import { App, TFile, requestUrl } from 'obsidian';
import { LinkMeta } from '../models/types';
import { parseLinkMetadata } from '../utils/linkMetadata';

const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'avif']);
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export interface FetchedLinkMeta extends LinkMeta {
  /** Set when the page advertised an image we could not store. */
  imageWarning?: string;
}

/**
 * Reads a linked page's own metadata so the fields never have to be
 * transcribed by hand. Uses Obsidian's `requestUrl`, which is not subject to
 * the CORS rules a plain fetch would hit from inside the app.
 */
export class LinkMetadataService {
  private app: App;

  constructor(app: App) {
    this.app = app;
  }

  async fetch(url: string, slug: string, assetFolder: string): Promise<FetchedLinkMeta> {
    const target = this.normalizeUrl(url);

    const response = await requestUrl({
      url: target,
      method: 'GET',
      throw: false,
      headers: {
        // Some sites serve a stub to unknown agents; ask like a browser.
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    if (response.status >= 400) {
      throw new Error(`${target} returned ${response.status}`);
    }

    const parsed = parseLinkMetadata(response.text || '', target);
    const meta: FetchedLinkMeta = {
      url: target,
      title: parsed.title,
      description: parsed.description,
      captured: this.today(),
    };

    if (!parsed.image) return meta;

    try {
      const wikilink = await this.downloadImage(parsed.image, slug, assetFolder);
      if (wikilink) meta.image = wikilink;
    } catch (error) {
      // A missing card image is a downgrade, not a failure — the clipping
      // renders without one, and the rest of the metadata is still worth having.
      meta.imageWarning = error instanceof Error ? error.message : String(error);
    }

    return meta;
  }

  /**
   * Stores the card image in the vault beside the post's other assets and
   * returns a wikilink to it, so publishing uploads it through the existing
   * image pipeline rather than a second, parallel one.
   */
  private async downloadImage(
    imageUrl: string,
    slug: string,
    assetFolder: string
  ): Promise<string | null> {
    const response = await requestUrl({ url: imageUrl, method: 'GET', throw: false });
    if (response.status >= 400) throw new Error(`image returned ${response.status}`);

    const bytes = response.arrayBuffer;
    if (!bytes || bytes.byteLength === 0) throw new Error('image was empty');
    if (bytes.byteLength > MAX_IMAGE_BYTES) {
      throw new Error(`image is ${Math.round(bytes.byteLength / 1024 / 1024)}MB, over the 8MB limit`);
    }

    const ext = this.extensionFor(imageUrl, response.headers?.['content-type']);
    if (!ext) throw new Error('image was not a recognised format');

    await this.ensureFolder(assetFolder);

    // Named per-post so wikilink resolution stays unambiguous across the vault.
    const filename = `${slug}-card.${ext}`;
    const path = `${assetFolder}/${filename}`;

    const existing = this.app.vault.getAbstractFileByPath(path);
    if (existing instanceof TFile) {
      await this.app.vault.modifyBinary(existing, bytes);
    } else {
      await this.app.vault.createBinary(path, bytes);
    }

    return `[[${filename}]]`;
  }

  private extensionFor(url: string, contentType?: string): string | null {
    const fromType = String(contentType || '')
      .split(';')[0]
      .trim()
      .replace(/^image\//, '')
      .replace('jpeg', 'jpg')
      .replace('svg+xml', 'svg');
    if (IMAGE_EXTENSIONS.has(fromType)) return fromType === 'jpeg' ? 'jpg' : fromType;

    const fromUrl = url.split('?')[0].split('#')[0].split('.').pop()?.toLowerCase() || '';
    if (IMAGE_EXTENSIONS.has(fromUrl)) return fromUrl === 'jpeg' ? 'jpg' : fromUrl;

    return null;
  }

  private normalizeUrl(url: string): string {
    const trimmed = String(url || '').trim();
    if (!trimmed) throw new Error('No URL to fetch');
    return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  }

  private today(): string {
    const now = new Date();
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  }

  private async ensureFolder(folder: string): Promise<void> {
    const parts = folder.split('/').filter(Boolean);
    let current = '';
    for (const part of parts) {
      current = current ? `${current}/${part}` : part;
      if (this.app.vault.getAbstractFileByPath(current)) continue;
      try {
        await this.app.vault.createFolder(current);
      } catch (error) {
        if (!String(error).toLowerCase().includes('already exists')) throw error;
      }
    }
  }
}

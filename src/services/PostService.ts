import { App, TFile, parseYaml, stringifyYaml } from 'obsidian';
import { BlogPublisherSettings, PostData, ImageData } from '../models/types';

const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'avif', 'bmp']);

export class PostService {
  private app: App;
  private settings: BlogPublisherSettings;

  constructor(app: App, settings: BlogPublisherSettings) {
    this.app = app;
    this.settings = settings;
  }

  async buildPostData(file: TFile): Promise<PostData> {
    // Parse frontmatter from file content directly (metadataCache can be stale)
    const content = await this.app.vault.read(file);
    const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const fm = fmMatch ? (parseYaml(fmMatch[1]) || {}) : {};

    if (!fm.date) throw new Error('Missing required frontmatter: date');
    if (!fm.slug) throw new Error('Missing required frontmatter: slug');

    const rawTitle = String(fm.title || '').trim();
    const title = rawTitle || file.basename;
    const date = String(fm.date);
    const slug = this.normalizeSlug(String(fm.slug));

    const yearMatch = date.match(/^(\d{4})/);
    if (!yearMatch) throw new Error(`Invalid date format: ${date}`);
    const year = yearMatch[1];
    const urlFormat = this.resolveUrlFormat();
    const images = await this.resolveImages(content, year, slug, urlFormat);
    const withTargetFrontmatter = this.rewriteFrontmatterForTarget(content, fm, date, slug, urlFormat);
    const transformedMarkdown = this.rewriteImageLinks(withTargetFrontmatter, images, year, slug, urlFormat);
    const publishedHash = await this.computeHash(transformedMarkdown, images);
    const repoPostsPath = this.normalizeRepoPath(this.settings.repoPostsPath || 'content/posts');
    const repoPostPath = urlFormat === 'posts-slug'
      ? `${repoPostsPath}/${slug}.md`
      : `${repoPostsPath}/${year}/${slug}.md`;

    return {
      title,
      date,
      year,
      slug,
      repoPostPath,
      transformedMarkdown,
      images,
      publishedHash,
    };
  }

  normalizeSlug(slug: string): string {
    return slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async resolveImages(content: string, year: string, slug: string, urlFormat: 'year-slug' | 'posts-slug'): Promise<ImageData[]> {
    const images: ImageData[] = [];
    const usedFilenames = new Set<string>();
    const re = /!\[\[([^\]|]+?)(?:\|([^\]]*))?\]\]/g;
    let match;

    while ((match = re.exec(content)) !== null) {
      const linkTarget = match[1].trim();
      const ext = linkTarget.split('.').pop()?.toLowerCase() || '';
      if (!IMAGE_EXTENSIONS.has(ext)) continue;

      const resolved = this.app.metadataCache.getFirstLinkpathDest(linkTarget, '');
      if (!resolved) {
        throw new Error(`Image not found in vault: ${linkTarget}`);
      }

      let filename = this.sanitizeFilename(resolved.name);
      if (usedFilenames.has(filename.toLowerCase())) {
        const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
        const fileExt = filename.substring(filename.lastIndexOf('.'));
        let counter = 2;
        while (usedFilenames.has(`${nameWithoutExt}-${counter}${fileExt}`.toLowerCase())) {
          counter++;
        }
        filename = `${nameWithoutExt}-${counter}${fileExt}`;
      }
      usedFilenames.add(filename.toLowerCase());

      images.push({
        vaultPath: resolved.path,
        filename,
        repoPath: urlFormat === 'posts-slug'
          ? `${this.normalizeRepoPath(this.settings.repoImagesPath || 'public/_assets/images')}/${slug}/${filename}`
          : `${this.normalizeRepoPath(this.settings.repoImagesPath || 'public/_assets/images')}/${year}/${slug}/${filename}`,
        originalWikilink: match[0],
      });
    }

    return images;
  }

  rewriteImageLinks(content: string, images: ImageData[], year: string, slug: string, urlFormat: 'year-slug' | 'posts-slug'): string {
    let result = content;
    for (const img of images) {
      const altMatch = img.originalWikilink.match(/!\[\[([^\]|]+?)(?:\|([^\]]*))?\]\]/);
      const alt = altMatch?.[2]?.trim() || '';
      const encodedFilename = encodeURIComponent(img.filename);
      const mdImage = urlFormat === 'posts-slug'
        ? `![${alt}](/_assets/images/${slug}/${encodedFilename})`
        : `![${alt}](/_assets/images/${year}/${slug}/${encodedFilename})`;
      result = result.replaceAll(img.originalWikilink, mdImage);
    }
    return result;
  }

  private rewriteFrontmatterForTarget(
    content: string,
    fm: Record<string, unknown>,
    date: string,
    slug: string,
    urlFormat: 'year-slug' | 'posts-slug'
  ): string {
    if (urlFormat !== 'posts-slug') return content;

    const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!fmMatch) return content;

    const next = { ...fm } as Record<string, unknown>;
    if (!next.published) next.published = date;
    if (!next.abbrlink) next.abbrlink = slug;
    if (typeof next.status === 'string' && next.draft === undefined) {
      next.draft = next.status !== 'publish';
    }

    const yaml = stringifyYaml(next).trim();
    return content.replace(/^---\r?\n[\s\S]*?\r?\n---/, `---\n${yaml}\n---`);
  }

  private sanitizeFilename(filename: string): string {
    const dotIndex = filename.lastIndexOf('.');
    const hasExt = dotIndex > 0 && dotIndex < filename.length - 1;
    const base = hasExt ? filename.slice(0, dotIndex) : filename;
    const ext = hasExt ? filename.slice(dotIndex).toLowerCase() : '';

    const cleanBase = base
      .normalize('NFKD')
      .replace(/[^\x00-\x7F]/g, '')
      .replace(/[^a-zA-Z0-9._-]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      || 'image';

    return `${cleanBase}${ext}`;
  }

  private normalizeRepoPath(path: string): string {
    return path.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
  }

  private resolveUrlFormat(): 'year-slug' | 'posts-slug' {
    const configured = String(this.settings.postUrlFormat || '').trim();
    if (configured === 'posts-slug') return 'posts-slug';
    if (configured === 'year-slug') return 'year-slug';
    const repoPostsPath = this.normalizeRepoPath(this.settings.repoPostsPath || '');
    return repoPostsPath === 'src/content/posts' ? 'posts-slug' : 'year-slug';
  }

  async computeHash(transformedMarkdown: string, images: ImageData[]): Promise<string> {
    const parts = [transformedMarkdown];
    const imageHashes: string[] = [];

    for (const img of images) {
      const file = this.app.vault.getAbstractFileByPath(img.vaultPath);
      if (file instanceof TFile) {
        const data = await this.app.vault.readBinary(file);
        const hash = await this.hashArrayBuffer(data);
        imageHashes.push(`${img.filename}:${hash}`);
      }
    }

    imageHashes.sort();
    parts.push(...imageHashes);
    const combined = parts.join('\n');

    const encoder = new TextEncoder();
    const encoded = encoder.encode(combined);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  private async hashArrayBuffer(buffer: ArrayBuffer): Promise<string> {
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
}

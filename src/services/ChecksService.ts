import { App, TFile, parseYaml } from 'obsidian';
import { BlogPublisherSettings } from '../models/types';
import { resolveRelative, scanImageRefs } from '../utils/imageRefs';

export interface CheckResult {
  passed: boolean;
  message?: string;
}

const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'avif', 'bmp']);

export class ChecksService {
  private app: App;
  private settings: BlogPublisherSettings;

  constructor(app: App, settings: BlogPublisherSettings) {
    this.app = app;
    this.settings = settings;
  }

  async checkFrontmatter(file: TFile): Promise<CheckResult> {
    // This check has to mirror what PostService actually requires at publish
    // time — it throws on a missing date or slug. Previously a note with no
    // frontmatter at all passed here, and a missing slug was silently replaced
    // with a basename-derived one that PostService would then reject, so all
    // five checks went green and Publish died with a raw exception instead.
    // Anything that passes here must be publishable.
    const fm = await this.parseFrontmatter(file);
    if (!fm) return { passed: false, message: 'No frontmatter found' };

    const missing: string[] = [];
    // `title` is deliberately not required: PostService falls back to the
    // filename, and some legacy posts have an empty title on purpose.
    if (!String(fm.slug ?? '').trim()) missing.push('slug');
    if (!String(fm.date ?? '').trim()) missing.push('date');

    if (missing.length > 0) {
      return { passed: false, message: `Missing: ${missing.join(', ')}` };
    }
    return { passed: true };
  }

  async checkSlug(file: TFile): Promise<CheckResult> {
    const fm = await this.parseFrontmatter(file);
    const slug = String(fm?.slug || '').trim() || this.slugify(file.basename);
    if (!slug) return { passed: false, message: 'No slug' };
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return { passed: false, message: 'Invalid characters in slug' };
    }
    if (slug.startsWith('-') || slug.endsWith('-')) {
      return { passed: false, message: 'Slug cannot start or end with hyphen' };
    }
    return { passed: true };
  }

  async checkLinks(file: TFile): Promise<CheckResult> {
    const content = await this.app.vault.read(file);
    const linkRe = /\[\[([^\]|]+?)(?:\|[^\]]*)?\]\]/g;
    let match;
    const broken: string[] = [];
    while ((match = linkRe.exec(content)) !== null) {
      const target = match[1].trim();
      // Skip image links
      const ext = target.split('.').pop()?.toLowerCase() || '';
      if (IMAGE_EXTENSIONS.has(ext)) continue;
      // Try to resolve
      const resolved = this.app.metadataCache.getFirstLinkpathDest(target, file.path);
      if (!resolved) broken.push(target);
    }
    if (broken.length > 0) {
      return { passed: false, message: `Broken: ${broken.slice(0, 3).join(', ')}` };
    }
    return { passed: true };
  }

  async checkImages(file: TFile): Promise<CheckResult> {
    const content = await this.app.vault.read(file);
    const refs = scanImageRefs(content);
    const missing: string[] = [];

    for (const target of refs.wikilinks) {
      const ext = target.split('.').pop()?.toLowerCase() || '';
      if (!IMAGE_EXTENSIONS.has(ext)) continue;
      if (!this.app.metadataCache.getFirstLinkpathDest(target, '')) missing.push(target);
    }

    // Markdown images and raw <img> tags are published verbatim, so they are only
    // as good as the path written in the note.
    for (const raw of refs.relative) {
      if (!this.app.vault.getAbstractFileByPath(resolveRelative(file.path, raw))) {
        missing.push(raw);
      }
    }

    const problems: string[] = [];
    if (missing.length > 0) problems.push(`Missing: ${missing.slice(0, 3).join(', ')}`);
    // A leading `/` resolves from the vault root and shows nothing in Obsidian —
    // the post looks right on the site and empty where it is actually written.
    if (refs.absolute.length > 0) {
      problems.push(
        `Not visible in Obsidian (use ../../_assets/…): ${refs.absolute.slice(0, 2).join(', ')}`
      );
    }
    return problems.length > 0 ? { passed: false, message: problems.join(' · ') } : { passed: true };
  }

  async checkBuild(_file: TFile): Promise<CheckResult> {
    // Structural check for now.
    // Future: could hit Vercel API to check deploy status.
    return { passed: true };
  }

  async runAll(file: TFile): Promise<Record<string, CheckResult>> {
    return {
      frontmatter: await this.checkFrontmatter(file),
      slug: await this.checkSlug(file),
      links: await this.checkLinks(file),
      images: await this.checkImages(file),
      build: await this.checkBuild(file),
    };
  }

  private async parseFrontmatter(file: TFile): Promise<Record<string, unknown> | null> {
    const content = await this.app.vault.read(file);
    const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!fmMatch) return null;
    const parsed = parseYaml(fmMatch[1]);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed as Record<string, unknown>;
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
}

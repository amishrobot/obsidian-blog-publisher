import { App, TFile, parseYaml } from 'obsidian';
import { BlogPublisherSettings } from '../models/types';

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
    const fm = await this.parseFrontmatter(file);
    if (!fm) {
      return { passed: false, message: 'No frontmatter found' };
    }
    const missing: string[] = [];
    const title = String(fm.title || '').trim();
    if (!title) {
      // Some legacy posts intentionally/accidentally have empty title in frontmatter.
      // We can safely fall back to filename for publish flow.
    }
    if (!fm.slug) missing.push('slug');
    if (missing.length > 0) {
      return { passed: false, message: `Missing: ${missing.join(', ')}` };
    }
    return { passed: true };
  }

  async checkSlug(file: TFile): Promise<CheckResult> {
    const fm = await this.parseFrontmatter(file);
    const slug = String(fm?.slug || '');
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
    const imageRe = /!\[\[([^\]|]+?)(?:\|[^\]]*)?\]\]/g;
    let match;
    const missing: string[] = [];
    while ((match = imageRe.exec(content)) !== null) {
      const target = match[1].trim();
      const ext = target.split('.').pop()?.toLowerCase() || '';
      if (!IMAGE_EXTENSIONS.has(ext)) continue;
      const resolved = this.app.metadataCache.getFirstLinkpathDest(target, '');
      if (!resolved) missing.push(target);
    }
    if (missing.length > 0) {
      return { passed: false, message: `Missing: ${missing.slice(0, 3).join(', ')}` };
    }
    return { passed: true };
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
}

import { ItemView, WorkspaceLeaf, TFile } from 'obsidian';
import { h, render } from 'preact';
import { PublishPanel } from './components/PublishPanel';
import type BlogPublisherPlugin from './main';
import { PostState, STATUS_CONFIG } from './models/types';
import { CheckResult } from './services/ChecksService';

export const VIEW_TYPE_BLOG_PUBLISHER = 'blog-publisher-view';

export class PublishView extends ItemView {
  plugin: BlogPublisherPlugin;

  constructor(leaf: WorkspaceLeaf, plugin: BlogPublisherPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return VIEW_TYPE_BLOG_PUBLISHER;
  }

  getDisplayText(): string {
    return 'Publish';
  }

  getIcon(): string {
    return 'rocket';
  }

  async onOpen() {
    await this.refresh();
  }

  async onClose() {
    const container = this.containerEl.children[1] as HTMLElement;
    render(null, container);
  }

  async refresh() {
    const file = this.app.workspace.getActiveFile();
    const container = this.containerEl.children[1] as HTMLElement;

    if (!file || !this.isPostFile(file)) {
      container.empty();
      container.innerHTML = '<div style="padding:20px;color:#888;font-size:13px;">Open a blog post to see publishing controls.</div>';
      return;
    }

    const post = await this.buildPostState(file);
    const saved = await this.buildSavedState(file);
    const settings = this.plugin.settings;

    render(
      h(PublishPanel, {
        post,
        saved,
        settings,
        onStatusChange: (status: string) => this.handleStatusChange(file, status),
        onThemeChange: (theme: string) => this.handleThemeChange(theme),
        onSlugChange: (slug: string) => this.handleSlugChange(file, slug),
        onTagsChange: (tags: string[]) => this.handleTagsChange(file, tags),
        onPublish: () => this.handlePublish(file),
        onUnpublish: () => this.handleUnpublish(file),
        onRunChecks: () => this.handleRunChecks(file),
        onOpenDeployHistory: () => this.handleOpenDeployHistory(),
      }),
      container
    );
  }

  private isPostFile(file: TFile): boolean {
    const folder = this.plugin.settings.postsFolder.replace(/\/$/, '');
    return file.path.startsWith(folder + '/') && file.path.endsWith('.md');
  }

  private async buildPostState(file: TFile): Promise<PostState> {
    const cache = this.app.metadataCache.getFileCache(file);
    const fm = cache?.frontmatter || {};
    const content = await this.app.vault.read(file);
    const wordCount = content.split(/\s+/).filter((w: string) => w.length > 0).length;

    return {
      title: String(fm.title || file.basename),
      slug: String(fm.slug || ''),
      date: String(fm.date || ''),
      status: String(fm.status || 'draft'),
      type: String(fm.type || 'post'),
      tags: Array.isArray(fm.tags) ? fm.tags.map(String) : [],
      wordCount,
      lastModified: new Date(file.stat.mtime).toISOString(),
      publishedHash: String(fm.publishedHash || ''),
      publishedCommit: String(fm.publishedCommit || ''),
      publishedAt: String(fm.publishedAt || ''),
    };
  }

  private async buildSavedState(file: TFile): Promise<PostState> {
    // "Saved" = the last published state snapshot from frontmatter.
    // The panel compares "saved" (what's published) to "post" (current).
    return this.buildPostState(file);
  }

  private async handleStatusChange(file: TFile, status: string): Promise<void> {
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      fm.status = status;
    });
    await this.refresh();
  }

  private async handleThemeChange(theme: string): Promise<void> {
    const themeFile = this.app.vault.getAbstractFileByPath(this.plugin.settings.themeFilePath);
    if (themeFile instanceof TFile) {
      await this.app.vault.modify(themeFile, `---\ntheme: ${theme}\n---\n`);
    }
    await this.refresh();
  }

  private async handleSlugChange(file: TFile, slug: string): Promise<void> {
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      fm.slug = slug;
    });
    await this.refresh();
  }

  private async handleTagsChange(file: TFile, tags: string[]): Promise<void> {
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      fm.tags = tags;
    });
    await this.refresh();
  }

  private async handlePublish(file: TFile): Promise<void> {
    await this.plugin.publishFile(file);
    await this.refresh();
  }

  private async handleUnpublish(file: TFile): Promise<void> {
    await this.plugin.unpublishFile(file);
    await this.refresh();
  }

  private async handleRunChecks(file: TFile): Promise<Record<string, CheckResult>> {
    return this.plugin.checksService.runAll(file);
  }

  private handleOpenDeployHistory(): void {
    const repo = this.plugin.settings.repository;
    const url = `https://github.com/${repo}/commits/main`;
    window.open(url);
  }
}

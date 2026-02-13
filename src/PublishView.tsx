import { ItemView, WorkspaceLeaf, TFile, parseYaml } from 'obsidian';
import { h, render } from 'preact';
import { PublishPanel } from './components/PublishPanel';
import type BlogPublisherPlugin from './main';
import { PostState } from './models/types';
import { CheckResult } from './services/ChecksService';

export const VIEW_TYPE_BLOG_PUBLISHER = 'blog-publisher-view';

export class PublishView extends ItemView {
  plugin: BlogPublisherPlugin;
  private savedStates = new Map<string, PostState>();

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

    // Capture a snapshot of the state when we first see a file.
    // This frozen "saved" state represents what's currently published.
    // It only gets updated after a successful publish/unpublish.
    if (!this.savedStates.has(file.path)) {
      this.savedStates.set(file.path, { ...post });
    }
    const saved = this.savedStates.get(file.path)!;
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
    const content = await this.app.vault.read(file);

    // Parse frontmatter directly from file content rather than metadataCache,
    // which can be stale immediately after processFrontMatter writes.
    const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const fm = fmMatch ? (parseYaml(fmMatch[1]) || {}) : {};

    const body = fmMatch ? content.slice(fmMatch[0].length) : content;
    const wordCount = body.split(/\s+/).filter((w: string) => w.length > 0).length;

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
    // Mark the post as published in frontmatter
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      fm.status = 'publish';
    });
    // Update the saved snapshot so the panel shows "Live" with no pending changes
    const newState = await this.buildPostState(file);
    this.savedStates.set(file.path, { ...newState });
    await this.refresh();
  }

  private async handleUnpublish(file: TFile): Promise<void> {
    await this.plugin.unpublishFile(file);
    // Mark the post as unpublished in frontmatter
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      fm.status = 'unpublish';
    });
    // Update the saved snapshot
    const newState = await this.buildPostState(file);
    this.savedStates.set(file.path, { ...newState });
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

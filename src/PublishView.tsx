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

  async refresh(explicitFile?: TFile | null) {
    const container = this.containerEl.children[1] as HTMLElement;
    try {
      const file = this.resolveCurrentPostFile(explicitFile);

      if (!file) {
        render(
          h('div', { style: 'padding:20px;color:#888;font-size:13px;' }, 'Open a blog post to see publishing controls.'),
          container
        );
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
      const effectiveSettings = this.plugin.getEffectiveSettingsForPath(file.path);
      const currentTheme = await this.getCurrentThemeSafe(effectiveSettings.themeFilePath, effectiveSettings.themes);
      const settings = {
        ...effectiveSettings,
        themes: this.orderThemes(effectiveSettings.themes, currentTheme),
      };

      render(
        h(PublishPanel, {
          post,
          saved,
          settings,
          onStatusChange: (status: string) => this.handleStatusChange(file, status),
          onThemeChange: (theme: string) => this.handleThemeChange(file, theme),
          onSlugChange: (slug: string) => this.handleSlugChange(file, slug),
          onTagsChange: (tags: string[]) => this.handleTagsChange(file, tags),
          onPublish: () => this.handlePublish(file),
          onPublishConfig: () => this.handlePublishConfig(file),
          onRunChecks: () => this.handleRunChecks(file),
          onOpenDeployHistory: () => this.handleOpenDeployHistory(),
        }),
        container
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      render(
        h('div', { style: 'padding:20px;color:#e06c75;font-size:12px;white-space:pre-wrap;' }, `Publish panel error: ${message}`),
        container
      );
      console.error('Publish panel refresh failed:', error);
    }
  }

  private isPostFile(file: { path: string }): boolean {
    return this.plugin.isPostPath(file.path);
  }

  private resolveCurrentPostFile(explicitFile?: TFile | null): TFile | null {
    if (explicitFile === null) return null;

    // If the caller provides the current file, treat it as authoritative.
    if (explicitFile instanceof TFile) {
      return this.isPostFile(explicitFile) ? explicitFile : null;
    }

    const active = this.app.workspace.getActiveFile();
    if (active instanceof TFile && this.isPostFile(active)) {
      return active;
    }

    return null;
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

  private async handleThemeChange(file: TFile, theme: string): Promise<void> {
    const effectiveSettings = this.plugin.getEffectiveSettingsForPath(file.path);
    const themeFile = this.app.vault.getAbstractFileByPath(effectiveSettings.themeFilePath);
    if (themeFile instanceof TFile) {
      await this.app.vault.modify(themeFile, `---\ntheme: ${theme}\n---\n`);
      await this.plugin.publishThemeSetting(theme, file.path);
    }
    await this.refresh();
  }

  private async getCurrentThemeSafe(themeFilePath: string, themes: string[]): Promise<string> {
    try {
      return await this.getCurrentTheme(themeFilePath, themes);
    } catch {
      return themes[0] || 'classic';
    }
  }

  private async getCurrentTheme(themeFilePath: string, themes: string[]): Promise<string> {
    const themeFile = this.app.vault.getAbstractFileByPath(themeFilePath);
    if (!(themeFile instanceof TFile)) return themes[0] || 'classic';

    const content = await this.app.vault.read(themeFile);
    const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    const fm = fmMatch ? (parseYaml(fmMatch[1]) || {}) : {};
    const fromFm = String(fm.theme || '').trim().toLowerCase();
    if (fromFm) return fromFm;

    const kvMatch = content.match(/^theme\s*:\s*["']?([^"'#\r\n]+)["']?\s*$/m);
    return kvMatch?.[1]?.trim().toLowerCase() || themes[0] || 'classic';
  }

  private orderThemes(themes: string[], currentTheme: string): string[] {
    const normalizedCurrent = currentTheme.trim().toLowerCase();
    const ordered: string[] = [];

    if (normalizedCurrent) ordered.push(normalizedCurrent);
    for (const theme of themes) {
      const normalized = theme.trim().toLowerCase();
      if (!normalized || ordered.includes(normalized)) continue;
      ordered.push(normalized);
    }

    return ordered.length > 0 ? ordered : ['classic', 'paper', 'spruce', 'midnight', 'vaporwave', 'year2000', 'soviet'];
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
    // Update saved snapshot to match what was just deployed
    const newState = await this.buildPostState(file);
    this.savedStates.set(file.path, { ...newState });
    await this.refresh();
  }

  private async handlePublishConfig(file: TFile): Promise<void> {
    await this.plugin.publishBlogConfig(file.path);
    await this.refresh();
  }

  private async handleRunChecks(file: TFile): Promise<Record<string, CheckResult>> {
    return this.plugin.checksService.runAll(file);
  }

  private handleOpenDeployHistory(): void {
    const activeFile = this.app.workspace.getActiveFile();
    const effectiveSettings = this.plugin.getEffectiveSettingsForPath(activeFile?.path);
    const url = `https://github.com/${effectiveSettings.repository}/commits/${effectiveSettings.branch}`;
    window.open(url);
  }
}

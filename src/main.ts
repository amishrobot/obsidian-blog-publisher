import { Plugin, WorkspaceLeaf, TFile } from 'obsidian';
import { PublishView, VIEW_TYPE_BLOG_PUBLISHER } from './PublishView';
import { PostService } from './services/PostService';
import { GitHubService } from './services/GitHubService';
import { ChecksService } from './services/ChecksService';
import { ConfigService } from './services/ConfigService';
import { BlogPublisherSettings, BlogTargetSettings, DEFAULT_SETTINGS } from './models/types';
import { SettingsTab } from './SettingsTab';

export default class BlogPublisherPlugin extends Plugin {
  settings: BlogPublisherSettings;
  checksService: ChecksService;
  private configService: ConfigService;
  private writeLock: Promise<void> = Promise.resolve();
  private refreshFastTimer: ReturnType<typeof setTimeout> | null = null;
  private refreshSettledTimer: ReturnType<typeof setTimeout> | null = null;

  async onload() {
    console.log('Loading Blog Publisher v2');
    await this.loadSettings();

    this.checksService = new ChecksService(this.app, this.settings);

    // Register the publish view
    this.registerView(
      VIEW_TYPE_BLOG_PUBLISHER,
      (leaf: WorkspaceLeaf) => new PublishView(leaf, this)
    );

    // Ribbon icon
    this.addRibbonIcon('rocket', 'Blog Publisher', () => {
      this.activateView();
    });

    // Commands
    this.addCommand({
      id: 'open-blog-publisher',
      name: 'Open Blog Publisher',
      callback: () => this.activateView(),
    });

    this.addCommand({
      id: 'publish-current-post',
      name: 'Publish Current Post',
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (!file || !this.isPostFile(file)) return false;
        if (!checking) this.publishFile(file);
        return true;
      },
    });

    // Refresh panel when active file changes
    this.registerEvent(
      this.app.workspace.on('file-open', async (file) => {
        if (file instanceof TFile && this.isPostFile(file)) {
          await this.syncTitleAndSlugFromName(file);
          this.scheduleRefresh(file);
          return;
        }
        this.scheduleRefresh((file as TFile | null) ?? null);
      })
    );

    this.registerEvent(
      this.app.workspace.on('active-leaf-change', () => {
        this.scheduleRefresh();
      })
    );

    this.registerEvent(
      this.app.workspace.on('layout-change', () => {
        this.scheduleRefresh();
      })
    );

    // Refresh panel when file is modified (debounced)
    let modifyTimeout: ReturnType<typeof setTimeout> | null = null;
    this.registerEvent(
      this.app.vault.on('modify', (file) => {
        if (!(file instanceof TFile) || !this.isPostFile(file)) return;
        if (modifyTimeout) clearTimeout(modifyTimeout);
        modifyTimeout = setTimeout(() => this.scheduleRefresh(file), 500);
      })
    );

    // Keep post title aligned with note title on rename.
    // Slug policy: only auto-update if it still matched the old title-derived slug.
    this.registerEvent(
      this.app.vault.on('rename', async (file, oldPath) => {
        if (!(file instanceof TFile) || !this.isPostFile(file)) return;
        await this.syncTitleAndSlugFromName(file, oldPath);
        this.scheduleRefresh(file);
      })
    );

    // Settings tab
    this.addSettingTab(new SettingsTab(this.app, this));
  }

  async onunload() {
    if (this.refreshFastTimer) clearTimeout(this.refreshFastTimer);
    if (this.refreshSettledTimer) clearTimeout(this.refreshSettledTimer);
    console.log('Unloading Blog Publisher v2');
  }

  private isPostFile(file: TFile): boolean {
    if (!file.path.endsWith('.md')) return false;
    return this.resolveTargetForPath(file.path) !== null;
  }

  isPostPath(path: string): boolean {
    if (!path.endsWith('.md')) return false;
    return this.resolveTargetForPath(path) !== null;
  }

  private normalizeFolderPath(path: string): string {
    return path.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
  }

  private pathMatchesFolder(path: string, folder: string): boolean {
    const normalizedPath = this.normalizeFolderPath(path);
    const normalizedFolder = this.normalizeFolderPath(folder);
    if (!normalizedFolder) return false;
    return normalizedPath === normalizedFolder || normalizedPath.startsWith(`${normalizedFolder}/`);
  }

  private resolveTargetForPath(path?: string): BlogTargetSettings | null {
    if (!path) return null;
    const targets = this.settings.blogTargets || [];
    if (targets.length === 0) {
      return this.pathMatchesFolder(path, this.settings.postsFolder)
        ? { postsFolder: this.settings.postsFolder }
        : null;
    }

    let best: BlogTargetSettings | null = null;
    let bestLength = -1;
    for (const target of targets) {
      const folder = this.normalizeFolderPath(target.postsFolder || '');
      if (!folder || !this.pathMatchesFolder(path, folder)) continue;
      if (folder.length > bestLength) {
        best = target;
        bestLength = folder.length;
      }
    }

    return best;
  }

  getEffectiveSettingsForPath(path?: string): BlogPublisherSettings {
    const target = this.resolveTargetForPath(path);
    if (!target) return this.settings;

    return {
      ...this.settings,
      repository: target.repository ?? this.settings.repository,
      branch: target.branch ?? this.settings.branch,
      postsFolder: target.postsFolder || this.settings.postsFolder,
      themeFilePath: target.themeFilePath ?? this.settings.themeFilePath,
      themeRepoPath: target.themeRepoPath ?? this.settings.themeRepoPath,
      siteUrl: target.siteUrl ?? this.settings.siteUrl,
      themes: target.themes && target.themes.length > 0 ? target.themes : this.settings.themes,
    };
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private async syncTitleAndSlugFromName(file: TFile, oldPath?: string): Promise<void> {
    const newTitle = file.basename;
    const oldBasename = oldPath?.split('/').pop()?.replace(/\.md$/i, '') || '';
    const oldAutoSlug = this.slugify(oldBasename);
    const newAutoSlug = this.slugify(newTitle);

    let needsUpdate = false;
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      const currentTitle = String(fm.title || '');
      if (currentTitle !== newTitle) {
        fm.title = newTitle;
        needsUpdate = true;
      }

      if (!oldPath) return;

      const currentSlug = String(fm.slug || '').trim();
      if (!currentSlug || (oldAutoSlug && currentSlug === oldAutoSlug)) {
        if (currentSlug !== newAutoSlug) {
          fm.slug = newAutoSlug;
          needsUpdate = true;
        }
      }
    });

    if (!needsUpdate) return;
  }

  async activateView() {
    const { workspace } = this.app;
    let leaf: WorkspaceLeaf | null = null;
    const leaves = workspace.getLeavesOfType(VIEW_TYPE_BLOG_PUBLISHER);

    if (leaves.length > 0) {
      leaf = leaves[0];
    } else {
      leaf = workspace.getRightLeaf(false);
      if (leaf) {
        await leaf.setViewState({
          type: VIEW_TYPE_BLOG_PUBLISHER,
          active: true,
        });
      }
    }

    if (leaf) {
      workspace.revealLeaf(leaf);
    }
  }

  private refreshView(file?: TFile | null) {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_BLOG_PUBLISHER);
    for (const leaf of leaves) {
      const view = leaf.view as PublishView;
      if (view?.refresh) view.refresh(file);
    }
  }

  private scheduleRefresh(file?: TFile | null) {
    if (this.refreshFastTimer) clearTimeout(this.refreshFastTimer);
    if (this.refreshSettledTimer) clearTimeout(this.refreshSettledTimer);

    // Immediate refresh (event payload if present).
    this.refreshView(file);

    // Follow-up refreshes use the actual active file after workspace settles.
    this.refreshFastTimer = setTimeout(() => this.refreshView(), 75);
    this.refreshSettledTimer = setTimeout(() => this.refreshView(), 250);
  }

  // ── Publishing methods (called by PublishView) ──────────────────

  async publishFile(file: TFile): Promise<void> {
    await this.withWriteLock(async () => {
      await this.ensurePublishDate(file);
      const effectiveSettings = this.getEffectiveSettingsForPath(file.path);
      const postService = new PostService(this.app, effectiveSettings);
      const postData = await postService.buildPostData(file);
      const githubService = new GitHubService(this.app, effectiveSettings);
      const result = await githubService.publish(postData);

      // Write publish metadata (don't touch status — user controls that via the panel)
      await this.app.fileManager.processFrontMatter(file, (fm) => {
        fm.publishedAt = new Date().toISOString();
        fm.publishedCommit = result.commitSha;
        fm.publishedHash = postData.publishedHash;
      });
    });
  }

  async unpublishFile(file: TFile): Promise<void> {
    await this.withWriteLock(async () => {
      await this.ensurePublishDate(file);
      const effectiveSettings = this.getEffectiveSettingsForPath(file.path);
      const postService = new PostService(this.app, effectiveSettings);
      const postData = await postService.buildPostData(file);
      const filePaths = [postData.repoPostPath, ...postData.images.map(img => img.repoPath)];
      const githubService = new GitHubService(this.app, effectiveSettings);
      await githubService.unpublish(filePaths, postData.title);

      await this.app.fileManager.processFrontMatter(file, (fm) => {
        delete fm.publishedAt;
        delete fm.publishedCommit;
        delete fm.publishedHash;
      });
    });
  }

  async publishThemeSetting(theme: string, filePath?: string): Promise<void> {
    await this.withWriteLock(async () => {
      const effectiveSettings = this.getEffectiveSettingsForPath(filePath);
      const content = `---\ntheme: ${theme}\n---\n`;
      const githubService = new GitHubService(this.app, effectiveSettings);

      const remoteMatches = await githubService.fileContentEquals(
        effectiveSettings.themeRepoPath,
        content
      );
      if (remoteMatches) {
        return;
      }

      const commitSha = await githubService.publishTextFile(
        effectiveSettings.themeRepoPath,
        content,
        `Theme: ${theme}`
      );

      this.settings.themePublishedCommit = commitSha;
      this.settings.themePublishedHash = '';
      await this.saveSettings();
    });
  }

  // ── Settings ────────────────────────────────────────────────────

  async loadSettings() {
    this.configService = new ConfigService(this.app);
    const pluginData = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    const stateOverrides = await this.configService.loadFromStateFile();
    this.settings = this.configService.merge(pluginData, stateOverrides);
    this.settings.blogTargets = this.resolveBlogTargets(this.settings.blogTargets, this.settings.blogTargetsJson);
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  private async ensurePublishDate(file: TFile): Promise<void> {
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      const current = String(fm.date || '').trim();
      if (!current) {
        fm.date = new Date().toISOString().slice(0, 10);
      }
    });
  }

  private resolveBlogTargets(
    targets: BlogTargetSettings[] | undefined,
    blogTargetsJson: string | undefined
  ): BlogTargetSettings[] {
    if (targets && targets.length > 0) {
      return targets;
    }

    const raw = (blogTargetsJson || '').trim();
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((item): item is BlogTargetSettings => {
        return !!item && typeof item === 'object'
          && typeof (item as BlogTargetSettings).postsFolder === 'string'
          && (item as BlogTargetSettings).postsFolder.trim().length > 0;
      });
    } catch {
      console.warn('Failed to parse blogTargetsJson. Expected a JSON array.');
      return [];
    }
  }

  private async withWriteLock<T>(operation: () => Promise<T>): Promise<T> {
    const previous = this.writeLock;
    let release: () => void = () => {};
    this.writeLock = new Promise<void>((resolve) => {
      release = resolve;
    });

    await previous;
    try {
      return await operation();
    } finally {
      release();
    }
  }
}

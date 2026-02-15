import { Plugin, WorkspaceLeaf, TFile, parseYaml } from 'obsidian';
import { PublishView, VIEW_TYPE_BLOG_PUBLISHER } from './PublishView';
import { PostService } from './services/PostService';
import { GitHubService } from './services/GitHubService';
import { ChecksService } from './services/ChecksService';
import { ConfigService } from './services/ConfigService';
import { BlogPublisherSettings, BlogTargetSettings, DEFAULT_SETTINGS } from './models/types';
import { SettingsTab } from './SettingsTab';
import { getEffectiveSettingsForPath, isPostPath, resolveTargetForPath } from './utils/targetRouting';

const STATE_CONFIG_PATH = '_state/blog-config.md';

export interface PublishConfigResult {
  skipped: boolean;
  repoPath: string;
  commitSha?: string;
}

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

    this.addCommand({
      id: 'publish-blog-config',
      name: 'Publish Blog Config',
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        if (!file || (!this.isPostFile(file) && !this.isConfigFile(file))) return false;
        if (!checking) this.publishBlogConfig(file.path);
        return true;
      },
    });

    // Refresh panel when active file changes
    this.registerEvent(
      this.app.workspace.on('file-open', async (file) => {
        if (file instanceof TFile && this.isPostFile(file)) {
          this.scheduleRefresh(file);
          return;
        }
        if (file instanceof TFile && this.isConfigFile(file)) {
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
        if (!(file instanceof TFile) || (!this.isPostFile(file) && !this.isConfigFile(file))) return;
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
    return isPostPath(file.path, this.settings);
  }

  private isConfigFile(file: TFile): boolean {
    return this.isConfigPath(file.path);
  }

  isPostPath(path: string): boolean {
    return isPostPath(path, this.settings);
  }

  isConfigPath(path: string): boolean {
    return String(path || '').replace(/\\/g, '/').replace(/^\/+/, '') === STATE_CONFIG_PATH;
  }

  private resolveTargetForPath(path?: string): BlogTargetSettings | null {
    return resolveTargetForPath(path, this.settings);
  }

  getEffectiveSettingsForPath(path?: string): BlogPublisherSettings {
    return getEffectiveSettingsForPath(path, this.settings);
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
      await this.refreshRuntimeSettings();
      await this.ensurePublishDate(file);
      const effectiveSettings = this.validatePublishConfig(file.path, 'post');
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
      await this.refreshRuntimeSettings();
      await this.ensurePublishDate(file);
      const effectiveSettings = this.validatePublishConfig(file.path, 'post');
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
      await this.refreshRuntimeSettings();
      const resolvedPath = filePath || this.app.workspace.getActiveFile()?.path;
      const effectiveSettings = this.validatePublishConfig(resolvedPath, 'theme');
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

  async publishBlogConfig(filePath?: string): Promise<PublishConfigResult> {
    return this.withWriteLock(async () => {
      await this.refreshRuntimeSettings();
      const resolvedPath = filePath || this.app.workspace.getActiveFile()?.path || '';

      const stateFile = this.app.vault.getAbstractFileByPath(STATE_CONFIG_PATH);
      if (!(stateFile instanceof TFile)) {
        throw new Error(`Missing state config: ${STATE_CONFIG_PATH}`);
      }

      const content = await this.app.vault.read(stateFile);
      this.validateBlogConfigContent(content);
      const targets = this.resolveConfigPublishTargets(resolvedPath);
      let firstResult: PublishConfigResult = { skipped: true, repoPath: '' };

      for (const targetSettings of targets) {
        const repoPath = this.resolveBlogConfigRepoPath(targetSettings);
        const githubService = new GitHubService(this.app, targetSettings);
        const remoteMatches = await githubService.fileContentEquals(repoPath, content);
        if (remoteMatches) {
          if (!firstResult.repoPath) firstResult = { skipped: true, repoPath };
          continue;
        }

        const commitSha = await githubService.publishTextFile(
          repoPath,
          content,
          'Publish: blog config update'
        );

        if (!firstResult.repoPath) {
          firstResult = { skipped: false, repoPath, commitSha };
        }
      }

      return firstResult;
    });
  }

  // ── Settings ────────────────────────────────────────────────────

  async loadSettings() {
    this.configService = new ConfigService(this.app);
    await this.refreshRuntimeSettings();
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
        if (!item || typeof item !== 'object') return false;
        const target = item as BlogTargetSettings;
        const hasPostsFolder = typeof target.postsFolder === 'string' && target.postsFolder.trim().length > 0;
        const hasName = typeof target.name === 'string' && target.name.trim().length > 0;
        return hasPostsFolder || hasName;
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

  private async hydrateTokenFromSecretsFile(): Promise<void> {
    if (this.settings.githubToken && this.settings.githubToken.trim().length > 0) return;

    const filePath = (this.settings.secretsFilePath || '').trim();
    const tokenKey = (this.settings.githubTokenConfigKey || '').trim();
    if (!filePath || !tokenKey) return;

    const file = this.app.vault.getAbstractFileByPath(filePath);
    if (!(file instanceof TFile)) return;

    try {
      const content = await this.app.vault.read(file);
      const parsed = JSON.parse(content) as Record<string, unknown>;
      const resolved = parsed[tokenKey];
      if (typeof resolved === 'string' && resolved.trim().length > 0) {
        this.settings.githubToken = resolved.trim();
      }
    } catch (error) {
      console.warn(`Failed to read GitHub token from ${filePath}:`, error);
    }
  }

  private async refreshRuntimeSettings(): Promise<void> {
    const pluginData = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    const stateOverrides = await this.configService.loadFromStateFile();
    this.settings = this.configService.merge(pluginData, stateOverrides);
    await this.hydrateTokenFromSecretsFile();
    this.settings.blogTargets = this.resolveBlogTargets(this.settings.blogTargets, this.settings.blogTargetsJson);
  }

  private validatePublishConfig(path: string | undefined, mode: 'post' | 'theme' | 'config'): BlogPublisherSettings {
    const errors: string[] = [];
    const activePath = String(path || '').trim();

    if (!activePath) {
      errors.push('Could not determine the current note path.');
    }

    const hasTargets = (this.settings.blogTargets || []).length > 0;
    const target = activePath ? this.resolveTargetForPath(activePath) : null;
    if (mode !== 'config' && hasTargets && !target && activePath) {
      errors.push(
        `No \`blogTargets\` match for \`${activePath}\`. Add a target with \`postsFolder\` for this path (recommended: \`Blog/<SiteName>/posts\`).`
      );
    }

    const effective = this.getEffectiveSettingsForPath(activePath || undefined);

    const token = String(effective.githubToken || '').trim();
    if (!token) {
      const secretsPath = String(effective.secretsFilePath || '.system/config.json').trim();
      const tokenKey = String(effective.githubTokenConfigKey || 'blog_publisher_github_token').trim();
      errors.push(
        `GitHub token not configured. Set \`${tokenKey}\` in \`${secretsPath}\` or set \`githubToken\` in plugin settings.`
      );
    }

    const repository = String(effective.repository || '').trim();
    if (!repository || !/^[^/\s]+\/[^/\s]+$/.test(repository)) {
      errors.push('Repository is missing/invalid. Use `owner/repo` format in target config.');
    }

    if (!String(effective.branch || '').trim()) {
      errors.push('Branch is missing. Set `branch` in target config.');
    }

    if (mode === 'post') {
      if (!String(effective.repoPostsPath || '').trim()) {
        errors.push('`repoPostsPath` is missing for this target.');
      }
      if (!String(effective.repoImagesPath || '').trim()) {
        errors.push('`repoImagesPath` is missing for this target.');
      }
    }

    if (mode === 'theme' && !String(effective.themeRepoPath || '').trim()) {
      errors.push('`themeRepoPath` is missing for this target.');
    }

    if (mode === 'config') {
      const repoPath = this.resolveBlogConfigRepoPath(effective);
      if (!repoPath) {
        errors.push('`blogConfigRepoPath` is missing for this target.');
      }
    }

    if (errors.length > 0) {
      throw new Error(`Publish config check failed:\n- ${errors.join('\n- ')}`);
    }

    return effective;
  }

  private resolveBlogConfigRepoPath(settings: BlogPublisherSettings): string {
    const direct = String(settings.blogConfigRepoPath || '').trim();
    if (direct) return direct;

    const themeRepoPath = String(settings.themeRepoPath || '').trim();
    if (!themeRepoPath) return 'content/settings/blog-config.md';
    if (themeRepoPath.endsWith('/theme.md')) {
      return `${themeRepoPath.slice(0, -'/theme.md'.length)}/blog-config.md`;
    }
    if (themeRepoPath.endsWith('theme.md')) {
      return `${themeRepoPath.slice(0, -'theme.md'.length)}blog-config.md`;
    }
    return 'content/settings/blog-config.md';
  }

  private validateBlogConfigContent(content: string): void {
    const body = content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
    let parsed: unknown;

    try {
      parsed = parseYaml(body);
    } catch (error) {
      throw new Error(`Invalid blog-config format: ${(error as Error)?.message || error}`);
    }

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid blog-config: expected YAML object body.');
    }

    const root = parsed as Record<string, unknown>;
    const targets = root.blogTargets;
    if (!Array.isArray(targets)) {
      throw new Error('Invalid blog-config: missing `blogTargets` list.');
    }

    for (const target of targets) {
      if (!target || typeof target !== 'object') continue;
      const row = target as Record<string, unknown>;
      const name = String(row.name || 'unknown target');
      const selectedTheme = typeof row.theme === 'string' ? row.theme.trim() : '';
      if (!selectedTheme) continue;
      const themes = Array.isArray(row.themes)
        ? row.themes.filter((value): value is string => typeof value === 'string').map((value) => value.trim())
        : [];
      if (themes.length > 0 && !themes.includes(selectedTheme)) {
        throw new Error(`Invalid blog-config: target "${name}" has theme "${selectedTheme}" not present in its themes list.`);
      }
    }
  }

  private validateConfigTargetSettings(settings: BlogPublisherSettings): void {
    const token = String(settings.githubToken || '').trim();
    if (!token) {
      throw new Error('GitHub token not configured for config publish.');
    }

    const repository = String(settings.repository || '').trim();
    if (!repository || !/^[^/\s]+\/[^/\s]+$/.test(repository)) {
      throw new Error('Repository is missing/invalid for config publish.');
    }

    if (!String(settings.branch || '').trim()) {
      throw new Error('Branch is missing for config publish.');
    }
  }

  private resolveConfigPublishTargets(path: string): BlogPublisherSettings[] {
    const activePath = String(path || '').trim();
    if (activePath && !this.isConfigPath(activePath)) {
      const effective = this.validatePublishConfig(activePath, 'config');
      this.validateConfigTargetSettings(effective);
      return [effective];
    }

    const targets = this.settings.blogTargets || [];
    if (targets.length === 0) {
      const effective = this.validatePublishConfig(STATE_CONFIG_PATH, 'config');
      this.validateConfigTargetSettings(effective);
      return [effective];
    }

    const settingsByKey = new Map<string, BlogPublisherSettings>();
    for (const target of targets) {
      const effective: BlogPublisherSettings = {
        ...this.settings,
        repository: target.repository ?? this.settings.repository,
        branch: target.branch ?? this.settings.branch,
        themeRepoPath: target.themeRepoPath ?? this.settings.themeRepoPath,
        blogConfigRepoPath: target.blogConfigRepoPath ?? this.settings.blogConfigRepoPath,
        siteUrl: target.siteUrl ?? this.settings.siteUrl,
        themes: target.themes && target.themes.length > 0 ? target.themes : this.settings.themes,
      };
      this.validateConfigTargetSettings(effective);
      const key = `${effective.repository}::${effective.branch}::${this.resolveBlogConfigRepoPath(effective)}`;
      if (!settingsByKey.has(key)) settingsByKey.set(key, effective);
    }

    return [...settingsByKey.values()];
  }
}

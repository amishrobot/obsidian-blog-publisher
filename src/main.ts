import { Plugin, WorkspaceLeaf, TFile } from 'obsidian';
import { PublishView, VIEW_TYPE_BLOG_PUBLISHER } from './PublishView';
import { PostService } from './services/PostService';
import { GitHubService } from './services/GitHubService';
import { ChecksService } from './services/ChecksService';
import { ConfigService } from './services/ConfigService';
import { BlogPublisherSettings, DEFAULT_SETTINGS } from './models/types';
import { SettingsTab } from './SettingsTab';

export default class BlogPublisherPlugin extends Plugin {
  settings: BlogPublisherSettings;
  checksService: ChecksService;
  private configService: ConfigService;

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
      this.app.workspace.on('active-leaf-change', () => {
        this.refreshView();
      })
    );

    // Refresh panel when file is modified (debounced)
    let modifyTimeout: ReturnType<typeof setTimeout> | null = null;
    this.registerEvent(
      this.app.vault.on('modify', (file) => {
        if (!(file instanceof TFile) || !this.isPostFile(file)) return;
        if (modifyTimeout) clearTimeout(modifyTimeout);
        modifyTimeout = setTimeout(() => this.refreshView(), 500);
      })
    );

    // Settings tab
    this.addSettingTab(new SettingsTab(this.app, this));
  }

  async onunload() {
    console.log('Unloading Blog Publisher v2');
  }

  private isPostFile(file: TFile): boolean {
    const folder = this.settings.postsFolder.replace(/\/$/, '');
    return file.path.startsWith(folder + '/') && file.path.endsWith('.md');
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

  private refreshView() {
    const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_BLOG_PUBLISHER);
    for (const leaf of leaves) {
      const view = leaf.view as PublishView;
      if (view?.refresh) view.refresh();
    }
  }

  // ── Publishing methods (called by PublishView) ──────────────────

  async publishFile(file: TFile): Promise<void> {
    const postService = new PostService(this.app, this.settings);
    const postData = await postService.buildPostData(file);
    const githubService = new GitHubService(this.app, this.settings);
    const result = await githubService.publish(postData);

    // Write back frontmatter
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      fm.status = 'published';
      fm.publishedAt = new Date().toISOString();
      fm.publishedCommit = result.commitSha;
      fm.publishedHash = postData.publishedHash;
    });
  }

  async unpublishFile(file: TFile): Promise<void> {
    const postService = new PostService(this.app, this.settings);
    const postData = await postService.buildPostData(file);
    const filePaths = [postData.repoPostPath, ...postData.images.map(img => img.repoPath)];
    const githubService = new GitHubService(this.app, this.settings);
    await githubService.unpublish(filePaths, postData.title);

    await this.app.fileManager.processFrontMatter(file, (fm) => {
      delete fm.publishedAt;
      delete fm.publishedCommit;
      delete fm.publishedHash;
      fm.status = 'unpublished';
    });
  }

  // ── Settings ────────────────────────────────────────────────────

  async loadSettings() {
    this.configService = new ConfigService(this.app);
    const pluginData = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    const stateOverrides = await this.configService.loadFromStateFile();
    this.settings = this.configService.merge(pluginData, stateOverrides);
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

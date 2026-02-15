import { App, PluginSettingTab, Setting } from 'obsidian';
import type BlogPublisherPlugin from './main';

export class SettingsTab extends PluginSettingTab {
  plugin: BlogPublisherPlugin;

  constructor(app: App, plugin: BlogPublisherPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    new Setting(containerEl)
      .setName('GitHub token')
      .setDesc('Optional override. If empty, token is read from vault config (`secretsFilePath` + `githubTokenConfigKey`).')
      .addText((text) =>
        text
          .setPlaceholder('github_pat_...')
          .setValue(this.plugin.settings.githubToken)
          .then((t) => (t.inputEl.type = 'password'))
          .onChange(async (value) => {
            this.plugin.settings.githubToken = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Secrets file path')
      .setDesc('Vault-local JSON file for secrets (JoshOS pattern: `.system/config.json`).')
      .addText((text) =>
        text
          .setPlaceholder('.system/config.json')
          .setValue(this.plugin.settings.secretsFilePath || '')
          .onChange(async (value) => {
            this.plugin.settings.secretsFilePath = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('GitHub token config key')
      .setDesc('JSON key in the secrets file used to resolve the GitHub token.')
      .addText((text) =>
        text
          .setPlaceholder('blog_publisher_github_token')
          .setValue(this.plugin.settings.githubTokenConfigKey || '')
          .onChange(async (value) => {
            this.plugin.settings.githubTokenConfigKey = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Repository')
      .setDesc('GitHub repository (owner/repo)')
      .addText((text) =>
        text
          .setPlaceholder('your-org/your-blog-repo')
          .setValue(this.plugin.settings.repository)
          .onChange(async (value) => {
            this.plugin.settings.repository = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Branch')
      .setDesc('Target branch for commits')
      .addText((text) =>
        text
          .setPlaceholder('main')
          .setValue(this.plugin.settings.branch)
          .onChange(async (value) => {
            this.plugin.settings.branch = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Posts folder')
      .setDesc('Vault folder to watch for posts')
      .addText((text) =>
        text
          .setPlaceholder('Blog/MySite/posts')
          .setValue(this.plugin.settings.postsFolder)
          .onChange(async (value) => {
            this.plugin.settings.postsFolder = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Repo posts path')
      .setDesc('Path in target repo where markdown posts are committed')
      .addText((text) =>
        text
          .setPlaceholder('content/posts')
          .setValue(this.plugin.settings.repoPostsPath)
          .onChange(async (value) => {
            this.plugin.settings.repoPostsPath = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Repo images path')
      .setDesc('Path in target repo where published images are committed')
      .addText((text) =>
        text
          .setPlaceholder('public/_assets/images')
          .setValue(this.plugin.settings.repoImagesPath)
          .onChange(async (value) => {
            this.plugin.settings.repoImagesPath = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Post URL format')
      .setDesc('`year-slug` -> /YYYY/slug, `posts-slug` -> /posts/slug')
      .addText((text) =>
        text
          .setPlaceholder('year-slug')
          .setValue(this.plugin.settings.postUrlFormat || 'year-slug')
          .onChange(async (value) => {
            this.plugin.settings.postUrlFormat = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Blog targets (JSON)')
      .setDesc('Optional per-folder routing. Used when `_state/blog-config.md` is not present.')
      .addTextArea((text) =>
        text
          .setPlaceholder('[{"name":"MySite","repository":"your-org/your-blog-repo","siteUrl":"https://mysite.com"}]')
          .setValue(this.plugin.settings.blogTargetsJson || '')
          .onChange(async (value) => {
            this.plugin.settings.blogTargetsJson = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Theme settings file')
      .setDesc('Vault markdown file to publish when theme settings change')
      .addText((text) =>
        text
          .setPlaceholder('Blog/MySite/settings/theme.md')
          .setValue(this.plugin.settings.themeFilePath)
          .onChange(async (value) => {
            this.plugin.settings.themeFilePath = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Theme repo path')
      .setDesc('Path in GitHub repo for committed theme settings')
      .addText((text) =>
        text
          .setPlaceholder('content/settings/theme.md')
          .setValue(this.plugin.settings.themeRepoPath)
          .onChange(async (value) => {
            this.plugin.settings.themeRepoPath = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Blog config repo path')
      .setDesc('Path in GitHub repo for committed blog-config markdown')
      .addText((text) =>
        text
          .setPlaceholder('content/settings/blog-config.md')
          .setValue(this.plugin.settings.blogConfigRepoPath || '')
          .onChange(async (value) => {
            this.plugin.settings.blogConfigRepoPath = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Site URL')
      .setDesc('Blog URL for success notice links')
      .addText((text) =>
        text
          .setPlaceholder('https://mysite.com')
          .setValue(this.plugin.settings.siteUrl)
          .onChange(async (value) => {
            this.plugin.settings.siteUrl = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Themes')
      .setDesc('Comma-separated list of theme IDs (e.g., classic,paper,spruce,midnight,vaporwave,year2000,soviet)')
      .addText((text) =>
        text
          .setPlaceholder('classic,paper,spruce,midnight,vaporwave,year2000,soviet')
          .setValue(this.plugin.settings.themes.join(','))
          .onChange(async (value) => {
            this.plugin.settings.themes = value
              .split(',')
              .map((s) => s.trim())
              .filter((s) => s.length > 0);
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Multi-blog targets')
      .setDesc('Configure `blogTargets` in `_state/blog-config.md` for per-folder repo/site routing.');
  }
}

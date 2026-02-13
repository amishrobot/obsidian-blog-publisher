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
      .setDesc('Fine-grained personal access token with contents:write scope')
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
      .setName('Repository')
      .setDesc('GitHub repository (owner/repo)')
      .addText((text) =>
        text
          .setPlaceholder('amishrobot/amishrobot.com')
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
          .setPlaceholder('Personal/Blog/posts')
          .setValue(this.plugin.settings.postsFolder)
          .onChange(async (value) => {
            this.plugin.settings.postsFolder = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Theme settings file')
      .setDesc('Vault markdown file to publish when theme settings change')
      .addText((text) =>
        text
          .setPlaceholder('Personal/Blog/settings/theme.md')
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
      .setName('Site URL')
      .setDesc('Blog URL for success notice links')
      .addText((text) =>
        text
          .setPlaceholder('https://amishrobot.com')
          .setValue(this.plugin.settings.siteUrl)
          .onChange(async (value) => {
            this.plugin.settings.siteUrl = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Themes')
      .setDesc('Comma-separated list of theme IDs (e.g., classic,paper,spruce,midnight,soviet)')
      .addText((text) =>
        text
          .setPlaceholder('classic,paper,spruce,midnight,soviet')
          .setValue(this.plugin.settings.themes.join(','))
          .onChange(async (value) => {
            this.plugin.settings.themes = value
              .split(',')
              .map((s) => s.trim())
              .filter((s) => s.length > 0);
            await this.plugin.saveSettings();
          })
      );
  }
}

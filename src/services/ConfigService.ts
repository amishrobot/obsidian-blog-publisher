import { App, TFile, parseYaml } from 'obsidian';
import { BlogPublisherSettings, BlogTargetSettings } from '../models/types';

const STATE_FILE_PATH = '_state/blog-config.md';

export class ConfigService {
  private app: App;

  constructor(app: App) {
    this.app = app;
  }

  async loadFromStateFile(): Promise<Partial<BlogPublisherSettings> | null> {
    const file = this.app.vault.getAbstractFileByPath(STATE_FILE_PATH);
    if (!(file instanceof TFile)) return null;

    const content = await this.app.vault.read(file);
    return this.parseStateFile(content);
  }

  parseStateFile(content: string): Partial<BlogPublisherSettings> {
    const settings: Partial<BlogPublisherSettings> = {};

    // Strip YAML frontmatter delimiters if present.
    const body = content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
    let parsed: unknown;
    try {
      parsed = parseYaml(body);
    } catch {
      return this.parseLineBased(content);
    }
    if (!parsed || typeof parsed !== 'object') {
      return this.parseLineBased(content);
    }

    const data = parsed as Record<string, unknown>;
    this.setStringValue(settings, 'githubToken', data.githubToken);
    this.setStringValue(settings, 'repository', data.repository);
    this.setStringValue(settings, 'branch', data.branch);
    this.setStringValue(settings, 'postsFolder', data.postsFolder);
    this.setStringValue(settings, 'repoPostsPath', data.repoPostsPath);
    this.setStringValue(settings, 'repoImagesPath', data.repoImagesPath);
    this.setStringValue(settings, 'blogTargetsJson', data.blogTargetsJson);
    this.setStringValue(settings, 'themeFilePath', data.themeFilePath);
    this.setStringValue(settings, 'themeRepoPath', data.themeRepoPath);
    this.setStringValue(settings, 'siteUrl', data.siteUrl);
    this.setListValue(settings, 'themes', data.themes);
    this.setTargetListValue(settings, data.blogTargets);

    return settings;
  }

  private setStringValue(
    settings: Partial<BlogPublisherSettings>,
    key: keyof BlogPublisherSettings,
    value: unknown
  ): void {
    if (typeof value === 'string' && value.trim().length > 0) {
      (settings as Record<string, unknown>)[key] = value.trim();
    }
  }

  private setListValue(
    settings: Partial<BlogPublisherSettings>,
    key: string,
    values: unknown
  ): void {
    if (key === 'themes' && Array.isArray(values)) {
      settings.themes = values
        .map((value) => (typeof value === 'string' ? value.trim() : ''))
        .filter((value) => value.length > 0);
    }
  }

  private setTargetListValue(
    settings: Partial<BlogPublisherSettings>,
    value: unknown
  ): void {
    if (!Array.isArray(value)) return;

    const targets: BlogTargetSettings[] = value
      .map((item) => this.parseTarget(item))
      .filter((item): item is BlogTargetSettings => item !== null);

    if (targets.length > 0) {
      settings.blogTargets = targets;
    }
  }

  private parseTarget(input: unknown): BlogTargetSettings | null {
    if (!input || typeof input !== 'object') return null;
    const row = input as Record<string, unknown>;
    if (typeof row.postsFolder !== 'string' || row.postsFolder.trim().length === 0) {
      return null;
    }

    const target: BlogTargetSettings = { postsFolder: row.postsFolder.trim() };

    if (typeof row.name === 'string' && row.name.trim().length > 0) target.name = row.name.trim();
    if (typeof row.repository === 'string' && row.repository.trim().length > 0) target.repository = row.repository.trim();
    if (typeof row.branch === 'string' && row.branch.trim().length > 0) target.branch = row.branch.trim();
    if (typeof row.repoPostsPath === 'string' && row.repoPostsPath.trim().length > 0) target.repoPostsPath = row.repoPostsPath.trim();
    if (typeof row.repoImagesPath === 'string' && row.repoImagesPath.trim().length > 0) target.repoImagesPath = row.repoImagesPath.trim();
    if (typeof row.themeFilePath === 'string' && row.themeFilePath.trim().length > 0) target.themeFilePath = row.themeFilePath.trim();
    if (typeof row.themeRepoPath === 'string' && row.themeRepoPath.trim().length > 0) target.themeRepoPath = row.themeRepoPath.trim();
    if (typeof row.siteUrl === 'string' && row.siteUrl.trim().length > 0) target.siteUrl = row.siteUrl.trim();
    if (Array.isArray(row.themes)) {
      target.themes = row.themes
        .map((theme) => (typeof theme === 'string' ? theme.trim() : ''))
        .filter((theme) => theme.length > 0);
    }

    return target;
  }

  private parseLineBased(content: string): Partial<BlogPublisherSettings> {
    const settings: Partial<BlogPublisherSettings> = {};
    const body = content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
    const lines = body.split('\n');
    let currentKey: string | null = null;
    let listValues: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        if (currentKey && listValues.length > 0) {
          this.setListValue(settings, currentKey, listValues);
        }
        currentKey = null;
        listValues = [];
        continue;
      }

      const listMatch = line.match(/^\s+-\s+(.+)/);
      if (listMatch && currentKey) {
        listValues.push(listMatch[1].trim());
        continue;
      }

      const kvMatch = line.match(/^(\w+):\s*(.*)/);
      if (!kvMatch) continue;

      if (currentKey && listValues.length > 0) {
        this.setListValue(settings, currentKey, listValues);
      }

      const key = kvMatch[1];
      const value = kvMatch[2].trim();
      listValues = [];

      if (!value) {
        currentKey = key;
      } else {
        currentKey = null;
        this.setStringValue(settings, key as keyof BlogPublisherSettings, value);
      }
    }

    if (currentKey && listValues.length > 0) {
      this.setListValue(settings, currentKey, listValues);
    }

    return settings;
  }

  merge(pluginSettings: BlogPublisherSettings, stateOverrides: Partial<BlogPublisherSettings> | null): BlogPublisherSettings {
    if (!stateOverrides) return pluginSettings;
    return { ...pluginSettings, ...stateOverrides };
  }
}

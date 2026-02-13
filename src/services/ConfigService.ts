import { App, TFile } from 'obsidian';
import { BlogPublisherSettings } from '../models/types';

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

    // Strip YAML frontmatter delimiters if present
    const body = content.replace(/^---\n[\s\S]*?\n---\n?/, '');

    const lines = body.split('\n');
    let currentKey: string | null = null;
    let listValues: string[] = [];

    for (const line of lines) {
      // Skip comments and empty lines
      if (line.startsWith('#') || line.trim() === '') {
        if (currentKey && listValues.length > 0) {
          this.setListValue(settings, currentKey, listValues);
          currentKey = null;
          listValues = [];
        }
        continue;
      }

      // List item (indented with -)
      const listMatch = line.match(/^\s+-\s+(.+)/);
      if (listMatch && currentKey) {
        listValues.push(listMatch[1].trim());
        continue;
      }

      // Key: value pair
      const kvMatch = line.match(/^(\w+):\s*(.*)/);
      if (kvMatch) {
        // Flush previous list
        if (currentKey && listValues.length > 0) {
          this.setListValue(settings, currentKey, listValues);
          listValues = [];
        }

        const key = kvMatch[1];
        const value = kvMatch[2].trim();

        if (value === '') {
          // Next lines might be a list
          currentKey = key;
        } else {
          this.setStringValue(settings, key, value);
          currentKey = null;
        }
      }
    }

    // Flush final list
    if (currentKey && listValues.length > 0) {
      this.setListValue(settings, currentKey, listValues);
    }

    return settings;
  }

  private setStringValue(settings: Partial<BlogPublisherSettings>, key: string, value: string): void {
    const validKeys: (keyof BlogPublisherSettings)[] = [
      'githubToken', 'repository', 'branch', 'postsFolder',
      'themeFilePath', 'themeRepoPath', 'siteUrl',
    ];
    if (validKeys.includes(key as keyof BlogPublisherSettings)) {
      (settings as any)[key] = value;
    }
  }

  private setListValue(settings: Partial<BlogPublisherSettings>, key: string, values: string[]): void {
    if (key === 'themes') {
      settings.themes = values;
    }
  }

  merge(pluginSettings: BlogPublisherSettings, stateOverrides: Partial<BlogPublisherSettings> | null): BlogPublisherSettings {
    if (!stateOverrides) return pluginSettings;
    return { ...pluginSettings, ...stateOverrides };
  }
}

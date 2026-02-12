import { Notice, Plugin, TFile } from 'obsidian';
import { PluginSettings, DEFAULT_SETTINGS } from './models/types';
import { PostService } from './services/PostService';
import { GitHubService } from './services/GitHubService';
import { SettingsTab } from './ui/SettingsTab';

export default class BlogPublisherPlugin extends Plugin {
    settings: PluginSettings;
    private publishTimeouts: Map<string, NodeJS.Timeout> = new Map();
    private writebackGuard: Map<string, number> = new Map();

    async onload() {
        console.log('Loading Blog Publisher plugin');
        await this.loadSettings();

        this.addSettingTab(new SettingsTab(this.app, this));

        // Manual publish command
        this.addCommand({
            id: 'publish-blog-post',
            name: 'Publish Blog Post',
            checkCallback: (checking: boolean) => {
                const file = this.app.workspace.getActiveFile();
                const cmdFolder = this.settings.postsFolder.replace(/\/$/, '');
                if (!file || !file.path.startsWith(cmdFolder + '/')) {
                    return false;
                }
                if (!checking) {
                    this.publishFile(file);
                }
                return true;
            },
        });

        // Watch for file modifications in posts folder
        this.registerEvent(
            this.app.vault.on('modify', (file) => {
                if (!(file instanceof TFile)) return;
                const folder = this.settings.postsFolder.replace(/\/$/, '');
                if (!file.path.startsWith(folder + '/')) return;
                if (!file.path.endsWith('.md')) return;

                // Writeback guard: skip if we recently wrote to this file
                const guardTimestamp = this.writebackGuard.get(file.path);
                if (guardTimestamp && Date.now() - guardTimestamp < 5000) {
                    return;
                }
                this.writebackGuard.delete(file.path);

                // Debounce 2 seconds per file
                const existing = this.publishTimeouts.get(file.path);
                if (existing) clearTimeout(existing);

                const timeout = setTimeout(() => {
                    this.publishTimeouts.delete(file.path);
                    this.checkAndPublish(file);
                }, 2000);
                this.publishTimeouts.set(file.path, timeout);
            })
        );
    }

    async onunload() {
        console.log('Unloading Blog Publisher plugin');
        // Clear pending timeouts
        for (const timeout of this.publishTimeouts.values()) {
            clearTimeout(timeout);
        }
        this.publishTimeouts.clear();
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    private async checkAndPublish(file: TFile) {
        const cache = this.app.metadataCache.getFileCache(file);
        if (!cache?.frontmatter) return;
        if (cache.frontmatter.status !== 'publish') return;

        await this.publishFile(file);
    }

    private async publishFile(file: TFile) {
        if (!this.settings.githubToken) {
            new Notice('Blog Publisher: No GitHub token configured. Check plugin settings.');
            return;
        }

        const publishingNotice = new Notice(`Publishing...`, 0);

        try {
            const postService = new PostService(this.app, this.settings);
            const postData = await postService.buildPostData(file);

            // Idempotency check
            const cache = this.app.metadataCache.getFileCache(file);
            const existingHash = cache?.frontmatter?.publishedHash;
            if (existingHash && existingHash === postData.publishedHash) {
                publishingNotice.hide();
                // Content unchanged — just ensure status is "published"
                if (cache?.frontmatter?.status === 'publish') {
                    await this.writeBackFrontmatter(file, {
                        status: 'published',
                    });
                    new Notice('No changes detected — marked as published.');
                }
                return;
            }

            // Publish to GitHub
            const githubService = new GitHubService(this.app, this.settings);
            const result = await githubService.publish(postData);

            // Write back frontmatter
            await this.writeBackFrontmatter(file, {
                status: 'published',
                publishedAt: new Date().toISOString(),
                publishedCommit: result.commitSha,
                publishedHash: postData.publishedHash,
            });

            publishingNotice.hide();
            new Notice(`Published: ${postData.title}\n${result.postUrl}`);

        } catch (e: unknown) {
            publishingNotice.hide();
            const msg = e instanceof Error ? e.message : String(e);
            new Notice(`Publish failed: ${msg}`, 10000);
            console.error('Blog Publisher error:', e);
        }
    }

    private async writeBackFrontmatter(
        file: TFile,
        updates: Record<string, string>
    ) {
        // Add to writeback guard before modifying
        this.writebackGuard.set(file.path, Date.now());

        // Safety cleanup: remove from guard after 5 seconds
        setTimeout(() => {
            const ts = this.writebackGuard.get(file.path);
            if (ts && Date.now() - ts >= 5000) {
                this.writebackGuard.delete(file.path);
            }
        }, 5000);

        await this.app.fileManager.processFrontMatter(file, (fm) => {
            for (const [key, value] of Object.entries(updates)) {
                fm[key] = value;
            }
        });
    }
}

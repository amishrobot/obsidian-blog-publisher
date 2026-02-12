import { Notice, Plugin, TFile } from 'obsidian';
import { PluginSettings, DEFAULT_SETTINGS } from './models/types';
import { PostService } from './services/PostService';
import { GitHubService } from './services/GitHubService';
import { SettingsTab } from './ui/SettingsTab';

export default class BlogPublisherPlugin extends Plugin {
    settings: PluginSettings;
    private publishTimeouts: Map<string, NodeJS.Timeout> = new Map();
    private writebackGuard: Map<string, number> = new Map();
    private publishQueue: Promise<void> = Promise.resolve();

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
                    this.enqueuePublish(() => this.publishFile(file));
                }
                return true;
            },
        });

        this.addCommand({
            id: 'publish-blog-theme-settings',
            name: 'Publish Blog Theme Settings',
            callback: async () => {
                const themeFile = this.app.vault.getAbstractFileByPath(this.settings.themeFilePath);
                if (!(themeFile instanceof TFile)) {
                    new Notice(`Theme file not found: ${this.settings.themeFilePath}`);
                    return;
                }
                this.enqueuePublish(() => this.publishThemeFile(themeFile));
            },
        });

        // Watch for file modifications in posts folder
        this.registerEvent(
            this.app.vault.on('modify', (file) => {
                if (!(file instanceof TFile)) return;
                const folder = this.settings.postsFolder.replace(/\/$/, '');
                const isPost =
                    file.path.startsWith(folder + '/') && file.path.endsWith('.md');
                const isThemeFile = file.path === this.settings.themeFilePath;
                if (!isPost && !isThemeFile) return;

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
                    if (isThemeFile) {
                        this.enqueuePublish(() => this.publishThemeFile(file));
                        return;
                    }
                    this.enqueuePublish(() => this.checkAndPublish(file));
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

        if (cache.frontmatter.status === 'publish') {
            await this.publishFile(file);
        } else if (cache.frontmatter.status === 'draft' && cache.frontmatter.publishedCommit) {
            await this.unpublishFile(file);
        }
    }

    private enqueuePublish(task: () => Promise<void>) {
        this.publishQueue = this.publishQueue
            .then(task)
            .catch((error) => {
                console.error('Blog Publisher queued task failed:', error);
            });
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

    private async unpublishFile(file: TFile) {
        if (!this.settings.githubToken) {
            new Notice('Blog Publisher: No GitHub token configured. Check plugin settings.');
            return;
        }

        const unpublishingNotice = new Notice('Unpublishing...', 0);

        try {
            const postService = new PostService(this.app, this.settings);
            const postData = await postService.buildPostData(file);

            // Collect all repo paths to delete
            const filePaths = [postData.repoPostPath, ...postData.images.map(img => img.repoPath)];

            const githubService = new GitHubService(this.app, this.settings);
            await githubService.unpublish(filePaths, postData.title);

            // Clear published metadata
            await this.writeBackFrontmatter(file, {
                publishedAt: '',
                publishedCommit: '',
                publishedHash: '',
            });

            unpublishingNotice.hide();
            new Notice(`Unpublished: ${postData.title}`);

        } catch (e: unknown) {
            unpublishingNotice.hide();
            const msg = e instanceof Error ? e.message : String(e);
            new Notice(`Unpublish failed: ${msg}`, 10000);
            console.error('Blog Publisher error:', e);
        }
    }

    private async publishThemeFile(file: TFile) {
        if (!this.settings.githubToken) {
            new Notice('Blog Publisher: No GitHub token configured. Check plugin settings.');
            return;
        }

        const publishingNotice = new Notice('Publishing theme settings...', 0);

        try {
            const content = await this.app.vault.read(file);
            const contentHash = await this.hashText(content);
            if (this.settings.themePublishedHash === contentHash) {
                publishingNotice.hide();
                new Notice('Theme settings unchanged; skipping publish.');
                return;
            }

            const githubService = new GitHubService(this.app, this.settings);
            const commitSha = await githubService.publishTextFile(
                this.settings.themeRepoPath,
                content,
                'Publish: theme settings'
            );

            this.settings.themePublishedHash = contentHash;
            this.settings.themePublishedCommit = commitSha;
            await this.saveSettings();

            publishingNotice.hide();
            new Notice(`Published theme settings (${commitSha.slice(0, 7)}).`);
        } catch (e: unknown) {
            publishingNotice.hide();
            const msg = e instanceof Error ? e.message : String(e);
            new Notice(`Theme publish failed: ${msg}`, 10000);
            console.error('Blog Publisher theme publish error:', e);
        }
    }

    private async hashText(content: string): Promise<string> {
        const encoder = new TextEncoder();
        const data = encoder.encode(content);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
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
                if (value === '') {
                    delete fm[key];
                } else {
                    fm[key] = value;
                }
            }
        });
    }
}

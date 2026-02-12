import { App, TFile, requestUrl } from 'obsidian';
import { PluginSettings, PostData, PublishResult } from '../models/types';

interface BlobRef {
    path: string;
    sha: string;
    mode: '100644';
    type: 'blob';
}

export class GitHubService {
    private owner: string;
    private repo: string;

    constructor(
        private app: App,
        private settings: PluginSettings
    ) {
        const parts = settings.repository.split('/');
        if (parts.length !== 2 || !parts[0] || !parts[1]) {
            throw new Error('Invalid repository format. Must be "owner/repo"');
        }
        this.owner = parts[0];
        this.repo = parts[1];
    }

    async unpublish(filePaths: string[], title: string): Promise<string> {
        const deletions = filePaths.map(path => ({
            path,
            mode: '100644' as const,
            type: 'blob' as const,
            sha: null,
        }));
        return this.withRefRetry((headSha, treeSha) =>
            this.deleteAndUpdateRef(deletions, treeSha, headSha, title)
        );
    }

    private async deleteAndUpdateRef(
        deletions: { path: string; mode: '100644'; type: 'blob'; sha: null }[],
        baseTreeSha: string,
        parentCommitSha: string,
        title: string
    ): Promise<string> {
        const tree = await this.apiPost(
            `/repos/${this.owner}/${this.repo}/git/trees`,
            { base_tree: baseTreeSha, tree: deletions }
        );

        const commit = await this.apiPost(
            `/repos/${this.owner}/${this.repo}/git/commits`,
            {
                message: `Unpublish: ${title}`,
                tree: tree.sha,
                parents: [parentCommitSha],
            }
        );

        await this.apiPatch(
            `/repos/${this.owner}/${this.repo}/git/refs/heads/${this.settings.branch}`,
            { sha: commit.sha }
        );

        return commit.sha;
    }

    async publish(postData: PostData): Promise<PublishResult> {
        // Step 2: Create blobs for all files
        const blobs = await this.createBlobs(postData);
        const commitSha = await this.withRefRetry((headSha, treeSha) =>
            this.createCommitAndUpdateRef(
                blobs,
                treeSha,
                headSha,
                `Publish: ${postData.title}`
            )
        );

        const postUrl = `${this.settings.siteUrl}/${postData.year}/${postData.slug}`;
        return { commitSha, postUrl };
    }

    async publishTextFile(
        repoPath: string,
        content: string,
        message: string
    ): Promise<string> {
        const blob = await this.apiPost(
            `/repos/${this.owner}/${this.repo}/git/blobs`,
            { content, encoding: 'utf-8' }
        );

        const blobs: BlobRef[] = [
            {
                path: repoPath,
                sha: blob.sha,
                mode: '100644',
                type: 'blob',
            },
        ];

        return this.withRefRetry((headSha, treeSha) =>
            this.createCommitAndUpdateRef(blobs, treeSha, headSha, message)
        );
    }

    private async getHeadSha(): Promise<string> {
        const resp = await this.apiGet(
            `/repos/${this.owner}/${this.repo}/git/ref/heads/${this.settings.branch}`
        );
        return resp.object.sha;
    }

    private async getTreeSha(commitSha: string): Promise<string> {
        const resp = await this.apiGet(
            `/repos/${this.owner}/${this.repo}/git/commits/${commitSha}`
        );
        return resp.tree.sha;
    }

    private async createBlobs(postData: PostData): Promise<BlobRef[]> {
        const blobs: BlobRef[] = [];

        // Create blob for markdown file (utf-8)
        const mdBlob = await this.apiPost(
            `/repos/${this.owner}/${this.repo}/git/blobs`,
            { content: postData.transformedMarkdown, encoding: 'utf-8' }
        );
        blobs.push({
            path: postData.repoPostPath,
            sha: mdBlob.sha,
            mode: '100644',
            type: 'blob',
        });

        // Create blobs for images (base64)
        for (const img of postData.images) {
            const file = this.app.vault.getAbstractFileByPath(img.vaultPath);
            if (!(file instanceof TFile)) {
                throw new Error(`Image file not found: ${img.vaultPath}`);
            }
            const binary = await this.app.vault.readBinary(file);
            const base64 = this.arrayBufferToBase64(binary);

            const imgBlob = await this.apiPost(
                `/repos/${this.owner}/${this.repo}/git/blobs`,
                { content: base64, encoding: 'base64' }
            );
            blobs.push({
                path: img.repoPath,
                sha: imgBlob.sha,
                mode: '100644',
                type: 'blob',
            });
        }

        return blobs;
    }

    private async createCommitAndUpdateRef(
        blobs: BlobRef[],
        baseTreeSha: string,
        parentCommitSha: string,
        message: string
    ): Promise<string> {
        // Create tree
        const tree = await this.apiPost(
            `/repos/${this.owner}/${this.repo}/git/trees`,
            {
                base_tree: baseTreeSha,
                tree: blobs,
            }
        );

        // Create commit
        const commit = await this.apiPost(
            `/repos/${this.owner}/${this.repo}/git/commits`,
            {
                message,
                tree: tree.sha,
                parents: [parentCommitSha],
            }
        );

        // Update ref
        await this.apiPatch(
            `/repos/${this.owner}/${this.repo}/git/refs/heads/${this.settings.branch}`,
            { sha: commit.sha }
        );

        return commit.sha;
    }

    private headers(): Record<string, string> {
        return {
            'Authorization': `Bearer ${this.settings.githubToken}`,
            'Accept': 'application/vnd.github+json',
            'Content-Type': 'application/json',
            'X-GitHub-Api-Version': '2022-11-28',
        };
    }

    private async apiRequest(method: string, path: string, body?: Record<string, any>): Promise<Record<string, any>> {
        const url = `https://api.github.com${path}`;
        try {
            const resp = await requestUrl({
                url,
                method,
                headers: this.headers(),
                body: body ? JSON.stringify(body) : undefined,
            });
            return resp.json;
        } catch (e: any) {
            // Obsidian's requestUrl throws on non-2xx — extract details
            const status = e?.status || 'unknown';
            let detail = '';
            try {
                detail = JSON.stringify(e?.response?.json || e?.message || e);
            } catch {
                detail = String(e);
            }
            throw new Error(`GitHub ${status} on ${method} ${path}: ${detail}`);
        }
    }

    private async apiGet(path: string): Promise<Record<string, any>> {
        return this.apiRequest('GET', path);
    }

    private async apiPost(path: string, body: Record<string, any>): Promise<Record<string, any>> {
        return this.apiRequest('POST', path, body);
    }

    private async apiPatch(path: string, body: Record<string, any>): Promise<Record<string, any>> {
        return this.apiRequest('PATCH', path, body);
    }

    async fileContentEquals(repoPath: string, expectedContent: string): Promise<boolean> {
        try {
            const encodedPath = repoPath
                .split('/')
                .map((part) => encodeURIComponent(part))
                .join('/');
            const resp = await this.apiGet(
                `/repos/${this.owner}/${this.repo}/contents/${encodedPath}?ref=${this.settings.branch}`
            );
            const contentBase64 = String(resp.content || '').replace(/\n/g, '');
            const actualContent = atob(contentBase64);
            return actualContent === expectedContent;
        } catch (error: unknown) {
            if (error instanceof Error && error.message.includes('404')) {
                return false;
            }
            throw error;
        }
    }

    private shouldRetryRefUpdate(error: unknown): boolean {
        if (!(error instanceof Error)) return false;
        return (
            error.message.includes('409') ||
            error.message.includes('422') ||
            error.message.includes('Reference update failed') ||
            error.message.includes('Update is not a fast forward')
        );
    }

    private async withRefRetry(
        operation: (headSha: string, treeSha: string) => Promise<string>
    ): Promise<string> {
        const maxAttempts = 5;
        let lastError: unknown = null;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            const headSha = await this.getHeadSha();
            const treeSha = await this.getTreeSha(headSha);

            try {
                return await operation(headSha, treeSha);
            } catch (error: unknown) {
                lastError = error;
                if (!this.shouldRetryRefUpdate(error) || attempt === maxAttempts) {
                    throw error;
                }
                await this.sleep(attempt * 250);
            }
        }

        throw lastError instanceof Error ? lastError : new Error(String(lastError));
    }

    private async sleep(ms: number): Promise<void> {
        await new Promise((resolve) => setTimeout(resolve, ms));
    }

    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }
}

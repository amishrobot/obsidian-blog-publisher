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
        let headSha = await this.getHeadSha();
        let treeSha = await this.getTreeSha(headSha);

        const deletions = filePaths.map(path => ({
            path,
            mode: '100644' as const,
            type: 'blob' as const,
            sha: null,
        }));

        let commitSha: string;
        try {
            commitSha = await this.deleteAndUpdateRef(deletions, treeSha, headSha, title);
        } catch (e: unknown) {
            if (e instanceof Error && e.message.includes('409')) {
                headSha = await this.getHeadSha();
                treeSha = await this.getTreeSha(headSha);
                commitSha = await this.deleteAndUpdateRef(deletions, treeSha, headSha, title);
            } else {
                throw e;
            }
        }

        return commitSha;
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

        const resp = await requestUrl({
            url: `https://api.github.com/repos/${this.owner}/${this.repo}/git/refs/heads/${this.settings.branch}`,
            method: 'PATCH',
            headers: this.headers(),
            body: JSON.stringify({ sha: commit.sha }),
        });

        if (resp.status === 409) {
            throw new Error('409 conflict updating ref');
        }
        if (resp.status < 200 || resp.status >= 300) {
            throw new Error(`GitHub API error ${resp.status}: ${JSON.stringify(resp.json)}`);
        }

        return commit.sha;
    }

    async publish(postData: PostData): Promise<PublishResult> {
        // Step 1: Get current head ref
        let headSha = await this.getHeadSha();
        let treeSha = await this.getTreeSha(headSha);

        // Step 2: Create blobs for all files
        const blobs = await this.createBlobs(postData);

        // Step 3-6: Create tree, commit, update ref (with 409 retry)
        let commitSha: string;
        try {
            commitSha = await this.createCommitAndUpdateRef(blobs, treeSha, headSha, postData);
        } catch (e: unknown) {
            if (e instanceof Error && e.message.includes('409')) {
                // Retry once: refetch head, rebuild
                headSha = await this.getHeadSha();
                treeSha = await this.getTreeSha(headSha);
                commitSha = await this.createCommitAndUpdateRef(blobs, treeSha, headSha, postData);
            } else {
                throw e;
            }
        }

        const postUrl = `${this.settings.siteUrl}/${postData.year}/${postData.slug}`;
        return { commitSha, postUrl };
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
        postData: PostData
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
                message: `Publish: ${postData.title}`,
                tree: tree.sha,
                parents: [parentCommitSha],
            }
        );

        // Update ref
        const resp = await requestUrl({
            url: `https://api.github.com/repos/${this.owner}/${this.repo}/git/refs/heads/${this.settings.branch}`,
            method: 'PATCH',
            headers: this.headers(),
            body: JSON.stringify({ sha: commit.sha }),
        });

        if (resp.status === 409) {
            throw new Error('409 conflict updating ref');
        }
        if (resp.status < 200 || resp.status >= 300) {
            throw new Error(`GitHub API error ${resp.status}: ${JSON.stringify(resp.json)}`);
        }

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

    private async apiGet(path: string): Promise<Record<string, any>> {
        const resp = await requestUrl({
            url: `https://api.github.com${path}`,
            method: 'GET',
            headers: this.headers(),
        });
        if (resp.status < 200 || resp.status >= 300) {
            throw new Error(`GitHub API error ${resp.status}: ${JSON.stringify(resp.json)}`);
        }
        return resp.json;
    }

    private async apiPost(path: string, body: Record<string, any>): Promise<Record<string, any>> {
        const resp = await requestUrl({
            url: `https://api.github.com${path}`,
            method: 'POST',
            headers: this.headers(),
            body: JSON.stringify(body),
        });
        if (resp.status < 200 || resp.status >= 300) {
            throw new Error(`GitHub API error ${resp.status}: ${JSON.stringify(resp.json)}`);
        }
        return resp.json;
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

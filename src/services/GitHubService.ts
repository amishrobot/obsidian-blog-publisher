import { App, TFile, requestUrl } from 'obsidian';
import { BlogPublisherSettings, PostData } from '../models/types';
import { buildPostUrl } from '../utils/postUrl';

interface GitTreeEntry {
  path: string;
  mode: string;
  type: string;
  sha: string | null;
}

export class GitHubService {
  private app: App;
  private settings: BlogPublisherSettings;
  private owner: string;
  private repo: string;

  constructor(app: App, settings: BlogPublisherSettings) {
    this.app = app;
    this.settings = settings;
    const parts = settings.repository.split('/');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      throw new Error('Invalid repository format. Must be "owner/repo"');
    }
    this.owner = parts[0];
    this.repo = parts[1];
  }

  async publish(postData: PostData): Promise<{ commitSha: string; postUrl: string }> {
    const blobs = await this.createBlobs(postData);
    const commitSha = await this.withRefRetry(
      (headSha: string, treeSha: string) =>
        this.createCommitAndUpdateRef(
          blobs,
          treeSha,
          headSha,
          `Publish: ${postData.title}`
        )
    );
    const postUrl = buildPostUrl(this.settings, postData.date, postData.slug);
    return { commitSha, postUrl };
  }

  async unpublish(filePaths: string[], title: string): Promise<string> {
    const deletions: GitTreeEntry[] = filePaths.map((path) => ({
      path,
      mode: '100644',
      type: 'blob',
      sha: null,
    }));
    return this.withRefRetry(
      (headSha: string, treeSha: string) =>
        this.deleteAndUpdateRef(deletions, treeSha, headSha, title)
    );
  }

  async publishTextFile(repoPath: string, content: string, message: string): Promise<string> {
    const blob = await this.apiPost(
      `/repos/${this.owner}/${this.repo}/git/blobs`,
      { content, encoding: 'utf-8' }
    );
    const blobs: GitTreeEntry[] = [
      {
        path: repoPath,
        sha: blob.sha,
        mode: '100644',
        type: 'blob',
      },
    ];
    return this.withRefRetry(
      (headSha: string, treeSha: string) =>
        this.createCommitAndUpdateRef(blobs, treeSha, headSha, message)
    );
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
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return false;
      }
      throw error;
    }
  }

  // ── Internal methods ──────────────────────────────────────────────

  private async deleteAndUpdateRef(
    deletions: GitTreeEntry[],
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
      { sha: commit.sha, force: false }
    );
    return commit.sha;
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

  private async createBlobs(postData: PostData): Promise<GitTreeEntry[]> {
    const blobs: GitTreeEntry[] = [];

    // Create blob for the markdown content
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

    // Create blobs for each image
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
    blobs: GitTreeEntry[],
    baseTreeSha: string,
    parentCommitSha: string,
    message: string
  ): Promise<string> {
    const tree = await this.apiPost(
      `/repos/${this.owner}/${this.repo}/git/trees`,
      { base_tree: baseTreeSha, tree: blobs }
    );
    const commit = await this.apiPost(
      `/repos/${this.owner}/${this.repo}/git/commits`,
      {
        message,
        tree: tree.sha,
        parents: [parentCommitSha],
      }
    );
    await this.apiPatch(
      `/repos/${this.owner}/${this.repo}/git/refs/heads/${this.settings.branch}`,
      { sha: commit.sha, force: false }
    );
    return commit.sha;
  }

  private async withRefRetry(
    operation: (headSha: string, treeSha: string) => Promise<string>
  ): Promise<string> {
    const maxAttempts = 8;
    let lastError: unknown = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const headSha = await this.getHeadSha();
      const treeSha = await this.getTreeSha(headSha);
      try {
        return await operation(headSha, treeSha);
      } catch (error) {
        lastError = error;
        if (!this.shouldRetryRefUpdate(error) || attempt === maxAttempts) {
          throw error;
        }
        await this.sleep(attempt * 350 + Math.floor(Math.random() * 150));
      }
    }
    throw lastError instanceof Error ? lastError : new Error(String(lastError));
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

  // ── HTTP helpers ──────────────────────────────────────────────────

  private headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.settings.githubToken}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async apiRequest(method: string, path: string, body?: any): Promise<any> {
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
      const status = e?.status || 'unknown';
      let detail = '';
      try {
        detail = JSON.stringify(
          e?.response?.json
          || e?.response?.text
          || e?.response?.body
          || e?.message
          || e
        );
      } catch {
        detail = String(e);
      }
      throw new Error(`GitHub ${status} on ${method} ${path}: ${detail}`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async apiGet(path: string): Promise<any> {
    return this.apiRequest('GET', path);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async apiPost(path: string, body: any): Promise<any> {
    return this.apiRequest('POST', path, body);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async apiPatch(path: string, body: any): Promise<any> {
    return this.apiRequest('PATCH', path, body);
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private async sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}

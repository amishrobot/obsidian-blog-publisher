export interface PluginSettings {
    githubToken: string;
    repository: string;       // "owner/repo"
    branch: string;
    postsFolder: string;      // Vault folder to watch
    siteUrl: string;
}

export const DEFAULT_SETTINGS: PluginSettings = {
    githubToken: '',
    repository: 'amishrobot/amishrobot.com',
    branch: 'main',
    postsFolder: 'Personal/Blog/posts',
    siteUrl: 'https://amishrobot.com',
};

export interface ImageRef {
    vaultPath: string;        // Resolved absolute path in vault
    filename: string;         // Final filename (after collision rename)
    repoPath: string;         // Path in GitHub repo
    originalWikilink: string; // The full ![[...]] match for replacement
}

export interface PostData {
    title: string;
    date: string;             // YYYY-MM-DD
    year: string;             // YYYY extracted from date
    slug: string;             // Normalized [a-z0-9-]
    repoPostPath: string;     // content/posts/{YYYY}/{slug}.md
    transformedMarkdown: string;
    images: ImageRef[];
    publishedHash: string;
}

export interface PublishResult {
    commitSha: string;
    postUrl: string;
}

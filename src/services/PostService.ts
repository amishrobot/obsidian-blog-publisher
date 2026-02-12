import { App, TFile } from 'obsidian';
import { PluginSettings, PostData, ImageRef } from '../models/types';

const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'avif', 'bmp']);

export class PostService {
    constructor(
        private app: App,
        private settings: PluginSettings
    ) {}

    async buildPostData(file: TFile): Promise<PostData> {
        const cache = this.app.metadataCache.getFileCache(file);
        if (!cache?.frontmatter) {
            throw new Error('No frontmatter found');
        }

        const fm = cache.frontmatter;

        // Validate required fields
        if (!fm.title) throw new Error('Missing required frontmatter: title');
        if (!fm.date) throw new Error('Missing required frontmatter: date');
        if (!fm.slug) throw new Error('Missing required frontmatter: slug');

        const title = String(fm.title);
        const date = String(fm.date);
        const slug = this.normalizeSlug(String(fm.slug));

        // Extract year from date
        const yearMatch = date.match(/^(\d{4})/);
        if (!yearMatch) throw new Error(`Invalid date format: ${date}`);
        const year = yearMatch[1];

        // Read file content
        const content = await this.app.vault.read(file);

        // Find and resolve images
        const images = await this.resolveImages(content, year, slug);

        // Build transformed markdown (rewrite wikilinks in committed copy)
        const transformedMarkdown = this.rewriteImageLinks(content, images, year, slug);

        // Compute hash for idempotency
        const publishedHash = await this.computeHash(transformedMarkdown, images);

        const repoPostPath = `content/posts/${year}/${slug}.md`;

        return {
            title,
            date,
            year,
            slug,
            repoPostPath,
            transformedMarkdown,
            images,
            publishedHash,
        };
    }

    private normalizeSlug(slug: string): string {
        return slug
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }

    private async resolveImages(content: string, year: string, slug: string): Promise<ImageRef[]> {
        const images: ImageRef[] = [];
        const usedFilenames = new Set<string>();

        const re = /!\[\[([^\]|]+?)(?:\|([^\]]*))?\]\]/g;
        let match;

        while ((match = re.exec(content)) !== null) {
            const linkTarget = match[1].trim();
            const ext = linkTarget.split('.').pop()?.toLowerCase() || '';

            if (!IMAGE_EXTENSIONS.has(ext)) continue;

            // Resolve via Obsidian's link resolution
            const resolved = this.app.metadataCache.getFirstLinkpathDest(linkTarget, '');
            if (!resolved) {
                throw new Error(`Image not found in vault: ${linkTarget}`);
            }

            // Handle filename collisions within this post
            let filename = resolved.name;
            if (usedFilenames.has(filename.toLowerCase())) {
                const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
                const fileExt = filename.substring(filename.lastIndexOf('.'));
                let counter = 2;
                while (usedFilenames.has(`${nameWithoutExt}-${counter}${fileExt}`.toLowerCase())) {
                    counter++;
                }
                filename = `${nameWithoutExt}-${counter}${fileExt}`;
            }
            usedFilenames.add(filename.toLowerCase());

            images.push({
                vaultPath: resolved.path,
                filename,
                repoPath: `public/_assets/images/${year}/${slug}/${filename}`,
                originalWikilink: match[0],
            });
        }

        return images;
    }

    private rewriteImageLinks(content: string, images: ImageRef[], year: string, slug: string): string {
        let result = content;

        for (const img of images) {
            // Parse alt text from original wikilink
            const altMatch = img.originalWikilink.match(/!\[\[([^\]|]+?)(?:\|([^\]]*))?\]\]/);
            const alt = altMatch?.[2]?.trim() || '';
            const mdImage = `![${alt}](/_assets/images/${year}/${slug}/${img.filename})`;

            // Replace all occurrences of this wikilink
            result = result.replaceAll(img.originalWikilink, mdImage);
        }

        return result;
    }

    private async computeHash(transformedMarkdown: string, images: ImageRef[]): Promise<string> {
        const parts: string[] = [transformedMarkdown];

        // Add sorted image content hashes
        const imageHashes: string[] = [];
        for (const img of images) {
            const file = this.app.vault.getAbstractFileByPath(img.vaultPath);
            if (file instanceof TFile) {
                const data = await this.app.vault.readBinary(file);
                const hash = await this.hashArrayBuffer(data);
                imageHashes.push(`${img.filename}:${hash}`);
            }
        }
        imageHashes.sort();
        parts.push(...imageHashes);

        const combined = parts.join('\n');
        const encoder = new TextEncoder();
        const data = encoder.encode(combined);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    private async hashArrayBuffer(buffer: ArrayBuffer): Promise<string> {
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
}

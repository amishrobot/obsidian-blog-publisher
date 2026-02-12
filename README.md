# Blog Publisher

An Obsidian plugin that publishes blog posts to GitHub by changing frontmatter status. Designed for the AmishRobot blog (Astro/Vercel), but works with any static site that builds from a GitHub repo.

## Setup

### 1. Install via BRAT

1. Install [BRAT](https://github.com/TfTHacker/obsidian42-brat) if you don't have it
2. BRAT Settings → Add Beta Plugin → `amishrobot/obsidian-blog-publisher`
3. Enable "Blog Publisher" in Community Plugins

### 2. Create a GitHub Token

1. Go to [GitHub Settings → Fine-grained tokens](https://github.com/settings/tokens?type=beta)
2. Create a new token:
   - **Name**: Blog Publisher
   - **Expiration**: 90 days (or no expiration)
   - **Repository access**: Only select repositories → `amishrobot/amishrobot.com`
   - **Permissions**: Contents → Read and write
3. Copy the token

### 3. Configure the Plugin

Settings → Blog Publisher:

| Setting | Default | Description |
|---------|---------|-------------|
| GitHub Token | — | The fine-grained PAT from step 2 |
| Repository | `amishrobot/amishrobot.com` | Target `owner/repo` |
| Branch | `main` | Branch to commit to |
| Posts Folder | `Personal/Blog/posts` | Vault folder the plugin watches |
| Theme Settings File | `Personal/Blog/settings/theme.md` | Vault markdown file watched for theme changes |
| Theme Repo Path | `content/settings/theme.md` | Repo destination for theme settings file |
| Site URL | `https://amishrobot.com` | Used for success notice links |

## How It Works

### Publishing

1. Write a post with `status: draft` in frontmatter
2. When ready, change `status: publish` and save
3. The plugin detects the change, validates the post, and commits to GitHub
4. Frontmatter is updated automatically:
   - `status: published`
   - `publishedAt: <timestamp>`
   - `publishedCommit: <sha>`
   - `publishedHash: <content hash>`
5. Vercel auto-deploys from the commit

### Unpublishing

1. Change `status: draft` and save
2. The plugin deletes the post and its images from GitHub
3. Published metadata is cleared from frontmatter
4. Vercel redeploys without the post

### Republishing

1. Edit the post content
2. Change `status: publish` and save
3. The plugin detects the content hash changed and commits the update

If you set `status: publish` without changing content, the plugin skips the commit (idempotency) and just flips status to `published`.

### Manual Publish

Open the command palette and run **Publish Blog Post** to publish the current file regardless of the watcher.

### Theme Settings Publish

The plugin also watches your theme settings markdown file and commits it to the site repo:

- Vault file: `Personal/Blog/settings/theme.md`
- Repo file: `content/settings/theme.md`

Any save to the theme file triggers a commit and deploy, so theme switches follow the same workflow as posts.

Manual command: **Publish Blog Theme Settings**

## Frontmatter Contract

```yaml
---
title: My Post
date: 2026-02-11
slug: my-post
status: draft
type: post
---
```

**Required fields**: `title`, `date`, `slug`

- `slug` is normalized to lowercase `[a-z0-9-]`
- `date` must start with `YYYY` (used for repo path)
- `status` values: `draft` → `publish` (you set) → `published` (plugin sets)

**Plugin-managed fields** (do not edit manually):
- `publishedAt` — ISO 8601 timestamp of last publish
- `publishedCommit` — Git commit SHA
- `publishedHash` — Content hash for idempotency

## Image Handling

Embedded image wikilinks are rewritten in the committed copy (your Obsidian file is never modified):

| Obsidian (unchanged) | GitHub (committed) |
|---|---|
| `![[photo.jpg]]` | `![](/_assets/images/2026/my-post/photo.jpg)` |
| `![[photo.jpg\|alt text]]` | `![alt text](/_assets/images/2026/my-post/photo.jpg)` |

- Images are resolved via Obsidian's link resolution (works regardless of where the file is in your vault)
- Images are namespaced per post: `public/_assets/images/{year}/{slug}/`
- Duplicate filenames within a post are renamed: `photo.jpg` → `photo-2.jpg`
- Non-image wikilinks like `[[some-note]]` are left alone

## Repo Paths

Posts and images are committed to these paths in the target repo:

```
content/posts/{year}/{slug}.md
public/_assets/images/{year}/{slug}/{filename}
```

## Error Handling

- **Missing frontmatter field** → Error notice, status stays `publish` so you can fix it
- **Missing image** → Error notice, status stays `publish`
- **No GitHub token** → Error notice prompting you to check settings
- **GitHub API error** → Error notice with status code and details
- **Concurrent push (409)** → Automatic retry once

## Development

```bash
cd ~/Projects/obsidian-blog-publisher
npm install
npm run dev    # watch mode
npm run build  # production build
```

The plugin is installed via BRAT in production. For local development, you can symlink the built files into your vault's plugins directory:

```bash
mkdir -p ~/JoshOS/.obsidian/plugins/blog-publisher
ln -s ~/Projects/obsidian-blog-publisher/main.js ~/JoshOS/.obsidian/plugins/blog-publisher/main.js
ln -s ~/Projects/obsidian-blog-publisher/manifest.json ~/JoshOS/.obsidian/plugins/blog-publisher/manifest.json
ln -s ~/Projects/obsidian-blog-publisher/styles.css ~/JoshOS/.obsidian/plugins/blog-publisher/styles.css
```

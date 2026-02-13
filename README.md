# Blog Publisher

An Obsidian plugin for publishing blog posts to a GitHub-hosted Astro site. Opens a side panel with status controls, theme selection, pre-publish checks, and one-click deploy.

Built for [amishrobot.com](https://amishrobot.com).

## Features

- **Side panel UI** — status, theme, slug, tags, URL preview, change tracking
- **Publish** — pushes post markdown + images to GitHub via the git tree API; Vercel auto-deploys
- **Unpublish** — removes the post from GitHub entirely
- **Pre-publish checks** — validates frontmatter, slug format, links, and images before deploy
- **Theme selection** — switch between site themes (Classic, Paper, Spruce, Midnight)
- **Change tracking** — shows pending changes vs. last published state

## How It Works

```
Obsidian vault                Plugin                    GitHub repo              Vercel
┌──────────────┐    ┌──────────────────────┐    ┌──────────────────┐    ┌─────────────┐
│ posts/       │───>│ Build post data      │───>│ content/posts/   │───>│ Astro build │
│   slug.md    │    │ Resolve images       │    │ public/_assets/  │    │ Static site │
│ _assets/     │    │ Push via git tree API│    │                  │    │             │
└──────────────┘    └──────────────────────┘    └──────────────────┘    └─────────────┘
```

Posts have two statuses: **Draft** and **Published** (stored in frontmatter as `status: draft` or `status: publish`). The Astro site only renders posts with `status: publish`.

## Installation

This plugin is installed via [BRAT](https://github.com/TfTHacker/obsidian42-brat):

1. Install BRAT from the Obsidian community plugins
2. In BRAT settings, add this repo: `amishrobot/obsidian-blog-publisher`
3. Enable "Blog Publisher" in Obsidian's plugin settings
4. Configure your GitHub token and repository in the plugin settings

## Configuration

The plugin reads settings from a JoshOS state file (`_state/blog-config.md`) with fallback to Obsidian's plugin settings panel.

Required settings:

| Setting | Description |
|---------|-------------|
| `githubToken` | GitHub personal access token with repo scope |
| `repository` | GitHub repo in `owner/repo` format |
| `postsFolder` | Vault path to blog posts |
| `themes` | Available site themes |

## Tech Stack

| Layer | Technology |
|-------|------------|
| UI | [Preact](https://preactjs.com/) with inline styles |
| Build | esbuild with JSX transform |
| API | Obsidian Plugin API |
| Backend | GitHub REST API (git trees, blobs, commits) |

## Development

```bash
npm install
npm run dev    # watch mode
npm run build  # production build
```

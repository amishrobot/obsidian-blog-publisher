# Blog Publisher

An Obsidian plugin for publishing blog posts to a GitHub-hosted Astro site. Opens a side panel with status controls, theme selection, pre-publish checks, and one-click deploy.

Built for multi-site Obsidian-to-GitHub publishing.

## Features

- **Side panel UI** — status, theme, slug, tags, URL preview, change tracking
- **Publish** — pushes post markdown + images to GitHub via the git tree API; Vercel auto-deploys
- **Update-first published flow** — published posts can be updated directly via the bottom `Update` action
- **Multi-site routing** — routes files by canonical vault path: `Blog/<SiteName>/posts/**`
- **Pre-publish checks** — validates frontmatter, slug format, links, and images before deploy
- **Config guardrails** — validates target/token/repo config before GitHub API calls, with actionable fix messages
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

The plugin follows JoshOS config conventions:

- Non-secret publishing config in `_state/blog-config.md`
- Secrets in vault-local `.system/config.json`
- Plugin settings panel as fallback/override

Required settings:

| Setting | Description |
|---------|-------------|
| `githubToken` | Optional direct token override (password field in plugin settings) |
| `secretsFilePath` | Vault-local JSON file for sensitive values (default `.system/config.json`) |
| `githubTokenConfigKey` | JSON key used to resolve GitHub token (default `blog_publisher_github_token`) |
| `repository` | GitHub repo in `owner/repo` format |
| `postsFolder` | Vault path to blog posts |
| `themes` | Available site themes |
| `blogTargets` | Optional YAML array for per-folder repo/site/theme routing |
| `blogTargetsJson` | Optional JSON fallback when state file isn’t used |

Optional multi-blog routing (`_state/blog-config.md`):

```yaml
blogTargets:
  - name: SiteA
    postsFolder: Blog/SiteA/posts
    repository: your-org/site-a
    branch: main
    siteUrl: https://site-a.com
    repoPostsPath: content/posts
    repoImagesPath: public/_assets/images
    themeFilePath: Blog/SiteA/settings/theme.md
    themeRepoPath: content/settings/theme.md
    themes: [classic, paper, spruce, midnight, soviet]
  - name: SiteB
    postsFolder: Blog/SiteB/posts
    repository: your-org/site-b
    branch: main
    siteUrl: https://site-b.com
    repoPostsPath: src/content/posts
    repoImagesPath: public/_assets/images
    postUrlFormat: posts-slug
    themeFilePath: Blog/SiteB/settings/theme.md
    themeRepoPath: content/settings/theme.md
```

JoshOS-style secret storage (`.system/config.json`):

```json
{
  "blog_publisher_github_token": "github_pat_..."
}
```

Token resolution order:

1. `githubToken` from plugin settings or `_state/blog-config.md` (if set)
2. `secretsFilePath` + `githubTokenConfigKey` lookup in vault JSON

If `blogTargets` is omitted, the plugin keeps the legacy single-folder behavior using `postsFolder`.

Routing rules:

1. Exact target mapping by longest `blogTargets[].postsFolder` prefix (or inferred `Blog/<name>/posts` from target name).
2. Legacy fallback remains supported for `Blog/posts/**` and `Personal/Blog/posts/**` during migration.
3. Unknown paths are not treated as publishable post paths.
4. URL generation supports both styles:
   `year-slug` -> `/YYYY/slug`
   `posts-slug` -> `/posts/slug`

Full operating spec/runbook: `docs/multi-site-publishing-runbook.md`.
Starter profile template: `docs/profile-template.md`.

## Releases

- Canonical current release: `v2.0.23`
- See full notes in `CHANGELOG.md`
- BRAT release retention policy: keep latest 5 GitHub releases/tags only.
- Current retained set: `v2.0.22`, `v2.0.21`, `v2.0.20`, `v2.0.19`, `v2.0.18`.

## Operations Notes

- Canonical vault structure: `Blog/<SiteName>/posts/**`
- A `GitHub 404` on publish to a private repo typically means the configured token lacks access to that repo.

## Regression Checklist

Run this before every release:

1. `npm test` passes.
2. `npm run build` succeeds and updates `main.js`.
3. `package.json` + `manifest.json` versions match.
4. Vault plugin install has same version as repo manifest.
5. BRAT release exists with assets: `main.js`, `manifest.json`, `styles.css`.
6. Open published post in Obsidian panel: bottom action reads `Update` and is enabled.
7. Edit a published post (slug/tag/content), click `Update`, and confirm new commit SHA in frontmatter.
8. Verify live page content changed at the expected URL.
9. Verify image rendering for filenames with spaces/special chars.
10. Verify `date` auto-fills only when missing and does not overwrite existing dates.
11. Verify multi-blog routing:
    `Blog/SiteA/posts` -> target repo A
    `Blog/SiteB/posts` -> target repo B
12. Verify legacy fallback routing:
    `Blog/posts` -> configured default target.

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
npm run hooks:install
npm test
npm run dev    # watch mode
npm run build  # production build
```

## Git Hook Guard

Install once per clone:

```bash
npm run hooks:install
```

Verify on any machine:

```bash
npm run hooks:check
```

The `pre-push` hook enforces BRAT release hygiene on pushes to `main`:

- if plugin version changed, `v<version>` tag must exist
- matching GitHub release must exist
- release must include assets: `main.js`, `manifest.json`, `styles.css`

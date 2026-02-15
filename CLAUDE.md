# Blog Publisher — Obsidian Plugin

## Overview

Preact-powered side panel plugin for publishing blog posts from Obsidian to GitHub. Replaces v1's invisible frontmatter-watching with explicit UI controls.

## How It Works

### Status Model

Posts have two statuses: **Draft** and **Published**. Status is stored in frontmatter (`status: draft` or `status: publish`). The blog site filters by `status === 'publish'` — only published posts appear on the live site.

### Publish = Push to GitHub

Clicking "Publish" pushes the post markdown + images to the blog repo via GitHub's git tree API. Vercel auto-deploys from the repo. The post's status in frontmatter determines whether the site renders it:

- **Draft + Publish** → file exists on GitHub but site excludes it (not live)
- **Published + Publish** → file on GitHub with `status: publish`, site renders it (live)

### Update Published Posts

Published posts are updated directly through the bottom `Update` action in the panel. You do not need to switch to Draft first just to push edits.

### Change Tracking

The panel tracks a "saved" snapshot (captured when the panel first loads a file). Any changes to status, slug, tags, or theme are compared against this snapshot to show pending changes and enable the Publish button. The snapshot updates after a successful publish.

### Frontmatter Metadata

After a successful publish, the plugin writes these fields to frontmatter (but does NOT touch `status` — that's user-controlled):

```yaml
publishedAt: 2026-02-13T06:32:14.680Z
publishedCommit: abc123...
publishedHash: def456...
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| UI | Preact (h/Fragment), inline styles |
| Build | esbuild with JSX transform |
| API | Obsidian Plugin API (ItemView, requestUrl, parseYaml) |
| Backend | GitHub REST API (blobs, trees, commits) |
| Config | JoshOS `_state/blog-config.md` with Obsidian settings fallback |

## Project Structure

```
src/
├── main.ts                    # Plugin entry: view registration, commands, file watching
│                              # Contains publishFile() and unpublishFile() — these write
│                              # frontmatter after deploy (publishedAt, hash, commit)
├── PublishView.tsx             # Obsidian ItemView → mounts Preact PublishPanel
│                              # Parses frontmatter via parseYaml (NOT metadataCache)
│                              # Manages savedStates Map for change tracking
├── SettingsTab.ts              # Plugin settings UI (fallback for non-JoshOS)
├── models/types.ts             # All interfaces, constants, theme palettes
│                              # STATUS_CONFIG: draft, publish (2 statuses only)
├── services/
│   ├── GitHubService.ts        # GitHub REST API (publish/unpublish via git tree API)
│   ├── PostService.ts          # Build post data, resolve images, compute hashes
│   │                           # Parses frontmatter via parseYaml (NOT metadataCache)
│   ├── ConfigService.ts        # Read JoshOS _state/blog-config.md
│   └── ChecksService.ts       # 5 pre-publish validators
├── hooks/useHover.ts           # Shared hover state hook
└── components/                 # 14 Preact components (StatusPill, ThemeChip, etc.)
```

## CRITICAL: Release & Deployment Checklist

**Every time you change plugin code, you MUST follow ALL of these steps or the update won't reach Obsidian:**

1. **Build**: `npm run build` (produces `main.js`)
2. **Update version** in BOTH `manifest.json` AND `package.json` (they must match)
3. **Commit** all changes including `main.js` (it's committed, not gitignored)
4. **Git tag** with `v` prefix: `git tag v<version>` (e.g., `git tag v2.0.1`)
5. **Push** commits AND tag: `git push origin main --tags`
6. **Create GitHub Release** with assets: `gh release create v<version> --title "v<version>" --notes "..." main.js manifest.json styles.css`
7. **Install to vault**: `cp main.js manifest.json styles.css ~/JoshOS/.obsidian/plugins/blog-publisher/`
8. **Reload Obsidian** to pick up changes

**WHY RELEASES MATTER:** This plugin is installed via BRAT (Beta Reviewers Auto-update Tester). BRAT requires a **GitHub Release** (not just a git tag) with `main.js`, `manifest.json`, and `styles.css` attached as assets. The tag MUST have a `v` prefix (e.g., `v2.0.1` not `2.0.1`). Missing any of these = invisible to BRAT = update never arrives in Obsidian.

**DO NOT** overwrite `data.json` in the vault plugin directory — it contains the user's settings including the GitHub token.

## Release Canon

- Current canonical release: `v2.0.17`
- `v2.0.10` was tagged on the wrong commit and is superseded.
- Keep `CHANGELOG.md` updated for every release.

## Known Pitfalls

- **Obsidian `metadataCache` is async** — it can be stale immediately after `processFrontMatter` writes. Always use `parseYaml` on raw file content (via `vault.read()`) instead of `metadataCache.getFileCache()`.
- **`publishFile()` and `unpublishFile()` in `main.ts`** write frontmatter after deploy. If status bugs appear, check here FIRST — previous bugs were caused by these methods overwriting the user's chosen status.
- **Blog site filters by `status === 'publish'`** in all page routes (index, archive, RSS, post pages, redirects). Posts with any other status are excluded from the build.

## GitHub Remote

- **Repo**: `https://github.com/amishrobot/obsidian-blog-publisher.git`
- **Remote name**: `origin`

## Related Repos & Paths

| What | Path |
|------|------|
| Plugin source | `~/Projects/obsidian-blog-publisher/` |
| Vault install | `~/JoshOS/.obsidian/plugins/blog-publisher/` |
| Blog site repo | `~/Projects/AmishRobot-Blog/` |
| JoshOS code repo | `~/Projects/JoshOS/` |
| Vault | `~/JoshOS/` |
| Config state file | `~/JoshOS/_state/blog-config.md` |

## Design References

| Doc | Path |
|-----|------|
| Design doc | `~/Projects/AmishRobot-Blog/docs/plans/2026-02-12-blog-publisher-v2-design.md` |
| Implementation plan | `~/Projects/AmishRobot-Blog/docs/plans/2026-02-12-blog-publisher-v2-plan.md` |
| UI prototype (React) | `~/Projects/AmishRobot-Blog/docs/plans/obsidian-publish-panel-prototype.jsx` |

## Development

```bash
npm run dev    # watch mode
npm run build  # production build
```

## Preact Notes

- Every `.tsx` file must import `h` from preact (needed for JSX transform)
- Use `onInput` instead of React's `onChange` for input elements
- Use `preact/hooks` not `react` for hooks
- `ComponentChildren` type from `preact` for children props

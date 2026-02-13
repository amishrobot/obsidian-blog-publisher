# Blog Publisher — Obsidian Plugin

## Overview

Preact-powered side panel plugin for publishing blog posts from Obsidian to GitHub. Replaces v1's invisible frontmatter-watching with explicit UI controls.

## Tech Stack

| Layer | Technology |
|-------|------------|
| UI | Preact (h/Fragment), inline styles |
| Build | esbuild with JSX transform |
| API | Obsidian Plugin API (ItemView, requestUrl) |
| Backend | GitHub REST API (blobs, trees, commits) |
| Config | JoshOS `_state/blog-config.md` with Obsidian settings fallback |

## Project Structure

```
src/
├── main.ts                    # Plugin entry: view registration, commands, file watching
├── PublishView.tsx             # Obsidian ItemView → mounts Preact PublishPanel
├── SettingsTab.ts              # Plugin settings UI (fallback for non-JoshOS)
├── models/types.ts             # All interfaces, constants, theme palettes
├── services/
│   ├── GitHubService.ts        # GitHub REST API (publish/unpublish via git tree API)
│   ├── PostService.ts          # Build post data, resolve images, compute hashes
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
4. **Git tag** the release: `git tag <version>` (e.g., `git tag 2.0.1`)
5. **Push** commits AND tag: `git push origin main --tags`
6. **Install to vault**: `cp main.js manifest.json styles.css ~/JoshOS/.obsidian/plugins/blog-publisher/`
7. **Reload Obsidian** to pick up changes

**WHY THE TAG MATTERS:** This plugin is installed via BRAT (Beta Reviewers Auto-update Tester). BRAT only sees releases that have a git tag. No tag = invisible to BRAT = update never arrives in Obsidian. This has caused failed deployments multiple times.

**DO NOT** overwrite `data.json` in the vault plugin directory — it contains the user's settings including the GitHub token.

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

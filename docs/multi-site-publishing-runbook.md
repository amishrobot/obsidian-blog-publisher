# Multi-site Publishing Runbook

This runbook defines the routing contract and day-2 operations for publishing from one Obsidian vault to multiple sites.

## Scope

- Multi-site vault routing with canonical path convention
- Plugin: `obsidian-blog-publisher`

## Folder Conventions

- `Blog/<SiteName>/posts/**` -> publishable site target path
- Legacy fallback: `Blog/posts/**` and `Personal/Blog/posts/**` -> configured default target

Only markdown files (`*.md`) under mapped paths are treated as post files.

## Routing Contract

Routing is path-prefix based and deterministic:

1. Normalize all paths to forward slashes and trim leading/trailing slashes.
2. Evaluate configured `blogTargets`.
3. Select the matching target with the longest `postsFolder` prefix.
4. If no target matches, check legacy fallback folders.
5. If still unmatched, treat the file as non-publishable for this plugin.

Unknown site folders do not publish.

## Plugin Config Schema

Configured in `_state/blog-config.md`:

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

Sensitive token storage (vault local, not in shared docs):

`/.system/config.json`

```json
{
  "blog_publisher_github_token": "github_pat_..."
}
```

Notes:

- `postsFolder` is optional if `name` is set. If omitted, the plugin infers `Blog/<name>/posts`.
- `repository`, `branch`, `siteUrl`, `repoPostsPath`, `repoImagesPath`, `postUrlFormat`, and theme fields fall back to global settings when omitted.
- `blogTargetsJson` is supported as JSON fallback when state-file YAML is unavailable.

## Publish/Update Flow

1. Set status in panel (`Draft` or `Published`).
2. Click bottom action (`Publish`/`Update`) once.
3. Plugin runs checks, computes effective target from file path, and pushes to GitHub.
4. Vercel deploys from target repo.

`date` behavior:

- If missing, plugin sets current date on publish.
- If already set, plugin preserves existing date.

## Test & Validation

Local deterministic test suite:

```bash
npm test
```

Current required matrix:

- `Blog/SiteA/posts/foo.md` -> SiteA target
- `Blog/SiteB/posts/foo.md` -> SiteB target
- `Blog/posts/foo.md` -> legacy fallback (configured default target)
- Unknown path -> no target
- Non-markdown path -> ignored

Build/package check:

```bash
npm run build
```

## Failure Modes and Recovery

1. Post says published but URL 404s.
Cause: wrong repo target or build failed.
Recovery: verify file path, target mapping, GitHub commit, and Vercel deploy logs.

2. Images render as raw markdown.
Cause: unresolved Obsidian link or bad filename/path encoding.
Recovery: run checks, verify source image exists in vault, republish.

3. GitHub `422` on update/unpublish.
Cause: stale/missing ref SHA race.
Recovery: retry publish; confirm branch exists and token has repo scope.

4. Frontmatter check fails unexpectedly.
Cause: manual metadata drift.
Recovery: set status via panel and rerun checks.

5. GitHub `404` on publish to private repo.
Cause: token does not have access to target repository.
Recovery: verify `githubToken` has `repo` scope and is authorized for the target org/repo.

## Plugin Release Process

1. Update code and tests.
2. Run `npm test` and `npm run build`.
3. Bump version in `manifest.json` and `package.json` (if releasing).
4. Update `CHANGELOG.md`.
5. Tag/release with `main.js`, `manifest.json`, `styles.css`.
6. Validate install/update via BRAT and live smoke test one publish.

Release retention policy:

- Keep latest 5 releases/tags in GitHub for BRAT clarity.
- Delete older releases with `--cleanup-tag`.
- Current retained baseline: latest 5 releases.

## Legacy Fallback Deprecation

- Legacy folders (`Blog/posts`, `Personal/Blog/posts`) are supported for migration safety.
- Target deprecation date: June 30, 2026.
- After deprecation:
  - Remove legacy folder fallback from routing utility.
  - Keep a migration note in changelog and runbook.

## Adding a Third Blog/Site

1. Create vault folders:
   - `Blog/<NewSite>/posts`
   - `Blog/<NewSite>/settings`
2. Add new `blogTargets` entry with repo, branch, site URL, and theme paths.
3. Add routing tests for the new folder mapping and unknown-path behavior.
4. Run `npm test` and `npm run build`.
5. Publish a smoke-test post and verify URL + assets in production.

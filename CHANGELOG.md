# Changelog

## Unreleased
- Added JoshOS-style secret resolution for GitHub token:
  - New settings: `secretsFilePath` (default `.system/config.json`) and `githubTokenConfigKey` (default `blog_publisher_github_token`)
  - If `githubToken` is empty, plugin loads token from the configured vault JSON key.
- Updated settings UI and docs to formalize config split:
  - Non-secrets in `_state/blog-config.md`
  - Secrets in `.system/config.json`

## v2.0.16 (2026-02-14)
- Fixed primary action label logic:
  - New notes (never published) now show `Publish`
  - Previously published notes show `Update`
- Keeps update-first behavior for already-live posts without forcing draft/unpublish cycle.

## v2.0.15 (2026-02-14)
- Fixed Charming publish model to align with Astro schema/routes:
  - Writes `published` frontmatter (from `date` when missing)
  - Writes `abbrlink` frontmatter (from `slug` when missing)
  - Maps `status` to `draft` when needed for posts-slug targets
- For `posts-slug` targets, publishes markdown to `src/content/posts/<slug>.md` (no forced year folder).
- For `posts-slug` targets, rewrites published image paths to `/_assets/images/<slug>/...`.

## v2.0.14 (2026-02-14)
- Fixed Charming target documentation to use the correct repo slug: `amishrobot/charmingweb`.
- Added configurable post URL format (`postUrlFormat`) with support for:
  - `year-slug` -> `/YYYY/slug`
  - `posts-slug` -> `/posts/slug`
- Updated URL preview and publish result URL generation to use the configured format.
- Added URL builder tests to prevent route-shape regressions.

## v2.0.13 (2026-02-14)
- Added deterministic routing test suite (`vitest`) for multi-site + legacy fallback behavior.
- Added path-routing utility and wired plugin routing through it.
- Added legacy fallback support for `Blog/posts/**` and `Personal/Blog/posts/**` when multi-target mapping is enabled.
- Added per-target repo publish roots:
  - `repoPostsPath` (e.g. `content/posts` vs `src/content/posts`)
  - `repoImagesPath` (defaults to `public/_assets/images`)
- Updated docs with formal multi-site routing runbook and regression checklist updates.

## v2.0.12 (2026-02-14)
- Removed publish/update confirmation modal.
- Bottom action now triggers checks + deploy immediately on click.

## v2.0.11 (2026-02-14)
- Canonical release for the "update-first" published workflow.
- Published posts now show `Update` as the primary bottom action.
- Bottom action stays enabled for published posts (no disabled `Live ✓` state).
- Explicit panel `Unpublish` button removed.
- Release hygiene follow-up: docs now include a regression checklist in `README.md`.

## v2.0.10 (2026-02-14)
- Same UX intent as `v2.0.11`, but this tag/release was created on the wrong commit.
- Use `v2.0.11` for BRAT and production installs.

## v2.0.9 (2026-02-14)
- Multi-blog routing by folder (`blogTargets`/`blogTargetsJson`).
- URL preview scheme fix (`https://https://...` guard).
- Improved checks and frontmatter handling (including auto-date fill when missing).
- Publish stability improvements (serialized writes + stronger GitHub ref retry).
- Image publish path hardening (filename sanitization + encoded markdown URLs).

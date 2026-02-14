# Changelog

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

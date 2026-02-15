# AGENTS.md

## Release Discipline (Required)

If you modify plugin runtime or packaging files in this repo, you must treat the change as a releasable plugin update for BRAT.

Plugin-impacting files include:
- `src/**`
- `main.js`
- `styles.css`
- `manifest.json`
- `package.json`
- `esbuild.config.mjs`

Required flow before push to `main`:
1. Bump plugin version in both `manifest.json` and `package.json`.
2. Run `npm test` and `npm run build`.
3. Update `CHANGELOG.md` with the new version and date.
4. Create tag `v<version>`.
5. Create GitHub release `v<version>` with assets: `main.js`, `manifest.json`, `styles.css`.
6. Push commit and tag.

Do not push plugin-impacting changes to `main` without a new versioned release.

import { BlogPublisherSettings, BlogTargetSettings } from '../models/types';

const LEGACY_POSTS_FOLDERS = ['Blog/posts', 'Personal/Blog/posts'];

// Vault roots that hold per-site `<root>/<SiteName>/posts` folders, current first.
// The 2026-08 vault reorg moved `Blogs/` under `Library/`; the older roots stay
// so vaults that were never reorganized keep resolving.
const SITE_ROOTS = ['Library/Blogs', 'Blogs', 'Blog'];

export function normalizeFolderPath(path: string): string {
  return path.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
}

export function pathMatchesFolder(path: string, folder: string): boolean {
  const normalizedPath = normalizeFolderPath(path);
  const normalizedFolder = normalizeFolderPath(folder);
  if (!normalizedFolder) return false;
  return normalizedPath === normalizedFolder || normalizedPath.startsWith(`${normalizedFolder}/`);
}

function legacyFolders(settings: BlogPublisherSettings): string[] {
  const configured = normalizeFolderPath(settings.postsFolder || '');
  const merged = [configured, ...LEGACY_POSTS_FOLDERS.map(normalizeFolderPath)];
  return [...new Set(merged.filter(Boolean))];
}

function canonicalFolderFromPath(path: string): string | null {
  const segments = normalizeFolderPath(path).split('/');
  for (const root of SITE_ROOTS) {
    const depth = root.split('/').length;
    if (segments.slice(0, depth).join('/').toLowerCase() !== root.toLowerCase()) continue;
    const site = segments[depth];
    const posts = segments[depth + 1];
    if (!site || String(posts || '').toLowerCase() !== 'posts') continue;
    return `${root}/${site}/posts`;
  }
  return null;
}

function inferredFoldersFromName(name: string | undefined): string[] {
  const value = String(name || '').trim();
  if (!value) return [];
  return SITE_ROOTS.map((root) => `${root}/${value}/posts`);
}

function targetCandidateFolders(target: BlogTargetSettings): string[] {
  const candidates = [
    normalizeFolderPath(target.postsFolder || ''),
    ...inferredFoldersFromName(target.name).map(normalizeFolderPath),
  ].filter(Boolean);
  return [...new Set(candidates)];
}

export function resolveTargetForPath(
  path: string | undefined,
  settings: BlogPublisherSettings
): BlogTargetSettings | null {
  if (!path) return null;

  const targets = settings.blogTargets || [];
  if (targets.length === 0) {
    const canonicalFolder = canonicalFolderFromPath(path);
    if (canonicalFolder) {
      return { postsFolder: canonicalFolder };
    }
    return legacyFolders(settings).some((folder) => pathMatchesFolder(path, folder))
      ? { postsFolder: settings.postsFolder }
      : null;
  }

  let best: BlogTargetSettings | null = null;
  let bestLength = -1;
  for (const target of targets) {
    for (const folder of targetCandidateFolders(target)) {
      if (!folder || !pathMatchesFolder(path, folder)) continue;
      if (folder.length > bestLength) {
        best = { ...target, postsFolder: folder };
        bestLength = folder.length;
      }
    }
  }
  if (best) return best;

  return legacyFolders(settings).some((folder) => pathMatchesFolder(path, folder))
    ? { postsFolder: settings.postsFolder }
    : null;
}

export function isPostPath(path: string, settings: BlogPublisherSettings): boolean {
  if (!path.endsWith('.md')) return false;
  return resolveTargetForPath(path, settings) !== null;
}

export function getEffectiveSettingsForPath(
  path: string | undefined,
  settings: BlogPublisherSettings
): BlogPublisherSettings {
  const target = resolveTargetForPath(path, settings);
  if (!target) return settings;

  return {
    ...settings,
    repository: target.repository ?? settings.repository,
    branch: target.branch ?? settings.branch,
    postsFolder: target.postsFolder || settings.postsFolder,
    repoPostsPath: target.repoPostsPath ?? settings.repoPostsPath,
    repoImagesPath: target.repoImagesPath ?? settings.repoImagesPath,
    postUrlFormat: target.postUrlFormat ?? settings.postUrlFormat,
    themeFilePath: target.themeFilePath ?? settings.themeFilePath,
    themeRepoPath: target.themeRepoPath ?? settings.themeRepoPath,
    blogConfigRepoPath: target.blogConfigRepoPath ?? settings.blogConfigRepoPath,
    siteUrl: target.siteUrl ?? settings.siteUrl,
    themes: target.themes && target.themes.length > 0 ? target.themes : settings.themes,
  };
}

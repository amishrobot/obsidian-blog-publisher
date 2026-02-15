import { BlogPublisherSettings, BlogTargetSettings } from '../models/types';

const LEGACY_POSTS_FOLDERS = ['Blog/posts', 'Personal/Blog/posts'];
const CANONICAL_SITE_POSTS_RE = /^Blog\/([^/]+)\/posts(?:\/|$)/i;

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
  const normalizedPath = normalizeFolderPath(path);
  const match = normalizedPath.match(CANONICAL_SITE_POSTS_RE);
  if (!match) return null;
  return `Blog/${match[1]}/posts`;
}

function inferredFolderFromName(name: string | undefined): string | null {
  const value = String(name || '').trim();
  if (!value) return null;
  return `Blog/${value}/posts`;
}

function targetCandidateFolders(target: BlogTargetSettings): string[] {
  const candidates = [
    normalizeFolderPath(target.postsFolder || ''),
    normalizeFolderPath(inferredFolderFromName(target.name) || ''),
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

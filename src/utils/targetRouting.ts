import { BlogPublisherSettings, BlogTargetSettings } from '../models/types';

const LEGACY_POSTS_FOLDERS = ['Blog/posts', 'Personal/Blog/posts'];

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

export function resolveTargetForPath(
  path: string | undefined,
  settings: BlogPublisherSettings
): BlogTargetSettings | null {
  if (!path) return null;

  const targets = settings.blogTargets || [];
  if (targets.length === 0) {
    return legacyFolders(settings).some((folder) => pathMatchesFolder(path, folder))
      ? { postsFolder: settings.postsFolder }
      : null;
  }

  let best: BlogTargetSettings | null = null;
  let bestLength = -1;
  for (const target of targets) {
    const folder = normalizeFolderPath(target.postsFolder || '');
    if (!folder || !pathMatchesFolder(path, folder)) continue;
    if (folder.length > bestLength) {
      best = target;
      bestLength = folder.length;
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
    themeFilePath: target.themeFilePath ?? settings.themeFilePath,
    themeRepoPath: target.themeRepoPath ?? settings.themeRepoPath,
    siteUrl: target.siteUrl ?? settings.siteUrl,
    themes: target.themes && target.themes.length > 0 ? target.themes : settings.themes,
  };
}

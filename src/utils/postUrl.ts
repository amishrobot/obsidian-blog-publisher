import { BlogPublisherSettings } from '../models/types';

function normalizeSiteUrl(siteUrl: string): string {
  return siteUrl.replace(/\/+$/, '');
}

function normalizeFormat(format?: string): 'year-slug' | 'posts-slug' {
  if (format === 'posts-slug') return 'posts-slug';
  return 'year-slug';
}

function inferredFormat(settings: BlogPublisherSettings): 'year-slug' | 'posts-slug' {
  const configured = normalizeFormat((settings.postUrlFormat || '').trim());
  if ((settings.postUrlFormat || '').trim().length > 0) return configured;

  const repoPostsPath = (settings.repoPostsPath || '').replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
  if (repoPostsPath === 'src/content/posts') return 'posts-slug';
  return 'year-slug';
}

export function buildPostUrl(settings: BlogPublisherSettings, date: string, slug: string): string {
  const base = normalizeSiteUrl(settings.siteUrl || '');
  const year = date.match(/^(\d{4})/)?.[1] || '';
  const safeSlug = String(slug || '').replace(/^\/+|\/+$/g, '');
  const format = inferredFormat(settings);
  if (format === 'posts-slug') {
    return `${base}/posts/${safeSlug}`;
  }
  return `${base}/${year}/${safeSlug}`;
}

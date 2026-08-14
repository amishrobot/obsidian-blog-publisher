/**
 * Pure helpers for creating a new post. Deliberately free of any `obsidian`
 * import so the frontmatter contract can be tested directly — this is the code
 * that has to stay in step with what PostService requires at publish time
 * (a `date` and a `slug`, or it throws).
 */

export interface NewPostFields {
  title: string;
  slug: string;
  type: 'post' | 'link';
  linkUrl?: string;
}

export function slugifyTitle(value: string): string {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function sanitizeFileName(value: string): string {
  return String(value || '')
    .replace(/[\\/:*?"<>|#^[\]]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/^\.+/, '')
    .trim();
}

/** Local date, not ISO/UTC: posting at 9pm should not be dated tomorrow. */
export function localDateStamp(now: Date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/**
 * Vault folder for a new post, mirroring the repo layout the target publishes
 * to: `posts/<year>/` for year-slug blogs, flat `posts/` for posts-slug ones.
 */
export function newPostFolder(
  postsFolder: string,
  urlFormat: string | undefined,
  date: string
): string {
  const base = String(postsFolder || '').replace(/\\/g, '/').replace(/^\/+|\/+$/g, '');
  if (!base) return '';
  return urlFormat === 'posts-slug' ? base : `${base}/${date.slice(0, 4)}`;
}

export function buildNewPostContent(fields: NewPostFields, date: string): string {
  const quote = (value: string) => `"${String(value).replace(/"/g, '\\"')}"`;

  const lines = [
    '---',
    `title: ${quote(fields.title)}`,
    `date: ${date}`,
    `slug: ${quote(fields.slug)}`,
    // Draft is the safe default: the file can be pushed to GitHub while the
    // site keeps filtering it out until the status is flipped in the panel.
    'status: draft',
    `type: ${fields.type}`,
  ];

  if (fields.type === 'link' && fields.linkUrl) {
    lines.push('link:', `  url: ${quote(fields.linkUrl)}`);
  }

  lines.push('---', '', '');
  return lines.join('\n');
}

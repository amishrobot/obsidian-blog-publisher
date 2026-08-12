export interface ImageRefs {
  /** `![[file.png]]` — the publisher uploads these and rewrites the link. */
  wikilinks: string[];
  /** `![](../../_assets/…)` or `<img src="../../_assets/…">` — published verbatim. */
  relative: string[];
  /** Same, but rooted at `/`. Renders on the site, shows nothing in Obsidian. */
  absolute: string[];
}

const WIKI_RE = /!\[\[([^\]|]+?)(?:\|[^\]]*)?\]\]/g;
const SRC_RE = /!\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)|<img\b[^>]*?\bsrc\s*=\s*["']([^"']+)["']/gi;

function isRemote(url: string): boolean {
  return /^(https?:)?\/\//i.test(url) || url.startsWith('data:');
}

export function scanImageRefs(content: string): ImageRefs {
  const refs: ImageRefs = { wikilinks: [], relative: [], absolute: [] };

  let match: RegExpExecArray | null;
  const wiki = new RegExp(WIKI_RE.source, WIKI_RE.flags);
  while ((match = wiki.exec(content)) !== null) {
    refs.wikilinks.push(match[1].trim());
  }

  const src = new RegExp(SRC_RE.source, SRC_RE.flags);
  while ((match = src.exec(content)) !== null) {
    const raw = (match[1] || match[2] || '').trim();
    if (!raw || isRemote(raw)) continue;
    (raw.startsWith('/') ? refs.absolute : refs.relative).push(raw);
  }

  return refs;
}

/** Resolve a note-relative URL against the note's own path, vault-root style. */
export function resolveRelative(fromPath: string, url: string): string {
  let decoded = url.split('#')[0].split('?')[0];
  try {
    decoded = decodeURIComponent(decoded);
  } catch {
    // Leave a malformed escape sequence alone rather than throwing mid-check.
  }
  const segments = fromPath.split('/').slice(0, -1);
  for (const part of decoded.split('/')) {
    if (part === '' || part === '.') continue;
    if (part === '..') segments.pop();
    else segments.push(part);
  }
  return segments.join('/');
}

/**
 * Open Graph / meta tag parsing. Pure and `obsidian`-free so the extraction
 * rules can be tested against real page markup.
 */

export interface ParsedLinkMetadata {
  title?: string;
  description?: string;
  image?: string;
}

function decodeEntities(value: string): string {
  const named: Record<string, string> = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' ',
    '#39': "'",
    '#x27': "'",
  };
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&([a-z]+|#x?\d+);/gi, (match, name) => named[String(name).toLowerCase()] ?? match);
}

function metaContent(html: string, attr: 'property' | 'name', key: string): string | undefined {
  // Attribute order varies, so match the tag first and read its parts after.
  const tags = html.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of tags) {
    const keyMatch = tag.match(new RegExp(`\\b${attr}\\s*=\\s*["']([^"']+)["']`, 'i'));
    if (!keyMatch || keyMatch[1].toLowerCase() !== key.toLowerCase()) continue;
    const content = tag.match(/\bcontent\s*=\s*["']([^"']*)["']/i);
    if (content?.[1]) return decodeEntities(content[1]).trim();
  }
  return undefined;
}

function absolutize(value: string | undefined, pageUrl: string): string | undefined {
  if (!value) return undefined;
  try {
    return new URL(value, pageUrl).href;
  } catch {
    return undefined;
  }
}

export function parseLinkMetadata(html: string, pageUrl: string): ParsedLinkMetadata {
  const source = String(html || '');

  // og: first — it is what the page chose to present when shared — then the
  // twitter: equivalents, then the plain document metadata.
  const title =
    metaContent(source, 'property', 'og:title') ||
    metaContent(source, 'name', 'twitter:title') ||
    (() => {
      const tag = source.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      return tag?.[1] ? decodeEntities(tag[1]).replace(/\s+/g, ' ').trim() : undefined;
    })();

  const description =
    metaContent(source, 'property', 'og:description') ||
    metaContent(source, 'name', 'twitter:description') ||
    metaContent(source, 'name', 'description');

  const image =
    metaContent(source, 'property', 'og:image') ||
    metaContent(source, 'name', 'twitter:image') ||
    metaContent(source, 'property', 'og:image:url');

  return {
    title: title || undefined,
    description: description || undefined,
    image: absolutize(image, pageUrl),
  };
}

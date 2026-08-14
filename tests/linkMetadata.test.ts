import { describe, expect, it } from 'vitest';
import { parseLinkMetadata } from '../src/utils/linkMetadata';

// Trimmed from the real ordinaryabundance.com response.
const REAL_PAGE = `
<head>
<meta name="description" content="A walk through a modern apartment, through the eyes of the people for whom everything in it was new.">
<meta property="og:type" content="article">
<meta property="og:title" content="Ordinary Abundance">
<meta property="og:description" content="A walk through a modern apartment, through the eyes of the people for whom everything in it was new.">
<meta property="og:image" content="https://ordinaryabundance.com/assets/abundance-room-v8.jpg">
<title>Ordinary Abundance</title>
</head>`;

describe('parseLinkMetadata', () => {
  it('reads og tags from a real page', () => {
    const meta = parseLinkMetadata(REAL_PAGE, 'https://ordinaryabundance.com/');
    expect(meta.title).toBe('Ordinary Abundance');
    expect(meta.description).toBe(
      'A walk through a modern apartment, through the eyes of the people for whom everything in it was new.'
    );
    expect(meta.image).toBe('https://ordinaryabundance.com/assets/abundance-room-v8.jpg');
  });

  it('resolves a relative image against the page URL', () => {
    const meta = parseLinkMetadata(
      `<meta property="og:image" content="/assets/card.jpg">`,
      'https://example.com/posts/thing'
    );
    expect(meta.image).toBe('https://example.com/assets/card.jpg');
  });

  it('falls back through twitter tags, then plain description, then <title>', () => {
    const meta = parseLinkMetadata(
      `<title>  Fallback   Title </title>
       <meta name="twitter:description" content="From twitter">`,
      'https://example.com/'
    );
    expect(meta.title).toBe('Fallback Title');
    expect(meta.description).toBe('From twitter');
  });

  it('is not confused by attribute order', () => {
    const meta = parseLinkMetadata(
      `<meta content="Reversed" property="og:title">`,
      'https://example.com/'
    );
    expect(meta.title).toBe('Reversed');
  });

  it('does not mistake og:description for og:title', () => {
    const meta = parseLinkMetadata(
      `<meta property="og:description" content="Desc"><meta property="og:title" content="Title">`,
      'https://example.com/'
    );
    expect(meta.title).toBe('Title');
    expect(meta.description).toBe('Desc');
  });

  it('decodes entities', () => {
    const meta = parseLinkMetadata(
      `<meta property="og:title" content="Rocky&#39;s language &amp; music">`,
      'https://example.com/'
    );
    expect(meta.title).toBe("Rocky's language & music");
  });

  it('returns nothing rather than guessing on a bare page', () => {
    const meta = parseLinkMetadata('<html><body><p>hi</p></body></html>', 'https://example.com/');
    expect(meta.title).toBeUndefined();
    expect(meta.description).toBeUndefined();
    expect(meta.image).toBeUndefined();
  });

  it('drops an unparseable image rather than emitting a broken path', () => {
    const meta = parseLinkMetadata(
      `<meta property="og:image" content="::::not a url">`,
      'not-a-base'
    );
    expect(meta.image).toBeUndefined();
  });
});

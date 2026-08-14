import { describe, expect, it } from 'vitest';
import {
  buildNewPostContent,
  localDateStamp,
  newPostFolder,
  sanitizeFileName,
  slugifyTitle,
} from '../src/utils/newPost';

describe('slugifyTitle', () => {
  it('lowercases and hyphenates', () => {
    expect(slugifyTitle('Ordinary Abundance')).toBe('ordinary-abundance');
  });

  it('collapses punctuation runs and trims edge hyphens', () => {
    expect(slugifyTitle("The Innovator's Dilemma!")).toBe('the-innovator-s-dilemma');
    expect(slugifyTitle('  -- Hello, World -- ')).toBe('hello-world');
  });

  it('returns empty for input with nothing sluggable', () => {
    expect(slugifyTitle('!!!')).toBe('');
    expect(slugifyTitle('')).toBe('');
  });
});

describe('sanitizeFileName', () => {
  it('strips characters that are illegal in vault filenames', () => {
    expect(sanitizeFileName('Rocky: a/b "quoted" #tag')).toBe('Rocky ab quoted tag');
  });

  it('strips leading dots so the note is not hidden', () => {
    expect(sanitizeFileName('...hidden')).toBe('hidden');
  });
});

describe('localDateStamp', () => {
  it('uses local calendar date, not UTC', () => {
    // 9pm on the 13th in a negative-offset zone is still the 13th locally,
    // while toISOString() would roll it to the 14th.
    const evening = new Date(2026, 7, 13, 21, 30);
    expect(localDateStamp(evening)).toBe('2026-08-13');
  });

  it('zero-pads month and day', () => {
    expect(localDateStamp(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});

describe('newPostFolder', () => {
  it('nests by year for year-slug blogs', () => {
    expect(newPostFolder('Library/Blogs/AmishRobot/posts', 'year-slug', '2026-08-13')).toBe(
      'Library/Blogs/AmishRobot/posts/2026'
    );
  });

  it('stays flat for posts-slug blogs', () => {
    expect(newPostFolder('Library/Blogs/Charming/posts', 'posts-slug', '2026-08-13')).toBe(
      'Library/Blogs/Charming/posts'
    );
  });

  it('defaults to year nesting when no format is configured', () => {
    expect(newPostFolder('Blog/posts', undefined, '2026-08-13')).toBe('Blog/posts/2026');
  });

  it('normalizes stray slashes', () => {
    expect(newPostFolder('/Blog/posts/', 'year-slug', '2026-08-13')).toBe('Blog/posts/2026');
  });
});

describe('buildNewPostContent', () => {
  it('always writes the fields PostService requires', () => {
    const content = buildNewPostContent(
      { title: 'Ordinary Abundance', slug: 'ordinary-abundance', type: 'post' },
      '2026-08-13'
    );

    // PostService throws without these two; the whole point of the command is
    // that a created note can never be missing them.
    expect(content).toContain('date: 2026-08-13');
    expect(content).toContain('slug: "ordinary-abundance"');
    expect(content).toContain('title: "Ordinary Abundance"');
    expect(content).toContain('status: draft');
    expect(content).toContain('type: post');
  });

  it('adds a link block only for link posts with a url', () => {
    const link = buildNewPostContent(
      {
        title: 'Ordinary Abundance',
        slug: 'ordinary-abundance',
        type: 'link',
        linkUrl: 'https://ordinaryabundance.com/',
      },
      '2026-08-13'
    );
    expect(link).toContain('link:\n  url: "https://ordinaryabundance.com/"');

    const post = buildNewPostContent(
      { title: 'A Post', slug: 'a-post', type: 'post', linkUrl: 'https://example.com' },
      '2026-08-13'
    );
    expect(post).not.toContain('link:');
  });

  it('escapes quotes so the frontmatter stays parseable', () => {
    const content = buildNewPostContent(
      { title: 'He said "hello"', slug: 'he-said-hello', type: 'post' },
      '2026-08-13'
    );
    expect(content).toContain('title: "He said \\"hello\\""');
  });

  it('closes the frontmatter block and leaves the body empty', () => {
    const content = buildNewPostContent({ title: 'T', slug: 't', type: 'post' }, '2026-08-13');
    expect(content.startsWith('---\n')).toBe(true);
    expect(content.match(/^---$/gm)?.length).toBe(2);
    expect(content.endsWith('---\n\n')).toBe(true);
  });
});

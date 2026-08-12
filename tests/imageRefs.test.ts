import { describe, expect, it } from 'vitest';
import { resolveRelative, scanImageRefs } from '../src/utils/imageRefs';

describe('scanImageRefs', () => {
  it('separates wikilinks, relative sources, and vault-root sources', () => {
    const refs = scanImageRefs([
      '![[Pasted image 20260220160103.jpg]]',
      '![alt](../../_assets/images/ok.jpg)',
      '![alt](/_assets/images/invisible.jpg)',
      '<img src="../../_assets/images/legacy/tag.jpg" width="500" class="imglft" />',
      '<img src="/_assets/images/legacy/bad.jpg" width="500" />',
    ].join('\n\n'));

    expect(refs.wikilinks).toEqual(['Pasted image 20260220160103.jpg']);
    expect(refs.relative).toEqual([
      '../../_assets/images/ok.jpg',
      '../../_assets/images/legacy/tag.jpg',
    ]);
    expect(refs.absolute).toEqual([
      '/_assets/images/invisible.jpg',
      '/_assets/images/legacy/bad.jpg',
    ]);
  });

  it('ignores remote and inline sources', () => {
    const refs = scanImageRefs([
      '![x](https://live.staticflickr.com/3545/3340117451.jpg)',
      '<img src="http://www.shorpy.com/files/images/05319u.jpg" />',
      '![x](//cdn.example.com/a.png)',
      '![x](data:image/png;base64,iVBORw0KGgo=)',
    ].join('\n\n'));

    expect(refs.relative).toEqual([]);
    expect(refs.absolute).toEqual([]);
  });

  it('does not mistake an anchor href for an image source', () => {
    // Legacy posts wrap thumbnails in popup links to the full-size asset.
    const refs = scanImageRefs(
      '<p><a href="/_assets/images/legacy/feet02-1.jpg"><img src="../../_assets/images/legacy/feet02-1-tm.jpg" height="220" /></a></p>'
    );
    expect(refs.absolute).toEqual([]);
    expect(refs.relative).toEqual(['../../_assets/images/legacy/feet02-1-tm.jpg']);
  });

  it('keeps a title attribute out of the captured path', () => {
    const refs = scanImageRefs('![alt](../../_assets/images/ok.jpg "A title")');
    expect(refs.relative).toEqual(['../../_assets/images/ok.jpg']);
  });
});

describe('resolveRelative', () => {
  it('resolves against the note folder', () => {
    expect(
      resolveRelative('Library/Blogs/AmishRobot/posts/2007/summer-feet.md', '../../_assets/images/x.jpg')
    ).toBe('Library/Blogs/AmishRobot/_assets/images/x.jpg');
  });

  it('handles percent-encoding and same-folder references', () => {
    expect(
      resolveRelative('Library/Blogs/AmishRobot/posts/2009/a.md', '../../_assets/images/two%20words.jpg')
    ).toBe('Library/Blogs/AmishRobot/_assets/images/two words.jpg');
    expect(resolveRelative('Blog/posts/a.md', './pic.png')).toBe('Blog/posts/pic.png');
  });

  it('drops a fragment or query without mangling the path', () => {
    expect(resolveRelative('Blog/posts/a.md', 'pic.png?v=2#top')).toBe('Blog/posts/pic.png');
  });
});

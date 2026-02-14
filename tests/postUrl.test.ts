import { describe, expect, it } from 'vitest';
import { BlogPublisherSettings } from '../src/models/types';
import { buildPostUrl } from '../src/utils/postUrl';

const base: BlogPublisherSettings = {
  githubToken: '',
  repository: 'amishrobot/amishrobot.com',
  branch: 'main',
  postsFolder: 'Blogs/AmishRobot/posts',
  repoPostsPath: 'content/posts',
  repoImagesPath: 'public/_assets/images',
  postUrlFormat: 'year-slug',
  blogTargets: [],
  blogTargetsJson: '',
  themeFilePath: 'Blogs/AmishRobot/settings/theme.md',
  themeRepoPath: 'content/settings/theme.md',
  themePublishedHash: '',
  themePublishedCommit: '',
  siteUrl: 'https://amishrobot.com',
  themes: ['classic'],
};

describe('post url builder', () => {
  it('builds amish-style year/slug urls', () => {
    expect(buildPostUrl(base, '2026-02-14', 'hello-world')).toBe('https://amishrobot.com/2026/hello-world');
  });

  it('builds charming-style posts/slug urls', () => {
    const settings = { ...base, siteUrl: 'https://thischarmingweb.com', postUrlFormat: 'posts-slug' };
    expect(buildPostUrl(settings, '2026-02-14', 'hello-world')).toBe('https://thischarmingweb.com/posts/hello-world');
  });
});

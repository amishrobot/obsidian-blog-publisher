import { describe, expect, it } from 'vitest';
import { BlogPublisherSettings } from '../src/models/types';
import { getEffectiveSettingsForPath, isPostPath, resolveTargetForPath } from '../src/utils/targetRouting';

const baseSettings: BlogPublisherSettings = {
  githubToken: '',
  repository: 'amishrobot/amishrobot.com',
  branch: 'main',
  postsFolder: 'Blogs/AmishRobot/posts',
  repoPostsPath: 'content/posts',
  repoImagesPath: 'public/_assets/images',
  postUrlFormat: 'year-slug',
  blogTargets: [
    {
      name: 'AmishRobot',
      postsFolder: 'Blogs/AmishRobot/posts',
      repository: 'amishrobot/amishrobot.com',
      siteUrl: 'https://amishrobot.com',
      repoPostsPath: 'content/posts',
      postUrlFormat: 'year-slug',
    },
    {
      name: 'Charming',
      postsFolder: 'Blogs/Charming/posts',
      repository: 'amishrobot/charmingweb',
      siteUrl: 'https://thischarmingweb.com',
      repoPostsPath: 'src/content/posts',
      repoImagesPath: 'public/_assets/images',
      postUrlFormat: 'posts-slug',
    },
  ],
  blogTargetsJson: '',
  themeFilePath: 'Blogs/AmishRobot/settings/theme.md',
  themeRepoPath: 'content/settings/theme.md',
  themePublishedHash: '',
  themePublishedCommit: '',
  siteUrl: 'https://amishrobot.com',
  themes: ['classic'],
};

describe('target routing', () => {
  it('routes AmishRobot post paths to AmishRobot target', () => {
    const target = resolveTargetForPath('Blogs/AmishRobot/posts/hello-world.md', baseSettings);
    expect(target?.repository).toBe('amishrobot/amishrobot.com');
    expect(target?.postsFolder).toBe('Blogs/AmishRobot/posts');
  });

  it('routes Charming post paths to Charming target', () => {
    const target = resolveTargetForPath('Blogs/Charming/posts/hello-world.md', baseSettings);
    expect(target?.repository).toBe('amishrobot/charmingweb');
    expect(target?.postsFolder).toBe('Blogs/Charming/posts');
  });

  it('falls back legacy Blog/posts paths to default settings target', () => {
    const target = resolveTargetForPath('Blog/posts/legacy-note.md', baseSettings);
    expect(target).not.toBeNull();
    expect(target?.postsFolder).toBe('Blogs/AmishRobot/posts');
  });

  it('returns null for unknown site paths', () => {
    const target = resolveTargetForPath('Blogs/Unknown/posts/something.md', baseSettings);
    expect(target).toBeNull();
  });

  it('treats non-markdown paths as non-posts', () => {
    expect(isPostPath('Blogs/AmishRobot/posts/hello-world.png', baseSettings)).toBe(false);
  });

  it('selects effective publish settings for the matching target', () => {
    const effective = getEffectiveSettingsForPath('Blogs/Charming/posts/hello-world.md', baseSettings);
    expect(effective.repository).toBe('amishrobot/charmingweb');
    expect(effective.siteUrl).toBe('https://thischarmingweb.com');
    expect(effective.postsFolder).toBe('Blogs/Charming/posts');
    expect(effective.repoPostsPath).toBe('src/content/posts');
    expect(effective.postUrlFormat).toBe('posts-slug');
  });
});

# Blog Publisher Profile Template

Use this in a new vault to keep setup portable and personal-data-safe.

## 1) Vault Folder Structure

```text
Blog/
  MySite/
    posts/
    settings/
```

## 2) `_state/blog-config.md`

```yaml
---
scope: profile
updated: 2026-02-15
---

secretsFilePath: .system/config.json
githubTokenConfigKey: blog_publisher_github_token
branch: main
postsFolder: Blog/MySite/posts
repoPostsPath: content/posts
repoImagesPath: public/_assets/images
postUrlFormat: year-slug
themeFilePath: Blog/MySite/settings/theme.md
themeRepoPath: content/settings/theme.md
siteUrl: https://example.com

blogTargets:
  - name: MySite
    repository: your-org/your-blog-repo
    branch: main
    siteUrl: https://example.com
    repoPostsPath: content/posts
    repoImagesPath: public/_assets/images
    postUrlFormat: year-slug
    themeFilePath: Blog/MySite/settings/theme.md
    themeRepoPath: content/settings/theme.md
    themes: [classic, paper, spruce, midnight, soviet]
```

Note: `postsFolder` can be omitted in each target if `name` is set. The plugin infers `Blog/<name>/posts`.

## 3) `.system/config.json`

```json
{
  "blog_publisher_github_token": "github_pat_..."
}
```

Use a token with access only to that user's repository/repositories.

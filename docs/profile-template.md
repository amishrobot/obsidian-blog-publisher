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

# Vault-local secrets lookup (token lives in .system/config.json)
secretsFilePath: .system/config.json
githubTokenConfigKey: blog_publisher_github_token

blogTargets:
  # You can define multiple sites. One target = one site/repo.
  - name: MySite
    # Optional. If omitted, inferred as Blog/<name>/posts
    postsFolder: Blog/MySite/posts
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

## 4) Validation

Publish now validates config before GitHub calls. If config is broken, the panel error explains exactly what to fix (missing token, bad `owner/repo`, no matching target, etc.).

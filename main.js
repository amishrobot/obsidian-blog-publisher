var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => BlogPublisherPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian4 = require("obsidian");

// src/models/types.ts
var DEFAULT_SETTINGS = {
  githubToken: "",
  repository: "amishrobot/amishrobot.com",
  branch: "main",
  postsFolder: "Personal/Blog/posts",
  themeFilePath: "Personal/Blog/settings/theme.md",
  themeRepoPath: "content/settings/theme.md",
  themePublishedHash: "",
  themePublishedCommit: "",
  siteUrl: "https://amishrobot.com"
};

// src/services/PostService.ts
var import_obsidian = require("obsidian");
var IMAGE_EXTENSIONS = /* @__PURE__ */ new Set(["png", "jpg", "jpeg", "gif", "svg", "webp", "avif", "bmp"]);
var PostService = class {
  constructor(app, settings) {
    this.app = app;
    this.settings = settings;
  }
  async buildPostData(file) {
    const cache = this.app.metadataCache.getFileCache(file);
    if (!(cache == null ? void 0 : cache.frontmatter)) {
      throw new Error("No frontmatter found");
    }
    const fm = cache.frontmatter;
    if (!fm.title)
      throw new Error("Missing required frontmatter: title");
    if (!fm.date)
      throw new Error("Missing required frontmatter: date");
    if (!fm.slug)
      throw new Error("Missing required frontmatter: slug");
    const title = String(fm.title);
    const date = String(fm.date);
    const slug = this.normalizeSlug(String(fm.slug));
    const yearMatch = date.match(/^(\d{4})/);
    if (!yearMatch)
      throw new Error(`Invalid date format: ${date}`);
    const year = yearMatch[1];
    const content = await this.app.vault.read(file);
    const images = await this.resolveImages(content, year, slug);
    const transformedMarkdown = this.rewriteImageLinks(content, images, year, slug);
    const publishedHash = await this.computeHash(transformedMarkdown, images);
    const repoPostPath = `content/posts/${year}/${slug}.md`;
    return {
      title,
      date,
      year,
      slug,
      repoPostPath,
      transformedMarkdown,
      images,
      publishedHash
    };
  }
  normalizeSlug(slug) {
    return slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  }
  async resolveImages(content, year, slug) {
    var _a;
    const images = [];
    const usedFilenames = /* @__PURE__ */ new Set();
    const re = /!\[\[([^\]|]+?)(?:\|([^\]]*))?\]\]/g;
    let match;
    while ((match = re.exec(content)) !== null) {
      const linkTarget = match[1].trim();
      const ext = ((_a = linkTarget.split(".").pop()) == null ? void 0 : _a.toLowerCase()) || "";
      if (!IMAGE_EXTENSIONS.has(ext))
        continue;
      const resolved = this.app.metadataCache.getFirstLinkpathDest(linkTarget, "");
      if (!resolved) {
        throw new Error(`Image not found in vault: ${linkTarget}`);
      }
      let filename = resolved.name;
      if (usedFilenames.has(filename.toLowerCase())) {
        const nameWithoutExt = filename.substring(0, filename.lastIndexOf("."));
        const fileExt = filename.substring(filename.lastIndexOf("."));
        let counter = 2;
        while (usedFilenames.has(`${nameWithoutExt}-${counter}${fileExt}`.toLowerCase())) {
          counter++;
        }
        filename = `${nameWithoutExt}-${counter}${fileExt}`;
      }
      usedFilenames.add(filename.toLowerCase());
      images.push({
        vaultPath: resolved.path,
        filename,
        repoPath: `public/_assets/images/${year}/${slug}/${filename}`,
        originalWikilink: match[0]
      });
    }
    return images;
  }
  rewriteImageLinks(content, images, year, slug) {
    var _a;
    let result = content;
    for (const img of images) {
      const altMatch = img.originalWikilink.match(/!\[\[([^\]|]+?)(?:\|([^\]]*))?\]\]/);
      const alt = ((_a = altMatch == null ? void 0 : altMatch[2]) == null ? void 0 : _a.trim()) || "";
      const mdImage = `![${alt}](/_assets/images/${year}/${slug}/${img.filename})`;
      result = result.replaceAll(img.originalWikilink, mdImage);
    }
    return result;
  }
  async computeHash(transformedMarkdown, images) {
    const parts = [transformedMarkdown];
    const imageHashes = [];
    for (const img of images) {
      const file = this.app.vault.getAbstractFileByPath(img.vaultPath);
      if (file instanceof import_obsidian.TFile) {
        const data2 = await this.app.vault.readBinary(file);
        const hash = await this.hashArrayBuffer(data2);
        imageHashes.push(`${img.filename}:${hash}`);
      }
    }
    imageHashes.sort();
    parts.push(...imageHashes);
    const combined = parts.join("\n");
    const encoder = new TextEncoder();
    const data = encoder.encode(combined);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  async hashArrayBuffer(buffer) {
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
};

// src/services/GitHubService.ts
var import_obsidian2 = require("obsidian");
var GitHubService = class {
  constructor(app, settings) {
    this.app = app;
    this.settings = settings;
    const parts = settings.repository.split("/");
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
      throw new Error('Invalid repository format. Must be "owner/repo"');
    }
    this.owner = parts[0];
    this.repo = parts[1];
  }
  async unpublish(filePaths, title) {
    let headSha = await this.getHeadSha();
    let treeSha = await this.getTreeSha(headSha);
    const deletions = filePaths.map((path) => ({
      path,
      mode: "100644",
      type: "blob",
      sha: null
    }));
    let commitSha;
    try {
      commitSha = await this.deleteAndUpdateRef(deletions, treeSha, headSha, title);
    } catch (e) {
      if (e instanceof Error && e.message.includes("409")) {
        headSha = await this.getHeadSha();
        treeSha = await this.getTreeSha(headSha);
        commitSha = await this.deleteAndUpdateRef(deletions, treeSha, headSha, title);
      } else {
        throw e;
      }
    }
    return commitSha;
  }
  async deleteAndUpdateRef(deletions, baseTreeSha, parentCommitSha, title) {
    const tree = await this.apiPost(
      `/repos/${this.owner}/${this.repo}/git/trees`,
      { base_tree: baseTreeSha, tree: deletions }
    );
    const commit = await this.apiPost(
      `/repos/${this.owner}/${this.repo}/git/commits`,
      {
        message: `Unpublish: ${title}`,
        tree: tree.sha,
        parents: [parentCommitSha]
      }
    );
    await this.apiPatch(
      `/repos/${this.owner}/${this.repo}/git/refs/heads/${this.settings.branch}`,
      { sha: commit.sha }
    );
    return commit.sha;
  }
  async publish(postData) {
    let headSha = await this.getHeadSha();
    let treeSha = await this.getTreeSha(headSha);
    const blobs = await this.createBlobs(postData);
    let commitSha;
    try {
      commitSha = await this.createCommitAndUpdateRef(
        blobs,
        treeSha,
        headSha,
        `Publish: ${postData.title}`
      );
    } catch (e) {
      if (e instanceof Error && e.message.includes("409")) {
        headSha = await this.getHeadSha();
        treeSha = await this.getTreeSha(headSha);
        commitSha = await this.createCommitAndUpdateRef(
          blobs,
          treeSha,
          headSha,
          `Publish: ${postData.title}`
        );
      } else {
        throw e;
      }
    }
    const postUrl = `${this.settings.siteUrl}/${postData.year}/${postData.slug}`;
    return { commitSha, postUrl };
  }
  async publishTextFile(repoPath, content, message) {
    let headSha = await this.getHeadSha();
    let treeSha = await this.getTreeSha(headSha);
    const blob = await this.apiPost(
      `/repos/${this.owner}/${this.repo}/git/blobs`,
      { content, encoding: "utf-8" }
    );
    const blobs = [
      {
        path: repoPath,
        sha: blob.sha,
        mode: "100644",
        type: "blob"
      }
    ];
    try {
      return await this.createCommitAndUpdateRef(blobs, treeSha, headSha, message);
    } catch (e) {
      if (e instanceof Error && e.message.includes("409")) {
        headSha = await this.getHeadSha();
        treeSha = await this.getTreeSha(headSha);
        return await this.createCommitAndUpdateRef(blobs, treeSha, headSha, message);
      }
      throw e;
    }
  }
  async getHeadSha() {
    const resp = await this.apiGet(
      `/repos/${this.owner}/${this.repo}/git/ref/heads/${this.settings.branch}`
    );
    return resp.object.sha;
  }
  async getTreeSha(commitSha) {
    const resp = await this.apiGet(
      `/repos/${this.owner}/${this.repo}/git/commits/${commitSha}`
    );
    return resp.tree.sha;
  }
  async createBlobs(postData) {
    const blobs = [];
    const mdBlob = await this.apiPost(
      `/repos/${this.owner}/${this.repo}/git/blobs`,
      { content: postData.transformedMarkdown, encoding: "utf-8" }
    );
    blobs.push({
      path: postData.repoPostPath,
      sha: mdBlob.sha,
      mode: "100644",
      type: "blob"
    });
    for (const img of postData.images) {
      const file = this.app.vault.getAbstractFileByPath(img.vaultPath);
      if (!(file instanceof import_obsidian2.TFile)) {
        throw new Error(`Image file not found: ${img.vaultPath}`);
      }
      const binary = await this.app.vault.readBinary(file);
      const base64 = this.arrayBufferToBase64(binary);
      const imgBlob = await this.apiPost(
        `/repos/${this.owner}/${this.repo}/git/blobs`,
        { content: base64, encoding: "base64" }
      );
      blobs.push({
        path: img.repoPath,
        sha: imgBlob.sha,
        mode: "100644",
        type: "blob"
      });
    }
    return blobs;
  }
  async createCommitAndUpdateRef(blobs, baseTreeSha, parentCommitSha, message) {
    const tree = await this.apiPost(
      `/repos/${this.owner}/${this.repo}/git/trees`,
      {
        base_tree: baseTreeSha,
        tree: blobs
      }
    );
    const commit = await this.apiPost(
      `/repos/${this.owner}/${this.repo}/git/commits`,
      {
        message,
        tree: tree.sha,
        parents: [parentCommitSha]
      }
    );
    await this.apiPatch(
      `/repos/${this.owner}/${this.repo}/git/refs/heads/${this.settings.branch}`,
      { sha: commit.sha }
    );
    return commit.sha;
  }
  headers() {
    return {
      "Authorization": `Bearer ${this.settings.githubToken}`,
      "Accept": "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28"
    };
  }
  async apiRequest(method, path, body) {
    var _a;
    const url = `https://api.github.com${path}`;
    try {
      const resp = await (0, import_obsidian2.requestUrl)({
        url,
        method,
        headers: this.headers(),
        body: body ? JSON.stringify(body) : void 0
      });
      return resp.json;
    } catch (e) {
      const status = (e == null ? void 0 : e.status) || "unknown";
      let detail = "";
      try {
        detail = JSON.stringify(((_a = e == null ? void 0 : e.response) == null ? void 0 : _a.json) || (e == null ? void 0 : e.message) || e);
      } catch (e2) {
        detail = String(e);
      }
      throw new Error(`GitHub ${status} on ${method} ${path}: ${detail}`);
    }
  }
  async apiGet(path) {
    return this.apiRequest("GET", path);
  }
  async apiPost(path, body) {
    return this.apiRequest("POST", path, body);
  }
  async apiPatch(path, body) {
    return this.apiRequest("PATCH", path, body);
  }
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }
};

// src/ui/SettingsTab.ts
var import_obsidian3 = require("obsidian");
var SettingsTab = class extends import_obsidian3.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    new import_obsidian3.Setting(containerEl).setName("GitHub token").setDesc("Fine-grained personal access token with contents:write scope").addText((text) => text.setPlaceholder("github_pat_...").setValue(this.plugin.settings.githubToken).then((t) => t.inputEl.type = "password").onChange(async (value) => {
      this.plugin.settings.githubToken = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian3.Setting(containerEl).setName("Repository").setDesc("GitHub repository (owner/repo)").addText((text) => text.setPlaceholder("amishrobot/amishrobot.com").setValue(this.plugin.settings.repository).onChange(async (value) => {
      this.plugin.settings.repository = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian3.Setting(containerEl).setName("Branch").setDesc("Target branch for commits").addText((text) => text.setPlaceholder("main").setValue(this.plugin.settings.branch).onChange(async (value) => {
      this.plugin.settings.branch = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian3.Setting(containerEl).setName("Posts folder").setDesc("Vault folder to watch for posts").addText((text) => text.setPlaceholder("Personal/Blog/posts").setValue(this.plugin.settings.postsFolder).onChange(async (value) => {
      this.plugin.settings.postsFolder = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian3.Setting(containerEl).setName("Theme settings file").setDesc("Vault markdown file to publish when theme settings change").addText((text) => text.setPlaceholder("Personal/Blog/settings/theme.md").setValue(this.plugin.settings.themeFilePath).onChange(async (value) => {
      this.plugin.settings.themeFilePath = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian3.Setting(containerEl).setName("Theme repo path").setDesc("Path in GitHub repo for committed theme settings").addText((text) => text.setPlaceholder("content/settings/theme.md").setValue(this.plugin.settings.themeRepoPath).onChange(async (value) => {
      this.plugin.settings.themeRepoPath = value;
      await this.plugin.saveSettings();
    }));
    new import_obsidian3.Setting(containerEl).setName("Site URL").setDesc("Blog URL for success notice links").addText((text) => text.setPlaceholder("https://amishrobot.com").setValue(this.plugin.settings.siteUrl).onChange(async (value) => {
      this.plugin.settings.siteUrl = value;
      await this.plugin.saveSettings();
    }));
  }
};

// src/main.ts
var BlogPublisherPlugin = class extends import_obsidian4.Plugin {
  constructor() {
    super(...arguments);
    this.publishTimeouts = /* @__PURE__ */ new Map();
    this.writebackGuard = /* @__PURE__ */ new Map();
  }
  async onload() {
    console.log("Loading Blog Publisher plugin");
    await this.loadSettings();
    this.addSettingTab(new SettingsTab(this.app, this));
    this.addCommand({
      id: "publish-blog-post",
      name: "Publish Blog Post",
      checkCallback: (checking) => {
        const file = this.app.workspace.getActiveFile();
        const cmdFolder = this.settings.postsFolder.replace(/\/$/, "");
        if (!file || !file.path.startsWith(cmdFolder + "/")) {
          return false;
        }
        if (!checking) {
          this.publishFile(file);
        }
        return true;
      }
    });
    this.addCommand({
      id: "publish-blog-theme-settings",
      name: "Publish Blog Theme Settings",
      callback: async () => {
        const themeFile = this.app.vault.getAbstractFileByPath(this.settings.themeFilePath);
        if (!(themeFile instanceof import_obsidian4.TFile)) {
          new import_obsidian4.Notice(`Theme file not found: ${this.settings.themeFilePath}`);
          return;
        }
        await this.publishThemeFile(themeFile);
      }
    });
    this.registerEvent(
      this.app.vault.on("modify", (file) => {
        if (!(file instanceof import_obsidian4.TFile))
          return;
        const folder = this.settings.postsFolder.replace(/\/$/, "");
        const isPost = file.path.startsWith(folder + "/") && file.path.endsWith(".md");
        const isThemeFile = file.path === this.settings.themeFilePath;
        if (!isPost && !isThemeFile)
          return;
        const guardTimestamp = this.writebackGuard.get(file.path);
        if (guardTimestamp && Date.now() - guardTimestamp < 5e3) {
          return;
        }
        this.writebackGuard.delete(file.path);
        const existing = this.publishTimeouts.get(file.path);
        if (existing)
          clearTimeout(existing);
        const timeout = setTimeout(() => {
          this.publishTimeouts.delete(file.path);
          if (isThemeFile) {
            this.publishThemeFile(file);
            return;
          }
          this.checkAndPublish(file);
        }, 2e3);
        this.publishTimeouts.set(file.path, timeout);
      })
    );
  }
  async onunload() {
    console.log("Unloading Blog Publisher plugin");
    for (const timeout of this.publishTimeouts.values()) {
      clearTimeout(timeout);
    }
    this.publishTimeouts.clear();
  }
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  async checkAndPublish(file) {
    const cache = this.app.metadataCache.getFileCache(file);
    if (!(cache == null ? void 0 : cache.frontmatter))
      return;
    if (cache.frontmatter.status === "publish") {
      await this.publishFile(file);
    } else if (cache.frontmatter.status === "draft" && cache.frontmatter.publishedCommit) {
      await this.unpublishFile(file);
    }
  }
  async publishFile(file) {
    var _a, _b;
    if (!this.settings.githubToken) {
      new import_obsidian4.Notice("Blog Publisher: No GitHub token configured. Check plugin settings.");
      return;
    }
    const publishingNotice = new import_obsidian4.Notice(`Publishing...`, 0);
    try {
      const postService = new PostService(this.app, this.settings);
      const postData = await postService.buildPostData(file);
      const cache = this.app.metadataCache.getFileCache(file);
      const existingHash = (_a = cache == null ? void 0 : cache.frontmatter) == null ? void 0 : _a.publishedHash;
      if (existingHash && existingHash === postData.publishedHash) {
        publishingNotice.hide();
        if (((_b = cache == null ? void 0 : cache.frontmatter) == null ? void 0 : _b.status) === "publish") {
          await this.writeBackFrontmatter(file, {
            status: "published"
          });
          new import_obsidian4.Notice("No changes detected \u2014 marked as published.");
        }
        return;
      }
      const githubService = new GitHubService(this.app, this.settings);
      const result = await githubService.publish(postData);
      await this.writeBackFrontmatter(file, {
        status: "published",
        publishedAt: (/* @__PURE__ */ new Date()).toISOString(),
        publishedCommit: result.commitSha,
        publishedHash: postData.publishedHash
      });
      publishingNotice.hide();
      new import_obsidian4.Notice(`Published: ${postData.title}
${result.postUrl}`);
    } catch (e) {
      publishingNotice.hide();
      const msg = e instanceof Error ? e.message : String(e);
      new import_obsidian4.Notice(`Publish failed: ${msg}`, 1e4);
      console.error("Blog Publisher error:", e);
    }
  }
  async unpublishFile(file) {
    if (!this.settings.githubToken) {
      new import_obsidian4.Notice("Blog Publisher: No GitHub token configured. Check plugin settings.");
      return;
    }
    const unpublishingNotice = new import_obsidian4.Notice("Unpublishing...", 0);
    try {
      const postService = new PostService(this.app, this.settings);
      const postData = await postService.buildPostData(file);
      const filePaths = [postData.repoPostPath, ...postData.images.map((img) => img.repoPath)];
      const githubService = new GitHubService(this.app, this.settings);
      await githubService.unpublish(filePaths, postData.title);
      await this.writeBackFrontmatter(file, {
        publishedAt: "",
        publishedCommit: "",
        publishedHash: ""
      });
      unpublishingNotice.hide();
      new import_obsidian4.Notice(`Unpublished: ${postData.title}`);
    } catch (e) {
      unpublishingNotice.hide();
      const msg = e instanceof Error ? e.message : String(e);
      new import_obsidian4.Notice(`Unpublish failed: ${msg}`, 1e4);
      console.error("Blog Publisher error:", e);
    }
  }
  async publishThemeFile(file) {
    if (!this.settings.githubToken) {
      new import_obsidian4.Notice("Blog Publisher: No GitHub token configured. Check plugin settings.");
      return;
    }
    const publishingNotice = new import_obsidian4.Notice("Publishing theme settings...", 0);
    try {
      const content = await this.app.vault.read(file);
      const contentHash = await this.hashText(content);
      if (this.settings.themePublishedHash === contentHash) {
        publishingNotice.hide();
        new import_obsidian4.Notice("Theme settings unchanged; skipping publish.");
        return;
      }
      const githubService = new GitHubService(this.app, this.settings);
      const commitSha = await githubService.publishTextFile(
        this.settings.themeRepoPath,
        content,
        "Publish: theme settings"
      );
      this.settings.themePublishedHash = contentHash;
      this.settings.themePublishedCommit = commitSha;
      await this.saveSettings();
      publishingNotice.hide();
      new import_obsidian4.Notice(`Published theme settings (${commitSha.slice(0, 7)}).`);
    } catch (e) {
      publishingNotice.hide();
      const msg = e instanceof Error ? e.message : String(e);
      new import_obsidian4.Notice(`Theme publish failed: ${msg}`, 1e4);
      console.error("Blog Publisher theme publish error:", e);
    }
  }
  async hashText(content) {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }
  async writeBackFrontmatter(file, updates) {
    this.writebackGuard.set(file.path, Date.now());
    setTimeout(() => {
      const ts = this.writebackGuard.get(file.path);
      if (ts && Date.now() - ts >= 5e3) {
        this.writebackGuard.delete(file.path);
      }
    }, 5e3);
    await this.app.fileManager.processFrontMatter(file, (fm) => {
      for (const [key, value] of Object.entries(updates)) {
        if (value === "") {
          delete fm[key];
        } else {
          fm[key] = value;
        }
      }
    });
  }
};

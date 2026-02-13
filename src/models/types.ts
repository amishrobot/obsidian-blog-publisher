// ── Plugin Settings (v1 compat + state file) ───────────────────────

export interface BlogPublisherSettings {
  githubToken: string;
  repository: string;
  branch: string;
  postsFolder: string;
  themeFilePath: string;
  themeRepoPath: string;
  themePublishedHash: string;
  themePublishedCommit: string;
  siteUrl: string;
  themes: string[];
}

export const DEFAULT_SETTINGS: BlogPublisherSettings = {
  githubToken: '',
  repository: 'amishrobot/amishrobot.com',
  branch: 'main',
  postsFolder: 'Personal/Blog/posts',
  themeFilePath: 'Personal/Blog/settings/theme.md',
  themeRepoPath: 'content/settings/theme.md',
  themePublishedHash: '',
  themePublishedCommit: '',
  siteUrl: 'https://amishrobot.com',
  themes: ['classic', 'paper', 'spruce', 'midnight'],
};

// ── Post Data ───────────────────────────────────────────────────────

export interface ImageData {
  vaultPath: string;
  filename: string;
  repoPath: string;
  originalWikilink: string;
}

export interface PostData {
  title: string;
  date: string;
  year: string;
  slug: string;
  repoPostPath: string;
  transformedMarkdown: string;
  images: ImageData[];
  publishedHash: string;
}

// ── Post State (what the panel tracks) ──────────────────────────────

export interface PostState {
  title: string;
  slug: string;
  date: string;
  status: string;
  type: string;
  tags: string[];
  wordCount: number;
  lastModified: string;
  publishedHash: string;
  publishedCommit: string;
  publishedAt: string;
}

// ── Status Config ───────────────────────────────────────────────────

export interface StatusDef {
  label: string;
  color: string;
  bg: string;
  icon: string;
  desc: string;
}

export const STATUS_CONFIG: Record<string, StatusDef> = {
  draft:     { label: 'Draft',       color: '#e5c07b', bg: '#e5c07b20', icon: '○', desc: 'Work in progress' },
  review:    { label: 'Review',      color: '#61afef', bg: '#61afef20', icon: '◎', desc: 'Ready for review' },
  publish:   { label: 'Published',   color: '#98c379', bg: '#98c37920', icon: '●', desc: 'Live on site' },
  unpublish: { label: 'Unpublished', color: '#e06c75', bg: '#e06c7520', icon: '○', desc: 'Taken offline' },
};

// ── Theme Palettes ──────────────────────────────────────────────────

export interface ThemePalette {
  label: string;
  dots: string[];
  bg: string; bgDeep: string; bgSurface: string;
  border: string; borderSubtle: string;
  text: string; textMuted: string; textFaint: string;
  accent: string; accentBg: string; heading: string;
  inputBg: string; inputBorder: string;
  tagBg: string; tagText: string; urlColor: string;
  chipBorder: string; chipSelectedBg: string; chipSelectedBorder: string;
  overlayBg: string; hoverBg: string;
}

export const THEME_PALETTES: Record<string, ThemePalette> = {
  classic: {
    label: 'Classic',
    dots: ['#1a1a2e', '#e8e8e8', '#4a90d9'],
    bg: '#1e1e2e', bgDeep: '#16162a', bgSurface: '#252540',
    border: '#2e2e4a', borderSubtle: '#252540',
    text: '#d4d4e8', textMuted: '#8888aa', textFaint: '#555577',
    accent: '#4a90d9', accentBg: '#4a90d920', heading: '#ccccee',
    inputBg: '#1a1a30', inputBorder: '#333355',
    tagBg: '#2e2e50', tagText: '#aaaacc', urlColor: '#4a90d9',
    chipBorder: '#3a3a5a', chipSelectedBg: '#2e2e50', chipSelectedBorder: '#6a6a9a',
    overlayBg: '#202038', hoverBg: '#28284a',
  },
  paper: {
    label: 'Paper',
    dots: ['#faf9f6', '#2c2c2c', '#8b7355'],
    bg: '#f5f3ee', bgDeep: '#eae7df', bgSurface: '#fff',
    border: '#ddd8cc', borderSubtle: '#e8e4da',
    text: '#3a3530', textMuted: '#8a8378', textFaint: '#b5ad9e',
    accent: '#8b7355', accentBg: '#8b735520', heading: '#4a4540',
    inputBg: '#faf9f6', inputBorder: '#d5d0c5',
    tagBg: '#e8e4da', tagText: '#6a6358', urlColor: '#8b7355',
    chipBorder: '#d5d0c5', chipSelectedBg: '#e8e4da', chipSelectedBorder: '#8b7355',
    overlayBg: '#f0ede6', hoverBg: '#ece8e0',
  },
  spruce: {
    label: 'Spruce',
    dots: ['#1b2a1b', '#d4e4d4', '#5a8a5a'],
    bg: '#1a2a1a', bgDeep: '#142014', bgSurface: '#223322',
    border: '#2a3f2a', borderSubtle: '#223322',
    text: '#c8dcc8', textMuted: '#7a9a7a', textFaint: '#4a6a4a',
    accent: '#5a8a5a', accentBg: '#5a8a5a20', heading: '#b8d4b8',
    inputBg: '#162016', inputBorder: '#2a4a2a',
    tagBg: '#223a22', tagText: '#8ab88a', urlColor: '#6aaa6a',
    chipBorder: '#2a4a2a', chipSelectedBg: '#223a22', chipSelectedBorder: '#5a8a5a',
    overlayBg: '#1e2e1e', hoverBg: '#243824',
  },
  midnight: {
    label: 'Midnight',
    dots: ['#0d1117', '#c9d1d9', '#58a6ff'],
    bg: '#0d1117', bgDeep: '#080c12', bgSurface: '#161b22',
    border: '#21262d', borderSubtle: '#161b22',
    text: '#c9d1d9', textMuted: '#8b949e', textFaint: '#484f58',
    accent: '#58a6ff', accentBg: '#58a6ff20', heading: '#d2dae4',
    inputBg: '#0d1117', inputBorder: '#30363d',
    tagBg: '#1c2330', tagText: '#8bb0d0', urlColor: '#58a6ff',
    chipBorder: '#21262d', chipSelectedBg: '#1c2330', chipSelectedBorder: '#58a6ff',
    overlayBg: '#111820', hoverBg: '#171d28',
  },
};

// ── Check definitions ───────────────────────────────────────────────

export interface CheckDef {
  id: string;
  label: string;
}

export const CHECKS: CheckDef[] = [
  { id: 'frontmatter', label: 'Frontmatter' },
  { id: 'slug',        label: 'Slug' },
  { id: 'links',       label: 'Links' },
  { id: 'images',      label: 'Images' },
  { id: 'build',       label: 'Build' },
];

// ── Change tracking ─────────────────────────────────────────────────

export interface Change {
  field: string;
  from: string | null;
  to: string | null;
}

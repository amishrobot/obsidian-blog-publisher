import { h } from 'preact';
import { useState, useCallback, useMemo, useEffect } from 'preact/hooks';
import { PostState, BlogPublisherSettings, STATUS_CONFIG, THEME_PALETTES, CHECKS, Change, ThemePalette } from '../models/types';
import { CheckResult } from '../services/ChecksService';
import { StatusPill } from './StatusPill';
import { ThemeChip } from './ThemeChip';
import { CheckBadge } from './CheckBadge';
import { AnimatedSection } from './AnimatedSection';
import { FieldRow } from './FieldRow';
import { TagInput } from './TagInput';
import { SlugEditor } from './SlugEditor';
import { UrlPreview } from './UrlPreview';
import { ChangeRow } from './ChangeRow';
import { ActionButton } from './ActionButton';
import { ConfirmModal } from './ConfirmModal';
import { HoverButton } from './HoverButton';
import { DeployHistoryButton } from './DeployHistoryButton';

export interface PublishPanelProps {
  post: PostState;
  saved: PostState;
  settings: BlogPublisherSettings;
  onStatusChange: (status: string) => void;
  onThemeChange: (theme: string) => Promise<void>;
  onSlugChange: (slug: string) => void;
  onTagsChange: (tags: string[]) => void;
  onPublish: () => Promise<void>;
  onUnpublish: () => Promise<void>;
  onRunChecks: () => Promise<Record<string, CheckResult>>;
  onOpenDeployHistory: () => void;
}

function computeChanges(saved: PostState, current: PostState, savedTheme: string, currentTheme: string): Change[] {
  const changes: Change[] = [];
  if (saved.status !== current.status) {
    changes.push({
      field: 'Status',
      from: STATUS_CONFIG[saved.status]?.label || saved.status,
      to: STATUS_CONFIG[current.status]?.label || current.status,
    });
  }
  if (savedTheme !== currentTheme) {
    changes.push({
      field: 'Theme',
      from: THEME_PALETTES[savedTheme]?.label || savedTheme,
      to: THEME_PALETTES[currentTheme]?.label || currentTheme,
    });
  }
  if (saved.slug !== current.slug) {
    changes.push({ field: 'Slug', from: saved.slug, to: current.slug });
  }
  const added = current.tags.filter((x) => !saved.tags.includes(x));
  const removed = saved.tags.filter((x) => !current.tags.includes(x));
  added.forEach((x) => changes.push({ field: 'Tags', from: null, to: `+#${x}` }));
  removed.forEach((x) => changes.push({ field: 'Tags', from: `#${x}`, to: null }));
  return changes;
}

export function PublishPanel({
  post, saved, settings,
  onStatusChange, onThemeChange, onSlugChange, onTagsChange,
  onPublish, onUnpublish, onRunChecks, onOpenDeployHistory,
}: PublishPanelProps) {
  const [publishing, setPublishing] = useState(false);
  const [checks, setChecks] = useState<Record<string, boolean | 'running'>>({});
  const [justPassed, setJustPassed] = useState<Record<string, boolean>>({});
  const [checksRunning, setChecksRunning] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [toast, setToast] = useState<{ msg: string; color: string } | null>(null);
  const [toastExiting, setToastExiting] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(settings.themes[0] || 'classic');

  const t = THEME_PALETTES[selectedTheme] || THEME_PALETTES.classic;
  const themes = useMemo(() => {
    const ids = settings.themes.filter((id) => id.trim().length > 0);
    return ids.length > 0 ? ids : ['classic', 'paper', 'spruce', 'midnight', 'soviet'];
  }, [settings.themes]);
  const changes = computeChanges(saved, post, settings.themes[0] || 'classic', selectedTheme);
  const hasChanges = changes.length > 0;
  const allChecksPassed = CHECKS.every((c) => checks[c.id] === true);
  const readingTime = Math.max(1, Math.ceil(post.wordCount / 238));
  const statusConfig = STATUS_CONFIG[post.status] || STATUS_CONFIG.draft;

  const siteUrl = `amishrobot.com/${post.date.match(/^(\d{4})/)?.[1] || ''}/${post.slug}`;

  useEffect(() => {
    const liveTheme = settings.themes[0] || 'classic';
    setSelectedTheme(liveTheme);
  }, [settings.themes]);

  const showToast = useCallback((msg: string, color: string) => {
    setToastExiting(false);
    setToast({ msg, color });
    setTimeout(() => {
      setToastExiting(true);
      setTimeout(() => { setToast(null); setToastExiting(false); }, 200);
    }, 2500);
  }, []);

  const runChecks = useCallback(async () => {
    setChecks({});
    setJustPassed({});
    setChecksRunning(true);

    // Run checks sequentially with visual feedback
    for (let i = 0; i < CHECKS.length; i++) {
      const check = CHECKS[i];
      setChecks((prev) => ({ ...prev, [check.id]: 'running' }));

      // Small delay for visual effect
      await new Promise((r) => setTimeout(r, 150));

      const results = await onRunChecks();
      const result = results[check.id];
      setChecks((prev) => ({ ...prev, [check.id]: result?.passed ?? false }));
      setJustPassed((prev) => ({ ...prev, [check.id]: result?.passed ?? false }));
      setTimeout(() => setJustPassed((prev) => ({ ...prev, [check.id]: false })), 400);
    }

    setChecksRunning(false);
    showToast('All checks passed', '#98c379');
  }, [onRunChecks, showToast]);

  const handlePublish = () => {
    setShowConfirm(true);
  };

  const confirmAction = useCallback(async () => {
    setShowConfirm(false);

    // Run checks first
    setChecks({});
    setJustPassed({});
    setChecksRunning(true);

    for (let i = 0; i < CHECKS.length; i++) {
      const check = CHECKS[i];
      setChecks((prev) => ({ ...prev, [check.id]: 'running' }));
      await new Promise((r) => setTimeout(r, 150));

      const results = await onRunChecks();
      const result = results[check.id];
      const passed = result?.passed ?? false;
      setChecks((prev) => ({ ...prev, [check.id]: passed }));
      setJustPassed((prev) => ({ ...prev, [check.id]: passed }));
      setTimeout(() => setJustPassed((prev) => ({ ...prev, [check.id]: false })), 400);

      if (!passed) {
        setChecksRunning(false);
        showToast(`Check failed: ${check.label}`, '#e06c75');
        return;
      }
    }
    setChecksRunning(false);

    // Publish
    setPublishing(true);
    try {
      if (selectedTheme !== (settings.themes[0] || 'classic')) {
        await onThemeChange(selectedTheme);
      }
      await onPublish();
      const statusLabel = (STATUS_CONFIG[post.status]?.label || 'unknown').toLowerCase();
      const toastMsg = post.status === 'publish'
        ? 'Deploy triggered \u2014 post going live'
        : `Deploy triggered \u2014 status: ${statusLabel}`;
      showToast(toastMsg, '#98c379');
    } catch (e: any) {
      showToast(`Publish failed: ${e?.message || e}`, '#e06c75');
    } finally {
      setPublishing(false);
    }
  }, [onRunChecks, onPublish, onThemeChange, selectedTheme, settings.themes, post.status, showToast]);

  return (
    <div style={{
      height: '100%',
      background: t.bg, borderLeft: `1px solid ${t.border}`,
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      color: t.text,
      display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative',
      transition: 'background 0.4s ease, color 0.4s ease, border-color 0.4s ease',
    }}>

      {/* Header */}
      <div style={{
        padding: '12px 14px',
        borderBottom: `1px solid ${t.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        transition: 'border-color 0.4s ease',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14 }}>{'\uD83D\uDE80'}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: t.heading, transition: 'color 0.4s ease' }}>Publish</span>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '3px 8px', borderRadius: 4,
          background: statusConfig.bg,
          border: `1px solid ${statusConfig.color}40`,
          transition: 'all 0.25s ease',
        }}>
          <span style={{ fontSize: 8, color: statusConfig.color }}>{statusConfig.icon}</span>
          <span style={{ fontSize: 10.5, color: statusConfig.color, fontWeight: 500 }}>{statusConfig.label}</span>
        </div>
      </div>

      {/* Scrollable Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 14px 14px' }}>

        {/* Post title + reading time */}
        <div style={{ padding: '8px 0 12px' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: t.heading, lineHeight: 1.35, transition: 'color 0.4s ease' }}>{post.title}</div>
          <div style={{ fontSize: 11, color: t.textFaint, marginTop: 4, transition: 'color 0.4s ease' }}>
            {post.wordCount} words {'\u00B7'} {readingTime} min read {'\u00B7'} {post.type}
          </div>
        </div>

        {/* Status */}
        <AnimatedSection title="Status" t={t}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {Object.keys(STATUS_CONFIG).map((s) => (
              <StatusPill key={s} status={s} selected={post.status === s} onClick={() => onStatusChange(s)} t={t} />
            ))}
          </div>
        </AnimatedSection>

        <div style={{ height: 1, background: t.border, margin: '8px 0', transition: 'background 0.4s ease' }} />

        {/* Theme */}
        <AnimatedSection title="Theme" collapsible defaultOpen={false} t={t}>
          <div style={{ marginBottom: 6 }}>
            <FieldRow label="Live theme" t={t}>
              <span style={{
                textTransform: 'capitalize',
                color: selectedTheme !== (settings.themes[0] || 'classic') ? '#e5c07b' : t.text,
                transition: 'color 0.25s ease',
              }}>
                {THEME_PALETTES[settings.themes[0] || 'classic']?.label || 'Classic'}
                {selectedTheme !== (settings.themes[0] || 'classic') && ` \u2192 ${THEME_PALETTES[selectedTheme]?.label || selectedTheme}`}
              </span>
            </FieldRow>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {themes.map((id) => (
              <ThemeChip key={id} themeId={id} selected={selectedTheme === id} onClick={() => setSelectedTheme(id)} t={t} />
            ))}
          </div>
        </AnimatedSection>

        <div style={{ height: 1, background: t.border, margin: '8px 0', transition: 'background 0.4s ease' }} />

        {/* Checks */}
        <AnimatedSection title="Checks" t={t} badge={
          allChecksPassed && !checksRunning ? (
            <span style={{ fontSize: 10, color: '#98c379', fontWeight: 400, textTransform: 'none', letterSpacing: '0' }}>All passed</span>
          ) : null
        }>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
            {CHECKS.map((c) => (
              <CheckBadge key={c.id} label={c.label} passed={checks[c.id] === true} running={checks[c.id] === 'running'} justPassed={justPassed[c.id] || false} />
            ))}
          </div>
          {!checksRunning && !allChecksPassed && (
            <HoverButton onClick={runChecks} t={t}>Run checks</HoverButton>
          )}
        </AnimatedSection>

        <div style={{ height: 1, background: t.border, margin: '8px 0', transition: 'background 0.4s ease' }} />

        {/* Metadata */}
        <AnimatedSection title="Metadata" collapsible defaultOpen={true} t={t}>
          <FieldRow label="Date" t={t}>{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</FieldRow>
          <FieldRow label="Type" t={t}><span style={{ textTransform: 'capitalize' }}>{post.type}</span></FieldRow>
          <FieldRow label="Modified" t={t}>{new Date(post.lastModified).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</FieldRow>
          <div style={{ padding: '5px 0' }}>
            <div style={{ color: t.textMuted, fontSize: 12.5, marginBottom: 4, transition: 'color 0.25s ease' }}>Slug</div>
            <SlugEditor slug={post.slug} onChange={onSlugChange} t={t} />
          </div>
        </AnimatedSection>

        <div style={{ height: 1, background: t.border, margin: '8px 0', transition: 'background 0.4s ease' }} />

        {/* Tags */}
        <AnimatedSection title="Tags" collapsible defaultOpen={true} t={t}>
          <TagInput tags={post.tags} onChange={onTagsChange} t={t} />
        </AnimatedSection>

        <div style={{ height: 1, background: t.border, margin: '8px 0', transition: 'background 0.4s ease' }} />

        {/* URL Preview */}
        <AnimatedSection title="URL Preview" collapsible defaultOpen={true} t={t}>
          <UrlPreview url={siteUrl} t={t} />
        </AnimatedSection>

        <div style={{ height: 1, background: t.border, margin: '8px 0', transition: 'background 0.4s ease' }} />

        {/* Changes */}
        <AnimatedSection title="Changes" collapsible defaultOpen={true} t={t} badge={
          hasChanges ? <span style={{ fontSize: 10, color: '#e5c07b', fontWeight: 400, textTransform: 'none', letterSpacing: '0' }}>{changes.length}</span> : null
        }>
          {hasChanges ? (
            <div style={{ padding: '4px 0' }}>
              {changes.map((c, i) => <ChangeRow key={i} change={c} t={t} />)}
            </div>
          ) : (
            <div style={{ fontSize: 11.5, color: t.textFaint, padding: '4px 0', fontStyle: 'italic' }}>No changes</div>
          )}
        </AnimatedSection>
      </div>

      {/* Bottom Action */}
      <div style={{ flexShrink: 0 }}>
        <div style={{ padding: '10px 14px', borderTop: `1px solid ${t.border}`, transition: 'border-color 0.4s ease' }}>
          <ActionButton
            post={post} saved={saved} hasChanges={hasChanges}
            publishing={publishing}
            onPublish={handlePublish}
            t={t}
          />
        </div>
        <DeployHistoryButton onClick={onOpenDeployHistory} t={t} />
      </div>

      {/* Confirmation Overlay */}
      {showConfirm && (
        <ConfirmModal
          changes={changes}
          hasChanges={hasChanges}
          onConfirm={confirmAction}
          onCancel={() => setShowConfirm(false)}
          t={t}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'absolute', bottom: 100, left: 14, right: 14,
          padding: '10px 14px', borderRadius: 8,
          background: `${toast.color}15`, border: `1px solid ${toast.color}30`,
          fontSize: 12, color: toast.color, zIndex: 5,
          animation: toastExiting ? 'slideOut 0.2s ease forwards' : 'slideUp 0.2s ease',
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}

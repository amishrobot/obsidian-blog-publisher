import { h } from 'preact';
import { PostState, ThemePalette } from '../models/types';
import { useHover } from '../hooks/useHover';

interface ActionButtonProps {
  post: PostState;
  saved: PostState;
  hasChanges: boolean;
  publishing: boolean;
  onPublish: () => void;
  t: ThemePalette;
}

export function ActionButton({ post, saved, hasChanges, publishing, onPublish, t }: ActionButtonProps) {
  const [hovered, hoverHandlers] = useHover();
  const isPublished = post.status === 'publish';
  const hasPublishedSnapshot = Boolean(
    (saved.publishedAt && saved.publishedAt.trim().length > 0)
    || (saved.publishedCommit && saved.publishedCommit.trim().length > 0)
    || (saved.publishedHash && saved.publishedHash.trim().length > 0)
  );

  let label: string, bg: string, color: string, glow: boolean, onClick: (() => void) | null, disabled: boolean;

  if (publishing) {
    label = 'Deploying';
    bg = '#98c379';
    color = '#1e1e1e';
    glow = false;
    onClick = null;
    disabled = true;
  } else if (isPublished) {
    label = hasPublishedSnapshot ? 'Update' : 'Publish';
    bg = hovered ? '#88b86a' : '#98c379';
    color = '#1e1e1e';
    glow = true;
    onClick = onPublish;
    disabled = false;
  } else if (hasChanges) {
    label = 'Save Draft';
    bg = hovered ? '#88b86a' : '#98c379';
    color = '#1e1e1e';
    glow = true;
    onClick = onPublish;
    disabled = false;
  } else {
    label = 'No changes';
    bg = t.bgSurface;
    color = t.textFaint;
    glow = false;
    onClick = null;
    disabled = true;
  }

  return (
    <button
      onClick={onClick || undefined}
      disabled={disabled}
      {...(!disabled ? hoverHandlers : {})}
      style={{
        position: 'relative',
        width: '100%', padding: '10px 16px', borderRadius: 8,
        border: 'none',
        background: bg, color: color,
        fontSize: 12.5, fontWeight: 600,
        cursor: disabled ? 'default' : 'pointer',
        fontFamily: 'inherit',
        transition: 'all 0.2s ease',
        animation: glow && !publishing ? 'pulseGlow 2s ease-in-out infinite' : 'none',
        overflow: 'hidden',
        transform: hovered && !disabled ? 'translateY(-1px)' : 'none',
      }}
    >
      {publishing && (
        <span style={{
          position: 'absolute', top: 0, left: 0, bottom: 0,
          background: 'rgba(255,255,255,0.2)',
          animation: 'progressFill 2.8s ease-out forwards',
          borderRadius: 8,
        }} />
      )}
      <span style={{ position: 'relative', zIndex: 1 }}>{label}</span>
    </button>
  );
}

import { h } from 'preact';
import { Change, ThemePalette } from '../models/types';
import { ChangeRow } from './ChangeRow';
import { useHover } from '../hooks/useHover';

interface ConfirmButtonProps {
  label: string;
  onClick: () => void;
  bg: string;
  color: string;
  border?: string;
}

function ConfirmButton({ label, onClick, bg, color, border }: ConfirmButtonProps) {
  const [hovered, hoverHandlers] = useHover();
  return (
    <button
      onClick={onClick}
      {...hoverHandlers}
      style={{
        flex: 1, padding: '8px', borderRadius: 6,
        border: border ? `1px solid ${border}` : 'none',
        background: bg, color: color,
        fontSize: 12, fontWeight: border ? 400 : 600,
        cursor: 'pointer', fontFamily: 'inherit',
        transform: hovered ? 'translateY(-1px)' : 'none',
        transition: 'all 0.15s ease',
        filter: hovered ? 'brightness(1.1)' : 'none',
      }}
    >
      {label}
    </button>
  );
}

interface ConfirmModalProps {
  changes: Change[];
  hasChanges: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  t: ThemePalette;
}

export function ConfirmModal({ changes, hasChanges, onConfirm, onCancel, t }: ConfirmModalProps) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, zIndex: 10,
      animation: 'overlayIn 0.2s ease forwards',
      background: 'rgba(0,0,0,0.6)',
    }}>
      <div style={{
        background: t.overlayBg, borderRadius: 10, padding: 20, width: '100%',
        border: `1px solid ${t.border}`,
        animation: 'modalIn 0.25s ease',
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: t.heading }}>
          Publish changes?
        </div>
        <div style={{ fontSize: 12, color: t.textMuted, marginBottom: 12, lineHeight: 1.5 }}>
          This will run checks, update frontmatter, and trigger a Vercel deploy. Your build pipeline will handle the rest.
        </div>
        {hasChanges && (
          <div style={{ padding: '8px 10px', borderRadius: 6, background: t.bgDeep, border: `1px solid ${t.border}`, marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: t.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Changes</div>
            {changes.map((c, i) => <ChangeRow key={i} change={c} t={t} />)}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <ConfirmButton label="Cancel" onClick={onCancel} bg="transparent" color={t.textMuted} border={t.border} />
          <ConfirmButton label="Publish" onClick={onConfirm} bg="#98c379" color="#1e1e1e" />
        </div>
      </div>
    </div>
  );
}

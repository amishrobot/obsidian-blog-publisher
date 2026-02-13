import { h } from 'preact';
import { ThemePalette } from '../models/types';
import { useHover } from '../hooks/useHover';

interface DeployHistoryButtonProps {
  onClick: () => void;
  t: ThemePalette;
}

export function DeployHistoryButton({ onClick, t }: DeployHistoryButtonProps) {
  const [hovered, hoverHandlers] = useHover();
  return (
    <button
      onClick={onClick}
      {...hoverHandlers}
      style={{
        width: '100%', padding: '8px 14px',
        background: hovered ? t.hoverBg : 'none',
        border: 'none', borderTop: `1px solid ${t.border}`,
        color: hovered ? t.textMuted : t.textFaint,
        fontSize: 11, cursor: 'pointer',
        fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6,
        transition: 'all 0.2s ease',
      }}
    >
      Deploy history {'\u25B8'}
    </button>
  );
}

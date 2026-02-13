import { h } from 'preact';
import { STATUS_CONFIG, ThemePalette } from '../models/types';
import { useHover } from '../hooks/useHover';

interface StatusPillProps {
  status: string;
  selected: boolean;
  onClick: () => void;
  t: ThemePalette;
}

export function StatusPill({ status, selected, onClick, t }: StatusPillProps) {
  const c = STATUS_CONFIG[status];
  const [hovered, hoverHandlers] = useHover();
  return (
    <button
      onClick={onClick}
      {...hoverHandlers}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 12px', borderRadius: 6, width: '100%',
        border: selected ? `1.5px solid ${c.color}` : '1.5px solid transparent',
        background: selected ? c.bg : hovered ? t.hoverBg : 'transparent',
        color: selected ? c.color : hovered ? t.text : t.textFaint,
        cursor: 'pointer', fontSize: 12.5,
        fontWeight: selected ? 600 : 400,
        transition: 'all 0.2s ease', fontFamily: 'inherit',
        justifyContent: 'flex-start',
        transform: hovered && !selected ? 'translateX(2px)' : 'none',
      }}
    >
      <span style={{ fontSize: 11 }}>{c.icon}</span>
      <span>{c.label}</span>
      {selected && <span style={{ marginLeft: 'auto', fontSize: 10.5, opacity: 0.7 }}>{c.desc}</span>}
    </button>
  );
}

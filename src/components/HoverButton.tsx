import { h, ComponentChildren } from 'preact';
import { ThemePalette } from '../models/types';
import { useHover } from '../hooks/useHover';

interface HoverButtonProps {
  onClick: () => void;
  t: ThemePalette;
  children: ComponentChildren;
}

export function HoverButton({ onClick, t, children }: HoverButtonProps) {
  const [hovered, hoverHandlers] = useHover();
  return (
    <button
      onClick={onClick}
      {...hoverHandlers}
      style={{
        padding: '5px 10px', borderRadius: 5,
        border: `1px solid ${hovered ? t.accent + '60' : t.border}`,
        background: hovered ? t.hoverBg : 'transparent',
        color: hovered ? t.text : t.textMuted,
        fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
        transition: 'all 0.2s ease',
      }}
    >
      {children}
    </button>
  );
}

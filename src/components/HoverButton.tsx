import { h, ComponentChildren } from 'preact';
import { ThemePalette } from '../models/types';
import { useHover } from '../hooks/useHover';

interface HoverButtonProps {
  onClick: () => void;
  t: ThemePalette;
  children: ComponentChildren;
  disabled?: boolean;
}

export function HoverButton({ onClick, t, children, disabled = false }: HoverButtonProps) {
  const [hovered, hoverHandlers] = useHover();
  const activeHover = hovered && !disabled;
  return (
    <button
      onClick={onClick}
      {...(disabled ? {} : hoverHandlers)}
      disabled={disabled}
      style={{
        padding: '5px 10px', borderRadius: 5,
        border: `1px solid ${activeHover ? t.accent + '60' : t.border}`,
        background: activeHover ? t.hoverBg : 'transparent',
        color: disabled ? t.textFaint : activeHover ? t.text : t.textMuted,
        opacity: disabled ? 0.75 : 1,
        fontSize: 11, cursor: disabled ? 'default' : 'pointer', fontFamily: 'inherit',
        transition: 'all 0.2s ease',
      }}
    >
      {children}
    </button>
  );
}

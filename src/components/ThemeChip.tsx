import { h } from 'preact';
import { THEME_PALETTES, ThemePalette } from '../models/types';
import { useHover } from '../hooks/useHover';

interface ThemeChipProps {
  themeId: string;
  selected: boolean;
  onClick: () => void;
  t: ThemePalette;
}

export function ThemeChip({ themeId, selected, onClick, t }: ThemeChipProps) {
  const palette = THEME_PALETTES[themeId];
  const [hovered, hoverHandlers] = useHover();
  return (
    <button
      onClick={onClick}
      {...hoverHandlers}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '5px 10px', borderRadius: 6,
        border: selected ? `1.5px solid ${palette.chipSelectedBorder}` : `1.5px solid ${t.chipBorder}`,
        background: selected ? palette.chipSelectedBg : hovered ? t.hoverBg : 'transparent',
        cursor: 'pointer', fontFamily: 'inherit', fontSize: 11.5,
        color: selected ? t.text : hovered ? t.text : t.textMuted,
        fontWeight: selected ? 600 : 400,
        transition: 'all 0.2s ease',
        transform: hovered && !selected ? 'translateY(-1px)' : 'none',
      }}
    >
      <span style={{ display: 'flex', gap: 2 }}>
        {palette.dots.map((color, i) => (
          <span key={i} style={{
            width: selected ? 10 : 8, height: selected ? 10 : 8,
            borderRadius: '50%', background: color,
            border: `1px solid ${t.border}`,
            transition: 'all 0.25s ease',
          }} />
        ))}
      </span>
      {palette.label}
    </button>
  );
}

import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { ThemePalette } from '../models/types';
import { useHover } from '../hooks/useHover';

interface SlugEditorProps {
  slug: string;
  onChange: (slug: string) => void;
  t: ThemePalette;
}

export function SlugEditor({ slug, onChange, t }: SlugEditorProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(slug);
  const [hovered, hoverHandlers] = useHover();

  useEffect(() => setValue(slug), [slug]);

  if (editing) {
    return (
      <input
        autoFocus
        value={value}
        onInput={(e) => setValue((e.target as HTMLInputElement).value.replace(/[^a-z0-9-]/g, ''))}
        onBlur={() => { onChange(value); setEditing(false); }}
        onKeyDown={(e) => { if (e.key === 'Enter') { onChange(value); setEditing(false); } }}
        style={{
          width: '100%', padding: '5px 8px', borderRadius: 4,
          border: `1px solid ${t.accent}`, background: t.inputBg,
          color: t.text, fontSize: 12, outline: 'none',
          fontFamily: "'SF Mono', monospace", boxSizing: 'border-box',
          transition: 'all 0.25s ease',
        }}
      />
    );
  }

  return (
    <button
      onClick={() => setEditing(true)}
      {...hoverHandlers}
      style={{
        background: 'none', border: 'none', fontSize: 11.5, cursor: 'pointer',
        padding: 0, fontFamily: "'SF Mono', monospace", textAlign: 'right',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%',
        color: hovered ? t.text : t.accent,
        textDecoration: hovered ? 'underline' : 'none',
        transition: 'all 0.15s ease',
      }}
    >
      /{slug}
    </button>
  );
}

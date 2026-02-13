import { h } from 'preact';
import { useState } from 'preact/hooks';
import { ThemePalette } from '../models/types';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  t: ThemePalette;
}

export function TagInput({ tags, onChange, t }: TagInputProps) {
  const [input, setInput] = useState('');
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: tags.length ? 6 : 0 }}>
        {tags.map((tag) => (
          <span key={tag} style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 8px', borderRadius: 4,
            background: t.tagBg, color: t.tagText, fontSize: 11,
            transition: 'all 0.25s ease',
            animation: 'tagIn 0.2s ease',
          }}>
            #{tag}
            <button
              onClick={() => onChange(tags.filter((x) => x !== tag))}
              style={{
                background: 'none', border: 'none', color: t.textFaint,
                cursor: 'pointer', padding: 0, fontSize: 13, lineHeight: 1,
                fontFamily: 'inherit', transition: 'color 0.15s ease',
              }}
            >
              {'\u00D7'}
            </button>
          </span>
        ))}
      </div>
      <input
        value={input}
        onInput={(e) => setInput((e.target as HTMLInputElement).value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const val = input.trim().toLowerCase();
            if (val && !tags.includes(val)) onChange([...tags, val]);
            setInput('');
          }
        }}
        placeholder="Add tag..."
        style={{
          width: '100%', padding: '5px 8px', borderRadius: 4,
          border: `1px solid ${t.inputBorder}`, background: t.inputBg,
          color: t.text, fontSize: 12, outline: 'none', fontFamily: 'inherit',
          boxSizing: 'border-box', transition: 'all 0.25s ease',
        }}
      />
    </div>
  );
}

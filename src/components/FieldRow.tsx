import { h, ComponentChildren } from 'preact';
import { ThemePalette } from '../models/types';

interface FieldRowProps {
  label: string;
  children: ComponentChildren;
  t: ThemePalette;
}

export function FieldRow({ label, children, t }: FieldRowProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0', fontSize: 12.5 }}>
      <span style={{ color: t.textMuted, flexShrink: 0, transition: 'color 0.25s ease' }}>{label}</span>
      <span style={{ color: t.text, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%', transition: 'color 0.25s ease' }}>{children}</span>
    </div>
  );
}

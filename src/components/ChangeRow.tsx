import { h } from 'preact';
import { Change, ThemePalette } from '../models/types';

interface ChangeRowProps {
  change: Change;
  t: ThemePalette;
}

export function ChangeRow({ change, t }: ChangeRowProps) {
  if (change.from && change.to && !change.to.startsWith('+')) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0', fontSize: 11.5 }}>
        <span style={{ color: t.textMuted, width: 50, flexShrink: 0 }}>{change.field}:</span>
        <span style={{ color: '#e06c75' }}>{change.from}</span>
        <span style={{ color: t.textFaint }}>{'\u2192'}</span>
        <span style={{ color: '#98c379' }}>{change.to}</span>
      </div>
    );
  }
  if (change.to) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0', fontSize: 11.5 }}>
        <span style={{ color: t.textMuted, width: 50, flexShrink: 0 }}>{change.field}:</span>
        <span style={{ color: '#98c379' }}>{change.to}</span>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0', fontSize: 11.5 }}>
      <span style={{ color: t.textMuted, width: 50, flexShrink: 0 }}>{change.field}:</span>
      <span style={{ color: '#e06c75', textDecoration: 'line-through' }}>{change.from}</span>
    </div>
  );
}

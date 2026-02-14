import { h, Fragment } from 'preact';
import { useState } from 'preact/hooks';
import { ThemePalette } from '../models/types';
import { useHover } from '../hooks/useHover';

interface UrlPreviewProps {
  url: string;
  t: ThemePalette;
}

export function UrlPreview({ url, t }: UrlPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [hovered, hoverHandlers] = useHover();
  const normalized = url.trim();
  const fullUrl = /^https?:\/\//i.test(normalized) ? normalized : `https://${normalized}`;

  const copy = () => {
    navigator.clipboard.writeText(fullUrl).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      copy();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={copy}
      onKeyDown={onKeyDown}
      {...hoverHandlers}
      title={fullUrl}
      style={{
        display: 'flex', alignItems: 'center', gap: 6, width: '100%', textAlign: 'left',
        padding: '8px 10px', borderRadius: 6,
        background: hovered ? t.hoverBg : t.bgDeep,
        border: `1px solid ${hovered ? t.accent + '60' : t.border}`,
        fontSize: 11.5, fontFamily: "'SF Mono', Consolas, monospace",
        color: t.textMuted,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        lineHeight: 1.5,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxSizing: 'border-box',
        maxWidth: '100%',
        minWidth: 0,
      }}
    >
      {copied ? (
        <span style={{ color: '#98c379', animation: 'fadeScaleIn 0.15s ease' }}>{'\u2713'} Copied to clipboard</span>
      ) : (
        <Fragment>
          <span style={{
            flex: 1,
            minWidth: 0,
            color: t.urlColor,
            transition: 'color 0.4s ease',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {fullUrl}
          </span>
          {hovered && <span style={{ color: t.textFaint, marginLeft: 6, fontSize: 10 }}>{'\u2398'}</span>}
        </Fragment>
      )}
    </div>
  );
}

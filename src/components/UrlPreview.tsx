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

  const copy = () => {
    navigator.clipboard.writeText('https://' + url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      onClick={copy}
      {...hoverHandlers}
      style={{
        display: 'block', width: '100%', textAlign: 'left',
        padding: '8px 10px', borderRadius: 6,
        background: hovered ? t.hoverBg : t.bgDeep,
        border: `1px solid ${hovered ? t.accent + '60' : t.border}`,
        fontSize: 11.5, fontFamily: "'SF Mono', Consolas, monospace",
        color: t.textMuted, wordBreak: 'break-all', lineHeight: 1.5,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxSizing: 'border-box',
      }}
    >
      {copied ? (
        <span style={{ color: '#98c379', animation: 'fadeScaleIn 0.15s ease' }}>{'\u2713'} Copied to clipboard</span>
      ) : (
        <Fragment>
          <span style={{ color: t.textFaint }}>https://</span>
          <span style={{ color: t.urlColor, transition: 'color 0.4s ease' }}>{url}</span>
          {hovered && <span style={{ color: t.textFaint, marginLeft: 6, fontSize: 10 }}>{'\u2398'}</span>}
        </Fragment>
      )}
    </button>
  );
}

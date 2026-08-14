import { h, Fragment } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { LinkMeta, ThemePalette } from '../models/types';
import { useHover } from '../hooks/useHover';

interface LinkSectionProps {
  link: LinkMeta | null;
  postTitle: string;
  onChange: (patch: Partial<LinkMeta>) => void;
  onFetch: (url: string) => Promise<void>;
  t: ThemePalette;
}

function fieldStyle(t: ThemePalette, multiline = false) {
  return {
    width: '100%',
    padding: '5px 8px',
    borderRadius: 4,
    border: `1px solid ${t.border}`,
    background: t.inputBg,
    color: t.text,
    fontSize: 12,
    outline: 'none',
    boxSizing: 'border-box' as const,
    resize: multiline ? ('vertical' as const) : ('none' as const),
    minHeight: multiline ? 54 : undefined,
    fontFamily: 'inherit',
    lineHeight: 1.45,
    transition: 'border-color 0.25s ease',
  };
}

/** Edits the `link:` block so the nested YAML never has to be typed by hand. */
export function LinkSection({ link, postTitle, onChange, onFetch, t }: LinkSectionProps) {
  const [url, setUrl] = useState(link?.url || '');
  const [title, setTitle] = useState(link?.title || '');
  const [description, setDescription] = useState(link?.description || '');
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchHovered, fetchHoverHandlers] = useHover();

  useEffect(() => setUrl(link?.url || ''), [link?.url]);
  useEffect(() => setTitle(link?.title || ''), [link?.title]);
  useEffect(() => setDescription(link?.description || ''), [link?.description]);

  const normalizedPostTitle = postTitle.toLowerCase().replace(/[^a-z0-9]/g, '');
  const normalizedLinkTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '');
  const titleIsRedundant = Boolean(title) && normalizedLinkTitle === normalizedPostTitle;

  const runFetch = async () => {
    if (!url.trim() || fetching) return;
    setFetching(true);
    setError(null);
    try {
      await onFetch(url.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setFetching(false);
    }
  };

  const label = (text: string) => (
    <div style={{ color: t.textMuted, fontSize: 12.5, marginBottom: 4, marginTop: 10 }}>{text}</div>
  );

  return (
    <Fragment>
      {label('URL')}
      <div style={{ display: 'flex', gap: 6 }}>
        <input
          value={url}
          placeholder="https://example.com/article"
          onInput={(e) => setUrl((e.target as HTMLInputElement).value)}
          onBlur={() => onChange({ url: url.trim() })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void runFetch();
          }}
          style={{ ...fieldStyle(t), fontFamily: "'SF Mono', monospace", fontSize: 11.5 }}
        />
        <button
          {...fetchHoverHandlers}
          onClick={() => void runFetch()}
          disabled={!url.trim() || fetching}
          title="Read the page's own title, description and image"
          style={{
            flexShrink: 0,
            padding: '5px 10px',
            borderRadius: 4,
            border: `1px solid ${t.border}`,
            background: fetchHovered && url.trim() && !fetching ? t.accent : t.inputBg,
            color: fetchHovered && url.trim() && !fetching ? t.bg : t.text,
            fontSize: 11.5,
            cursor: url.trim() && !fetching ? 'pointer' : 'default',
            opacity: url.trim() ? 1 : 0.5,
            whiteSpace: 'nowrap',
            transition: 'all 0.2s ease',
          }}
        >
          {fetching ? 'Fetching…' : 'Fetch'}
        </button>
      </div>

      {error && (
        <div style={{ color: '#e06c75', fontSize: 11.5, marginTop: 6, lineHeight: 1.45 }}>{error}</div>
      )}

      {label('Title')}
      <input
        value={title}
        placeholder="The page's own title"
        onInput={(e) => setTitle((e.target as HTMLInputElement).value)}
        onBlur={() => onChange({ title: title.trim() })}
        style={fieldStyle(t)}
      />
      {titleIsRedundant && (
        <div style={{ color: t.textMuted, fontSize: 11, marginTop: 4, lineHeight: 1.45 }}>
          Same as the post title, so the card will hide it and show the domain instead.
        </div>
      )}

      {label('Description')}
      <textarea
        value={description}
        placeholder="The page's own summary, or an excerpt you'd rather feature"
        onInput={(e) => setDescription((e.target as HTMLTextAreaElement).value)}
        onBlur={() => onChange({ description: description.trim() })}
        style={fieldStyle(t, true)}
      />

      {label('Card image')}
      <div style={{ fontSize: 11.5, color: link?.image ? t.text : t.textMuted, lineHeight: 1.5 }}>
        {link?.image ? (
          <span style={{ fontFamily: "'SF Mono', monospace" }}>{link.image}</span>
        ) : (
          'None. Fetch pulls the page’s share image in automatically.'
        )}
      </div>

      {link?.captured && (
        <div style={{ fontSize: 11, color: t.textMuted, marginTop: 8 }}>
          Captured {link.captured}
        </div>
      )}
    </Fragment>
  );
}

import { h, ComponentChildren } from 'preact';
import { useState, useRef } from 'preact/hooks';
import { ThemePalette } from '../models/types';
import { useHover } from '../hooks/useHover';

interface AnimatedSectionProps {
  title: string;
  children: ComponentChildren;
  collapsible?: boolean;
  defaultOpen?: boolean;
  badge?: ComponentChildren;
  t: ThemePalette;
}

export function AnimatedSection({ title, children, collapsible = false, defaultOpen = true, badge, t }: AnimatedSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [contentHeight, setContentHeight] = useState<string>('auto');
  const [animating, setAnimating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [hovered, hoverHandlers] = useHover();

  const toggle = () => {
    if (!collapsible) return;
    if (contentRef.current) {
      const h = contentRef.current.scrollHeight;
      if (open) {
        setContentHeight(h + 'px');
        requestAnimationFrame(() => {
          setAnimating(true);
          setContentHeight('0px');
        });
        setTimeout(() => { setOpen(false); setAnimating(false); }, 200);
      } else {
        setOpen(true);
        setContentHeight('0px');
        requestAnimationFrame(() => {
          setAnimating(true);
          setContentHeight(h + 'px');
        });
        setTimeout(() => { setContentHeight('auto'); setAnimating(false); }, 200);
      }
    } else {
      setOpen(!open);
    }
  };

  return (
    <div style={{ marginBottom: 2 }}>
      <button
        onClick={toggle}
        {...(collapsible ? hoverHandlers : {})}
        style={{
          display: 'flex', alignItems: 'center', gap: 6, width: '100%',
          padding: '8px 0', background: 'none', border: 'none',
          color: hovered && collapsible ? t.text : t.heading,
          fontSize: 10.5, fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.05em',
          cursor: collapsible ? 'pointer' : 'default', fontFamily: 'inherit',
          transition: 'color 0.2s ease',
        }}
      >
        {collapsible && (
          <span style={{
            fontSize: 9, display: 'inline-block',
            transition: 'transform 0.2s ease',
            transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
          }}>{'\u25B6'}</span>
        )}
        {title}
        {badge && <span style={{ marginLeft: 'auto' }}>{badge}</span>}
      </button>
      <div
        ref={contentRef}
        style={{
          overflow: animating ? 'hidden' : 'visible',
          height: open && !animating ? 'auto' : contentHeight,
          transition: animating ? 'height 0.2s ease' : 'none',
          opacity: open ? 1 : 0,
        }}
      >
        {open && children}
      </div>
    </div>
  );
}

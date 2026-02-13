import { useState, useMemo } from 'preact/hooks';

export function useHover(): [boolean, { onMouseEnter: () => void; onMouseLeave: () => void }] {
  const [hovered, setHovered] = useState(false);
  const handlers = useMemo(() => ({
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  }), []);
  return [hovered, handlers];
}

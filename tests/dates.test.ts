import { describe, expect, it } from 'vitest';
import { formatModified, formatPostDate } from '../src/utils/dates';

describe('formatPostDate', () => {
  it('reads a frontmatter date as the calendar date it is', () => {
    // The bug: `new Date('2026-08-13')` is UTC midnight, so formatting it in
    // local time showed "Aug 12" to anyone west of UTC while the site — which
    // builds in UTC — showed the 13th.
    expect(formatPostDate('2026-08-13')).toBe('Aug 13, 2026');
  });

  it('does not shift across a year boundary', () => {
    expect(formatPostDate('2006-01-01')).toBe('Jan 1, 2006');
  });

  it('accepts a Date as well as a string', () => {
    expect(formatPostDate(new Date('2011-03-24'))).toBe('Mar 24, 2011');
  });

  it('returns the input unchanged when it is not a date', () => {
    expect(formatPostDate('not a date')).toBe('not a date');
    expect(formatPostDate('')).toBe('');
  });
});

describe('formatModified', () => {
  it('formats a real instant, which belongs in the reader’s own timezone', () => {
    const out = formatModified(new Date('2026-08-13T21:30:00Z'));
    expect(out).toMatch(/Aug 1[34]/); // the local day depends on the runner
    expect(out).toMatch(/\d{1,2}:\d{2}/);
  });

  it('returns empty for an unparseable value', () => {
    expect(formatModified('nonsense')).toBe('');
  });
});

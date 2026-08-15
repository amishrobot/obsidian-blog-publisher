/**
 * Date formatting for the panel. Pure and `obsidian`-free so the timezone
 * behaviour can be tested — it is the kind of bug that is invisible on a
 * machine set to UTC and wrong everywhere else.
 */

/**
 * A post's `date` is a calendar date from frontmatter. `new Date('2026-08-13')`
 * parses that as UTC midnight, so formatting it in local time shows the day
 * before to anyone west of UTC. The site builds in UTC and reads it as the
 * 13th; the panel has to agree.
 */
export function formatPostDate(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value ?? '');
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/**
 * A modification time is a real instant rather than a calendar date, so it is
 * shown in the reader's own timezone — "3:41 PM" should mean when they saved.
 */
export function formatModified(value: string | number | Date): string {
  const date = value instanceof Date ? value : new Date(value as string);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

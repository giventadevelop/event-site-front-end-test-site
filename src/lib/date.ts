/**
 * Formats a YYYY-MM-DD string as 'Month Day, Year' in local time.
 * @param dateStr - The date string in YYYY-MM-DD format
 * @returns Formatted date string (e.g., 'June 4, 2025')
 */
export function formatDateLocal(dateStr?: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  const date = new Date(year, month - 1, day); // local time
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
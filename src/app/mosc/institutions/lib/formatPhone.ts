/**
 * Splits a phone string by slash or comma into individual numbers,
 * one per line. Normalizes each part: trim and remove spaces around hyphens.
 */
export function formatPhoneNumbers(phone: string): string[] {
  return phone
    .split(/[/,]/)
    .map((s) => s.trim().replace(/\s*-\s*/g, '-'))
    .filter(Boolean);
}

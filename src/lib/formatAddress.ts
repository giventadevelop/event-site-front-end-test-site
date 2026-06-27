export interface AddressFields {
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  stateProvince?: string | null;
  zipCode?: string | null;
  country?: string | null;
}

/** Multi-line mailing address for display (org/settings view pages). */
export function formatAddressBlock(fields: AddressFields): string | null {
  const line1 = [fields.addressLine1, fields.addressLine2].filter(Boolean).join(', ');
  const line2 = [fields.city, fields.stateProvince, fields.zipCode].filter(Boolean).join(', ');
  const lines = [line1, line2, fields.country].filter((part) => part && String(part).trim());
  return lines.length > 0 ? lines.join('\n') : null;
}

export function normalizeWebsiteUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

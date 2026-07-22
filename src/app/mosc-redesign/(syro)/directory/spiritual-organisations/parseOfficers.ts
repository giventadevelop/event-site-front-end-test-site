/**
 * Spiritual organisation CMS entries store office-bearers inside `description`
 * (no dedicated Strapi fields). Extract labeled roles; ignore narrative paragraphs.
 */

export type SpiritualOrganisationOfficers = {
  president?: string;
  vicePresident?: string;
  secretary?: string;
  officeAddress?: string;
};

const ROLE_LABEL =
  '\\b(?:President|Vice\\s*Presidents?|General\\s*Secretary|Secretary)\\b';

const TRAILING_FIELD_CUT =
  /\s*(?:Office\s*Address\b|Email\s*-?|Ph\s*-|Phones?\b|Website\b|Contact\s*Number\b).*$/is;

function cleanValue(value: string): string {
  return value
    .replace(TRAILING_FIELD_CUT, '')
    .replace(/\s+/g, ' ')
    .replace(/^[:\-–—]\s*/, '')
    .trim();
}

function looksLikeOfficerBlock(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  // Officer records usually start with a role label (not a narrative paragraph).
  return /^(President|Vice\s*Presidents?|General\s*Secretary|Secretary|Director)\b/i.test(
    trimmed
  );
}

export function parseSpiritualOrganisationOfficers(
  description: string | null | undefined
): SpiritualOrganisationOfficers {
  if (!description?.trim()) return {};

  const normalized = description.replace(/\r\n/g, '\n').trim();
  if (!looksLikeOfficerBlock(normalized)) return {};

  const officers: SpiritualOrganisationOfficers = {};
  const roleStarts = [...normalized.matchAll(new RegExp(ROLE_LABEL, 'gi'))].map((m) => ({
    label: m[0],
    index: m.index ?? 0,
  }));

  // Drop a bare "Secretary" match that sits inside an already-matched "General Secretary".
  const filteredRoles = roleStarts.filter((role, _idx, all) => {
    if (!/^secretary$/i.test(role.label)) return true;
    return !all.some(
      (other) =>
        /^general\s+secretary$/i.test(other.label) &&
        role.index > other.index &&
        role.index < other.index + other.label.length
    );
  });

  for (let i = 0; i < filteredRoles.length; i += 1) {
    const current = filteredRoles[i];
    const next = filteredRoles[i + 1];
    const labelEnd = current.index + current.label.length;
    const rawValue = normalized.slice(labelEnd, next?.index ?? normalized.length);
    const value = cleanValue(rawValue);
    if (!value) continue;

    const role = current.label.toLowerCase().replace(/\s+/g, ' ');
    if (role === 'president') {
      officers.president = value;
    } else if (role.startsWith('vice')) {
      officers.vicePresident = value;
    } else if (role.includes('secretary')) {
      officers.secretary = value;
    }
  }

  const addressMatch = normalized.match(
    /Office\s*Address\s*[:\s]*(.+?)(?=(?:\bEmail\b|\bPh\s*-|\bPhone|\bWebsite\b|\bPresident\b|\bVice\b|\bSecretary\b|$))/is
  );
  if (addressMatch?.[1]) {
    officers.officeAddress = addressMatch[1]
      .replace(/\s+/g, ' ')
      .replace(/[,\s]+$/g, '')
      .trim();
  }

  return officers;
}

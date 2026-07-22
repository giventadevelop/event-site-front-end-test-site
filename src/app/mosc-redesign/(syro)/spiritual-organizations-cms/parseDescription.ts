/**
 * Spiritual organisation CMS `description` fields mix narrative, office-bearer
 * roles, and contact blocks. Parse for display without changing stored content.
 */

export type OfficerSection = {
  heading: string;
  lines: string[];
};

export type ExtractedContact = {
  addressLines: string[];
  phones: string[];
  emails: string[];
  websites: string[];
};

export type ParsedSpiritualOrganisationDescription = {
  narrative: string[];
  officers: OfficerSection[];
  contact: ExtractedContact;
};

const SECTION_SKIP_RE = /^(?:Office\s*Bearers?|LEADERSHIP)\s*:?\s*$/i;

const ROLE_HEADING_RE =
  /^(President|Vice\s*Presidents?|Executive\s*Vice\s*President|Director\s*General|Office\s*Administrator|General\s*Secretary|Joint\s*Secretary|Organising\s*Secretary|Office\s*Secretary|Secretary|Treasurer|Joint\s*Director|Exe\.?\s*Director|Executive\s*Director|Director|Registrar|Principal(?:,\s*.+)?|Central\s*Organizer|Co-?ordinator|Patron|Outside\s*Kerala\s*Region)\s*:?\s*(.*)$/i;

const CONTACT_LABEL_RE =
  /^(Address|Office\s*Address|Contact\s*Address|Head\s*Quarters|Headquarters|Central\s*Office)\s*:?\s*(.*)$/i;

const CONTACT_FIELD_RE =
  /^(Phone|Phones?|Ph\s*-|Tel\s*:|Contact\s*Number|Email(?:\s*ID)?|Website)\s*[:\-–—]?\s*(.*)$/i;

const URL_ONLY_RE = /^(https?:\/\/\S+|www\.\S+)$/i;

function emptyContact(): ExtractedContact {
  return { addressLines: [], phones: [], emails: [], websites: [] };
}

function normalizeLine(line: string): string {
  return line.replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ').trim();
}

function isRoleHeading(line: string): boolean {
  return ROLE_HEADING_RE.test(line);
}

function isContactLabel(line: string): boolean {
  return CONTACT_LABEL_RE.test(line);
}

function isContactField(line: string): boolean {
  return CONTACT_FIELD_RE.test(line) || URL_ONLY_RE.test(line);
}

function looksLikePersonLine(line: string): boolean {
  return /\b(H\.?\s*G\.?|His\s+Grace|Very\s+Rev|Rev\.?|Fr\.?|Metropolitan|Bishop|Dr\.|Mob\.?\s*:)\b/i.test(
    line
  );
}

function looksLikeAddressContinuation(line: string): boolean {
  if (!line) return false;
  if (isRoleHeading(line) || SECTION_SKIP_RE.test(line)) return false;
  if (isContactField(line)) return false;
  if (looksLikePersonLine(line)) return false;
  // Org-name / postal lines after the last officer (e.g. Navajyothi block).
  if (/^[A-Z0-9][A-Z0-9\s.,'&\-()]{8,}$/.test(line) && line === line.toUpperCase()) {
    return true;
  }
  return /\b(P\.?\s*O\.?|PIN\s*:?\s*\d|Kottayam|India)\b/i.test(line) ||
    (/\bKerala\b/i.test(line) && !/\bOutside\s+Kerala\b/i.test(line));
}

function pushUnique(list: string[], value: string): void {
  const trimmed = value.trim();
  if (!trimmed) return;
  const key = trimmed.toLowerCase();
  if (list.some((item) => item.toLowerCase() === key)) return;
  list.push(trimmed);
}

function extractPhonesFromText(text: string, target: string[]): void {
  const matches = text.match(
    /(?:\+?\d[\d\s\-()]{6,}\d|\d{3,4}\s*[-–—]?\s*\d{6,8})/g
  );
  if (!matches) return;
  for (const match of matches) {
    pushUnique(target, match.replace(/\s+/g, ' ').trim());
  }
}

function extractEmailsFromText(text: string, target: string[]): void {
  const matches = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi);
  if (!matches) return;
  for (const match of matches) pushUnique(target, match);
}

function extractWebsitesFromText(text: string, target: string[]): void {
  const matches = text.match(/(?:https?:\/\/|www\.)[^\s,;]+/gi);
  if (!matches) return;
  for (const match of matches) {
    pushUnique(target, match.replace(/[),.;]+$/, ''));
  }
}

function consumeContactLines(lines: string[], startIndex: number): ExtractedContact {
  const contact = emptyContact();
  let mode: 'address' | 'auto' = 'address';

  for (let i = startIndex; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line) continue;

    const labelMatch = line.match(CONTACT_LABEL_RE);
    if (labelMatch) {
      mode = 'address';
      const remainder = (labelMatch[2] || '').trim();
      if (remainder) pushUnique(contact.addressLines, remainder);
      continue;
    }

    const fieldMatch = line.match(CONTACT_FIELD_RE);
    if (fieldMatch) {
      const label = fieldMatch[1].toLowerCase();
      const value = (fieldMatch[2] || '').trim();
      if (/^email/.test(label)) {
        mode = 'auto';
        if (value) extractEmailsFromText(value, contact.emails);
        else extractEmailsFromText(line, contact.emails);
      } else if (/^website/.test(label)) {
        mode = 'auto';
        if (value) extractWebsitesFromText(value, contact.websites);
        else extractWebsitesFromText(line, contact.websites);
      } else {
        mode = 'auto';
        if (value) extractPhonesFromText(value, contact.phones);
        else extractPhonesFromText(line, contact.phones);
      }
      continue;
    }

    if (URL_ONLY_RE.test(line) || /^(?:https?:\/\/|www\.)/i.test(line)) {
      mode = 'auto';
      extractWebsitesFromText(line, contact.websites);
      continue;
    }

    if (/@/.test(line)) {
      mode = 'auto';
      extractEmailsFromText(line, contact.emails);
      continue;
    }

    if (mode === 'address' || looksLikeAddressContinuation(line)) {
      mode = 'address';
      pushUnique(contact.addressLines, line);
      // Phone sometimes appended on the same address line.
      if (/\b(?:Phone|Ph|Tel)\b/i.test(line)) {
        extractPhonesFromText(line, contact.phones);
      }
      continue;
    }

    extractPhonesFromText(line, contact.phones);
    extractEmailsFromText(line, contact.emails);
    extractWebsitesFromText(line, contact.websites);
  }

  return contact;
}

/**
 * Split CMS description into narrative paragraphs, bold-ready officer sections,
 * and contact fields (for the card — removed from body to avoid duplication).
 */
export function parseSpiritualOrganisationDescription(
  description: string | null | undefined
): ParsedSpiritualOrganisationDescription {
  if (!description?.trim()) {
    return { narrative: [], officers: [], contact: emptyContact() };
  }

  const lines = description
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(normalizeLine);

  const narrativeChunks: string[] = [];
  const officers: OfficerSection[] = [];
  let currentOfficer: OfficerSection | null = null;
  let mode: 'narrative' | 'officers' = 'narrative';
  let narrativeBuffer: string[] = [];
  let contactStart = -1;

  const flushNarrative = () => {
    const text = narrativeBuffer.join(' ').replace(/\s+/g, ' ').trim();
    narrativeBuffer = [];
    if (text) narrativeChunks.push(text);
  };

  const flushOfficer = () => {
    if (currentOfficer && (currentOfficer.heading || currentOfficer.lines.length > 0)) {
      officers.push(currentOfficer);
    }
    currentOfficer = null;
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line) {
      if (mode === 'narrative') flushNarrative();
      continue;
    }

    if (SECTION_SKIP_RE.test(line)) {
      if (mode === 'narrative') flushNarrative();
      mode = 'officers';
      continue;
    }

    // Role headings must win over contact heuristics (e.g. "Outside Kerala Region").
    const roleMatch = line.match(ROLE_HEADING_RE);
    if (roleMatch) {
      const heading = roleMatch[1].replace(/\s+/g, ' ').trim();
      const inlineValue = (roleMatch[2] || '').trim();
      // Sub-role under Outside Kerala Region (e.g. "Director : Rev. ...") stays as detail text.
      if (
        currentOfficer &&
        /^Outside\s+Kerala\s+Region$/i.test(currentOfficer.heading) &&
        /^Director$/i.test(heading) &&
        inlineValue
      ) {
        currentOfficer.lines.push(line);
        continue;
      }
      if (mode === 'narrative') flushNarrative();
      mode = 'officers';
      flushOfficer();
      currentOfficer = { heading, lines: inlineValue ? [inlineValue] : [] };
      continue;
    }

    // Contact block begins — stop body parsing; remainder goes to contact card.
    if (
      mode === 'officers' &&
      (isContactLabel(line) ||
        isContactField(line) ||
        looksLikeAddressContinuation(line))
    ) {
      // Phone-only lines under an officer stay with that officer.
      if (
        currentOfficer &&
        currentOfficer.lines.length > 0 &&
        /^[+\d]/.test(line) &&
        !CONTACT_FIELD_RE.test(line) &&
        !isContactLabel(line) &&
        !URL_ONLY_RE.test(line)
      ) {
        currentOfficer.lines.push(line);
        continue;
      }
      flushOfficer();
      contactStart = i;
      break;
    }

    if (mode === 'officers') {
      if (!currentOfficer) {
        currentOfficer = { heading: '', lines: [] };
      }
      currentOfficer.lines.push(line);
      continue;
    }

    narrativeBuffer.push(line);
  }

  flushNarrative();
  if (contactStart < 0) flushOfficer();

  const contact =
    contactStart >= 0 ? consumeContactLines(lines, contactStart) : emptyContact();

  return { narrative: narrativeChunks, officers, contact };
}

export function mergeContactLists(...groups: Array<string[] | string | null | undefined>): string[] {
  const result: string[] = [];
  for (const group of groups) {
    if (!group) continue;
    if (typeof group === 'string') {
      group
        .split(/[,;\n]+/)
        .map((item) => item.trim())
        .filter(Boolean)
        .forEach((item) => pushUnique(result, item));
      continue;
    }
    for (const item of group) pushUnique(result, item);
  }
  return result;
}

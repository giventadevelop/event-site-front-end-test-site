const OFFICIAL_DOCUMENT_DISPLAY_EXTENSIONS = new Set([
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
  'txt',
  'rtf',
  'csv',
  'jpg',
  'jpeg',
  'png',
  'gif',
  'webp',
  'svg',
  'zip',
  'rar',
  '7z',
]);

function stripFileExtension(fileName: string): string {
  const trimmed = fileName.trim();
  const lastDot = trimmed.lastIndexOf('.');
  if (lastDot <= 0 || lastDot === trimmed.length - 1) {
    return trimmed;
  }
  const ext = trimmed.slice(lastDot + 1).toLowerCase();
  if (OFFICIAL_DOCUMENT_DISPLAY_EXTENSIONS.has(ext)) {
    return trimmed.slice(0, lastDot);
  }
  return trimmed;
}

function formatTitleWord(word: string): string {
  if (!word) return '';
  if (/[^\x00-\x7F]/.test(word)) return word;

  const camelSplit = word
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([0-9])([A-Za-z])/g, '$1 $2')
    .replace(/([A-Za-z])([0-9])/g, '$1 $2');

  if (camelSplit !== word) {
    return camelSplit
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => formatTitleWord(part))
      .join(' ');
  }

  if (/^[A-Z]{2,4}$/.test(word)) return word;
  if (/^[A-Z]{5,}$/.test(word)) {
    return word.charAt(0) + word.slice(1).toLowerCase();
  }

  if (/^[a-z]/.test(word)) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  return word;
}

function formatTitleWords(text: string): string {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => formatTitleWord(word))
    .join(' ');
}

/**
 * Turn a stored file name into a readable card title:
 * - drop file extension
 * - underscores/hyphens → spaces (except hyphen before trailing year)
 * - title-case words; year suffix formatted as ` - 2025` or ` - 2025-26`
 */
export function formatDownloadCardTitle(fileName: string): string {
  const withoutExt = stripFileExtension(fileName.trim());
  if (!withoutExt) return '';

  const normalized = withoutExt.replace(/_/g, ' ').replace(/-/g, ' ').replace(/\s+/g, ' ').trim();

  const yearAtEnd = normalized.match(/^(.*?)\s+(20\d{2})(?:\s+(\d{2}))?\s*$/);
  if (yearAtEnd && yearAtEnd[1].trim()) {
    const body = formatTitleWords(yearAtEnd[1].trim());
    const yearLabel = yearAtEnd[3] ? `${yearAtEnd[2]}-${yearAtEnd[3]}` : yearAtEnd[2];
    return `${body} - ${yearLabel}`;
  }

  return formatTitleWords(normalized);
}

const MOJIBAKE_PATTERN = /â[\u0080-\u00BF]|œ|š|†|™|€™|ï¿½|Ãƒ|Ã¢|Ã‚|Ã†|Ã¢â‚¬/;

function normalizeForDocumentMatch(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function isMediAssistClaimFormDocument(fileName: string, title?: string | null): boolean {
  const hay = normalizeForDocumentMatch(`${fileName} ${title ?? ''}`);
  return hay.includes('mediassist') && hay.includes('claim');
}

function isUnreadableDisplayText(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return true;
  if (trimmed.length > 80) return true;
  if (MOJIBAKE_PATTERN.test(trimmed)) return true;
  const nonAsciiRatio =
    (trimmed.match(/[^\x20-\x7E]/g)?.length ?? 0) / Math.max(trimmed.length, 1);
  if (trimmed.length > 24 && nonAsciiRatio > 0.35) return true;
  return false;
}

function formatFolderPathSegments(pathSegments: string[]): string {
  if (pathSegments.length <= 1) return '';
  return pathSegments
    .slice(0, -1)
    .map((segment) => formatDownloadCardTitle(segment))
    .filter(Boolean)
    .join(' / ');
}

/**
 * Subtitle under the card title (folder / document context).
 * Falls back when path metadata is missing or unreadable (e.g. PDF OCR garbage in storage).
 */
export function getDownloadCardSubtitle(input: {
  pathSegments: string[];
  fileName: string;
  title?: string | null;
  categoryLabel?: string | null;
}): string {
  if (isMediAssistClaimFormDocument(input.fileName, input.title)) {
    return 'Claim Form Medi Assist';
  }

  const folderPath = formatFolderPathSegments(input.pathSegments);
  if (folderPath && !isUnreadableDisplayText(folderPath)) {
    return folderPath;
  }

  const fromName = formatDownloadCardTitle(input.title?.trim() || input.fileName);
  const withoutYear = fromName.replace(/\s-\s20\d{2}(?:-\d{2})?$/, '').trim();
  if (withoutYear && !isUnreadableDisplayText(withoutYear)) {
    return withoutYear;
  }

  const category = input.categoryLabel?.trim();
  if (category) return category;

  return 'Library Root';
}

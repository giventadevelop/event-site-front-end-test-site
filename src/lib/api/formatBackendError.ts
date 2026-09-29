export type FormattedBackendError = {
  title: string;
  message: string;
  detail?: string;
  field?: string;
  status?: number;
};

const FORMATTED_MARKER = '__formattedBackendError';

function extractJsonObject(text: string): Record<string, unknown> | null {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end <= start) return null;
  try {
    const parsed = JSON.parse(text.slice(start, end + 1));
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

function inferField(text: string): string | undefined {
  if (/gallery[-_ ]?categor|galleryCategory/i.test(text)) return 'galleryCategoryId';
  if (/cover\s*image|coverImage/i.test(text)) return 'coverImage';
  if (/\btitle\b/i.test(text)) return 'title';
  if (/event (start|end) date|eventDate/i.test(text)) return 'eventDateStart';
  return undefined;
}

function isPrimaryKeySequenceError(text: string): boolean {
  return (
    /_pkey/i.test(text) &&
    /duplicate key value|already exists/i.test(text)
  ) || /Key \(id\)=\(\d+\) already exists/i.test(text);
}

function isSlugOrNameUniqueError(text: string): boolean {
  return /duplicate key|unique constraint|already exists/i.test(text) && !isPrimaryKeySequenceError(text);
}

/**
 * Turn a JHipster problem+json body (or a prefixed Error.message) into a readable form error.
 */
export function parseBackendErrorText(raw: string, fallbackTitle: string): FormattedBackendError {
  const text = (raw || '').trim();
  if (!text) {
    return { title: fallbackTitle, message: fallbackTitle };
  }

  const json = extractJsonObject(text);
  const detail = typeof json?.detail === 'string' ? json.detail : undefined;
  const jsonTitle = typeof json?.title === 'string' ? json.title : undefined;
  const status = typeof json?.status === 'number' ? json.status : undefined;
  const path = typeof json?.path === 'string' ? json.path : undefined;
  const blob = [text, detail, path].filter(Boolean).join('\n');

  if (isPrimaryKeySequenceError(blob) && /gallery.categor|gallery_category|\/api\/gallery-categories/i.test(blob)) {
    return {
      title: 'Could not create category',
      message:
        'The new category could not be saved because the gallery category ID sequence on the server is out of date. Choose an existing category, or leave Category empty and save the album again.',
      detail: detail || text,
      field: 'galleryCategoryId',
      status,
    };
  }

  if (isPrimaryKeySequenceError(blob)) {
    return {
      title: jsonTitle || fallbackTitle,
      message:
        'The server could not save this record because a database ID is already in use. Try again, or ask an admin to reset the table ID sequence.',
      detail: detail || text,
      field: inferField(blob),
      status,
    };
  }

  if (/gallery.categor|\/api\/gallery-categories/i.test(blob)) {
    return {
      title: 'Could not create category',
      message: isSlugOrNameUniqueError(blob)
        ? 'A category with that name or slug already exists. Choose it from the list instead of creating a new one.'
        : 'The new category could not be created. Choose an existing category or try a different name.',
      detail: detail || text,
      field: 'galleryCategoryId',
      status,
    };
  }

  if (detail && /could not execute batch|ERROR:|duplicate key|constraint/i.test(detail)) {
    return {
      title: jsonTitle || fallbackTitle,
      message: `${jsonTitle || fallbackTitle}. The server could not save this change.`,
      detail,
      field: inferField(blob),
      status,
    };
  }

  if (detail && detail.length < 240 && !/\{/.test(detail)) {
    return {
      title: jsonTitle || fallbackTitle,
      message: detail,
      field: inferField(blob),
      status,
    };
  }

  if (jsonTitle && !text.startsWith('{')) {
    return {
      title: jsonTitle,
      message: fallbackTitle,
      detail: detail || text,
      field: inferField(blob),
      status,
    };
  }

  if (json) {
    return {
      title: jsonTitle || fallbackTitle,
      message: fallbackTitle,
      detail: detail || text,
      field: inferField(blob),
      status,
    };
  }

  return {
    title: fallbackTitle,
    message: text,
    field: inferField(text),
  };
}

export function serializeFormattedError(error: FormattedBackendError): string {
  return JSON.stringify({ [FORMATTED_MARKER]: true, ...error });
}

export function formatUnknownError(err: unknown, fallbackTitle: string): FormattedBackendError {
  const raw = err instanceof Error ? err.message : String(err ?? fallbackTitle);
  try {
    const parsed = JSON.parse(raw) as FormattedBackendError & { [FORMATTED_MARKER]?: boolean };
    if (parsed?.[FORMATTED_MARKER] && parsed.message) {
      return {
        title: parsed.title || fallbackTitle,
        message: parsed.message,
        detail: parsed.detail,
        field: parsed.field,
        status: parsed.status,
      };
    }
  } catch {
    // not a serialized formatted error
  }
  return parseBackendErrorText(raw, fallbackTitle);
}

export function throwFormattedBackendError(raw: string, fallbackTitle: string): never {
  throw new Error(serializeFormattedError(parseBackendErrorText(raw, fallbackTitle)));
}

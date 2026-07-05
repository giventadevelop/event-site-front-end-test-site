/**
 * Maps JHipster problem+json API errors to user-friendly save dialog copy.
 */

export class UserFacingSaveError extends Error {
  readonly details: string[];

  /** Prefix so summary + details survive Next.js server-action error serialization. */
  static readonly TRANSPORT_PREFIX = '__UFS__';

  constructor(summary: string, details: string[] = []) {
    const message =
      details.length > 0
        ? `${UserFacingSaveError.TRANSPORT_PREFIX}${JSON.stringify({ summary, details })}`
        : summary;
    super(message);
    this.name = 'UserFacingSaveError';
    this.details = details;
  }
}

type ParsedProblem = {
  title?: string;
  message?: string;
  detail?: string;
  path?: string;
  status?: number;
};

const TENANT_SETTINGS_ERROR_MESSAGES: Record<string, { summary: string; details?: string[] }> = {
  invalidDefaultHeroImageUrlsJson: {
    summary: 'Homepage hero slides could not be saved.',
    details: [
      'Each slide needs a valid HTTPS image URL.',
      'Use the upload button or paste HTTPS links only (not http).',
      'If you uploaded images, wait for upload to finish before saving.',
    ],
  },
  defaultHeroImageUrlsJsonTooLong: {
    summary: 'Too many homepage hero images.',
    details: ['Reduce the number of slides or remove unused images, then try again.'],
  },
  invalidDefaultHeroDisplayMode: {
    summary: 'Invalid homepage hero display mode.',
    details: ['Choose slideshow, random, or single.'],
  },
  invalidDefaultHeroMaxDisplayCount: {
    summary: 'Invalid maximum number of hero slides to show.',
    details: ['Enter a number between 1 and 20.'],
  },
  invalidGoogleAdsensePublisherId: {
    summary: 'Google AdSense publisher ID is invalid.',
    details: [
      'Use the format ca-pub-XXXXXXXXXXXXXXXX, or turn off Google AdSense.',
    ],
  },
  googleAdsensePublisherIdRequired: {
    summary: 'Google AdSense is enabled but Publisher ID is missing.',
    details: [
      'You turned on Enable Google AdSense, so Publisher ID is required.',
      'Enter your ca-pub-... ID on the Integrations tab.',
      'Or turn off Enable Google AdSense on the Integrations tab if you do not intend to use this feature.',
    ],
  },
  identityFieldsMovedToTenantOrganization: {
    summary: 'Address and description are saved under Tenant Organizations.',
    details: ['Update organization details there, then save tenant settings again.'],
  },
  tenantIdRequired: {
    summary: 'Tenant ID is required.',
    details: ['Select a tenant before saving.'],
  },
  tenantSettingsNotFound: {
    summary: 'Tenant settings were not found.',
    details: ['Refresh the page or open settings from the tenant list again.'],
  },
  uploadFailed: {
    summary: 'File upload failed.',
    details: ['Check the file type and size, then try again.'],
  },
  invalidRequest: {
    summary: 'The server rejected this request.',
    details: ['Review your entries and try again.'],
  },
  'http.500': {
    summary: 'The server could not complete the save.',
    details: [
      'Restart the API after applying the latest database migrations.',
      'If this continues, check the server logs for a database or validation error.',
    ],
  },
};

function extractErrorKey(parsed: ParsedProblem): string | null {
  const rawMessage = parsed.message?.trim();
  if (rawMessage && !rawMessage.includes('ProblemDetailWithCause')) {
    return rawMessage.replace(/^error\./, '');
  }

  const detail = parsed.detail ?? '';
  const fromDetail = detail.match(/message=error\.([^,}\]'"]+)/);
  if (fromDetail?.[1]) {
    return fromDetail[1];
  }

  return null;
}

function mapErrorKey(errorKey: string | null): { summary: string; details: string[] } | null {
  if (!errorKey) return null;
  const mapped = TENANT_SETTINGS_ERROR_MESSAGES[errorKey];
  if (mapped) {
    return { summary: mapped.summary, details: mapped.details ?? [] };
  }
  return {
    summary: 'The server could not save your changes.',
    details: [`Error code: ${errorKey.replace(/^error\./, '')}`],
  };
}

/**
 * Parse a JHipster problem+json response body into dialog-friendly copy.
 */
export function parseJhipsterProblemErrorBody(
  errorText: string,
  action: 'create' | 'update' = 'update'
): { summary: string; details: string[] } {
  const fallbackSummary =
    action === 'create'
      ? 'Failed to create tenant settings.'
      : 'Failed to save tenant settings.';

  const lower = errorText.toLowerCase();
  if (lower.includes('duplicate key') || lower.includes('already exists')) {
    if (action === 'update' && lower.includes('tenant_settings_tenant_id')) {
      return {
        summary: 'Could not save because the tenant ID would conflict with another settings record.',
        details: [
          'Open Tenant Settings for your tenant from the settings list (do not reuse another tenant\'s settings ID in the URL).',
          'If you manage multiple tenants, edit the row that matches the tenant you intend to change.',
        ],
      };
    }
    return {
      summary: 'Settings for this tenant already exist.',
      details: ['Edit the existing settings instead of creating new ones.'],
    };
  }
  if (lower.includes('column') && lower.includes('does not exist')) {
    return {
      summary: 'The backend database is missing required columns.',
      details: ['Apply the latest migration and restart the API server.'],
    };
  }

  try {
    const parsed = JSON.parse(errorText) as ParsedProblem;
    const mapped = mapErrorKey(extractErrorKey(parsed));
    if (mapped) {
      const details = [...mapped.details];
      if (parsed.status === 500 && parsed.detail?.toLowerCase().includes('commit')) {
        details.unshift('The database rejected the update during save.');
      }
      if (parsed.status && parsed.status !== 500) {
        details.push(`HTTP status: ${parsed.status}`);
      }
      return { summary: mapped.summary, details };
    }

    if (parsed.status === 500) {
      const http500 = TENANT_SETTINGS_ERROR_MESSAGES['http.500'];
      const details = [...(http500.details ?? [])];
      if (parsed.detail?.toLowerCase().includes('commit')) {
        details.unshift('The database rejected the update during save.');
      }
      return { summary: http500.summary, details };
    }

    if (parsed.title && parsed.title !== 'Bad Request' && parsed.title !== 'Internal Server Error') {
      return { summary: parsed.title, details: [] };
    }
  } catch {
    // not JSON — fall through
  }

  const trimmed = errorText.trim();
  if (trimmed.length > 0 && trimmed.length <= 200 && !looksTechnical(trimmed)) {
    return { summary: trimmed, details: [] };
  }

  return {
    summary: fallbackSummary,
    details: ['Please review your entries and try again. If the problem continues, contact support.'],
  };
}

function looksTechnical(value: string): boolean {
  return (
    value.includes('ProblemDetailWithCause') ||
    value.includes('BAD_REQUEST') ||
    value.includes(' at ') ||
    value.includes('ApiServerActions') ||
    value.includes('digest:')
  );
}

function decodeTransportMessage(message: string): { summary: string; details: string[] } | null {
  const prefix = UserFacingSaveError.TRANSPORT_PREFIX;
  if (!message.startsWith(prefix)) return null;
  try {
    const parsed = JSON.parse(message.slice(prefix.length)) as {
      summary?: string;
      details?: string[];
    };
    if (parsed.summary) {
      return {
        summary: parsed.summary,
        details: Array.isArray(parsed.details) ? parsed.details : [],
      };
    }
  } catch {
    // fall through
  }
  return null;
}

/**
 * Normalize any thrown value for SaveStatusDialog (no stack traces).
 */
export function formatSaveErrorForDialog(
  error: unknown,
  fallback = 'Something went wrong while saving. Please try again.'
): { summary: string; details: string[] } {
  if (error instanceof UserFacingSaveError) {
    const transport = decodeTransportMessage(error.message);
    if (transport) return transport;
    return { summary: error.message, details: error.details };
  }

  if (error instanceof Error) {
    const transport = decodeTransportMessage(error.message?.trim() || '');
    if (transport) {
      return transport;
    }

    const msg = error.message?.trim() || '';
    if (msg.startsWith('{')) {
      const parsed = parseJhipsterProblemErrorBody(msg);
      if (parsed.summary !== 'Failed to save tenant settings.') {
        return parsed;
      }
    }
    if (looksTechnical(msg)) {
      const parsed = parseJhipsterProblemErrorBody(msg);
      return parsed;
    }
    if (msg) {
      return { summary: msg, details: [] };
    }
  }

  return { summary: fallback, details: [] };
}

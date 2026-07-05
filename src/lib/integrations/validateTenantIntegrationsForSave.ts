/** Shared copy for integration save validation dialogs and inline field errors. */
export function integrationDisableHint(featureToggleLabel: string): string {
  return `Or turn off "${featureToggleLabel}" on the Integrations tab if you do not intend to use this feature.`;
}

export type WhatsappIntegrationField =
  | 'whatsappPhoneNumber'
  | 'twilioAccountSid'
  | 'twilioAuthToken';

export type WhatsappIntegrationSaveValidationResult =
  | { valid: true }
  | {
      valid: false;
      fieldErrors: Partial<Record<WhatsappIntegrationField, string>>;
      summary: string;
      details: string[];
    };

const WHATSAPP_TOGGLE = 'Enable WhatsApp Integration';

/** Validates WhatsApp config before save (runs even when Integrations tab is not mounted). */
export function validateWhatsappIntegrationForSave(data: {
  enableWhatsappIntegration?: boolean;
  whatsappPhoneNumber?: string | null;
  twilioAccountSid?: string | null;
  twilioAuthToken?: string | null;
}): WhatsappIntegrationSaveValidationResult {
  if (!data.enableWhatsappIntegration) {
    return { valid: true };
  }

  const fieldErrors: Partial<Record<WhatsappIntegrationField, string>> = {};
  const missingLabels: string[] = [];

  const phone = data.whatsappPhoneNumber?.trim() ?? '';
  const sid = data.twilioAccountSid?.trim() ?? '';
  const token = data.twilioAuthToken?.trim() ?? '';

  if (!phone) {
    missingLabels.push('WhatsApp Business Phone Number');
    fieldErrors.whatsappPhoneNumber =
      'Phone number is required when WhatsApp Integration is enabled.';
  } else if (!/^\+[1-9]\d{1,14}$/.test(phone)) {
    fieldErrors.whatsappPhoneNumber =
      'Enter a valid international phone number (e.g., +1234567890).';
  }

  if (!sid) {
    missingLabels.push('Twilio Account SID');
    fieldErrors.twilioAccountSid = 'Account SID is required when WhatsApp Integration is enabled.';
  } else if (!/^AC[a-f0-9]{32}$/.test(sid)) {
    fieldErrors.twilioAccountSid =
      'Enter a valid Twilio Account SID (AC followed by 32 hex characters).';
  }

  if (!token) {
    missingLabels.push('Twilio Auth Token');
    fieldErrors.twilioAuthToken = 'Auth Token is required when WhatsApp Integration is enabled.';
  } else if (token.length < 32) {
    fieldErrors.twilioAuthToken = 'Auth Token must be at least 32 characters.';
  }

  if (Object.keys(fieldErrors).length === 0) {
    return { valid: true };
  }

  if (missingLabels.length > 0) {
    return {
      valid: false,
      fieldErrors,
      summary: 'WhatsApp Integration is enabled but required fields are missing.',
      details: [
        `You turned on ${WHATSAPP_TOGGLE}, so these fields are required: ${missingLabels.join(', ')}.`,
        'Complete them on the Integrations tab.',
        integrationDisableHint(WHATSAPP_TOGGLE),
      ],
    };
  }

  return {
    valid: false,
    fieldErrors,
    summary: 'WhatsApp Integration has invalid configuration.',
    details: [
      'Fix the highlighted fields on the Integrations tab.',
      integrationDisableHint(WHATSAPP_TOGGLE),
    ],
  };
}

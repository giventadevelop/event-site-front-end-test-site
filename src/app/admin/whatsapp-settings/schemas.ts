import { z } from 'zod';

/**
 * Zod validation schema for WhatsApp settings form
 */
export const whatsAppSettingsSchema = z.object({
  // Integration toggle
  enableWhatsappIntegration: z.boolean(),

  // Twilio credentials
  twilioAccountSid: z.string()
    .min(1, "Account SID is required")
    .regex(/^AC[a-f0-9]{32}$/, "Invalid Account SID format"),

  twilioAuthToken: z.string()
    .min(1, "Auth token is required")
    .min(32, "Auth token must be at least 32 characters"),

  twilioWhatsappFrom: z.string()
    .min(1, "WhatsApp From number is required")
    .regex(/^whatsapp:\+\d{10,15}$/, "Invalid WhatsApp number format (e.g., whatsapp:+1234567890)"),

  // Webhook configuration (optional)
  whatsappWebhookUrl: z.string()
    .url("Invalid webhook URL format")
    .optional()
    .or(z.literal("")),

  whatsappWebhookToken: z.string()
    .optional()
    .or(z.literal("")),

  // Test connection flag (not persisted)
  testConnection: z.boolean().optional(),
});

/**
 * TypeScript type derived from the schema
 */
export type WhatsAppSettingsFormData = z.infer<typeof whatsAppSettingsSchema>;

/**
 * Default form values
 */
export const defaultWhatsAppSettings: WhatsAppSettingsFormData = {
  enableWhatsappIntegration: false,
  twilioAccountSid: '',
  twilioAuthToken: '',
  twilioWhatsappFrom: '',
  whatsappWebhookUrl: '',
  whatsappWebhookToken: '',
  testConnection: false,
};

/**
 * Validation helper functions
 */
export const validateWhatsAppSettings = (data: unknown) => {
  try {
    return whatsAppSettingsSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        errors: error.flatten().fieldErrors,
      };
    }
    throw error;
  }
};

/**
 * Sanitize form data for submission
 */
export const sanitizeWhatsAppSettings = (data: WhatsAppSettingsFormData) => {
  return {
    ...data,
    whatsappWebhookUrl: data.whatsappWebhookUrl || undefined,
    whatsappWebhookToken: data.whatsappWebhookToken || undefined,
    // Remove test connection flag as it's not persisted
    testConnection: undefined,
  };
};

/**
 * Format validation error messages for display
 */
export const formatValidationErrors = (errors: Record<string, string[] | undefined>) => {
  const formatted: Record<string, string> = {};

  Object.entries(errors).forEach(([field, fieldErrors]) => {
    if (fieldErrors && fieldErrors.length > 0) {
      formatted[field] = fieldErrors[0];
    }
  });

  return formatted;
};

















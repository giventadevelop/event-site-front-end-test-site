import { z } from 'zod';

/**
 * Zod validation schema for bulk messaging form
 */
export const bulkMessagingSchema = z.object({
  // Step 1: Message Composition
  messageBody: z.string()
    .min(1, "Message content is required")
    .max(4096, "Message content cannot exceed 4096 characters"),

  templateName: z.string().optional(),
  templateParams: z.record(z.string()).optional(),

  messageType: z.enum(['TRANSACTIONAL', 'MARKETING'], {
    required_error: "Please select a message type"
  }),

  // Step 2: Recipient Selection
  recipients: z.array(z.object({
    phone: z.string()
      .min(1, "Phone number is required")
      .regex(/^\+[1-9]\d{1,14}$/, "Invalid phone number format (e.g., +1234567890)"),
    name: z.string().optional(),
    customParams: z.record(z.string()).optional(),
  })).min(1, "At least one recipient is required"),

  // Step 3: Scheduling (optional)
  scheduledAt: z.string().optional(),
  isScheduled: z.boolean().optional(),

  // Step 4: Review & Send
  confirmationChecked: z.boolean().refine(val => val === true, {
    message: "Please confirm before sending messages"
  }),
});

/**
 * Individual step schemas for validation
 */
export const messageCompositionSchema = z.object({
  messageBody: z.string()
    .min(1, "Message content is required")
    .max(4096, "Message content cannot exceed 4096 characters"),
  templateName: z.string().optional(),
  templateParams: z.record(z.string()).optional(),
  messageType: z.enum(['TRANSACTIONAL', 'MARKETING'], {
    required_error: "Please select a message type"
  }),
});

export const recipientSelectionSchema = z.object({
  recipients: z.array(z.object({
    phone: z.string()
      .min(1, "Phone number is required")
      .regex(/^\+[1-9]\d{1,14}$/, "Invalid phone number format (e.g., +1234567890)"),
    name: z.string().optional(),
    customParams: z.record(z.string()).optional(),
  })).min(1, "At least one recipient is required"),
});

export const schedulingSchema = z.object({
  scheduledAt: z.string().optional(),
  isScheduled: z.boolean().optional(),
});

export const confirmationSchema = z.object({
  confirmationChecked: z.boolean().refine(val => val === true, {
    message: "Please confirm before sending messages"
  }),
});

/**
 * TypeScript types derived from schemas
 */
export type BulkMessagingFormData = z.infer<typeof bulkMessagingSchema>;
export type MessageCompositionData = z.infer<typeof messageCompositionSchema>;
export type RecipientSelectionData = z.infer<typeof recipientSelectionSchema>;
export type SchedulingData = z.infer<typeof schedulingSchema>;
export type ConfirmationData = z.infer<typeof confirmationSchema>;

/**
 * Default form values
 */
export const defaultBulkMessagingForm: BulkMessagingFormData = {
  messageBody: '',
  templateName: '',
  templateParams: {},
  messageType: 'TRANSACTIONAL',
  recipients: [],
  scheduledAt: '',
  isScheduled: false,
  confirmationChecked: false,
};

/**
 * Step definitions for the multi-step form
 */
export const BULK_MESSAGING_STEPS = {
  COMPOSE: 'compose',
  RECIPIENTS: 'recipients',
  SCHEDULE: 'schedule',
  REVIEW: 'review',
  SENDING: 'sending',
  COMPLETE: 'complete',
} as const;

export type BulkMessagingStep = typeof BULK_MESSAGING_STEPS[keyof typeof BULK_MESSAGING_STEPS];

export const STEP_TITLES: Record<BulkMessagingStep, string> = {
  [BULK_MESSAGING_STEPS.COMPOSE]: 'Compose Message',
  [BULK_MESSAGING_STEPS.RECIPIENTS]: 'Select Recipients',
  [BULK_MESSAGING_STEPS.SCHEDULE]: 'Schedule (Optional)',
  [BULK_MESSAGING_STEPS.REVIEW]: 'Review & Send',
  [BULK_MESSAGING_STEPS.SENDING]: 'Sending Messages',
  [BULK_MESSAGING_STEPS.COMPLETE]: 'Complete',
};

export const STEP_DESCRIPTIONS: Record<BulkMessagingStep, string> = {
  [BULK_MESSAGING_STEPS.COMPOSE]: 'Create your WhatsApp message content',
  [BULK_MESSAGING_STEPS.RECIPIENTS]: 'Choose who will receive your message',
  [BULK_MESSAGING_STEPS.SCHEDULE]: 'Set when to send the message (optional)',
  [BULK_MESSAGING_STEPS.REVIEW]: 'Review your message and recipients before sending',
  [BULK_MESSAGING_STEPS.SENDING]: 'Your messages are being sent',
  [BULK_MESSAGING_STEPS.COMPLETE]: 'Messages sent successfully',
};

/**
 * Validation helper functions
 */
export const validateStep = (step: BulkMessagingStep, data: Partial<BulkMessagingFormData>) => {
  try {
    switch (step) {
      case BULK_MESSAGING_STEPS.COMPOSE:
        return messageCompositionSchema.parse(data);
      case BULK_MESSAGING_STEPS.RECIPIENTS:
        return recipientSelectionSchema.parse(data);
      case BULK_MESSAGING_STEPS.SCHEDULE:
        return schedulingSchema.parse(data);
      case BULK_MESSAGING_STEPS.REVIEW:
        return confirmationSchema.parse(data);
      default:
        return { success: true };
    }
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
export const sanitizeBulkMessagingData = (data: BulkMessagingFormData) => {
  return {
    ...data,
    templateParams: data.templateParams || {},
    scheduledAt: data.isScheduled ? data.scheduledAt : undefined,
    // Remove confirmation flag as it's not persisted
    confirmationChecked: undefined,
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

/**
 * Helper to check if a step can be accessed
 */
export const canAccessStep = (currentStep: BulkMessagingStep, targetStep: BulkMessagingStep): boolean => {
  const stepOrder = [
    BULK_MESSAGING_STEPS.COMPOSE,
    BULK_MESSAGING_STEPS.RECIPIENTS,
    BULK_MESSAGING_STEPS.SCHEDULE,
    BULK_MESSAGING_STEPS.REVIEW,
    BULK_MESSAGING_STEPS.SENDING,
    BULK_MESSAGING_STEPS.COMPLETE,
  ];

  const currentIndex = stepOrder.indexOf(currentStep);
  const targetIndex = stepOrder.indexOf(targetStep);

  // Can only access current step or previous steps
  return targetIndex <= currentIndex;
};

/**
 * Helper to get the next step
 */
export const getNextStep = (currentStep: BulkMessagingStep): BulkMessagingStep | null => {
  const stepOrder = [
    BULK_MESSAGING_STEPS.COMPOSE,
    BULK_MESSAGING_STEPS.RECIPIENTS,
    BULK_MESSAGING_STEPS.SCHEDULE,
    BULK_MESSAGING_STEPS.REVIEW,
    BULK_MESSAGING_STEPS.SENDING,
    BULK_MESSAGING_STEPS.COMPLETE,
  ];

  const currentIndex = stepOrder.indexOf(currentStep);
  const nextIndex = currentIndex + 1;

  return nextIndex < stepOrder.length ? stepOrder[nextIndex] : null;
};

/**
 * Helper to get the previous step
 */
export const getPreviousStep = (currentStep: BulkMessagingStep): BulkMessagingStep | null => {
  const stepOrder = [
    BULK_MESSAGING_STEPS.COMPOSE,
    BULK_MESSAGING_STEPS.RECIPIENTS,
    BULK_MESSAGING_STEPS.SCHEDULE,
    BULK_MESSAGING_STEPS.REVIEW,
    BULK_MESSAGING_STEPS.SENDING,
    BULK_MESSAGING_STEPS.COMPLETE,
  ];

  const currentIndex = stepOrder.indexOf(currentStep);
  const previousIndex = currentIndex - 1;

  return previousIndex >= 0 ? stepOrder[previousIndex] : null;
};

















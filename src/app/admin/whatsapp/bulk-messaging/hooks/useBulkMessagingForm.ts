import { useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';

import {
  bulkMessagingSchema,
  BulkMessagingFormData,
  defaultBulkMessagingForm,
  BULK_MESSAGING_STEPS,
  BulkMessagingStep,
  validateStep,
  sanitizeBulkMessagingData,
  getNextStep,
  getPreviousStep,
  canAccessStep,
} from '../schemas';

import { BulkMessageProgress, WhatsAppMessageStatus } from '@/types';

// Import server actions
import {
  sendBulkWhatsAppMessagesServer,
  scheduleBulkWhatsAppMessagesServer,
  getBulkMessageProgressServer,
  cancelBulkMessageCampaignServer,
  validatePhoneNumbersServer,
} from '../ApiServerActions';

interface UseBulkMessagingFormOptions {
  onComplete?: (result: any) => void;
  onCancel?: () => void;
}

export function useBulkMessagingForm({ onComplete, onCancel }: UseBulkMessagingFormOptions = {}) {
  // Current step state
  const [currentStep, setCurrentStep] = useState<BulkMessagingStep>(BULK_MESSAGING_STEPS.COMPOSE);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

  // Sending state
  const [isSending, setIsSending] = useState(false);
  const [sendingProgress, setSendingProgress] = useState<BulkMessageProgress | null>(null);
  const [campaignId, setCampaignId] = useState<string | null>(null);

  // Validation state
  const [isValidatingPhones, setIsValidatingPhones] = useState(false);
  const [phoneValidationResult, setPhoneValidationResult] = useState<{
    valid: string[];
    invalid: string[];
    suggestions: Record<string, string>;
  } | null>(null);

  // Initialize React Hook Form
  const form = useForm<BulkMessagingFormData>({
    resolver: zodResolver(bulkMessagingSchema),
    defaultValues: defaultBulkMessagingForm,
    mode: 'onChange',
  });

  const { watch, setValue, getValues, trigger, formState: { errors, isValid, isDirty } } = form;

  // Watch form values
  const formData = watch();

  // Step navigation functions
  const goToStep = useCallback((targetStep: BulkMessagingStep) => {
    if (canAccessStep(currentStep, targetStep)) {
      setCurrentStep(targetStep);
      setStepErrors({});
    }
  }, [currentStep]);

  const goToNextStep = useCallback(async () => {
    const nextStep = getNextStep(currentStep);
    if (!nextStep) return;

    // Validate current step before proceeding
    const validation = validateStep(currentStep, formData);

    if (!validation.success) {
      setStepErrors(validation.errors || {});
      toast.error('Please fix the errors before proceeding');
      return;
    }

    // Special validation for recipients step
    if (currentStep === BULK_MESSAGING_STEPS.RECIPIENTS) {
      await validateRecipients();
    }

    setStepErrors({});
    setCurrentStep(nextStep);
  }, [currentStep, formData]);

  const goToPreviousStep = useCallback(() => {
    const previousStep = getPreviousStep(currentStep);
    if (previousStep) {
      setCurrentStep(previousStep);
      setStepErrors({});
    }
  }, [currentStep]);

  // Validation functions
  const validateRecipients = useCallback(async () => {
    const recipients = getValues('recipients');
    if (!recipients || recipients.length === 0) return;

    try {
      setIsValidatingPhones(true);
      const phoneNumbers = recipients.map(r => r.phone);
      const result = await validatePhoneNumbersServer(phoneNumbers);

      setPhoneValidationResult(result);

      if (result.invalid.length > 0) {
        toast.error(`Found ${result.invalid.length} invalid phone numbers`);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating phone numbers:', error);
      toast.error('Failed to validate phone numbers');
      return false;
    } finally {
      setIsValidatingPhones(false);
    }
  }, [getValues]);

  // Sending functions
  const sendMessages = useCallback(async () => {
    try {
      setIsSending(true);

      // Validate entire form
      const isValidForm = await trigger();
      if (!isValidForm) {
        toast.error('Please fix all form errors before sending');
        return;
      }

      const formData = getValues();
      const sanitizedData = sanitizeBulkMessagingData(formData);

      let result;

      if (sanitizedData.isScheduled && sanitizedData.scheduledAt) {
        // Send scheduled messages
        result = await scheduleBulkWhatsAppMessagesServer(sanitizedData, sanitizedData.scheduledAt);
        toast.success('Messages scheduled successfully');
      } else {
        // Send immediate messages
        result = await sendBulkWhatsAppMessagesServer(sanitizedData);
        setCampaignId(result.campaignId || null);
        setCurrentStep(BULK_MESSAGING_STEPS.SENDING);

        // Start monitoring progress
        if (result.campaignId) {
          monitorSendingProgress(result.campaignId);
        }
      }

      onComplete?.(result);
    } catch (error) {
      console.error('Error sending messages:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send messages';
      toast.error(errorMessage);
      setStepErrors({ root: errorMessage });
    } finally {
      setIsSending(false);
    }
  }, [getValues, trigger, onComplete]);

  // Progress monitoring
  const monitorSendingProgress = useCallback(async (campaignId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const progress = await getBulkMessageProgressServer(campaignId);
        setSendingProgress(progress);

        if (!progress.inProgress) {
          clearInterval(pollInterval);
          setCurrentStep(BULK_MESSAGING_STEPS.COMPLETE);
          toast.success(`Messages sent successfully! ${progress.sent} delivered, ${progress.failed} failed`);
        }
      } catch (error) {
        console.error('Error monitoring progress:', error);
        clearInterval(pollInterval);
        toast.error('Failed to monitor sending progress');
      }
    }, 2000);

    // Cleanup after 10 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
    }, 600000);
  }, []);

  // Cancel sending
  const cancelSending = useCallback(async () => {
    if (!campaignId) return;

    try {
      const result = await cancelBulkMessageCampaignServer(campaignId);
      if (result.success) {
        toast.success('Campaign cancelled successfully');
        setCurrentStep(BULK_MESSAGING_STEPS.COMPOSE);
        setSendingProgress(null);
        setCampaignId(null);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error cancelling campaign:', error);
      toast.error('Failed to cancel campaign');
    }
  }, [campaignId]);

  // Reset form
  const resetForm = useCallback(() => {
    form.reset(defaultBulkMessagingForm);
    setCurrentStep(BULK_MESSAGING_STEPS.COMPOSE);
    setStepErrors({});
    setSendingProgress(null);
    setCampaignId(null);
    setPhoneValidationResult(null);
  }, [form]);

  // Cancel form
  const cancelForm = useCallback(() => {
    onCancel?.();
  }, [onCancel]);

  // Computed values
  const canProceedToNext = useMemo(() => {
    switch (currentStep) {
      case BULK_MESSAGING_STEPS.COMPOSE:
        return formData.messageBody && formData.messageType;
      case BULK_MESSAGING_STEPS.RECIPIENTS:
        return formData.recipients && formData.recipients.length > 0;
      case BULK_MESSAGING_STEPS.SCHEDULE:
        return true; // Schedule step is optional
      case BULK_MESSAGING_STEPS.REVIEW:
        return isValid && formData.confirmationChecked;
      default:
        return false;
    }
  }, [currentStep, formData, isValid]);

  const canGoToPrevious = useMemo(() => {
    return getPreviousStep(currentStep) !== null;
  }, [currentStep]);

  const isLastStep = useMemo(() => {
    return currentStep === BULK_MESSAGING_STEPS.REVIEW;
  }, [currentStep]);

  const isSendingStep = useMemo(() => {
    return currentStep === BULK_MESSAGING_STEPS.SENDING;
  }, [currentStep]);

  const isCompleteStep = useMemo(() => {
    return currentStep === BULK_MESSAGING_STEPS.COMPLETE;
  }, [currentStep]);

  // Step progress percentage
  const stepProgress = useMemo(() => {
    const stepOrder = [
      BULK_MESSAGING_STEPS.COMPOSE,
      BULK_MESSAGING_STEPS.RECIPIENTS,
      BULK_MESSAGING_STEPS.SCHEDULE,
      BULK_MESSAGING_STEPS.REVIEW,
      BULK_MESSAGING_STEPS.SENDING,
      BULK_MESSAGING_STEPS.COMPLETE,
    ];

    const currentIndex = stepOrder.indexOf(currentStep);
    return Math.round((currentIndex / (stepOrder.length - 1)) * 100);
  }, [currentStep]);

  return {
    // Form state
    form,
    formData,
    errors,
    isValid,
    isDirty,
    stepErrors,

    // Step navigation
    currentStep,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    canProceedToNext,
    canGoToPrevious,
    isLastStep,
    stepProgress,

    // Sending state
    isSending,
    isSendingStep,
    isCompleteStep,
    sendingProgress,
    campaignId,
    sendMessages,
    cancelSending,

    // Validation
    isValidatingPhones,
    phoneValidationResult,
    validateRecipients,

    // Actions
    resetForm,
    cancelForm,
  };
}

















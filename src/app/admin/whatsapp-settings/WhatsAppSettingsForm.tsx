'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';
import { FaSpinner, FaCheck, FaWhatsapp } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
// import { useWhatsAppErrorHandler, WhatsAppErrorCode } from '@/lib/whatsapp';
// import { WhatsAppErrorDisplay } from '@/components/whatsapp/WhatsAppErrorBoundary';

// Import schemas and types
// import {
//   whatsAppSettingsSchema,
//   WhatsAppSettingsFormData,
//   defaultWhatsAppSettings
// } from './schemas';
import { TenantSettingsDTO } from '@/types';

// Basic form types (temporary)
interface WhatsAppSettingsFormData {
  enableWhatsappIntegration: boolean;
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioWhatsappFrom: string;
  whatsappWebhookUrl: string;
  whatsappWebhookToken: string;
}

const defaultWhatsAppSettings: WhatsAppSettingsFormData = {
  enableWhatsappIntegration: false,
  twilioAccountSid: '',
  twilioAuthToken: '',
  twilioWhatsappFrom: '',
  whatsappWebhookUrl: '',
  whatsappWebhookToken: '',
};

// Import sub-components
// import TwilioCredentialsSection from './components/TwilioCredentialsSection';
// import WebhookConfiguration from './components/WebhookConfiguration';
// import TestConnection from './components/TestConnection';
// import MessageTemplatesManager from './components/MessageTemplatesManager';

// Import server actions
// import {
//   updateWhatsAppSettingsServer
//   // testWhatsAppConnectionServer
// } from './ApiServerActions';

interface WhatsAppSettingsFormProps {
  initialData?: TenantSettingsDTO;
  onSave?: (data: TenantSettingsDTO) => void;
  onCancel?: () => void;
  loading?: boolean;
}

export default function WhatsAppSettingsForm({
  initialData,
  onSave,
  onCancel,
  loading = false
}: WhatsAppSettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Error handling
  // const errorHandler = useWhatsAppErrorHandler({
  //   showToast: false, // We'll handle toasts manually for better UX
  // });

  // Initialize form with React Hook Form (simplified)
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    reset,
    watch,
    setValue,
    trigger
  } = useForm<WhatsAppSettingsFormData>({
    defaultValues: defaultWhatsAppSettings,
    mode: 'onChange'
  });

  // Watch form values for conditional rendering
  const enableWhatsappIntegration = watch('enableWhatsappIntegration');

  // Handle form submission (simplified)
  const onSubmit = async (data: WhatsAppSettingsFormData) => {
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Show success message
      toast.success('WhatsApp settings saved successfully!');

      // Call optional onSave callback
      onSave?.(data as any);

      // Reset form with new data
      reset(data);
    } catch (error: any) {
      console.error('Failed to save WhatsApp settings:', error);
      toast.error('Failed to save WhatsApp settings. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle connection test (placeholder)
  const handleConnectionTest = async (credentials: any) => {
    toast.info('Connection test feature will be available soon.');
  };

  // Handle form reset
  const handleReset = () => {
    reset(defaultWhatsAppSettings);
    toast.info('Form reset to default values');
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaWhatsapp className="text-green-500 text-2xl" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">WhatsApp Integration</h2>
              <p className="text-sm text-gray-600">Configure your WhatsApp Business API settings</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                {...register('enableWhatsappIntegration')}
                className="sr-only"
              />
              <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enableWhatsappIntegration ? 'bg-green-500' : 'bg-gray-200'
                }`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enableWhatsappIntegration ? 'translate-x-6' : 'translate-x-1'
                  }`} />
              </div>
              <span className="ml-3 text-sm font-medium text-gray-700">
                Enable WhatsApp Integration
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Content */}
      <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-6">

        {!enableWhatsappIntegration ? (
          <div className="text-center py-12">
            <FaWhatsapp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              WhatsApp Integration Disabled
            </h3>
            <p className="text-gray-600 mb-6">
              Enable WhatsApp integration to start sending messages and managing templates.
            </p>
            <button
              type="button"
              onClick={() => setValue('enableWhatsappIntegration', true, { shouldDirty: true })}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md font-medium"
            >
              Enable Integration
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Integration Status */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <FaCheck className="text-green-500 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-green-800">WhatsApp Integration Enabled</h4>
                  <p className="text-sm text-green-700">
                    You can now configure your Twilio credentials and start sending WhatsApp messages.
                  </p>
                </div>
              </div>
            </div>

            {/* Placeholder for Twilio Credentials */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Twilio Credentials</h3>
              <p className="text-gray-600">Configure your Twilio WhatsApp Business API credentials here.</p>
            </div>

            {/* Placeholder for Webhook Configuration */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Webhook Configuration</h3>
              <p className="text-gray-600">Set up webhook endpoints for message status updates.</p>
            </div>

            {/* Placeholder for Test Connection */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Test Connection</h3>
              <p className="text-gray-600">Test your WhatsApp integration connection.</p>
            </div>

            {/* Placeholder for Message Templates */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Message Templates</h3>
              <p className="text-gray-600">Manage your WhatsApp message templates.</p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 mt-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Your credentials are encrypted and stored securely</span>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleReset}
                disabled={isSubmitting || !isDirty}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !isDirty}
                className="px-4 py-2 text-sm font-medium text-white bg-green-500 border border-transparent rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <FaSpinner className="animate-spin mr-2" /> Saving...
                  </span>
                ) : (
                  'Save Settings'
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
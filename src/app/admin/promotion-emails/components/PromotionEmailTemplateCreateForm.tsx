'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type {
  PromotionEmailTemplateFormDTO,
  DiscountCodeDTO,
} from '@/types';
import { FaSave, FaBan } from 'react-icons/fa';
import {
  createPromotionEmailTemplateServer,
} from '../ApiServerActions';
import { fetchDiscountCodesForEvent } from '@/app/admin/events/[id]/discount-codes/list/ApiServerActions';
import EventSearchSelect from './EventSearchSelect';
import SaveStatusDialog, { type SaveStatus } from '@/components/SaveStatusDialog';
import FromEmailSelect from '@/components/FromEmailSelect';

interface PromotionEmailTemplateCreateFormProps {
  onSave: (templateId: number) => void;
  onCancel: () => void;
}

export default function PromotionEmailTemplateCreateForm({
  onSave,
  onCancel,
}: PromotionEmailTemplateCreateFormProps) {
  const [formData, setFormData] = useState<PromotionEmailTemplateFormDTO>({
    eventId: 0,
    templateName: '',
    templateType: 'EVENT_PROMOTION',
    subject: '',
    fromEmail: '',
    bodyHtml: '',
    footerHtml: '',
    headerImageUrl: '',
    footerImageUrl: '',
    discountCodeId: undefined,
    isActive: true,
  });

  const router = useRouter();
  const [discountCodes, setDiscountCodes] = useState<DiscountCodeDTO[]>([]);
  const [loadingDiscountCodes, setLoadingDiscountCodes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [isEmailListEmpty, setIsEmailListEmpty] = useState(false);
  const [fromEmailError, setFromEmailError] = useState<string | null>(null);

  useEffect(() => {
    // Load discount codes when event changes
    if (formData.eventId) {
      loadDiscountCodes(formData.eventId.toString());
    } else {
      setDiscountCodes([]);
    }
  }, [formData.eventId]);

  const loadDiscountCodes = async (eventId: string) => {
    setLoadingDiscountCodes(true);
    try {
      const codes = await fetchDiscountCodesForEvent(eventId);
      setDiscountCodes(codes);
    } catch (err: any) {
      console.error('Failed to load discount codes:', err);
      setDiscountCodes([]);
    } finally {
      setLoadingDiscountCodes(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    let processedValue: any = value;

    if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    } else if (name === 'discountCodeId') {
      processedValue = value ? Number(value) : undefined;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const handleEventChange = (eventId: number | undefined) => {
    setFormData((prev) => ({
      ...prev,
      eventId: eventId || 0,
      discountCodeId: undefined, // Clear discount code when event changes
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFromEmailError(null);
    setSaveStatus('saving');
    setSaveMessage('Please wait while we create your template...');

    // Validate event ID
    if (!formData.eventId || formData.eventId === 0) {
      setError('Please select an event');
      setSaveStatus('idle');
      return;
    }

    // Validate fromEmail following cursor rule pattern
    // First check: Is the email list empty?
    if (isEmailListEmpty) {
      setFromEmailError('The from email list is empty. Please contact Admin to add the list of from email addresses.');
      setError('The from email list is empty. Please contact Admin to add the list of from email addresses.');
      setSaveStatus('idle');
      return;
    }
    // Second check: Is the fromEmail field empty or just whitespace?
    // CRITICAL: This must catch untouched fields (empty string), null, undefined, and whitespace-only
    const fromEmailValue = formData.fromEmail;
    const isFromEmailEmpty = !fromEmailValue ||
                             fromEmailValue === '' ||
                             (typeof fromEmailValue === 'string' && fromEmailValue.trim() === '');

    if (isFromEmailEmpty) {
      setFromEmailError('Please enter from email address');
      setError('Please enter from email address');
      setSaveStatus('idle');
      return;
    }
    // Third check: Is the email format valid?
    else if (typeof fromEmailValue === 'string' && fromEmailValue.trim() !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fromEmailValue.trim())) {
      setFromEmailError('Please enter a valid email address');
      setError('Please enter a valid email address');
      setSaveStatus('idle');
      return;
    }

    setSaving(true);

    try {
      const createdTemplate = await createPromotionEmailTemplateServer(formData);
      if (createdTemplate.id) {
        // Show success message
        setSaveStatus('success');
        setSaveMessage('Your template has been created successfully. Redirecting to promotion emails...');

        // Redirect after a brief delay
        setTimeout(() => {
          router.push('/admin/promotion-emails');
        }, 1500);
      } else {
        throw new Error('Template created but no ID returned');
      }
    } catch (err: any) {
      setSaveStatus('error');
      const userMessage = err.message || 'Failed to create template. Please try again.';
      setSaveMessage(userMessage);
      setError(userMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        Create New Promotion Email Template
      </h2>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Info Tip about Editing and From Email */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
        <div className="flex items-start">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="flex-1 space-y-2">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Email header images can only be added to a template after it has been created. Once you create the template, edit it to upload header and footer images for the promotional email.
            </p>
            <p className="text-sm text-blue-800">
              <strong>From Email Field:</strong> The email address used in the "From Email" field must be registered and verified with AWS SES (Amazon Simple Email Service). AWS SES requires the "From" address to be verified in SES for production use. <strong>Please contact your administrator</strong> - only verified emails can be used as the From email field.
            </p>
            <p className="text-sm text-blue-800">
              <strong>Domain Verification:</strong> Your domain can be registered in AWS SES in the Identity section. Once your domain is verified, any valid email address from that domain can be used as the From email field (e.g., if your domain "example.com" is verified, you can use "noreply@example.com", "support@example.com", etc.).
            </p>
            <p className="text-sm text-blue-800">
              <strong>Email Restrictions:</strong> You cannot send an email to yourself where both the "From" and "To" email addresses are the same. Additionally, Hotmail accounts do not work as the From email field.
            </p>
            <p className="text-sm text-blue-800">
              Both email logo and email footer can be configured in the <strong>Tenant Settings → Customization</strong> tab.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Event Selection with Search */}
        <div>
          <EventSearchSelect
            value={formData.eventId || undefined}
            onChange={handleEventChange}
            required
          />
          {/* Hidden input for form validation */}
          <input
            type="hidden"
            name="eventId"
            value={formData.eventId || ''}
            required
          />
        </div>

        {/* Template Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Template Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="templateName"
            value={formData.templateName}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-2 text-base"
            placeholder="e.g., Summer Sale 2024"
          />
        </div>

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Subject <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-2 text-base"
            placeholder="e.g., Special Offer Just for You!"
          />
        </div>

        {/* From Email */}
        <div className="mb-4">
          <FromEmailSelect
            value={formData.fromEmail}
            onChange={(email) => {
              setFormData(prev => ({ ...prev, fromEmail: email || '' }));
              // Clear error when user selects an email
              if (fromEmailError) {
                setFromEmailError(null);
                setError(null);
              }
            }}
            onEmptyListChange={(isEmpty) => {
              setIsEmailListEmpty(isEmpty);
              // Clear error if list becomes non-empty
              if (!isEmpty && fromEmailError && fromEmailError.includes('empty')) {
                setFromEmailError(null);
                setError(null);
              }
            }}
            error={!!fromEmailError}
            required
          />
          {fromEmailError && (
            <div className="mt-2 p-3 bg-red-50 border border-red-300 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-red-700">{fromEmailError}</p>
              </div>
            </div>
          )}
        </div>

        {/* Discount Code Selection */}
        {formData.eventId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Code (Optional)
            </label>
            {loadingDiscountCodes ? (
              <div className="text-sm text-gray-500">Loading discount codes...</div>
            ) : (
              <select
                name="discountCodeId"
                value={formData.discountCodeId || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-2 text-base"
              >
                <option value="">None</option>
                {discountCodes.map((code) => (
                  <option key={code.id} value={code.id}>
                    {code.code} ({code.discountType} - {code.discountValue}
                    {code.discountType === 'PERCENTAGE' ? '%' : '$'})
                  </option>
                ))}
              </select>
            )}
            {discountCodes.length === 0 && !loadingDiscountCodes && (
              <p className="mt-1 text-sm text-gray-500">
                No discount codes available for this event. Create one in the event's discount codes section.
              </p>
            )}
          </div>
        )}

        {/* Body HTML */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Body HTML <span className="text-red-500">*</span>
          </label>

          {/* Tip with Example */}
          <div className="mb-3 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Tip:</strong> Paste only the inner HTML (no &lt;body&gt; tags). You can create a sample email body HTML using ChatGPT AI tools.
            </p>
            <p className="text-sm text-gray-700 mb-2">
              You can preview your HTML template or snippet in one of the sites like{' '}
              <a
                href="https://html.onlineviewer.net/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                https://html.onlineviewer.net/
              </a>
            </p>
            <details className="mt-2">
              <summary className="cursor-pointer text-sm text-blue-600 hover:text-blue-800 font-medium">
                Click to see example HTML
              </summary>
              <div className="mt-3 p-3 bg-white border border-gray-300 rounded overflow-x-auto">
                <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono">{`<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #f9f9f9; border-radius: 8px; padding: 24px; text-align: center;">

  <h2 style="color: #1a237e; margin-bottom: 12px;">Special Offer Just for You!</h2>

  <p style="font-size: 18px; color: #333; margin-bottom: 8px;">Use the code below to get an exclusive discount:</p>

  <div style="font-size: 24px; font-weight: bold; color: #1565c0; background: #e3f2fd; border-radius: 6px; display: inline-block; padding: 12px 32px; margin-bottom: 12px;">SAVE20</div>

  <p style="font-size: 16px; color: #444;">Enter this code at checkout to enjoy your savings!</p>

</div>`}</pre>
              </div>
            </details>
          </div>

          <textarea
            name="bodyHtml"
            value={formData.bodyHtml}
            onChange={handleChange}
            required
            rows={15}
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-2 text-base font-mono text-sm"
            placeholder="Enter HTML content for the email body..."
          />
        </div>

        {/* Footer HTML - Hidden for now, passed as null */}
        {/* <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Footer HTML <span className="text-red-500">*</span>
          </label>
          ...
        </div> */}

        {/* Active Status */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            id="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
            Template is active
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex flex-row gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6 disabled:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            title={saving ? 'Creating...' : 'Create Template'}
            aria-label={saving ? 'Creating...' : 'Create Template'}
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
              {saving ? (
                <FaSave className="w-6 h-6 text-blue-600 animate-spin" />
              ) : (
                <FaSave className="w-6 h-6 text-blue-600" />
              )}
            </div>
            <span className="font-semibold text-blue-700">{saving ? 'Creating...' : 'Create Template'}</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 flex-shrink-0 h-14 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
            title="Cancel"
            aria-label="Cancel"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-200 flex items-center justify-center">
              <FaBan className="w-6 h-6 text-red-600" />
            </div>
            <span className="font-semibold text-red-700">Cancel</span>
          </button>
        </div>
      </form>

      {/* Save Status Dialog */}
      <SaveStatusDialog
        isOpen={saveStatus !== 'idle'}
        status={saveStatus}
        message={saveMessage}
        onClose={() => {
          if (saveStatus === 'error') {
            setSaveStatus('idle');
            setSaveMessage('');
          }
        }}
      />
    </div>
  );
}


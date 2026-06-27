'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type {
  PromotionEmailTemplateDTO,
  PromotionEmailTemplateFormDTO,
  DiscountCodeDTO,
} from '@/types';
import { FaSave, FaBan, FaUpload, FaTimes } from 'react-icons/fa';
import Link from 'next/link';
import AdminNavigation from '@/components/AdminNavigation';
import SaveStatusDialog, { type SaveStatus } from '@/components/SaveStatusDialog';
import {
  updatePromotionEmailTemplateServer,
  uploadPromotionalEmailHeaderImageClient,
  uploadPromotionalEmailFooterImageClient,
} from '../ApiServerActions';
import { fetchDiscountCodesForEvent } from '@/app/admin/events/[id]/discount-codes/list/ApiServerActions';
import EventSearchSelect from '../components/EventSearchSelect';
import FromEmailSelect from '@/components/FromEmailSelect';

interface PromotionEmailTemplateEditClientProps {
  template: PromotionEmailTemplateDTO | null;
  templateId: number;
}

export default function PromotionEmailTemplateEditClient({
  template,
  templateId,
}: PromotionEmailTemplateEditClientProps) {
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [uploadingHeader, setUploadingHeader] = useState(false);
  const [uploadingFooter, setUploadingFooter] = useState(false);
  const [isDraggingHeader, setIsDraggingHeader] = useState(false);
  const [isDraggingFooter, setIsDraggingFooter] = useState(false);
  const headerFileInputRef = useRef<HTMLInputElement>(null);
  const footerFileInputRef = useRef<HTMLInputElement>(null);
  const [isEmailListEmpty, setIsEmailListEmpty] = useState(false);
  const [fromEmailError, setFromEmailError] = useState<string | null>(null);

  useEffect(() => {
    if (template) {
      setFormData({
        eventId: template.eventId,
        templateName: template.templateName,
        templateType: template.templateType || 'EVENT_PROMOTION',
        subject: template.subject,
        fromEmail: template.fromEmail || '',
        bodyHtml: template.bodyHtml,
        footerHtml: template.footerHtml || '',
        headerImageUrl: template.headerImageUrl || '',
        footerImageUrl: template.footerImageUrl || '',
        discountCodeId: template.discountCodeId,
        isActive: template.isActive !== undefined ? template.isActive : true,
      });
      if (template.eventId) {
        loadDiscountCodes(template.eventId.toString());
      }
    }
  }, [template]);

  useEffect(() => {
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

  const processHeaderImageUpload = async (file: File) => {
    if (!file || !formData.eventId) return;

    setUploadingHeader(true);
    setError(null);

    try {
      const result = await uploadPromotionalEmailHeaderImageClient(
        formData.eventId,
        templateId,
        file,
        'Promotional Email Header Image',
        'Promotional email header image'
      );

      setFormData((prev) => ({
        ...prev,
        headerImageUrl: result.url,
      }));

      // Automatically update the template with the new image URL
      await updatePromotionEmailTemplateServer(templateId, {
        headerImageUrl: result.url,
      });

      setSuccessMessage('Header image uploaded and saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload header image');
    } finally {
      setUploadingHeader(false);
      if (headerFileInputRef.current) {
        headerFileInputRef.current.value = '';
      }
    }
  };

  const handleHeaderImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processHeaderImageUpload(file);
    }
  };

  const handleHeaderDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploadingHeader && formData.eventId) {
      setIsDraggingHeader(true);
    }
  };

  const handleHeaderDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingHeader(false);
  };

  const handleHeaderDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingHeader(false);

    if (uploadingHeader || !formData.eventId) return;

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await processHeaderImageUpload(file);
    } else {
      setError('Please drop a valid image file');
    }
  };

  const processFooterImageUpload = async (file: File) => {
    if (!file || !formData.eventId) return;

    setUploadingFooter(true);
    setError(null);

    try {
      const result = await uploadPromotionalEmailFooterImageClient(
        formData.eventId,
        templateId,
        file,
        'Promotional Email Footer Image',
        'Promotional email footer image'
      );

      setFormData((prev) => ({
        ...prev,
        footerImageUrl: result.url,
      }));

      // Automatically update the template with the new image URL
      await updatePromotionEmailTemplateServer(templateId, {
        footerImageUrl: result.url,
      });

      setSuccessMessage('Footer image uploaded and saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload footer image');
    } finally {
      setUploadingFooter(false);
      if (footerFileInputRef.current) {
        footerFileInputRef.current.value = '';
      }
    }
  };

  const handleFooterImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFooterImageUpload(file);
    }
  };

  const handleFooterDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploadingFooter && formData.eventId) {
      setIsDraggingFooter(true);
    }
  };

  const handleFooterDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFooter(false);
  };

  const handleFooterDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFooter(false);

    if (uploadingFooter || !formData.eventId) return;

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await processFooterImageUpload(file);
    } else {
      setError('Please drop a valid image file');
    }
  };

  const handleRemoveHeaderImage = async () => {
    setFormData((prev) => ({
      ...prev,
      headerImageUrl: '',
    }));

    // Update template to remove header image URL
    try {
      await updatePromotionEmailTemplateServer(templateId, {
        headerImageUrl: '',
      });
      setSuccessMessage('Header image removed successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to remove header image');
    }
  };

  const handleRemoveFooterImage = async () => {
    setFormData((prev) => ({
      ...prev,
      footerImageUrl: '',
    }));

    // Update template to remove footer image URL
    try {
      await updatePromotionEmailTemplateServer(templateId, {
        footerImageUrl: '',
      });
      setSuccessMessage('Footer image removed successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to remove footer image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFromEmailError(null);
    setSaveStatus('saving');
    setSaveMessage('Please wait while we save your template...');

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
      await updatePromotionEmailTemplateServer(templateId, formData);

      // Show success message
      setSaveStatus('success');
      setSaveMessage('Your template has been saved successfully. Redirecting to promotion emails...');

      // Redirect after a brief delay
      setTimeout(() => {
        router.push('/admin/promotion-emails');
      }, 1500);
    } catch (err: any) {
      setSaveStatus('error');
      const userMessage = err.message || 'Failed to update template. Please try again.';
      setSaveMessage(userMessage);
      setError(userMessage);
    } finally {
      setSaving(false);
    }
  };

  if (!template) {
    return (
      <div className="max-w-5xl mx-auto px-8 py-8" style={{ paddingTop: '180px' }}>
        <AdminNavigation currentPage="promotion-emails" />
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center py-8 text-gray-500">
            Template not found
          </div>
          <Link href="/admin/promotion-emails" className="text-blue-600 hover:underline">
            ← Back to Promotion Emails
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-8" style={{ paddingTop: '180px' }}>
      <AdminNavigation currentPage="promotion-emails" />

      <div className="mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/promotion-emails"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Promotion Emails
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Edit Promotion Email Template
          </h1>
        </div>
      </div>

      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Info Tip about Configuration */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div className="flex-1 space-y-2">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> You can now upload header and footer images for this promotional email template using the upload sections below.
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
          {/* Event Selection (Editable) */}
          <div>
            <EventSearchSelect
              value={formData.eventId}
              onChange={handleEventChange}
              required
            />
            <input
              type="hidden"
              name="eventId"
              value={formData.eventId}
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
            </div>
          )}

          {/* Header Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Header Image
            </label>
            {formData.headerImageUrl ? (
              <div className="relative inline-block">
                <img
                  src={formData.headerImageUrl}
                  alt="Header preview"
                  className="max-w-full h-auto max-h-48 rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={handleRemoveHeaderImage}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div>
                <input
                  ref={headerFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleHeaderImageUpload}
                  disabled={uploadingHeader || !formData.eventId}
                  className="hidden"
                />
                <div
                  onDragOver={handleHeaderDragOver}
                  onDragLeave={handleHeaderDragLeave}
                  onDrop={handleHeaderDrop}
                  onClick={() => !uploadingHeader && formData.eventId && headerFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full ${
                    isDraggingHeader
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-500'
                  } ${uploadingHeader || !formData.eventId ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <FaUpload className={`mx-auto h-12 w-12 mb-2 ${
                    isDraggingHeader ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                  <p className={`text-sm ${
                    isDraggingHeader ? 'text-blue-600 font-semibold' : 'text-gray-600'
                  }`}>
                    {uploadingHeader
                      ? 'Uploading...'
                      : isDraggingHeader
                        ? 'Drop image here'
                        : 'Click to upload or drag and drop header image'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Footer Image
            </label>
            {formData.footerImageUrl ? (
              <div className="relative inline-block">
                <img
                  src={formData.footerImageUrl}
                  alt="Footer preview"
                  className="max-w-full h-auto max-h-48 rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={handleRemoveFooterImage}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg"
                >
                  <FaTimes className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div>
                <input
                  ref={footerFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFooterImageUpload}
                  disabled={uploadingFooter || !formData.eventId}
                  className="hidden"
                />
                <div
                  onDragOver={handleFooterDragOver}
                  onDragLeave={handleFooterDragLeave}
                  onDrop={handleFooterDrop}
                  onClick={() => !uploadingFooter && formData.eventId && footerFileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full ${
                    isDraggingFooter
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-500'
                  } ${uploadingFooter || !formData.eventId ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <FaUpload className={`mx-auto h-12 w-12 mb-2 ${
                    isDraggingFooter ? 'text-blue-500' : 'text-gray-400'
                  }`} />
                  <p className={`text-sm ${
                    isDraggingFooter ? 'text-blue-600 font-semibold' : 'text-gray-600'
                  }`}>
                    {uploadingFooter
                      ? 'Uploading...'
                      : isDraggingFooter
                        ? 'Drop image here'
                        : 'Click to upload or drag and drop footer image'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
              </div>
            )}
          </div>

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
              title={saving ? 'Saving...' : 'Update Template'}
              aria-label={saving ? 'Saving...' : 'Update Template'}
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
                {saving ? (
                  <FaSave className="w-6 h-6 text-blue-600 animate-spin" />
                ) : (
                  <FaSave className="w-6 h-6 text-blue-600" />
                )}
              </div>
              <span className="font-semibold text-blue-700">{saving ? 'Saving...' : 'Update Template'}</span>
            </button>
            <Link
              href="/admin/promotion-emails"
              className="flex-1 flex-shrink-0 h-14 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
              title="Cancel"
              aria-label="Cancel"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-200 flex items-center justify-center">
                <FaBan className="w-6 h-6 text-red-600" />
              </div>
              <span className="font-semibold text-red-700">Cancel</span>
            </Link>
          </div>
        </form>
      </div>

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


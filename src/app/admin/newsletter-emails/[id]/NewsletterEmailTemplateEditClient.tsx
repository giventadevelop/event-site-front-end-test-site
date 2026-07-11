'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type {
  PromotionEmailTemplateDTO,
  PromotionEmailTemplateFormDTO,
  DiscountCodeDTO,
} from '@/types';
import { FaSave, FaBan, FaUpload, FaTimes, FaCopy } from 'react-icons/fa';
import Link from 'next/link';
import AdminNavigation from '@/components/AdminNavigation';
import SaveStatusDialog, { type SaveStatus } from '@/components/SaveStatusDialog';
import {
  updateNewsletterEmailTemplateServer,
  uploadNewsletterEmailHeaderImageClient,
  uploadNewsletterEmailFooterImageClient,
  uploadNewsletterEmailBodyImageClient,
} from '../ApiServerActions';
import { fetchDiscountCodesForEvent } from '@/app/admin/events/[id]/discount-codes/list/ApiServerActions';
import FromEmailSelect from '@/components/FromEmailSelect';
import { useTenantSettings } from '@/components/TenantSettingsProvider';
import {
  buildSiteFooterEmailHtmlFromTenant,
} from '@/lib/newsletter/siteFooterEmailHtml';
// Event selection is no longer editable for newsletter templates.

interface NewsletterEmailTemplateEditClientProps {
  template: PromotionEmailTemplateDTO | null;
  templateId: number;
}

function extractBodyImageUrls(html: string): string[] {
  const urls: string[] = [];
  const regex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let match = regex.exec(html);
  while (match) {
    const url = match[1]?.trim();
    if (url && !urls.includes(url)) {
      urls.push(url);
    }
    match = regex.exec(html);
  }
  return urls;
}

function removeBodyImageFromHtml(html: string, imageUrl: string): string {
  const escaped = imageUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  let result = html
    .replace(
      new RegExp(`<p[^>]*>\\s*<img[^>]+src=["']${escaped}["'][^>]*>\\s*</p>`, 'gi'),
      ''
    )
    .replace(new RegExp(`<img[^>]+src=["']${escaped}["'][^>]*>`, 'gi'), '')
    .trim();
  return result.replace(/\n{3,}/g, '\n\n');
}

function NewsletterEmailSection({
  title,
  description,
  step,
  accent,
  children,
}: {
  title: string;
  description: string;
  step: number;
  accent: 'blue' | 'emerald' | 'purple';
  children: React.ReactNode;
}) {
  const styles = {
    blue: {
      box: 'border-blue-300 bg-blue-50/50',
      header: 'border-blue-200',
      badge: 'bg-blue-100 text-blue-800 border-blue-300',
      title: 'text-blue-900',
    },
    emerald: {
      box: 'border-emerald-300 bg-emerald-50/50',
      header: 'border-emerald-200',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      title: 'text-emerald-900',
    },
    purple: {
      box: 'border-purple-300 bg-purple-50/50',
      header: 'border-purple-200',
      badge: 'bg-purple-100 text-purple-800 border-purple-300',
      title: 'text-purple-900',
    },
  }[accent];

  return (
    <section className={`rounded-xl border-2 ${styles.box} p-5 sm:p-6 shadow-sm`}>
      <header className={`flex items-start gap-3 border-b-2 ${styles.header} pb-4 mb-5`}>
        <span
          className={`flex-shrink-0 w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-bold ${styles.badge}`}
          aria-hidden="true"
        >
          {step}
        </span>
        <div>
          <h2 className={`text-lg font-semibold font-heading ${styles.title}`}>{title}</h2>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </header>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function NewsletterEmailImagePreview({
  imageUrl,
  alt,
  label,
  variant,
  onRemove,
}: {
  imageUrl: string;
  alt: string;
  label: string;
  variant: 'header' | 'footer' | 'body';
  onRemove: () => void;
}) {
  const aspectClass =
    variant === 'header' ? 'aspect-[3/1]' : variant === 'footer' ? 'aspect-[6/1]' : 'min-h-[8rem]';

  return (
    <div className="relative w-full max-w-[600px]">
      <div
        className={`w-full ${aspectClass} p-4 bg-gray-50 border border-gray-300 rounded-lg flex items-center justify-center overflow-hidden`}
      >
        <img
          src={imageUrl}
          alt={alt}
          className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg"
        />
      </div>
      <p className="text-sm text-gray-700 mt-2 mb-1">Current {label} (email width preview ~600px):</p>
      <a
        href={imageUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline text-sm break-all"
      >
        {imageUrl}
      </a>
      <button
        type="button"
        onClick={onRemove}
        className="mt-3 flex-shrink-0 w-14 h-14 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
        title={`Remove ${label}`}
        aria-label={`Remove ${label}`}
      >
        <FaTimes className="w-10 h-10 text-red-500" />
      </button>
    </div>
  );
}

export default function NewsletterEmailTemplateEditClient({
  template,
  templateId,
}: NewsletterEmailTemplateEditClientProps) {
  const [formData, setFormData] = useState<PromotionEmailTemplateFormDTO>({
    eventId: 0,
    templateName: '',
    templateType: 'NEWS_LETTER',
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
  const EXAMPLE_BODY_HTML = `<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #f9f9f9; border-radius: 8px; padding: 24px; text-align: center;">

  <h2 style="color: #1a237e; margin-bottom: 12px;">Special Offer Just for You!</h2>

  <p style="font-size: 18px; color: #333; margin-bottom: 8px;">Use the code below to get an exclusive discount:</p>

  <div style="font-size: 24px; font-weight: bold; color: #1565c0; background: #e3f2fd; border-radius: 6px; display: inline-block; padding: 12px 32px; margin-bottom: 12px;">SAVE20</div>

  <p style="font-size: 16px; color: #444;">Enter this code at checkout to enjoy your savings!</p>

</div>`;
  const { settings, organization, organizationIdentity } = useTenantSettings();
  const [uploadingHeader, setUploadingHeader] = useState(false);
  const [uploadingFooter, setUploadingFooter] = useState(false);
  const [uploadingBodyImage, setUploadingBodyImage] = useState(false);
  const [isDraggingHeader, setIsDraggingHeader] = useState(false);
  const [isDraggingFooter, setIsDraggingFooter] = useState(false);
  const [isDraggingBodyImage, setIsDraggingBodyImage] = useState(false);
  const [addSiteFooter, setAddSiteFooter] = useState(false);
  const headerFileInputRef = useRef<HTMLInputElement>(null);
  const footerFileInputRef = useRef<HTMLInputElement>(null);
  const bodyImageFileInputRef = useRef<HTMLInputElement>(null);
  const [isEmailListEmpty, setIsEmailListEmpty] = useState(false);
  const [fromEmailError, setFromEmailError] = useState<string | null>(null);
  const [copiedSizeHint, setCopiedSizeHint] = useState<'header' | 'footer' | null>(null);

  const HEADER_SIZE_GUIDANCE =
    'Recommended for email: 600 × 200 px (or 1200 × 400 px for retina). Keep important content centered; email clients typically display at ~600 px wide.';
  const FOOTER_SIZE_GUIDANCE =
    'Recommended for email: 600 × 100–150 px (or 1200 × 200–300 px for retina). Use a shorter landscape strip so it fits the ~600 px email content width.';

  const bodyImageUrls = useMemo(
    () => extractBodyImageUrls(formData.bodyHtml || ''),
    [formData.bodyHtml]
  );

  useEffect(() => {
    if (template) {
      const hasSavedFooterHtml = !!(template.footerHtml?.trim());
      setAddSiteFooter(hasSavedFooterHtml);
      setFormData({
        eventId: template.eventId,
        templateName: template.templateName,
        templateType: template.templateType || 'NEWS_LETTER',
        subject: template.subject,
        fromEmail: template.fromEmail || '',
        bodyHtml: template.bodyHtml,
        footerHtml: '',
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

  const handleCopyExampleHtml = async () => {
    try {
      await navigator.clipboard.writeText(EXAMPLE_BODY_HTML);
      setFormData((prev) => ({
        ...prev,
        bodyHtml: EXAMPLE_BODY_HTML,
      }));
    } catch (err) {
      console.error('Failed to copy example HTML:', err);
    }
  };

  const getSiteFooterHtml = () =>
    buildSiteFooterEmailHtmlFromTenant(settings, organization, organizationIdentity);

  const handleAddSiteFooterChange = (checked: boolean) => {
    setAddSiteFooter(checked);
  };

  const buildSavePayload = (): Partial<PromotionEmailTemplateFormDTO> => ({
    ...formData,
    footerHtml: addSiteFooter ? getSiteFooterHtml() : '',
    headerImageUrl: formData.headerImageUrl?.trim() || '',
    footerImageUrl: formData.footerImageUrl?.trim() || '',
  });

  const appendBodyImageToHtml = (imageUrl: string) => {
    const imgTag = `<p style="text-align:center;margin:16px 0;"><img src="${imageUrl}" alt="Newsletter image" width="600" style="max-width:100%;width:600px;height:auto;display:block;margin:0 auto;border:0;" /></p>`;
    setFormData((prev) => ({
      ...prev,
      bodyHtml: prev.bodyHtml?.trim() ? `${prev.bodyHtml}\n\n${imgTag}` : imgTag,
    }));
  };

  const processBodyImageUpload = async (file: File) => {
    if (!file) return;

    setUploadingBodyImage(true);
    setError(null);

    try {
      const result = await uploadNewsletterEmailBodyImageClient(
        file,
        'Newsletter Email Body Image',
        'Newsletter email body image'
      );

      if (!result.url) {
        throw new Error('Upload succeeded but no image URL was returned.');
      }

      appendBodyImageToHtml(result.url);
      setSuccessMessage('Body image uploaded and inserted into HTML!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload body image');
    } finally {
      setUploadingBodyImage(false);
      if (bodyImageFileInputRef.current) {
        bodyImageFileInputRef.current.value = '';
      }
    }
  };

  const handleBodyImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processBodyImageUpload(file);
    }
  };

  const handleBodyImageDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploadingBodyImage) {
      setIsDraggingBodyImage(true);
    }
  };

  const handleBodyImageDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingBodyImage(false);
  };

  const handleBodyImageDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingBodyImage(false);

    if (uploadingBodyImage) return;

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await processBodyImageUpload(file);
    } else {
      setError('Please drop a valid image file');
    }
  };

  const handleRemoveBodyImage = (imageUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      bodyHtml: removeBodyImageFromHtml(prev.bodyHtml || '', imageUrl),
    }));
  };

  const handleCopySizeGuidance = async (kind: 'header' | 'footer') => {
    const text = kind === 'header' ? HEADER_SIZE_GUIDANCE : FOOTER_SIZE_GUIDANCE;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSizeHint(kind);
      setTimeout(() => setCopiedSizeHint((prev) => (prev === kind ? null : prev)), 2000);
    } catch (err) {
      console.error('Failed to copy size guidance:', err);
      setError('Failed to copy size guidance to clipboard');
    }
  };

  const handleEventChange = (eventId: number | undefined) => {
    setFormData((prev) => ({
      ...prev,
      eventId: eventId || 0,
      discountCodeId: undefined, // Clear discount code when event changes
    }));
  };

  const processHeaderImageUpload = async (file: File) => {
    if (!file) return;

    setUploadingHeader(true);
    setError(null);

    try {
      const result = await uploadNewsletterEmailHeaderImageClient(
        formData.eventId || null,
        templateId,
        file,
        'Newsletter Email Header Image',
        'Newsletter email header image'
      );

      setFormData((prev) => ({
        ...prev,
        headerImageUrl: result.url,
      }));

      // Automatically update the template with the new image URL
      await updateNewsletterEmailTemplateServer(templateId, {
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
    if (!uploadingHeader) {
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

    if (uploadingHeader) return;

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await processHeaderImageUpload(file);
    } else {
      setError('Please drop a valid image file');
    }
  };

  const processFooterImageUpload = async (file: File) => {
    if (!file) return;

    setUploadingFooter(true);
    setError(null);

    try {
      const result = await uploadNewsletterEmailFooterImageClient(
        formData.eventId || null,
        templateId,
        file,
        'Newsletter Email Footer Image',
        'Newsletter email footer image'
      );

      setFormData((prev) => ({
        ...prev,
        footerImageUrl: result.url,
      }));

      // Automatically update the template with the new image URL
      await updateNewsletterEmailTemplateServer(templateId, {
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
    if (!uploadingFooter) {
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

    if (uploadingFooter) return;

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

    try {
      await updateNewsletterEmailTemplateServer(templateId, {
        headerImageUrl: '',
      });
      router.refresh();
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

    try {
      await updateNewsletterEmailTemplateServer(templateId, {
        footerImageUrl: '',
      });
      router.refresh();
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
      await updateNewsletterEmailTemplateServer(templateId, buildSavePayload());
      router.refresh();

      // Show success message
      setSaveStatus('success');
      setSaveMessage('Your template has been saved successfully. Redirecting...');

      // Redirect after a brief delay
      setTimeout(() => {
        router.push('/admin/newsletter-emails');
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
                <strong>Tip:</strong> You can now upload header and footer images for this newsletter email template using the upload sections below.
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

        <form onSubmit={handleSubmit} className="space-y-8">
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

          {/* Email Header Section */}
          <NewsletterEmailSection
            step={1}
            title="Email Header"
            description="Banner image displayed at the top of the newsletter (~600 px wide in most email clients)."
            accent="blue"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Header Image
              </label>
            <div className="flex items-start gap-2 mb-2">
              <p className="text-xs text-blue-700 leading-relaxed flex-1">
                <strong>Recommended for email:</strong> 600 × 200 px (or 1200 × 400 px for retina).
                Keep important content centered; email clients typically display at ~600 px wide.
              </p>
              <button
                type="button"
                onClick={() => handleCopySizeGuidance('header')}
                className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 transition-colors"
                title="Copy header size guidance"
                aria-label="Copy header size guidance"
              >
                <FaCopy className="w-3 h-3" />
                {copiedSizeHint === 'header' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            {formData.headerImageUrl?.trim() ? (
              <NewsletterEmailImagePreview
                imageUrl={formData.headerImageUrl}
                alt="Header preview"
                label="header image"
                variant="header"
                onRemove={handleRemoveHeaderImage}
              />
            ) : (
              <div>
                <input
                  ref={headerFileInputRef}
                  id="newsletter-header-image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleHeaderImageUpload}
                  disabled={uploadingHeader}
                  className="sr-only"
                />
                <label
                  htmlFor="newsletter-header-image-input"
                  onDragOver={handleHeaderDragOver}
                  onDragLeave={handleHeaderDragLeave}
                  onDrop={handleHeaderDrop}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors block w-full ${
                    isDraggingHeader
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-500'
                  } ${uploadingHeader ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
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
                </label>
              </div>
            )}
            </div>
          </NewsletterEmailSection>

          {/* Email Body Section */}
          <NewsletterEmailSection
            step={2}
            title="Email Body"
            description="Main message content — upload images and/or edit the HTML for the center of the email."
            accent="emerald"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Body Image (optional)
              </label>
            <p className="text-xs text-blue-700 mb-2">
              Upload an image to insert into the body HTML. Recommended: 600 px wide (or 1200 px for retina). The image is added as an &lt;img&gt; tag you can move or edit in the HTML editor below.
            </p>

            {bodyImageUrls.length > 0 && (
              <div className="space-y-6 mb-4">
                {bodyImageUrls.map((url) => (
                  <NewsletterEmailImagePreview
                    key={url}
                    imageUrl={url}
                    alt="Body image preview"
                    label="body image"
                    variant="body"
                    onRemove={() => handleRemoveBodyImage(url)}
                  />
                ))}
              </div>
            )}

            <input
              ref={bodyImageFileInputRef}
              id="newsletter-body-image-input"
              type="file"
              accept="image/*"
              onChange={handleBodyImageUpload}
              disabled={uploadingBodyImage}
              className="sr-only"
            />
            <label
              htmlFor="newsletter-body-image-input"
              onDragOver={handleBodyImageDragOver}
              onDragLeave={handleBodyImageDragLeave}
              onDrop={handleBodyImageDrop}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors block w-full ${
                isDraggingBodyImage
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-500'
              } ${uploadingBodyImage ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
            >
              <FaUpload className={`mx-auto h-12 w-12 mb-2 ${
                isDraggingBodyImage ? 'text-blue-500' : 'text-gray-400'
              }`} />
              <p className={`text-sm ${
                isDraggingBodyImage ? 'text-blue-600 font-semibold' : 'text-gray-600'
              }`}>
                {uploadingBodyImage
                  ? 'Uploading...'
                  : isDraggingBodyImage
                    ? 'Drop image here'
                    : bodyImageUrls.length > 0
                      ? 'Click to upload or drag and drop another body image'
                      : 'Click to upload or drag and drop a body image'}
              </p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
            </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Body HTML <span className="text-red-500">*</span>
              </label>

            {/* Tip with Example */}
            <div className="mb-3 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Tip:</strong> Paste only the inner HTML (no &lt;body&gt; tags). You can combine HTML with uploaded images — images are inserted as &lt;img&gt; tags in the editor below.
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
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">Example body HTML</span>
                    <button
                      type="button"
                      onClick={handleCopyExampleHtml}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300"
                    >
                      <FaCopy className="w-3 h-3" />
                      Copy to editor
                    </button>
                  </div>
                  <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono">
                    {EXAMPLE_BODY_HTML}
                  </pre>
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
          </NewsletterEmailSection>

          {/* Email Footer Section */}
          <NewsletterEmailSection
            step={3}
            title="Email Footer"
            description="Closing strip — footer image and/or HTML (site footer layout, links, contact info)."
            accent="purple"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Footer Image
              </label>
            <div className="flex items-start gap-2 mb-2">
              <p className="text-xs text-blue-700 leading-relaxed flex-1">
                <strong>Recommended for email:</strong> 600 × 100–150 px (or 1200 × 200–300 px for retina).
                Use a shorter landscape strip so it fits the ~600 px email content width.
              </p>
              <button
                type="button"
                onClick={() => handleCopySizeGuidance('footer')}
                className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 transition-colors"
                title="Copy footer size guidance"
                aria-label="Copy footer size guidance"
              >
                <FaCopy className="w-3 h-3" />
                {copiedSizeHint === 'footer' ? 'Copied!' : 'Copy'}
              </button>
            </div>
            {formData.footerImageUrl?.trim() ? (
              <NewsletterEmailImagePreview
                imageUrl={formData.footerImageUrl}
                alt="Footer preview"
                label="footer image"
                variant="footer"
                onRemove={handleRemoveFooterImage}
              />
            ) : (
              <div>
                <input
                  ref={footerFileInputRef}
                  id="newsletter-footer-image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFooterImageUpload}
                  disabled={uploadingFooter}
                  className="sr-only"
                />
                <label
                  htmlFor="newsletter-footer-image-input"
                  onDragOver={handleFooterDragOver}
                  onDragLeave={handleFooterDragLeave}
                  onDrop={handleFooterDrop}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors block w-full ${
                    isDraggingFooter
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-blue-500'
                  } ${uploadingFooter ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
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
                </label>
              </div>
            )}
            </div>

            <div className="rounded-lg border border-purple-200 bg-purple-50/60 p-4">
              <p className="text-sm text-gray-700 mb-3">
                Upload a footer banner image above, or enable the site footer layout below. You can use both — they are sent separately in the email.
              </p>

              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="addSiteFooter"
                  checked={addSiteFooter}
                  onChange={(e) => handleAddSiteFooterChange(e.target.checked)}
                  className="mt-0.5 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="addSiteFooter" className="block text-sm text-gray-700">
                  <span className="font-medium text-gray-900">Add site footer</span>
                  <span className="block text-gray-600 mt-0.5">
                    Inserts your homepage-style footer (tenant name, contact, links) at ~600 px email width when the template is saved or sent.
                  </span>
                </label>
              </div>
            </div>
          </NewsletterEmailSection>

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
              className="flex-1 flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              title={saving ? 'Saving...' : 'Update Template'}
              aria-label={saving ? 'Saving...' : 'Update Template'}
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
                <FaSave className="w-6 h-6 text-blue-600" />
              </div>
              <span className="font-semibold text-blue-700">{saving ? 'Saving...' : 'Update Template'}</span>
            </button>
            <Link
              href="/admin/newsletter-emails"
              className="flex-1 flex-shrink-0 h-14 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105"
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


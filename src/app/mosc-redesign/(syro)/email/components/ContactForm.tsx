'use client';

import React, { useMemo, useRef, useState } from 'react';
import {
  buildContactFormEmailHtml,
  uploadContactFormEmailImage,
} from '@/lib/contactFormEmailTemplate';

interface FormData {
  name: string;
  email: string;
  message: string;
  headerImageUrl: string;
  footerImageUrl: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

function ContactEmailSection({
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
      box: 'border-blue-200 bg-blue-50/40',
      header: 'border-blue-200',
      badge: 'bg-blue-100 text-blue-800 border-blue-300',
      title: 'text-syro-blue',
    },
    emerald: {
      box: 'border-emerald-200 bg-emerald-50/40',
      header: 'border-emerald-200',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      title: 'text-syro-blue',
    },
    purple: {
      box: 'border-purple-200 bg-purple-50/40',
      header: 'border-purple-200',
      badge: 'bg-purple-100 text-purple-800 border-purple-300',
      title: 'text-syro-blue',
    },
  }[accent];

  // Use div (not section/header) so Syro layout CSS cannot force a horizontal flex row.
  return (
    <div className={`w-full flex flex-col rounded-xl border-2 ${styles.box} p-5 sm:p-6 shadow-sm`}>
      <div className={`w-full flex items-start gap-3 border-b-2 ${styles.header} pb-4 mb-5`}>
        <span
          className={`flex-shrink-0 w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-bold ${styles.badge}`}
          aria-hidden="true"
        >
          {step}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className={`font-syro-display font-semibold text-lg ${styles.title}`}>{title}</h3>
          <p className="font-syro-primary text-sm text-syro-dark-gray mt-1">{description}</p>
        </div>
      </div>
      <div className="w-full flex flex-col gap-4">{children}</div>
    </div>
  );
}

function ContactEmailImagePreview({
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
        className={`w-full ${aspectClass} p-4 bg-white border border-syro-table-border rounded-lg flex items-center justify-center overflow-hidden`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={alt}
          className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg"
        />
      </div>
      <p className="font-syro-primary text-sm text-syro-dark-gray mt-2 mb-1">
        Current {label} (email width preview ~600px):
      </p>
      <label className="block font-syro-primary text-xs font-medium text-syro-blue mb-1">
        Uploaded image URL
      </label>
      <input
        type="text"
        readOnly
        value={imageUrl}
        className="w-full px-3 py-2 bg-input border border-syro-table-border rounded-lg font-syro-primary text-xs text-syro-blue break-all"
        aria-label={`${label} URL`}
      />
      <button
        type="button"
        onClick={onRemove}
        className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-syro-primary text-sm font-medium transition-all duration-300"
        title={`Remove ${label}`}
        aria-label={`Remove ${label}`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
        Remove {label}
      </button>
    </div>
  );
}

function ImageUploadDropzone({
  inputId,
  uploading,
  isDragging,
  emptyLabel,
  hasImageLabel,
  hasImage,
  onChange,
  onDragOver,
  onDragLeave,
  onDrop,
  fileInputRef,
}: {
  inputId: string;
  uploading: boolean;
  isDragging: boolean;
  emptyLabel: string;
  hasImageLabel: string;
  hasImage: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}) {
  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        id={inputId}
        type="file"
        accept="image/*"
        onChange={onChange}
        disabled={uploading}
        className="sr-only"
      />
      <label
        htmlFor={inputId}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`w-full border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors block ${
          isDragging
            ? 'border-syro-red bg-syro-red/5'
            : 'border-syro-table-border hover:border-syro-red'
        } ${uploading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
      >
        <svg
          className={`mx-auto h-10 w-10 mb-2 ${isDragging ? 'text-syro-red' : 'text-syro-dark-gray/50'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
          />
        </svg>
        <p
          className={`font-syro-primary text-sm ${
            isDragging ? 'text-syro-red font-semibold' : 'text-syro-dark-gray'
          }`}
        >
          {uploading ? 'Uploading...' : isDragging ? 'Drop image here' : hasImage ? hasImageLabel : emptyLabel}
        </p>
        <p className="font-syro-primary text-xs text-syro-dark-gray/70 mt-1">PNG, JPG, GIF up to 5MB</p>
      </label>
    </div>
  );
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
    headerImageUrl: '',
    footerImageUrl: '',
  });
  const [bodyImageUrls, setBodyImageUrls] = useState<string[]>([]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const [uploadingHeader, setUploadingHeader] = useState(false);
  const [uploadingFooter, setUploadingFooter] = useState(false);
  const [uploadingBodyImage, setUploadingBodyImage] = useState(false);
  const [isDraggingHeader, setIsDraggingHeader] = useState(false);
  const [isDraggingFooter, setIsDraggingFooter] = useState(false);
  const [isDraggingBodyImage, setIsDraggingBodyImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const headerFileInputRef = useRef<HTMLInputElement>(null);
  const footerFileInputRef = useRef<HTMLInputElement>(null);
  const bodyImageFileInputRef = useRef<HTMLInputElement>(null);

  const emailPreviewHtml = useMemo(() => {
    if (!formData.message.trim() && !formData.headerImageUrl && !formData.footerImageUrl && bodyImageUrls.length === 0) {
      return '';
    }
    const [firstName, ...rest] = formData.name.trim().split(' ');
    return buildContactFormEmailHtml({
      firstName: firstName || formData.name.trim() || 'Visitor',
      lastName: rest.join(' ') || 'N/A',
      senderEmail: formData.email.trim() || 'you@example.com',
      message: formData.message.trim() || '(Your message will appear here)',
      headerImageUrl: formData.headerImageUrl,
      bodyImageUrls,
      footerImageUrl: formData.footerImageUrl,
    });
  }, [formData, bodyImageUrls]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
    if (submitStatus !== 'idle') {
      setSubmitStatus('idle');
      setSubmitMessage('');
    }
  };

  const processImageUpload = async (
    file: File,
    kind: 'header' | 'body' | 'footer'
  ) => {
    setUploadError(null);
    const setUploading =
      kind === 'header' ? setUploadingHeader : kind === 'footer' ? setUploadingFooter : setUploadingBodyImage;
    setUploading(true);
    try {
      const titles = {
        header: 'Contact Form Header Image',
        body: 'Contact Form Body Image',
        footer: 'Contact Form Footer Image',
      };
      const result = await uploadContactFormEmailImage(file, titles[kind], `Contact form ${kind} image`);
      if (kind === 'header') {
        setFormData((prev) => ({ ...prev, headerImageUrl: result.url }));
      } else if (kind === 'footer') {
        setFormData((prev) => ({ ...prev, footerImageUrl: result.url }));
      } else {
        setBodyImageUrls((prev) => (prev.includes(result.url) ? prev : [...prev, result.url]));
      }
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploading(false);
      if (kind === 'header' && headerFileInputRef.current) headerFileInputRef.current.value = '';
      if (kind === 'footer' && footerFileInputRef.current) footerFileInputRef.current.value = '';
      if (kind === 'body' && bodyImageFileInputRef.current) bodyImageFileInputRef.current.value = '';
    }
  };

  const makeDragHandlers = (
    setDragging: (v: boolean) => void,
    uploading: boolean,
    kind: 'header' | 'body' | 'footer'
  ) => ({
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!uploading) setDragging(true);
    },
    onDragLeave: (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(false);
    },
    onDrop: async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragging(false);
      if (uploading) return;
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith('image/')) {
        await processImageUpload(file, kind);
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');

    const [firstName, ...restNameParts] = formData.name.trim().split(' ');
    let lastName = restNameParts.join(' ');
    if (!lastName.trim()) {
      lastName = 'N/A';
    }

    // Send plain message + image URLs. Server composes HTML and sends via the
    // newsletter send-test pipeline so the inbox renders like the preview
    // (not escaped plain-text from /api/contact-form-email/send).
    const payload = {
      firstName: firstName || formData.name.trim(),
      lastName,
      senderEmail: formData.email.trim(),
      message: formData.message.trim(),
      headerImageUrl: formData.headerImageUrl || undefined,
      bodyImageUrls: bodyImageUrls.length > 0 ? bodyImageUrls : undefined,
      footerImageUrl: formData.footerImageUrl || undefined,
      emailType: 'CONTACT' as const,
    };

    try {
      const response = await fetch('/api/proxy/contact-form-email/send-html', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setSubmitMessage('Thank you for your message! We will get back to you soon.');
        setFormData({
          name: '',
          email: '',
          message: '',
          headerImageUrl: '',
          footerImageUrl: '',
        });
        setBodyImageUrls([]);
        setTimeout(() => {
          setSubmitStatus('idle');
          setSubmitMessage('');
        }, 5000);
      } else {
        setSubmitStatus('error');
        setSubmitMessage(data.error || 'Failed to send message. Please try again.');
        setTimeout(() => {
          setSubmitStatus('idle');
          setSubmitMessage('');
        }, 5000);
      }
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage('An error occurred. Please try again later.');
      console.error('Contact form error:', error);
      setTimeout(() => {
        setSubmitStatus('idle');
        setSubmitMessage('');
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const headerDrag = makeDragHandlers(setIsDraggingHeader, uploadingHeader, 'header');
  const bodyDrag = makeDragHandlers(setIsDraggingBodyImage, uploadingBodyImage, 'body');
  const footerDrag = makeDragHandlers(setIsDraggingFooter, uploadingFooter, 'footer');

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Sender details */}
      <div className="space-y-6">
        <div>
          <label htmlFor="name" className="block font-syro-primary font-medium text-syro-blue mb-2">
            Name <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-4 py-3 bg-input border rounded-lg font-syro-primary text-syro-blue placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-300 ${
              errors.name ? 'border-destructive' : 'border-syro-table-border'
            }`}
            placeholder="Enter your full name"
            disabled={isSubmitting}
          />
          {errors.name && (
            <p className="mt-2 inline-flex items-center gap-2 rounded-md bg-red-50 px-4 py-2 text-sm font-syro-primary text-red-700 border border-red-300">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white text-[11px] font-bold">
                !
              </span>
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block font-syro-primary font-medium text-syro-blue mb-2">
            Email Address <span className="text-destructive">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-4 py-3 bg-input border rounded-lg font-syro-primary text-syro-blue placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-300 ${
              errors.email ? 'border-destructive' : 'border-syro-table-border'
            }`}
            placeholder="Enter your email address"
            disabled={isSubmitting}
          />
          {errors.email && (
            <p className="mt-2 inline-flex items-center gap-2 rounded-md bg-red-50 px-4 py-2 text-sm font-syro-primary text-red-700 border border-red-300">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white text-[11px] font-bold">
                !
              </span>
              {errors.email}
            </p>
          )}
        </div>
      </div>

      {uploadError && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm font-syro-primary text-red-700">
          {uploadError}
        </div>
      )}

      {/* Email Header */}
      <ContactEmailSection
        step={1}
        title="Email Header"
        description="Optional banner image shown at the top of the email."
        accent="blue"
      >
        <div className="w-full flex flex-col gap-4">
          <p className="font-syro-primary text-xs text-blue-800 leading-relaxed">
            <strong>Recommended:</strong> 600 × 200 px (or 1200 × 400 px for retina). Keep important content centered.
          </p>
          {formData.headerImageUrl?.trim() ? (
            <ContactEmailImagePreview
              imageUrl={formData.headerImageUrl}
              alt="Header preview"
              label="header image"
              variant="header"
              onRemove={() => setFormData((prev) => ({ ...prev, headerImageUrl: '' }))}
            />
          ) : (
            <ImageUploadDropzone
              inputId="contact-header-image-input"
              uploading={uploadingHeader}
              isDragging={isDraggingHeader}
              emptyLabel="Click to upload or drag and drop header image"
              hasImageLabel="Click to upload or drag and drop header image"
              hasImage={false}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) await processImageUpload(file, 'header');
              }}
              fileInputRef={headerFileInputRef}
              {...headerDrag}
            />
          )}
        </div>
      </ContactEmailSection>

      {/* Email Body */}
      <ContactEmailSection
        step={2}
        title="Email Body"
        description="Your message and optional images for the center of the email."
        accent="emerald"
      >
        <div>
          <label htmlFor="message" className="block font-syro-primary font-medium text-syro-blue mb-2">
            Message <span className="text-destructive">*</span>
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={6}
            className={`w-full px-4 py-3 bg-input border rounded-lg font-syro-primary text-syro-blue placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-300 resize-none ${
              errors.message ? 'border-destructive' : 'border-syro-table-border'
            }`}
            placeholder="Enter your message"
            disabled={isSubmitting}
          />
          {errors.message && (
            <p className="mt-2 inline-flex items-center gap-2 rounded-md bg-red-50 px-4 py-2 text-sm font-syro-primary text-red-700 border border-red-300">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white text-[11px] font-bold">
                !
              </span>
              {errors.message}
            </p>
          )}
        </div>

        <div>
          <label className="block font-syro-primary font-medium text-syro-blue mb-1">
            Body Image (optional)
          </label>
          <p className="font-syro-primary text-xs text-emerald-800 mb-3">
            Upload an image to include in the email body. Recommended: 600 px wide (or 1200 px for retina).
          </p>

          {bodyImageUrls.length > 0 && (
            <div className="space-y-6 mb-4">
              {bodyImageUrls.map((url) => (
                <ContactEmailImagePreview
                  key={url}
                  imageUrl={url}
                  alt="Body image preview"
                  label="body image"
                  variant="body"
                  onRemove={() => setBodyImageUrls((prev) => prev.filter((u) => u !== url))}
                />
              ))}
            </div>
          )}

          <ImageUploadDropzone
            inputId="contact-body-image-input"
            uploading={uploadingBodyImage}
            isDragging={isDraggingBodyImage}
            emptyLabel="Click to upload or drag and drop a body image"
            hasImageLabel="Click to upload or drag and drop another body image"
            hasImage={bodyImageUrls.length > 0}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (file) await processImageUpload(file, 'body');
            }}
            fileInputRef={bodyImageFileInputRef}
            {...bodyDrag}
          />
        </div>
      </ContactEmailSection>

      {/* Email Footer */}
      <ContactEmailSection
        step={3}
        title="Email Footer"
        description="Optional closing strip image at the bottom of the email."
        accent="purple"
      >
        <div className="w-full flex flex-col gap-4">
          <p className="font-syro-primary text-xs text-purple-800 leading-relaxed">
            <strong>Recommended:</strong> 600 × 100–150 px (or 1200 × 200–300 px for retina). Use a shorter landscape strip.
          </p>
          {formData.footerImageUrl?.trim() ? (
            <ContactEmailImagePreview
              imageUrl={formData.footerImageUrl}
              alt="Footer preview"
              label="footer image"
              variant="footer"
              onRemove={() => setFormData((prev) => ({ ...prev, footerImageUrl: '' }))}
            />
          ) : (
            <ImageUploadDropzone
              inputId="contact-footer-image-input"
              uploading={uploadingFooter}
              isDragging={isDraggingFooter}
              emptyLabel="Click to upload or drag and drop footer image"
              hasImageLabel="Click to upload or drag and drop footer image"
              hasImage={false}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) await processImageUpload(file, 'footer');
              }}
              fileInputRef={footerFileInputRef}
              {...footerDrag}
            />
          )}
        </div>
      </ContactEmailSection>

      {/* Live template preview */}
      {emailPreviewHtml && (
        <div className="rounded-xl border-2 border-syro-table-border bg-syro-bg-gray/50 p-5 sm:p-6">
          <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-2">Email template preview</h3>
          <p className="font-syro-primary text-sm text-syro-dark-gray mb-4">
            This is how your message will be structured when sent (header → body → footer).
          </p>
          <div
            className="bg-white border border-syro-table-border rounded-lg p-4 overflow-x-auto max-w-[640px]"
            dangerouslySetInnerHTML={{ __html: emailPreviewHtml }}
          />
        </div>
      )}

      {/* Submit Status Message */}
      {submitStatus !== 'idle' && (
        <div
          className={`rounded-lg border px-4 py-3 shadow-syro-card-sm ${
            submitStatus === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
              : 'bg-red-50 border-red-300 text-red-700'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-syro-card-sm">
              {submitStatus === 'success' ? (
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <div>
              <p className="font-syro-display text-sm font-semibold">
                {submitStatus === 'success' ? 'Message sent successfully' : 'There was a problem sending your message'}
              </p>
              <p className="mt-1 font-syro-primary text-sm text-syro-dark-gray">{submitMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting || uploadingHeader || uploadingFooter || uploadingBodyImage}
        className="w-full bg-syro-red text-syro-red-foreground font-syro-primary font-medium px-6 py-3 rounded-lg hover:bg-syro-red/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Sending...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
            <span>Send Message</span>
          </>
        )}
      </button>
    </form>
  );
}

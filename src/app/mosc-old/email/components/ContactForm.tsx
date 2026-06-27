'use client';

import React, { useState } from 'react';
import { buildContactFormPayload } from '@/lib/contactForm';

interface FormData {
  name: string;
  email: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Message validation
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
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
    // If the user starts editing after a previous submission, clear global submit status/message
    if (submitStatus !== 'idle') {
      setSubmitStatus('idle');
      setSubmitMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');

    // Map frontend form fields to backend ContactFormDTO (from/to resolved server-side by emailType)
    const [firstName, ...restNameParts] = formData.name.trim().split(' ');
    let lastName = restNameParts.join(' ');
    // Some backends treat lastName as @NotBlank; avoid sending an empty string
    if (!lastName.trim()) {
      lastName = 'N/A';
    }

    const payload = buildContactFormPayload({
      firstName: firstName || formData.name.trim(),
      lastName: lastName || 'N/A',
      messageBody: formData.message.trim(),
      senderEmail: formData.email.trim(),
    });

    try {
      // Public MOSC contact form submission.
      // This calls our proxy API route, which forwards the request to the backend
      // `/api/contact-form-email/send` endpoint and injects the tenantId automatically.
      const response = await fetch('/api/proxy/contact-form-email', {
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
        // Clear form
        setFormData({
          name: '',
          email: '',
          message: '',
        });
        // After a short delay, reset the status so the form feels "ready" again
        setTimeout(() => {
          setSubmitStatus('idle');
          setSubmitMessage('');
        }, 5000);
      } else {
        setSubmitStatus('error');
        setSubmitMessage(data.error || 'Failed to send message. Please try again.');
        // Auto-clear the banner after a short delay so the user can try again easily
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Field */}
      <div>
        <label htmlFor="name" className="block font-body font-medium text-foreground mb-2">
          Name <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-4 py-3 bg-input border rounded-lg font-body text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 reverent-transition ${
            errors.name ? 'border-destructive' : 'border-border'
          }`}
          placeholder="Enter your full name"
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="mt-2 inline-flex items-center gap-2 rounded-md bg-red-50 px-4 py-2 text-sm font-body text-red-700 border border-red-300">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white text-[11px] font-bold">
              !
            </span>
            {errors.name}
          </p>
        )}
      </div>

      {/* Email Field */}
      <div>
        <label htmlFor="email" className="block font-body font-medium text-foreground mb-2">
          Email Address <span className="text-destructive">*</span>
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-4 py-3 bg-input border rounded-lg font-body text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 reverent-transition ${
            errors.email ? 'border-destructive' : 'border-border'
          }`}
          placeholder="Enter your email address"
          disabled={isSubmitting}
        />
        {errors.email && (
          <p className="mt-2 inline-flex items-center gap-2 rounded-md bg-red-50 px-4 py-2 text-sm font-body text-red-700 border border-red-300">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white text-[11px] font-bold">
              !
            </span>
            {errors.email}
          </p>
        )}
      </div>

      {/* Message Field */}
      <div>
        <label htmlFor="message" className="block font-body font-medium text-foreground mb-2">
          Message <span className="text-destructive">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          rows={6}
          className={`w-full px-4 py-3 bg-input border rounded-lg font-body text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 reverent-transition resize-none ${
            errors.message ? 'border-destructive' : 'border-border'
          }`}
          placeholder="Enter your message"
          disabled={isSubmitting}
        />
        {errors.message && (
          <p className="mt-2 inline-flex items-center gap-2 rounded-md bg-red-50 px-4 py-2 text-sm font-body text-red-700 border border-red-300">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white text-[11px] font-bold">
              !
            </span>
            {errors.message}
          </p>
        )}
      </div>

      {/* Submit Status Message */}
      {submitStatus !== 'idle' && (
        <div
          className={`rounded-lg border px-4 py-3 sacred-shadow-sm ${
            submitStatus === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
              : 'bg-red-50 border-red-300 text-red-700'
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 sacred-shadow-sm">
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
              <p className="font-heading text-sm font-semibold">
                {submitStatus === 'success' ? 'Message sent successfully' : 'There was a problem sending your message'}
              </p>
              <p className="mt-1 font-body text-sm text-muted-foreground">{submitMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary text-primary-foreground font-body font-medium px-6 py-3 rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 reverent-transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Sending...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <span>Send Message</span>
          </>
        )}
      </button>
    </form>
  );
}



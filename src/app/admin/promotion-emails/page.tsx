'use client';

import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import type {
  PromotionEmailTemplateDTO,
  EventDetailsDTO,
} from '@/types';
import AdminNavigation from '@/components/AdminNavigation';
import SaveStatusDialog, { type SaveStatus } from '@/components/SaveStatusDialog';
import PromotionEmailTemplateList from './components/PromotionEmailTemplateList';
import PromotionEmailTemplateCreateForm from './components/PromotionEmailTemplateCreateForm';
import PromotionEmailHistory from './components/PromotionEmailHistory';
import { FaPlus, FaHistory, FaEnvelope, FaBan, FaSave, FaUsers } from 'react-icons/fa';
import {
  fetchPromotionEmailTemplatesServer,
  sendTestEmailServer,
  sendBulkEmailServer,
  sendBulkEmailToSubscribedMembersServer,
} from './ApiServerActions';
import { fetchEventsFilteredServer } from '@/app/admin/ApiServerActions';

type ViewMode = 'list' | 'form' | 'history';

export default function PromotionEmailsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [events, setEvents] = useState<EventDetailsDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showTestEmailDialog, setShowTestEmailDialog] = useState(false);
  const [showBulkEmailDialog, setShowBulkEmailDialog] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PromotionEmailTemplateDTO | null>(null);
  const [testEmailRecipient, setTestEmailRecipient] = useState('');
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [sendingBulkEmail, setSendingBulkEmail] = useState(false);
  const [sendingToSubscribed, setSendingToSubscribed] = useState(false);
  const [showSubscribedEmailDialog, setShowSubscribedEmailDialog] = useState(false);
  const [emailSendStatus, setEmailSendStatus] = useState<SaveStatus>('idle');
  const [emailSendMessage, setEmailSendMessage] = useState<string>('');

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const result = await fetchEventsFilteredServer({
        pageNum: 0,
        pageSize: 100,
        sort: 'startDate,desc',
      });
      setEvents(result.events);
    } catch (err: any) {
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setViewMode('form');
    setError(null);
    setSuccessMessage(null);
  };

  const handleEdit = (template: PromotionEmailTemplateDTO) => {
    if (template.id) {
      window.location.href = `/admin/promotion-emails/${template.id}`;
    }
  };

  const handleDuplicate = async (template: PromotionEmailTemplateDTO) => {
    try {
      setError(null);
      // Create a new template with duplicated data
      const formData = {
        eventId: template.eventId,
        templateName: `${template.templateName} (Copy)`,
        subject: template.subject,
        fromEmail: template.fromEmail || '', // CRITICAL: Include fromEmail when duplicating
        bodyHtml: template.bodyHtml,
        headerImageUrl: template.headerImageUrl || '',
        footerImageUrl: template.footerImageUrl || '',
        discountCodeId: template.discountCodeId,
        isActive: template.isActive !== undefined ? template.isActive : true,
      };
      const { createPromotionEmailTemplateServer } = await import('./ApiServerActions');
      const created = await createPromotionEmailTemplateServer(formData);
      if (created.id) {
        setSuccessMessage('Template duplicated successfully!');
        setRefreshKey(prev => prev + 1);
        setTimeout(() => {
          window.location.href = `/admin/promotion-emails/${created.id}`;
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to duplicate template');
    }
  };

  const handleSendTest = (template: PromotionEmailTemplateDTO) => {
    if (!template.id) return;
    setSelectedTemplate(template);
    setTestEmailRecipient('');
    setShowTestEmailDialog(true);
  };

  const handleConfirmTestEmail = async () => {
    if (!selectedTemplate?.id) {
      setError('Template not selected');
      return;
    }

    if (!testEmailRecipient.trim()) {
      setError('Please enter a valid email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(testEmailRecipient.trim())) {
      setError('Please enter a valid email address');
      return;
    }

    // Prevent multiple simultaneous sends
    if (sendingTestEmail) {
      return;
    }

    setSendingTestEmail(true);
    setError(null);
    setEmailSendStatus('saving');
    setEmailSendMessage('Sending test email...');

    try {
      await sendTestEmailServer(selectedTemplate.id, testEmailRecipient.trim());
      setShowTestEmailDialog(false);

      // Show success dialog
      setEmailSendStatus('success');
      setEmailSendMessage(`Test email sent successfully to ${testEmailRecipient.trim()}`);
      // Note: Title will be set in SaveStatusDialog component via title prop

      // Clear after showing success
      setTimeout(() => {
        setEmailSendStatus('idle');
        setEmailSendMessage('');
        setTestEmailRecipient('');
        setSelectedTemplate(null);
      }, 2000);
    } catch (err: any) {
      setEmailSendStatus('error');
      const errorMessage = err.message || 'Failed to send test email';
      setEmailSendMessage(errorMessage);
      setError(errorMessage);
    } finally {
      setSendingTestEmail(false);
    }
  };

  const handleSendBulk = (template: PromotionEmailTemplateDTO) => {
    if (!template.id) return;
    setSelectedTemplate(template);
    setShowBulkEmailDialog(true);
  };

  const handleConfirmBulkEmail = async () => {
    if (!selectedTemplate?.id) return;

    setSendingBulkEmail(true);
    setError(null);
    setEmailSendStatus('saving');
    setEmailSendMessage('Sending bulk email...');

    try {
      const result = await sendBulkEmailServer(selectedTemplate.id);
      setShowBulkEmailDialog(false);

      // Show success dialog
      setEmailSendStatus('success');
      setEmailSendMessage(
        `Bulk email sent successfully! Sent: ${result.sentCount}, Failed: ${result.failedCount}`
      );

      // Clear after showing success
      setTimeout(() => {
        setEmailSendStatus('idle');
        setEmailSendMessage('');
        setSelectedTemplate(null);
      }, 2000);
    } catch (err: any) {
      setEmailSendStatus('error');
      const errorMessage = err.message || 'Failed to send bulk email';
      setEmailSendMessage(errorMessage);
      setError(errorMessage);
    } finally {
      setSendingBulkEmail(false);
    }
  };

  const handleSendToSubscribed = (template: PromotionEmailTemplateDTO) => {
    if (!template.id) return;
    setSelectedTemplate(template);
    setShowSubscribedEmailDialog(true);
  };

  const handleConfirmSendToSubscribed = async () => {
    if (!selectedTemplate?.id) return;

    setSendingToSubscribed(true);
    setError(null);
    setEmailSendStatus('saving');
    setEmailSendMessage('Sending email to all subscribed members...');

    try {
      const result = await sendBulkEmailToSubscribedMembersServer(selectedTemplate.id);
      setShowSubscribedEmailDialog(false);

      // Show success dialog
      setEmailSendStatus('success');
      setEmailSendMessage(
        `Email sent successfully to all subscribed members!${result.sentCount !== undefined ? ` Sent: ${result.sentCount}` : ''}${result.failedCount !== undefined ? `, Failed: ${result.failedCount}` : ''}`
      );

      // Clear after showing success
      setTimeout(() => {
        setEmailSendStatus('idle');
        setEmailSendMessage('');
        setSelectedTemplate(null);
      }, 2000);
    } catch (err: any) {
      setEmailSendStatus('error');
      const errorMessage = err.message || 'Failed to send email to subscribed members';
      setEmailSendMessage(errorMessage);
      setError(errorMessage);
    } finally {
      setSendingToSubscribed(false);
    }
  };

  const handleFormSave = (templateId: number) => {
    setViewMode('list');
    setRefreshKey(prev => prev + 1); // Force list refresh
    setSuccessMessage('Template created successfully!');
    setTimeout(() => {
      setSuccessMessage(null);
      // Navigate to edit page for image uploads
      window.location.href = `/admin/promotion-emails/${templateId}`;
    }, 1500);
  };

  const handleFormCancel = () => {
    setViewMode('list');
  };

  if (loading) {
    return (
      <div className="w-full overflow-x-hidden box-border" style={{ paddingTop: '120px' }}>
        {/* Navigation Section Skeleton */}
        <div className="w-full px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 mb-6 sm:mb-8">
          <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-4 lg:gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-200 rounded-lg h-24 animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
        {/* Main Content Section Skeleton */}
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8">
          <div className="text-center py-8">
            <div className="text-gray-500">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-hidden box-border" style={{ paddingTop: '120px' }}>
      {/* Navigation Section - Full Width, Separate Responsive Container */}
      <div className="w-full px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 mb-6 sm:mb-8">
        <AdminNavigation />
      </div>
      {/* Main Content Section - Constrained Width */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white text-center sm:text-left">
              Promotional Emails for Events
            </h1>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <button
              onClick={() => setViewMode('history')}
              className="flex-shrink-0 h-12 sm:h-14 rounded-xl bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center gap-2 sm:gap-3 transition-all duration-300 hover:scale-105 px-3 sm:px-6"
              title="Email History"
              aria-label="Email History"
              type="button"
            >
              <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-indigo-200 flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="font-semibold text-indigo-700 text-xs sm:text-sm lg:text-base whitespace-nowrap">Email History</span>
            </button>
            {viewMode !== 'form' && (
              <button
                onClick={handleCreateNew}
                className="flex-shrink-0 h-12 sm:h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center gap-2 sm:gap-3 transition-all duration-300 hover:scale-105 px-3 sm:px-6"
                title="Create New Template"
                aria-label="Create New Template"
                type="button"
              >
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-green-200 flex items-center justify-center">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="font-semibold text-green-700 text-xs sm:text-sm lg:text-base whitespace-nowrap">Create New Template</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {successMessage}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        </div>
      )}

      {viewMode === 'form' && (
        <PromotionEmailTemplateCreateForm
          onSave={handleFormSave}
          onCancel={handleFormCancel}
        />
      )}

      {viewMode === 'list' && (
        <PromotionEmailTemplateList
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onSendTest={handleSendTest}
          onSendBulk={handleSendBulk}
          onSendToSubscribed={handleSendToSubscribed}
          events={events}
          refreshKey={refreshKey}
        />
      )}

      {viewMode === 'history' && (
        <PromotionEmailHistory events={events} />
      )}

      {/* Test Email Dialog */}
      {showTestEmailDialog && selectedTemplate && (
        <TestEmailDialog
          isOpen={showTestEmailDialog}
          onClose={() => {
            if (!sendingTestEmail) {
              setShowTestEmailDialog(false);
              setTestEmailRecipient('');
              setSelectedTemplate(null);
              setError(null);
            }
          }}
          templateName={selectedTemplate.templateName}
          recipientEmail={testEmailRecipient}
          onRecipientChange={setTestEmailRecipient}
          onConfirm={handleConfirmTestEmail}
          sending={sendingTestEmail}
          error={error}
        />
      )}

      {/* Bulk Email Confirmation Dialog */}
      {showBulkEmailDialog && selectedTemplate && (
        <BulkEmailDialog
          isOpen={showBulkEmailDialog}
          onClose={() => {
            setShowBulkEmailDialog(false);
            setSelectedTemplate(null);
            setError(null);
          }}
          templateName={selectedTemplate.templateName}
          onConfirm={handleConfirmBulkEmail}
          sending={sendingBulkEmail}
        />
      )}

      {/* Send to Subscribed Members Confirmation Dialog */}
      {showSubscribedEmailDialog && selectedTemplate && (
        <SubscribedEmailDialog
          isOpen={showSubscribedEmailDialog}
          onClose={() => {
            if (!sendingToSubscribed) {
              setShowSubscribedEmailDialog(false);
              setSelectedTemplate(null);
              setError(null);
            }
          }}
          templateName={selectedTemplate.templateName}
          onConfirm={handleConfirmSendToSubscribed}
          sending={sendingToSubscribed}
        />
      )}

      {/* Email Send Status Dialog */}
      <SaveStatusDialog
        isOpen={emailSendStatus !== 'idle'}
        status={emailSendStatus}
        message={emailSendMessage}
        title={
          emailSendStatus === 'success'
            ? 'Send Successfully!'
            : emailSendStatus === 'saving'
            ? 'Sending...'
            : emailSendStatus === 'error'
            ? 'Send Failed'
            : undefined
        }
        onClose={() => {
          if (emailSendStatus === 'error') {
            setEmailSendStatus('idle');
            setEmailSendMessage('');
          }
        }}
      />
      </div>
    </div>
  );
}

// Test Email Dialog Component
function TestEmailDialog({
  isOpen,
  onClose,
  templateName,
  recipientEmail,
  onRecipientChange,
  onConfirm,
  sending,
  error,
}: {
  isOpen: boolean;
  onClose: () => void;
  templateName: string;
  recipientEmail: string;
  onRecipientChange: (email: string) => void;
  onConfirm: () => void;
  sending: boolean;
  error?: string | null;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure dialog is fully rendered
      const timer = setTimeout(() => {
        setIsMounted(true);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setIsMounted(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    // Prevent closing during send operation or before mount
    if (sending || !isMounted) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    // Only close if clicking directly on backdrop, not on modal content
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirmClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!sending && isMounted && recipientEmail.trim()) {
      onConfirm();
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 min-w-[400px] max-w-md w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white font-bold text-xl w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
          onClick={onClose}
          aria-label="Close"
          disabled={sending}
        >
          &times;
        </button>

        <h2 className="text-xl font-semibold mb-6 pr-8">Send Test Email</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Name
            </label>
            <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900">
              {templateName}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={recipientEmail}
              onChange={(e) => onRecipientChange(e.target.value)}
              placeholder="Enter email address"
              disabled={sending}
              className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-2 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter' && recipientEmail.trim() && !sending) {
                  e.preventDefault();
                  onConfirm();
                }
              }}
            />
            {error && (
              <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
                {error}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              disabled={sending}
              className="flex-shrink-0 h-14 rounded-xl bg-teal-100 hover:bg-teal-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6 disabled:bg-teal-100 disabled:border-teal-300 disabled:text-teal-500 disabled:cursor-not-allowed disabled:hover:scale-100"
              title="Cancel"
              aria-label="Cancel"
              type="button"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-teal-200 flex items-center justify-center">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <span className="font-semibold text-teal-700">Cancel</span>
            </button>
            <button
              type="button"
              onClick={handleConfirmClick}
              disabled={sending || !recipientEmail.trim() || !isMounted}
              className="flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6 disabled:bg-blue-100 disabled:border-blue-300 disabled:text-blue-500 disabled:cursor-not-allowed disabled:hover:scale-100"
              title="Send Test Email"
              aria-label="Send Test Email"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="font-semibold text-blue-700">{sending ? 'Sending...' : 'Send Test Email'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof window !== 'undefined' ? ReactDOM.createPortal(modalContent, document.body) : null;
}

// Bulk Email Confirmation Dialog Component
function BulkEmailDialog({
  isOpen,
  onClose,
  templateName,
  onConfirm,
  sending,
}: {
  isOpen: boolean;
  onClose: () => void;
  templateName: string;
  onConfirm: () => void;
  sending: boolean;
}) {
  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 min-w-[400px] max-w-md w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white font-bold text-xl w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
          onClick={onClose}
          aria-label="Close"
          disabled={sending}
        >
          &times;
        </button>

        <h2 className="text-xl font-semibold mb-6 pr-8">Send Bulk Email</h2>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
              ⚠️
            </div>
            <div className="flex-1">
              <p className="text-gray-700 font-medium mb-2">
                Are you sure you want to send bulk email using template:
              </p>
              <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-semibold">
                {templateName}
              </div>
              <p className="text-sm text-gray-600 mt-3">
                This will send promotional emails to all eligible recipients. This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              disabled={sending}
              className="flex-shrink-0 h-14 rounded-xl bg-teal-100 hover:bg-teal-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6 disabled:bg-teal-100 disabled:border-teal-300 disabled:text-teal-500 disabled:cursor-not-allowed disabled:hover:scale-100"
              title="Cancel"
              aria-label="Cancel"
              type="button"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-teal-200 flex items-center justify-center">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <span className="font-semibold text-teal-700">Cancel</span>
            </button>
            <button
              onClick={onConfirm}
              disabled={sending}
              className="flex-shrink-0 h-14 rounded-xl bg-yellow-100 hover:bg-yellow-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6 disabled:bg-yellow-100 disabled:border-yellow-300 disabled:text-yellow-500 disabled:cursor-not-allowed disabled:hover:scale-100"
              title="Confirm & Send"
              aria-label="Confirm & Send"
              type="button"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-yellow-200 flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="font-semibold text-yellow-700">{sending ? 'Sending...' : 'Confirm & Send'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof window !== 'undefined' ? ReactDOM.createPortal(modalContent, document.body) : null;
}

// Send to Subscribed Members Confirmation Dialog Component
function SubscribedEmailDialog({
  isOpen,
  onClose,
  templateName,
  onConfirm,
  sending,
}: {
  isOpen: boolean;
  onClose: () => void;
  templateName: string;
  onConfirm: () => void;
  sending: boolean;
}) {
  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl p-6 min-w-[400px] max-w-md w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 bg-red-500 hover:bg-red-600 text-white font-bold text-xl w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110"
          onClick={onClose}
          aria-label="Close"
          disabled={sending}
        >
          &times;
        </button>

        <h2 className="text-xl font-semibold mb-6 pr-8">Send to All Subscribed Members</h2>

        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <FaUsers className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-gray-700 font-medium mb-2">
                Are you sure you want to send this email to all subscribed members using template:
              </p>
              <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 font-semibold">
                {templateName}
              </div>
              <p className="text-sm text-gray-600 mt-3">
                This will send promotional emails to all members who have subscribed to receive emails. This action cannot be undone.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              disabled={sending}
              className="bg-teal-100 hover:bg-teal-200 text-teal-800 px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaBan />
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={sending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaUsers />
              {sending ? 'Sending...' : 'Confirm & Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof window !== 'undefined' ? ReactDOM.createPortal(modalContent, document.body) : null;
}

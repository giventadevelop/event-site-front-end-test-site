"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { flushSync } from 'react-dom';
import {
  fetchManualPaymentByIdServer,
  updateManualPaymentServer,
  updateManualPaymentStatusServer,
} from '../ApiServerActions';
import type { ManualPaymentRequestDTO, ManualPaymentStatus, ManualPaymentMethodType } from '@/types';
import {
  FaSpinner,
  FaCheckCircle,
  FaTimesCircle,
  FaBan,
  FaEdit,
  FaSave,
  FaArrowLeft,
  FaExclamationTriangle,
  FaDownload,
  FaUndo,
} from 'react-icons/fa';

interface ManualPaymentDetailClientProps {
  initialPayment: ManualPaymentRequestDTO | null;
  initialError?: string | null;
}

export default function ManualPaymentDetailClient({
  initialPayment,
  initialError = null,
}: ManualPaymentDetailClientProps) {
  const router = useRouter();
  const [payment, setPayment] = useState<ManualPaymentRequestDTO | null>(initialPayment);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(initialError);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<ManualPaymentRequestDTO>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showErrors, setShowErrors] = useState(false);
  const fieldRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>>({});

  // Initialize form data when payment loads
  useEffect(() => {
    if (payment) {
      setFormData({
        amountDue: payment.amountDue,
        manualPaymentMethodType: payment.manualPaymentMethodType,
        paymentHandle: payment.paymentHandle || '',
        paymentInstructions: payment.paymentInstructions || '',
        requesterEmail: payment.requesterEmail || '',
        requesterName: payment.requesterName || '',
        requesterPhone: payment.requesterPhone || '',
        voidReason: payment.voidReason || '',
      });
    }
  }, [payment]);

  const loadPayment = async () => {
    if (!payment?.id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchManualPaymentByIdServer(payment.id);
      if (data) {
        setPayment(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load payment');
    } finally {
      setLoading(false);
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!formData.amountDue || formData.amountDue <= 0) {
      errs.amountDue = 'Amount must be greater than zero';
    }

    if (!formData.manualPaymentMethodType) {
      errs.manualPaymentMethodType = 'Payment method is required';
    }

    if (formData.requesterEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.requesterEmail.trim())) {
      errs.requesterEmail = 'Please enter a valid email address';
    }

    const hasErrors = Object.keys(errs).length > 0;
    if (hasErrors) {
      flushSync(() => {
        setErrors(errs);
        setShowErrors(true);
      });
      scrollToFirstError(errs);
    } else {
      setErrors({});
      setShowErrors(false);
    }
    return !hasErrors;
  };

  const scrollToFirstError = (errorObj?: Record<string, string>) => {
    const errorsToUse = errorObj || errors;
    const firstErrorField = Object.keys(errorsToUse)[0];
    if (firstErrorField && fieldRefs.current[firstErrorField]) {
      const field = fieldRefs.current[firstErrorField];
      field.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest',
      });
      setTimeout(() => {
        if (fieldRefs.current[firstErrorField]) {
          fieldRefs.current[firstErrorField]?.focus();
        }
      }, 100);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value || '',
    }));
  };

  const handleSave = async () => {
    if (!payment?.id) return;

    const isValid = validate();
    if (!isValid) {
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const updated = await updateManualPaymentServer(payment.id, formData);
      setPayment(updated);
      setIsEditing(false);
      setShowErrors(false);
      setErrors({});
    } catch (err: any) {
      setError(err.message || 'Failed to update payment');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (
    newStatus: ManualPaymentStatus,
    voidReason?: string
  ) => {
    if (!payment?.id) return;

    const statusMessages: Record<ManualPaymentStatus, string> = {
      REQUESTED: 'Are you sure you want to reset this payment to REQUESTED?',
      RECEIVED: 'Are you sure you want to mark this payment as RECEIVED?',
      VOIDED: 'Are you sure you want to void this payment?',
      CANCELLED: 'Are you sure you want to cancel this payment?',
    };

    if (!confirm(statusMessages[newStatus])) {
      return;
    }

    setStatusUpdateLoading(true);
    setStatusUpdateError(null);
    try {
      const updated = await updateManualPaymentStatusServer(
        payment.id,
        newStatus,
        undefined,
        voidReason
      );
      setPayment(updated);
      // Reload to get latest data
      await loadPayment();
    } catch (err: any) {
      setStatusUpdateError(err.message || 'Failed to update status');
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setShowErrors(false);
    setErrors({});
    // Reset form data to original payment values
    if (payment) {
      setFormData({
        amountDue: payment.amountDue,
        manualPaymentMethodType: payment.manualPaymentMethodType,
        paymentHandle: payment.paymentHandle || '',
        paymentInstructions: payment.paymentInstructions || '',
        requesterEmail: payment.requesterEmail || '',
        requesterName: payment.requesterName || '',
        requesterPhone: payment.requesterPhone || '',
        voidReason: payment.voidReason || '',
      });
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'RECEIVED':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'VOIDED':
      case 'CANCELLED':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'REQUESTED':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const getMethodDisplayName = (method: string) => {
    const methodMap: Record<string, string> = {
      ZELLE_MANUAL: 'Zelle',
      VENMO_MANUAL: 'Venmo',
      CASH_APP_MANUAL: 'Cash App',
      PAYPAL_MANUAL: 'PayPal',
      APPLE_PAY_MANUAL: 'Apple Pay',
      GOOGLE_PAY_MANUAL: 'Google Pay',
      CASH: 'Cash',
      CHECK: 'Check',
      WIRE_TRANSFER_MANUAL: 'Wire Transfer',
      ACH_MANUAL: 'ACH',
      OTHER_MANUAL: 'Other',
    };
    return methodMap[method] || method;
  };

  const getAvailableStatusTransitions = (currentStatus: ManualPaymentStatus): ManualPaymentStatus[] => {
    switch (currentStatus) {
      case 'REQUESTED':
        return ['RECEIVED', 'CANCELLED', 'VOIDED'];
      case 'RECEIVED':
        return ['REQUESTED', 'VOIDED', 'CANCELLED'];
      case 'VOIDED':
        return ['REQUESTED'];
      case 'CANCELLED':
        return ['REQUESTED'];
      default:
        return [];
    }
  };

  if (!payment) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Payment not found</p>
        <Link
          href="/admin/manual-payments"
          className="mt-4 inline-block px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg transition-colors"
        >
          Back to Manual Payments
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/manual-payments"
            className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
            title="Back to Manual Payments"
            aria-label="Back to Manual Payments"
          >
            <FaArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Manual Payment Request #{payment.id}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {payment.eventId && (
                <Link
                  href={`/admin/events/${payment.eventId}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Event ID: {payment.eventId}
                </Link>
              )}
            </p>
          </div>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
            title="Edit Payment"
            aria-label="Edit Payment"
            type="button"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
              <FaEdit className="w-6 h-6 text-blue-600" />
            </div>
            <span className="font-semibold text-blue-700">Edit Payment</span>
          </button>
        )}
      </div>

      {/* Error Display */}
      {(error || statusUpdateError) && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 font-semibold mb-1">Error</p>
              <p className="text-sm text-red-700">{error || statusUpdateError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Summary Box */}
      {showErrors && Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Please fix the following {Object.keys(errors).length} error{Object.keys(errors).length !== 1 ? 's' : ''}:
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc pl-5 space-y-1">
                  {Object.entries(errors).map(([fieldName, errorMessage]) => (
                    <li key={fieldName}>
                      <span className="font-medium capitalize">
                        {fieldName.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>{' '}
                      {errorMessage}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Section */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Status</h2>
          {isEditing && (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                type="button"
              >
                {saving ? (
                  <FaSpinner className="w-4 h-4 animate-spin" />
                ) : (
                  <FaSave className="w-4 h-4" />
                )}
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Current Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
            <span
              className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStatusBadgeColor(
                payment.status
              )}`}
            >
              {payment.status}
            </span>
          </div>

          {/* Status Transitions */}
          {!isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Change Status</label>
              <div className="flex flex-wrap gap-2">
                {getAvailableStatusTransitions(payment.status as ManualPaymentStatus).map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      if (status === 'VOIDED' || status === 'CANCELLED') {
                        const reason = prompt(
                          `Enter ${status.toLowerCase()} reason (optional):`
                        );
                        handleStatusUpdate(status, reason || undefined);
                      } else {
                        handleStatusUpdate(status);
                      }
                    }}
                    disabled={statusUpdateLoading}
                    className={`px-4 py-2 font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                      status === 'RECEIVED'
                        ? 'bg-green-100 hover:bg-green-200 text-green-700'
                        : status === 'REQUESTED'
                        ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'
                        : 'bg-red-100 hover:bg-red-200 text-red-700'
                    }`}
                    type="button"
                  >
                    {statusUpdateLoading ? (
                      <FaSpinner className="w-4 h-4 animate-spin" />
                    ) : status === 'RECEIVED' ? (
                      <FaCheckCircle className="w-4 h-4" />
                    ) : status === 'VOIDED' || status === 'CANCELLED' ? (
                      <FaBan className="w-4 h-4" />
                    ) : (
                      <FaUndo className="w-4 h-4" />
                    )}
                    {status === 'RECEIVED' && 'Mark as Received'}
                    {status === 'REQUESTED' && 'Reset to Requested'}
                    {status === 'VOIDED' && 'Void Payment'}
                    {status === 'CANCELLED' && 'Cancel Payment'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Status Info */}
          {payment.receivedAt && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Received At</label>
              <p className="text-sm text-gray-600">
                {new Date(payment.receivedAt).toLocaleString()}
                {payment.receivedBy && ` by ${payment.receivedBy}`}
              </p>
            </div>
          )}

          {payment.voidReason && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Void/Cancel Reason</label>
              <p className="text-sm text-gray-600">{payment.voidReason}</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Details Section */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Amount Due */}
          <div>
            <label htmlFor="amountDue" className="block text-sm font-medium text-gray-700 mb-2">
              Amount Due <span className="text-red-500">*</span>
            </label>
            {isEditing ? (
              <>
                <input
                  ref={(el) => {
                    if (el) fieldRefs.current.amountDue = el;
                  }}
                  type="number"
                  id="amountDue"
                  name="amountDue"
                  value={formData.amountDue || ''}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className={`mt-1 block w-full border rounded-xl focus:ring-blue-500 px-4 py-3 text-base ${
                    errors.amountDue
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-400 focus:border-blue-500'
                  }`}
                />
                {errors.amountDue && (
                  <div className="text-red-500 text-sm mt-1">{errors.amountDue}</div>
                )}
              </>
            ) : (
              <p className="text-lg font-semibold text-gray-900">
                ${(payment.amountDue || 0).toFixed(2)}
              </p>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label htmlFor="manualPaymentMethodType" className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method <span className="text-red-500">*</span>
            </label>
            {isEditing ? (
              <>
                <select
                  ref={(el) => {
                    if (el) fieldRefs.current.manualPaymentMethodType = el;
                  }}
                  id="manualPaymentMethodType"
                  name="manualPaymentMethodType"
                  value={formData.manualPaymentMethodType || ''}
                  onChange={handleChange}
                  className={`mt-1 block w-full border rounded-xl focus:ring-blue-500 px-4 py-3 text-base ${
                    errors.manualPaymentMethodType
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-400 focus:border-blue-500'
                  }`}
                >
                  <option value="">Select Payment Method</option>
                  <option value="ZELLE_MANUAL">Zelle</option>
                  <option value="VENMO_MANUAL">Venmo</option>
                  <option value="CASH_APP_MANUAL">Cash App</option>
                  <option value="PAYPAL_MANUAL">PayPal</option>
                  <option value="APPLE_PAY_MANUAL">Apple Pay</option>
                  <option value="GOOGLE_PAY_MANUAL">Google Pay</option>
                  <option value="CASH">Cash</option>
                  <option value="CHECK">Check</option>
                  <option value="WIRE_TRANSFER_MANUAL">Wire Transfer</option>
                  <option value="ACH_MANUAL">ACH</option>
                  <option value="OTHER_MANUAL">Other</option>
                </select>
                {errors.manualPaymentMethodType && (
                  <div className="text-red-500 text-sm mt-1">{errors.manualPaymentMethodType}</div>
                )}
              </>
            ) : (
              <p className="text-lg font-semibold text-gray-900">
                {getMethodDisplayName(payment.manualPaymentMethodType)}
              </p>
            )}
          </div>

          {/* Payment Handle */}
          <div>
            <label htmlFor="paymentHandle" className="block text-sm font-medium text-gray-700 mb-2">
              Payment Handle
            </label>
            {isEditing ? (
              <input
                ref={(el) => {
                  if (el) fieldRefs.current.paymentHandle = el;
                }}
                type="text"
                id="paymentHandle"
                name="paymentHandle"
                value={formData.paymentHandle || ''}
                onChange={handleChange}
                placeholder="e.g., @username, phone number, email"
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
              />
            ) : (
              <p className="text-sm text-gray-600">{payment.paymentHandle || '-'}</p>
            )}
          </div>

          {/* Payment Instructions */}
          <div className="md:col-span-2">
            <label htmlFor="paymentInstructions" className="block text-sm font-medium text-gray-700 mb-2">
              Payment Instructions
            </label>
            {isEditing ? (
              <textarea
                ref={(el) => {
                  if (el) fieldRefs.current.paymentInstructions = el;
                }}
                id="paymentInstructions"
                name="paymentInstructions"
                value={formData.paymentInstructions || ''}
                onChange={handleChange}
                rows={3}
                placeholder="Payment instructions or notes"
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
              />
            ) : (
              <p className="text-sm text-gray-600 whitespace-pre-wrap">
                {payment.paymentInstructions || '-'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Requester Information Section */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Requester Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Requester Email */}
          <div>
            <label htmlFor="requesterEmail" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            {isEditing ? (
              <>
                <input
                  ref={(el) => {
                    if (el) fieldRefs.current.requesterEmail = el;
                  }}
                  type="email"
                  id="requesterEmail"
                  name="requesterEmail"
                  value={formData.requesterEmail || ''}
                  onChange={handleChange}
                  placeholder="requester@example.com"
                  className={`mt-1 block w-full border rounded-xl focus:ring-blue-500 px-4 py-3 text-base ${
                    errors.requesterEmail
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                      : 'border-gray-400 focus:border-blue-500'
                  }`}
                />
                {errors.requesterEmail && (
                  <div className="text-red-500 text-sm mt-1">{errors.requesterEmail}</div>
                )}
              </>
            ) : (
              <p className="text-sm text-gray-600">{payment.requesterEmail || '-'}</p>
            )}
          </div>

          {/* Requester Name */}
          <div>
            <label htmlFor="requesterName" className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            {isEditing ? (
              <input
                ref={(el) => {
                  if (el) fieldRefs.current.requesterName = el;
                }}
                type="text"
                id="requesterName"
                name="requesterName"
                value={formData.requesterName || ''}
                onChange={handleChange}
                placeholder="Full name"
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
              />
            ) : (
              <p className="text-sm text-gray-600">{payment.requesterName || '-'}</p>
            )}
          </div>

          {/* Requester Phone */}
          <div>
            <label htmlFor="requesterPhone" className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            {isEditing ? (
              <input
                ref={(el) => {
                  if (el) fieldRefs.current.requesterPhone = el;
                }}
                type="tel"
                id="requesterPhone"
                name="requesterPhone"
                value={formData.requesterPhone || ''}
                onChange={handleChange}
                placeholder="Phone number"
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
              />
            ) : (
              <p className="text-sm text-gray-600">{payment.requesterPhone || '-'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Additional Information Section */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ticket Transaction ID */}
          {payment.ticketTransactionId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ticket Transaction ID
              </label>
              <Link
                href={`/admin/sales-analytics?eventId=${payment.eventId}`}
                className="text-blue-600 hover:text-blue-800 font-semibold"
              >
                #{payment.ticketTransactionId}
              </Link>
            </div>
          )}

          {/* Proof of Payment */}
          {payment.proofOfPaymentFileUrl && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proof of Payment
              </label>
              <a
                href={payment.proofOfPaymentFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg transition-colors"
              >
                <FaDownload className="w-4 h-4" />
                View Proof
              </a>
            </div>
          )}

          {/* Created At */}
          {payment.createdAt && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Created At</label>
              <p className="text-sm text-gray-600">
                {new Date(payment.createdAt).toLocaleString()}
              </p>
            </div>
          )}

          {/* Updated At */}
          {payment.updatedAt && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
              <p className="text-sm text-gray-600">
                {new Date(payment.updatedAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

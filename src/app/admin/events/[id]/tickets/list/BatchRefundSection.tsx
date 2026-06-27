'use client';

import React, { useState } from 'react';
import { FaSync, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { triggerStripeTicketBatchRefundServer, type StripeTicketBatchRefundRequest, type StripeTicketBatchRefundResponse } from './ApiServerActions';

interface BatchRefundSectionProps {
  eventId: number;
}

export default function BatchRefundSection({ eventId }: BatchRefundSectionProps) {
  const [showBatchRefundSection, setShowBatchRefundSection] = useState(false);
  const [batchRefundLoading, setBatchRefundLoading] = useState(false);
  const [batchRefundSuccess, setBatchRefundSuccess] = useState(false);
  const [batchRefundError, setBatchRefundError] = useState<string | null>(null);
  const [batchRefundResponse, setBatchRefundResponse] = useState<StripeTicketBatchRefundResponse | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleTriggerBatchRefund = async () => {
    setBatchRefundLoading(true);
    setBatchRefundError(null);
    setBatchRefundSuccess(false);
    setBatchRefundResponse(null);

    try {
      // Prepare request payload with eventId from URL params
      const request: StripeTicketBatchRefundRequest = {
        eventId: eventId,
      };

      // Trigger batch refund job
      const response = await triggerStripeTicketBatchRefundServer(request);

      setBatchRefundResponse(response);
      setBatchRefundSuccess(true);
      setShowConfirmDialog(false);
    } catch (err: any) {
      console.error('[BatchRefundSection] Batch refund error:', err);
      setBatchRefundError(err.message || 'Failed to trigger batch refund job. Please try again.');
      setShowConfirmDialog(false);
    } finally {
      setBatchRefundLoading(false);
    }
  };

  return (
    <>
      {/* Batch Refund Section Container */}
      <div className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Stripe Ticket Batch Refund
          </h3>
          <button
            onClick={() => setShowBatchRefundSection(!showBatchRefundSection)}
            className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg transition-colors flex items-center gap-2"
            type="button"
          >
            <FaSync className="w-4 h-4" />
            {showBatchRefundSection ? 'Hide' : 'Show'} Batch Refund Options
          </button>
        </div>

        {/* Batch Refund Section Content */}
        {showBatchRefundSection && (
          <div className="space-y-4">
            {/* Information Banner */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 mb-2">
                This batch job will refund all eligible Stripe tickets for this event. The job runs asynchronously in the background and will return a job ID when started.
              </p>
              <p className="text-sm text-blue-700 font-semibold">
                ⚠️ Only tickets with Stripe payments (not manual payments) will be refunded.
              </p>
            </div>

            {/* Eligibility Summary (Optional - can be enhanced with backend count) */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                <strong>Eligibility Criteria:</strong> Tickets with Stripe payments that are not already refunded.
              </p>
            </div>

            {/* Success Message */}
            {batchRefundSuccess && batchRefundResponse && (
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FaCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-green-800 font-semibold mb-2">Batch refund job started successfully!</p>
                    <div className="text-sm text-green-700 space-y-1">
                      <p><strong>Job ID:</strong> {batchRefundResponse.jobId}</p>
                      <p><strong>Status:</strong> {batchRefundResponse.status}</p>
                      {batchRefundResponse.estimatedRecords !== null && (
                        <p><strong>Estimated Records:</strong> {batchRefundResponse.estimatedRecords}</p>
                      )}
                      {batchRefundResponse.estimatedCompletionTime && (
                        <p><strong>Estimated Completion:</strong> {new Date(batchRefundResponse.estimatedCompletionTime).toLocaleString()}</p>
                      )}
                      <p className="mt-2 text-xs">{batchRefundResponse.message}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {batchRefundError && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <FaExclamationTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-800 font-semibold mb-1">Error</p>
                    <p className="text-sm text-red-700">{batchRefundError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Trigger Button */}
            <button
              onClick={() => setShowConfirmDialog(true)}
              disabled={batchRefundLoading}
              className="w-full flex-shrink-0 h-14 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 px-6"
              title="Trigger Batch Refund"
              aria-label="Trigger Batch Refund"
              type="button"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-200 flex items-center justify-center">
                {batchRefundLoading ? (
                  <FaSpinner className="w-6 h-6 text-red-600 animate-spin" />
                ) : (
                  <FaSync className="w-6 h-6 text-red-600" />
                )}
              </div>
              <span className="font-semibold text-red-700">
                {batchRefundLoading ? 'Starting Batch Job...' : 'Trigger Batch Refund'}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Batch Refund</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-3 mt-2">
                <p>
                  Are you sure you want to refund all eligible tickets for this event? This action cannot be undone.
                </p>
                <p className="font-semibold text-gray-800">
                  Only tickets with Stripe payments (not manual payments) will be refunded.
                </p>
                <p className="text-sm text-gray-600">
                  This will process refunds via Stripe. Manual payments will not be refunded.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row gap-3 sm:gap-4">
            <AlertDialogCancel
              onClick={() => setShowConfirmDialog(false)}
              className="flex-1 flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <span className="font-semibold text-blue-700">Cancel</span>
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleTriggerBatchRefund}
              disabled={batchRefundLoading}
              className="flex-1 flex-shrink-0 h-14 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-200 flex items-center justify-center">
                {batchRefundLoading ? (
                  <svg className="animate-spin w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </div>
              <span className="font-semibold text-red-700">{batchRefundLoading ? 'Processing...' : 'Confirm Refund'}</span>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

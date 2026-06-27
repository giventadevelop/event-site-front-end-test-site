'use client';

import React, { useState } from 'react';
import type { PaymentSessionResponse } from '@/types';

interface ZelleManualPaymentProps {
  paymentSession: PaymentSessionResponse;
  amount: number;
  currency: string;
  eventName?: string;
  onConfirm: () => Promise<void>;
  onCancel?: () => void;
}

/**
 * ZelleManualPayment - Component for Zelle manual payment instructions
 *
 * Displays Zelle payment instructions and creates a pending transaction
 * when the user confirms they will send payment.
 */
export default function ZelleManualPayment({
  paymentSession,
  amount,
  currency,
  eventName,
  onConfirm,
  onCancel,
}: ZelleManualPaymentProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  const zelleEmail = paymentSession.metadata?.zelleEmail as string | undefined;
  const zellePhone = paymentSession.metadata?.zellePhone as string | undefined;
  const instructions = paymentSession.metadata?.instructions as string | undefined;
  const transactionId = paymentSession.transactionId;

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      await onConfirm();
      setHasConfirmed(true);
      setShowInstructions(false);
    } catch (error) {
      console.error('[ZelleManualPayment] Confirmation error:', error);
      alert('Failed to confirm payment. Please try again.');
    } finally {
      setIsConfirming(false);
    }
  };

  if (hasConfirmed) {
    return (
      <div className="bg-success/10 border border-success rounded-lg p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
            <span className="text-white text-lg">✓</span>
          </div>
          <h3 className="text-lg font-semibold text-success">Payment Instructions Confirmed</h3>
        </div>
        <div className="space-y-2 text-sm">
          <p className="text-muted-foreground">
            Your registration is pending payment confirmation. We'll send you a confirmation email once your payment is verified.
          </p>
          <p className="font-medium">
            Transaction ID: <span className="font-mono text-xs">{transactionId}</span>
          </p>
          <p className="text-muted-foreground text-xs">
            Please complete your Zelle payment within 24 hours to secure your spot.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showInstructions && (
        <div className="bg-muted border border-border rounded-lg p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💳</span>
            <h3 className="text-lg font-semibold">Pay with Zelle</h3>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Amount to Send</p>
              <p className="text-2xl font-bold">{currency} {amount.toFixed(2)}</p>
            </div>

            {(zelleEmail || zellePhone) && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Send payment to:</p>
                <div className="bg-background rounded-md p-3 space-y-1">
                  {zelleEmail && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">📧</span>
                      <span className="font-mono text-sm">{zelleEmail}</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(zelleEmail)}
                        className="ml-auto text-xs text-primary hover:underline"
                      >
                        Copy
                      </button>
                    </div>
                  )}
                  {zellePhone && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm">📱</span>
                      <span className="font-mono text-sm">{zellePhone}</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(zellePhone)}
                        className="ml-auto text-xs text-primary hover:underline"
                      >
                        Copy
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {instructions && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Important Instructions:</p>
                <div className="bg-warning/10 border border-warning/20 rounded-md p-3">
                  <p className="text-sm whitespace-pre-line">{instructions}</p>
                </div>
              </div>
            )}

            <div className="bg-info/10 border border-info/20 rounded-md p-3">
              <p className="text-xs font-medium mb-1">📝 Memo/Note to Include:</p>
              <div className="bg-background rounded p-2 font-mono text-xs break-all">
                {eventName ? `Event: ${eventName}` : ''} {transactionId ? `ID: ${transactionId}` : ''}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Please include this information in your Zelle payment memo so we can match your payment.
              </p>
            </div>

            <div className="bg-muted-foreground/10 rounded-md p-3">
              <p className="text-xs text-muted-foreground">
                ⚠️ <strong>Important:</strong> Your registration will remain pending until we manually verify your payment.
                This may take 1-2 business days. You'll receive an email confirmation once your payment is verified.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleConfirm}
          disabled={isConfirming}
          className="flex-1 bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isConfirming ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Confirming...</span>
            </>
          ) : (
            <>
              <span>✓</span>
              <span>I Will Send Payment via Zelle</span>
            </>
          )}
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            disabled={isConfirming}
            className="px-6 py-3 border border-border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}










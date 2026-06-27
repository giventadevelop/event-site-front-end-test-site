'use client';

import React, { useState, useEffect } from 'react';
import { FaCreditCard, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { useSearchParams } from 'next/navigation';

export default function TestStripeClient() {
  const searchParams = useSearchParams();
  const [amount, setAmount] = useState('1.00');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle success/cancel from Stripe redirect
  useEffect(() => {
    const successParam = searchParams.get('success');
    const canceledParam = searchParams.get('canceled');
    const sessionId = searchParams.get('session_id');

    if (successParam === 'true' && sessionId) {
      setSuccess(`Payment successful! Session ID: ${sessionId}`);
    } else if (canceledParam === 'true') {
      setError('Payment was canceled.');
    }
  }, [searchParams]);

  const handleTestTransaction = async () => {
    setIsLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const response = await fetch('/api/stripe/test-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          description: 'Test Stripe Transaction',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create test checkout session');
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during checkout');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimal points
    if (/^\d*\.?\d{0,2}$/.test(value) || value === '') {
      setAmount(value);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">Test Stripe Integration</h2>
        <p className="text-blue-700 text-sm">
          Use this page to test Stripe payment processing with a minimal amount.
          This will create a test checkout session and redirect you to Stripe's payment page.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Test Amount (USD)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="text"
              id="amount"
              value={amount}
              onChange={handleAmountChange}
              className="block w-full pl-7 pr-12 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="0.00"
              min="0.01"
              step="0.01"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">USD</span>
            </div>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Enter an amount between $0.01 and $999.99
          </p>
        </div>

        <button
          onClick={handleTestTransaction}
          disabled={isLoading || !amount || parseFloat(amount) < 0.01}
          className="w-full flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 disabled:bg-gray-100 disabled:border-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:scale-100"
          title="Test Stripe Payment"
          aria-label="Test Stripe Payment"
          type="button"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
            {isLoading ? (
              <FaSpinner className="w-6 h-6 text-blue-600 animate-spin" />
            ) : (
              <FaCreditCard className="w-6 h-6 text-blue-600" />
            )}
          </div>
          <span className="font-semibold text-blue-700">
            {isLoading ? 'Creating Checkout Session...' : 'Test Stripe Payment'}
          </span>
        </button>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
          <FaCheckCircle className="text-green-500" />
          <span className="text-green-700">{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <FaExclamationTriangle className="text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Test Card Numbers</h3>
        <div className="space-y-2 text-xs text-gray-600">
          <p><strong>Success:</strong> 4242 4242 4242 4242</p>
          <p><strong>Decline:</strong> 4000 0000 0000 0002</p>
          <p><strong>Insufficient Funds:</strong> 4000 0000 0000 9995</p>
          <p><strong>Expired Card:</strong> 4000 0000 0000 0069</p>
          <p><strong>Incorrect CVC:</strong> 4000 0000 0000 0127</p>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Use any future expiry date and any 3-digit CVC for testing.
        </p>
      </div>
    </div>
  );
}
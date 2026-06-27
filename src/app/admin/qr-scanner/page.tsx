"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { FaQrcode, FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';

// Dynamically import QrScanner to avoid SSR issues
const QrScanner = dynamic(() => import('@/components/qr/QrScanner'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
      <FaSpinner className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  )
});

interface VerificationResult {
  valid: boolean;
  transaction?: {
    id: number;
    eventId?: number;
    email: string;
    firstName?: string;
    lastName?: string;
    quantity: number;
    status: string;
    checkInStatus?: string;
  };
  error?: string;
}

export default function AdminQrScannerPage() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleScan = async (data: string | null) => {
    if (!data) return;

    // Prevent duplicate scans
    if (scanResult === data) return;

    setScanResult(data);
    setLoading(true);
    setError(null);
    setVerificationResult(null);

    try {
      const baseUrl = window.location.origin;
      const response = await fetch(`${baseUrl}/api/qr/verify?data=${encodeURIComponent(data)}`);

      if (!response.ok) {
        throw new Error(`Verification failed: ${response.status} ${response.statusText}`);
      }

      const result: VerificationResult = await response.json();
      setVerificationResult(result);

      if (result.valid && result.transaction) {
        // Auto-redirect to check-in page after a short delay
        setTimeout(() => {
          const eventId = result.transaction!.eventId;
          const transactionId = result.transaction!.id;
          if (eventId && transactionId) {
            router.push(`/admin/qrcode-scan/tickets/events/${eventId}/transactions/${transactionId}`);
          }
        }, 2000);
      }
    } catch (err: any) {
      console.error('[QR-SCANNER] Verification error:', err);
      setError(err.message || 'Verification failed');
      setVerificationResult({
        valid: false,
        error: err.message || 'Failed to verify QR code. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleError = (err: Error) => {
    console.error('[QR-SCANNER] Scanner error:', err);

    // Categorize errors for better user feedback
    let errorMessage = err.message;
    let errorType = 'unknown';

    if (err.message.includes('permission') || err.message.includes('Permission')) {
      errorType = 'permission';
      errorMessage = 'Camera permission denied. Please enable camera access in your browser settings and reload the page.';
    } else if (err.message.includes('device') || err.message.includes('Device')) {
      errorType = 'device';
      errorMessage = 'Camera device not found. Please ensure your device has a camera and try again.';
    } else if (err.message.includes('NotAllowedError') || err.message.includes('NotReadableError')) {
      errorType = 'access';
      errorMessage = 'Camera access denied. Please check your browser settings and allow camera access.';
    } else if (err.message.includes('NotFoundError')) {
      errorType = 'notfound';
      errorMessage = 'Camera not found. Please ensure your device has a working camera.';
    } else if (err.message.includes('OverconstrainedError')) {
      errorType = 'constraint';
      errorMessage = 'Camera constraints not supported. Try switching cameras or using a different device.';
    }

    setError(errorMessage);
    setVerificationResult({
      valid: false,
      error: errorMessage,
    });
  };

  const handleScanAnother = () => {
    setScanResult(null);
    setVerificationResult(null);
    setError(null);
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ paddingTop: '120px' }}>
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
            <FaQrcode className="w-10 h-10 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">QR Code Scanner</h1>
            <p className="text-gray-600 text-sm sm:text-base mt-1">Scan QR codes to verify and check in tickets</p>
          </div>
        </div>

        {/* Scanner Section */}
        <div className="mb-6">
          <QrScanner
            onScan={handleScan}
            onError={handleError}
            delay={300}
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <FaSpinner className="w-5 h-5 text-blue-600 animate-spin" />
              <span className="text-blue-700 font-medium">Verifying QR code...</span>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && !verificationResult && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <FaTimesCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-red-800 font-semibold mb-2">Error</h3>
                <p className="text-red-700 text-sm mb-3">{error}</p>
                {error.includes('permission') || error.includes('Permission') ? (
                  <div className="bg-white rounded p-3 border border-red-200">
                    <p className="text-xs text-red-600 font-medium mb-1">How to fix:</p>
                    <ul className="list-disc list-inside text-xs text-red-600 space-y-1">
                      <li>Click the lock icon in your browser's address bar</li>
                      <li>Select "Allow" for camera permissions</li>
                      <li>Reload this page</li>
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}

        {/* Verification Result */}
        {verificationResult && (
          <div className={`rounded-lg p-4 mb-4 border-2 ${
            verificationResult.valid
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-3">
              {verificationResult.valid ? (
                <FaCheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <FaTimesCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <h3 className={`font-semibold mb-2 ${
                  verificationResult.valid ? 'text-green-800' : 'text-red-800'
                }`}>
                  {verificationResult.valid ? 'Valid Ticket' : 'Invalid Ticket'}
                </h3>

                {verificationResult.valid && verificationResult.transaction ? (
                  <div className="space-y-2 text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <span className="text-gray-600">Transaction ID:</span>
                        <span className="ml-2 font-semibold text-gray-900">
                          {verificationResult.transaction.id}
                        </span>
                      </div>
                      {verificationResult.transaction.eventId && (
                        <div>
                          <span className="text-gray-600">Event ID:</span>
                          <span className="ml-2 font-semibold text-gray-900">
                            {verificationResult.transaction.eventId}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <span className="ml-2 font-semibold text-gray-900">
                          {verificationResult.transaction.email}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Name:</span>
                        <span className="ml-2 font-semibold text-gray-900">
                          {verificationResult.transaction.firstName} {verificationResult.transaction.lastName}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Quantity:</span>
                        <span className="ml-2 font-semibold text-gray-900">
                          {verificationResult.transaction.quantity}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Status:</span>
                        <span className="ml-2 font-semibold text-gray-900">
                          {verificationResult.transaction.status}
                        </span>
                      </div>
                      {verificationResult.transaction.checkInStatus && (
                        <div>
                          <span className="text-gray-600">Check-In Status:</span>
                          <span className={`ml-2 font-semibold ${
                            verificationResult.transaction.checkInStatus === 'CHECKED_IN'
                              ? 'text-green-600'
                              : 'text-gray-900'
                          }`}>
                            {verificationResult.transaction.checkInStatus}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <p className="text-green-700 text-sm font-medium">
                        Redirecting to check-in page...
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-red-700 text-sm mb-2">
                      {verificationResult.error || 'This ticket cannot be checked in.'}
                    </p>
                    {verificationResult.transaction && (
                      <div className="mt-2 text-sm text-red-600">
                        <p>Transaction ID: {verificationResult.transaction.id}</p>
                        <p>Status: {verificationResult.transaction.status}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Scan Another Button */}
        {(verificationResult || error) && (
          <div className="flex justify-center">
            <button
              onClick={handleScanAnother}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors flex items-center gap-2"
              type="button"
            >
              <FaQrcode className="w-5 h-5" />
              Scan Another QR Code
            </button>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Instructions:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            <li>Point your camera at the QR code on the ticket</li>
            <li>Ensure the QR code is clearly visible and well-lit</li>
            <li>The scanner will automatically detect and verify the QR code</li>
            <li>Valid tickets will redirect to the check-in page</li>
            <li>Use the "Switch Camera" button to toggle between front and back cameras</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

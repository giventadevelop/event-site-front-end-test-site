'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import type { DonationTransactionDTO, EventTicketTransactionDTO } from '@/types';
import {
  getDonationTransaction,
  getPaymentTransactionStatus,
  generateDonationQRCode,
  sendDonationConfirmationEmail,
} from '../ApiServerActions';

interface DonationSuccessClientProps {
  eventId: string;
  initialTransactionId?: string;
  initialDonationId?: string; // GiveButter donation ID from redirect
}

export default function DonationSuccessClient({
  eventId,
  initialTransactionId,
  initialDonationId,
}: DonationSuccessClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const transactionId = initialTransactionId || searchParams.get('transactionId');
  const givebutterDonationId = initialDonationId || searchParams.get('donationId');
  
  const [donationData, setDonationData] = useState<DonationTransactionDTO | null>(null);
  const [ticketTransaction, setTicketTransaction] = useState<EventTicketTransactionDTO | null>(null);
  const [isTicketTransaction, setIsTicketTransaction] = useState(false);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState<boolean | null>(null);
  const [result, setResult] = useState<any>(null);
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingAttemptsRef = useRef(0);
  const MAX_POLLING_ATTEMPTS = 10; // Desktop: 10 attempts * 3 seconds = 30 seconds max
  const POLLING_INTERVAL = 3000; // Desktop: 3 seconds (matches Stripe flow)

  // Mobile detection and redirect logic - show brief success then redirect (mobile only)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Enhanced mobile detection with multiple methods (same as SuccessClient)
    const userAgent = navigator.userAgent || '';
    const platform = navigator.platform || '';

    // Method 1: User agent regex (primary method)
    const mobileRegexMatch = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|mobile|CriOS|FxiOS|EdgiOS/i.test(userAgent);

    // Method 2: Platform detection
    const platformMatch = /iPhone|iPad|iPod|Android|BlackBerry|Windows Phone/i.test(platform);

    // Method 3: Screen width detection (only for mobile if ALSO has mobile user agent)
    const narrowScreenMatch = window.innerWidth <= 768;
    const hasMobileUserAgent = mobileRegexMatch || platformMatch;

    // Method 4: User agent data API (if available)
    const userAgentData = (navigator as any).userAgentData;
    const isMobileFromUA = userAgentData?.mobile || false;

    // CRITICAL: Desktop detection fix - Only consider mobile if:
    // 1. User agent indicates mobile (primary method), OR
    // 2. User agent data API says mobile, OR
    // 3. Narrow screen AND mobile user agent (not just narrow screen alone)
    const isMobile = mobileRegexMatch || platformMatch || isMobileFromUA || (hasMobileUserAgent && narrowScreenMatch);

    console.log('[DONATION-SUCCESS] [MOBILE-DETECTION] ============================================');
    console.log('[DONATION-SUCCESS] [MOBILE-DETECTION] DonationSuccessClient component mounted');
    console.log('[DONATION-SUCCESS] [MOBILE-DETECTION] ============================================');
    console.log('[DONATION-SUCCESS] [MOBILE-DETECTION] Props:', { transactionId, givebutterDonationId, eventId });
    console.log('[DONATION-SUCCESS] [MOBILE-DETECTION] User Agent:', userAgent);
    console.log('[DONATION-SUCCESS] [MOBILE-DETECTION] FINAL RESULT:', {
      isMobile,
      detectionMethods: {
        userAgentRegex: mobileRegexMatch,
        platformMatch: platformMatch,
        narrowScreen: narrowScreenMatch,
        userAgentData: isMobileFromUA,
      },
      timestamp: new Date().toISOString(),
    });
    console.log('[DONATION-SUCCESS] [MOBILE-DETECTION] ============================================');

    // Set mobile detection state immediately to prevent desktop data fetching
    setIsMobileDevice(isMobile);

    if (isMobile) {
      console.log('[DONATION-SUCCESS] [MOBILE-DETECTION] ✅✅✅ MOBILE BROWSER DETECTED - Will redirect to mobile QR page');
      
      // Determine which identifier to use and store
      let identifier: string | null = transactionId || givebutterDonationId || null;
      if (!identifier) {
        try {
          const urlParams = new URLSearchParams(window.location.search);
          identifier = urlParams.get('transactionId') || urlParams.get('donationId') || null;
        } catch { }
      }
      
      if (identifier) {
        // Store in sessionStorage as fallback
        try {
          sessionStorage.setItem('donation_transaction_id', identifier);
          console.log('[DONATION-SUCCESS] [MOBILE-DETECTION] ✅ Stored identifier in sessionStorage');
        } catch (e) {
          console.error('[DONATION-SUCCESS] [MOBILE-DETECTION] ⚠️ Failed to store in sessionStorage:', e);
        }

        // Show brief success, then redirect to mobile QR page (similar to Stripe flow)
        // For donations, we can redirect to a mobile-specific page or stay on success page
        // For now, mobile will stay on success page but use POST fallback
        console.log('[DONATION-SUCCESS] [MOBILE-DETECTION] Mobile will use POST fallback for transaction creation');
      }
    } else {
      console.log('[DONATION-SUCCESS] [MOBILE-DETECTION] ❌ DESKTOP BROWSER DETECTED - Staying on success page');
      console.log('[DONATION-SUCCESS] [MOBILE-DETECTION] Desktop flow will use GET endpoint with polling');
    }
  }, [transactionId, givebutterDonationId, eventId, router]);

  // Fetch donation transaction data (used by desktop flow)
  async function fetchDonationTransactionData() {
    try {
      const queryParams = new URLSearchParams();
      
      if (transactionId) {
        queryParams.append('transactionId', transactionId);
      } else if (givebutterDonationId) {
        queryParams.append('donationId', givebutterDonationId);
      }
      
      queryParams.append('eventId', eventId);
      
      const getUrl = `/api/events/donation/success/process?${queryParams.toString()}&_t=${Date.now()}`;
      console.log('[DONATION-SUCCESS] [DESKTOP FLOW] GET request URL:', getUrl);

      const getRes = await fetch(getUrl, { cache: 'no-store' });

      if (getRes.ok) {
        const data = await getRes.json();
        console.log('[DONATION-SUCCESS] [DESKTOP FLOW] GET response data:', {
          hasTransaction: !!data.transaction,
          transactionId: data.transaction?.id,
          error: data.error,
          message: data.message,
          responseKeys: Object.keys(data),
        });

        if (data.transaction) {
          console.log('[DONATION-SUCCESS] [DESKTOP FLOW] ✅ Transaction found:', data.transaction.id);
          
          // Check if this is a ticket transaction (for ticketed fundraisers)
          const ticketTransactionId = data.transaction.ticketTransactionId || data.transaction.metadata?.ticketTransactionId;
          
          if (ticketTransactionId) {
            console.log('[DONATION-SUCCESS] Payment is for ticket transaction, fetching ticket data:', ticketTransactionId);
            await fetchTicketTransaction(ticketTransactionId);
          } else {
            setDonationData(data.transaction);
            setIsTicketTransaction(false);
            
            // Process QR code and email if available
            if (data.qrCodeData?.qrCodeUrl || data.qrCodeData?.qrCodeImageUrl) {
              setQrCodeUrl(data.qrCodeData.qrCodeUrl || data.qrCodeData.qrCodeImageUrl);
            }
            if (data.transaction.emailSent || data.transaction.confirmationSentAt) {
              setEmailSent(true);
            }
          }
          
          setResult(data);
          setLoading(false);
          return true;
        } else {
          console.log('[DONATION-SUCCESS] [DESKTOP FLOW] Transaction not found, will poll...');
          return false;
        }
      } else {
        const errorText = await getRes.text();
        console.error('[DONATION-SUCCESS] [DESKTOP FLOW] GET request failed:', getRes.status, errorText);
        return false;
      }
    } catch (err: any) {
      console.error('[DONATION-SUCCESS] [DESKTOP FLOW] Error in fetchDonationTransactionData:', err);
      return false;
    }
  }

  // Fetch ticket transaction (for ticketed fundraisers going through donation-checkout)
  async function fetchTicketTransaction(ticketTransactionId: number) {
    try {
      const response = await fetchWithJwtRetry(
        `/api/proxy/event-ticket-transactions/${ticketTransactionId}`,
        {
          method: 'GET',
          cache: 'no-store',
        },
        'fetchTicketTransaction'
      );

      if (response.ok) {
        const ticketData = await response.json();
        setTicketTransaction(ticketData);
        setIsTicketTransaction(true);
        
        // For ticket transactions, QR code and email are already handled by backend
        // Just check if QR code exists in the transaction
        if (ticketData.qrCodeImageUrl) {
          setQrCodeUrl(ticketData.qrCodeImageUrl);
        }
        
        // Email is already sent by backend for ticket transactions
        if (ticketData.confirmationSentAt) {
          setEmailSent(true);
        }
      } else {
        console.error('[DonationSuccessClient] Failed to fetch ticket transaction:', response.status);
        // Fallback: try to fetch as donation transaction
        await fetchDonationData(transactionId || '');
      }
    } catch (error) {
      console.error('[DonationSuccessClient] Error fetching ticket transaction:', error);
      // Fallback: try to fetch as donation transaction
      if (transactionId) {
        await fetchDonationData(transactionId);
      }
    }
  }

  // Fetch donation data after transaction is created
  async function fetchDonationData(txId: string) {
    try {
      const data = await getDonationTransaction(txId, eventId);
      if (data) {
        setDonationData(data);
        setIsTicketTransaction(false);
        await processDonationSuccess(data.id);
      }
    } catch (error) {
      console.error('Error fetching donation data:', error);
    }
  }

  // Process donation success (QR code, email)
  async function processDonationSuccess(donationTransactionId: number) {
    try {
      // Generate QR code if not exists
      if (!qrCodeUrl) {
        try {
          const qrData = await generateDonationQRCode(eventId, donationTransactionId);
          setQrCodeUrl(qrData.qrCodeUrl);
        } catch (qrError) {
          console.warn('[DonationSuccessClient] QR code generation failed (may not be required):', qrError);
        }
      }

      // Send confirmation email
      if (donationData?.email && !donationData.emailSent && !emailSent) {
        try {
          await sendDonationConfirmationEmail(eventId, donationTransactionId, donationData.email);
          setEmailSent(true);
        } catch (emailError) {
          console.error('[DonationSuccessClient] Email send error:', emailError);
        }
      }
    } catch (error) {
      console.error('Error processing donation success:', error);
    }
  }

  // Mobile flow handler (POST fallback) - defined before useEffect
  async function handleMobileFlow() {
    if (!transactionId && !givebutterDonationId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setPolling(true);
    
    // Mobile flow: Try POST endpoint as fallback (similar to Stripe mobile flow)
    try {
      const postBody: any = {
        eventId,
        skip_qr: true, // Skip QR for mobile to prevent duplicate emails
      };
      
      if (transactionId) {
        postBody.transactionId = transactionId;
      } else if (givebutterDonationId) {
        postBody.donationId = givebutterDonationId;
      }

      const postRes = await fetch(`${baseUrl}/api/events/donation/success/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postBody),
      });

      if (postRes.ok) {
        const postData = await postRes.json();
        
        if (postData.transaction) {
          console.log('[DONATION-SUCCESS] [MOBILE FLOW] ✅ Transaction created/found via POST:', postData.transaction.id);
          
          // Check if this is a ticket transaction
          const ticketTransactionId = postData.transaction.ticketTransactionId || postData.transaction.metadata?.ticketTransactionId;
          
          if (ticketTransactionId) {
            await fetchTicketTransaction(ticketTransactionId);
          } else {
            setDonationData(postData.transaction);
            setIsTicketTransaction(false);
            
            if (postData.qrCodeData?.qrCodeUrl || postData.qrCodeData?.qrCodeImageUrl) {
              setQrCodeUrl(postData.qrCodeData.qrCodeUrl || postData.qrCodeData.qrCodeImageUrl);
            }
            if (postData.transaction.emailSent || postData.transaction.confirmationSentAt) {
              setEmailSent(true);
            }
          }
          
          setResult(postData);
          setLoading(false);
          setPolling(false);
          return;
        }
      }
    } catch (postErr: any) {
      console.error('[DONATION-SUCCESS] [MOBILE FLOW] POST fallback error:', postErr);
    }

    // If POST fails, continue with polling (similar to Stripe mobile flow)
    setPolling(true);
    pollingAttemptsRef.current = 0;
    
    const pollInterval = setInterval(async () => {
      if (pollingAttemptsRef.current >= MAX_POLLING_ATTEMPTS) {
        clearInterval(pollInterval);
        setPolling(false);
        setLoading(false);
        setError('Transaction not found after maximum polling attempts. Please contact support.');
        return;
      }

      pollingAttemptsRef.current++;
      const found = await fetchDonationTransactionData();
      
      if (found) {
        clearInterval(pollInterval);
        setPolling(false);
        setLoading(false);
      }
    }, POLLING_INTERVAL);

    pollingIntervalRef.current = pollInterval;
  }

  // Data fetching effect for desktop flow (similar to SuccessClient)
  useEffect(() => {
    // Skip data fetching until mobile detection is complete
    if (isMobileDevice === null) {
      console.log('[DONATION-SUCCESS] Waiting for mobile detection to complete');
      return;
    }

    // Skip data fetching for mobile users - they use POST fallback
    if (isMobileDevice === true) {
      console.log('[DONATION-SUCCESS] Mobile user - will use POST fallback if needed');
      // Mobile flow: Use POST endpoint as fallback
      handleMobileFlow();
      return;
    }

    console.log('[DONATION-SUCCESS] Desktop user confirmed - proceeding with GET endpoint polling');
    console.log('[DONATION-SUCCESS] [DESKTOP FLOW] ============================================');
    console.log('[DONATION-SUCCESS] [DESKTOP FLOW] Desktop browser detected - using GET-only flow');
    console.log('[DONATION-SUCCESS] [DESKTOP FLOW] Desktop will poll GET endpoint if transaction not found');
    console.log('[DONATION-SUCCESS] [DESKTOP FLOW] Webhook should create transaction automatically');
    console.log('[DONATION-SUCCESS] [DESKTOP FLOW] ============================================');

    // Desktop data fetching logic
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      setError(null);
      
      if (!transactionId && !givebutterDonationId) {
        console.error('[DONATION-SUCCESS] Missing both transactionId and givebutterDonationId');
        setError('Missing transaction ID or donation ID');
        setLoading(false);
        return;
      }

      try {
        // 1. Try to GET the transaction
        const found = await fetchDonationTransactionData();
        
        if (found) {
          // Transaction found - done
          return;
        }

        // 2. Transaction not found - start polling (webhook may still be processing)
        console.log('[DONATION-SUCCESS] [DESKTOP FLOW] Starting polling loop - waiting for webhook...');
        let pollAttempt = 0;

        while (pollAttempt < MAX_POLLING_ATTEMPTS && !cancelled) {
          pollAttempt++;
          console.log(`[DONATION-SUCCESS] [DESKTOP FLOW] Polling attempt ${pollAttempt}/${MAX_POLLING_ATTEMPTS}`);

          // Wait before polling (except first attempt)
          if (pollAttempt > 1) {
            await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
          }

          // Poll GET endpoint
          const queryParams = new URLSearchParams();
          if (transactionId) {
            queryParams.append('transactionId', transactionId);
          } else if (givebutterDonationId) {
            queryParams.append('donationId', givebutterDonationId);
          }
          queryParams.append('eventId', eventId);
          
          const pollUrl = `/api/events/donation/success/process?${queryParams.toString()}&_t=${Date.now()}&_poll=${pollAttempt}`;
          
          try {
            const pollRes = await fetch(pollUrl, { cache: 'no-store' });
            
            if (pollRes.ok) {
              const pollData = await pollRes.json();
              
              if (pollData.transaction) {
                console.log('[DONATION-SUCCESS] [DESKTOP FLOW] ✅ Transaction found after polling:', pollData.transaction.id);
                
                // Check if this is a ticket transaction
                const ticketTransactionId = pollData.transaction.ticketTransactionId || pollData.transaction.metadata?.ticketTransactionId;
                
                if (ticketTransactionId) {
                  await fetchTicketTransaction(ticketTransactionId);
                } else {
                  setDonationData(pollData.transaction);
                  setIsTicketTransaction(false);
                  
                  if (pollData.qrCodeData?.qrCodeUrl || pollData.qrCodeData?.qrCodeImageUrl) {
                    setQrCodeUrl(pollData.qrCodeData.qrCodeUrl || pollData.qrCodeData.qrCodeImageUrl);
                  }
                  if (pollData.transaction.emailSent || pollData.transaction.confirmationSentAt) {
                    setEmailSent(true);
                  }
                }
                
                setResult(pollData);
                setLoading(false);
                return;
              }
            }
          } catch (pollErr: any) {
            console.warn(`[DONATION-SUCCESS] [DESKTOP FLOW] Poll request error (attempt ${pollAttempt}):`, pollErr?.message);
          }
        }

        // If still not found after polling, show error
        if (!cancelled) {
          console.error('[DONATION-SUCCESS] [DESKTOP FLOW] ⚠️ Transaction not found after polling');
          setError(
            `Your donation was successful, but we're still processing your transaction. ` +
            `We checked ${MAX_POLLING_ATTEMPTS} times over ${(MAX_POLLING_ATTEMPTS * POLLING_INTERVAL) / 1000} seconds. ` +
            `Please wait a moment and refresh this page, or check your email for confirmation.`
          );
        }
        setLoading(false);
      } catch (err: any) {
        if (!cancelled) {
          console.error('[DONATION-SUCCESS] [DESKTOP FLOW] Error in fetchData:', err);
          setError(err?.message || 'Unknown error');
        }
        setLoading(false);
      }
    }

    fetchData();
    return () => { cancelled = true; };
  }, [transactionId, givebutterDonationId, eventId, isMobileDevice]);

  if (loading || polling) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {polling ? 'Processing your donation...' : 'Please wait while your donation is being verified...'}
          </p>
        </div>
      </div>
    );
  }

  if (error && !donationData && !ticketTransaction) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-orange-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Processing Your Donation</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="block w-full bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  if (!donationData && !ticketTransaction && !error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <svg
              className="mx-auto h-16 w-16 text-orange-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Transaction Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            We couldn't find your transaction. Please contact support if you believe this is an error.
          </p>
          <a
            href={`/events/${eventId}`}
            className="block w-full bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition-colors font-medium"
          >
            Return to Event
          </a>
        </div>
      </div>
    );
  }

  // Use ticket transaction data if available, otherwise use donation data
  const transactionData = isTicketTransaction ? ticketTransaction : donationData;
  const transactionAmount = isTicketTransaction 
    ? (ticketTransaction?.totalAmount || 0)
    : (donationData?.amount || 0);
  const transactionEmail = isTicketTransaction
    ? ticketTransaction?.email
    : donationData?.email;
  const transactionReference = isTicketTransaction
    ? ticketTransaction?.transactionReference
    : donationData?.transactionReference;
  const transactionDate = isTicketTransaction
    ? ticketTransaction?.createdAt
    : donationData?.createdAt;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-green-600 mb-6">
          {isTicketTransaction ? 'Thank You for Your Purchase!' : 'Thank You for Your Donation!'}
        </h1>

        <div className="space-y-6">
          {/* Transaction Details */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              {isTicketTransaction ? 'Purchase Details' : 'Donation Details'}
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700">Amount:</span>
                <span className="font-bold text-gray-900">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }).format(transactionAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Date:</span>
                <span className="text-gray-900">
                  {transactionDate ? new Date(transactionDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              {transactionReference && (
                <div className="flex justify-between">
                  <span className="text-gray-700">Transaction ID:</span>
                  <span className="font-mono text-sm text-gray-900">{transactionReference}</span>
                </div>
              )}
              {isTicketTransaction && ticketTransaction?.quantity && (
                <div className="flex justify-between">
                  <span className="text-gray-700">Quantity:</span>
                  <span className="text-gray-900">{ticketTransaction.quantity} ticket(s)</span>
                </div>
              )}
            </div>
          </div>

          {/* QR Code (if applicable) */}
          {qrCodeUrl && (
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <h2 className="text-xl font-semibold mb-4 text-gray-900">
                {isTicketTransaction ? 'Your Ticket QR Code' : 'Your Donation QR Code'}
              </h2>
              <div className="flex justify-center">
                <Image
                  src={qrCodeUrl}
                  alt={isTicketTransaction ? 'Ticket QR Code' : 'Donation QR Code'}
                  width={200}
                  height={200}
                  className="mx-auto"
                />
              </div>
              <p className="text-sm text-gray-600 mt-4">
                {emailSent && transactionEmail && (
                  <>A confirmation email has been sent to {transactionEmail}</>
                )}
              </p>
            </div>
          )}

          {/* Email Confirmation Message (if QR code not shown) */}
          {!qrCodeUrl && emailSent && transactionEmail && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                A confirmation email has been sent to {transactionEmail}
              </p>
            </div>
          )}

          {/* Return to Event */}
          <a
            href={`/events/${eventId}`}
            className="block w-full bg-teal-600 text-white text-center px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
          >
            Return to Event
          </a>
        </div>
      </div>
    </div>
  );
}

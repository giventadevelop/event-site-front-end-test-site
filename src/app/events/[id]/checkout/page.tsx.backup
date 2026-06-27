'use client';

import Image from 'next/image';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaTags, FaCreditCard, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaMapPin, FaTicketAlt, FaUser, FaEnvelope, FaMoneyBillWave, FaReceipt } from 'react-icons/fa';
import { Modal } from '@/components/Modal';
import UniversalPaymentCheckout from '@/components/UniversalPaymentCheckout';
import { formatInTimeZone } from 'date-fns-tz';
import LocationDisplay from '@/components/LocationDisplay';
import { PaymentUseCase } from '@/types';
import { createComponentLogger } from '@/lib/clientLogger';

// Create component-specific logger for CloudWatch visibility
const logger = createComponentLogger('CheckoutPage');

// CRITICAL: Log immediately when module loads (verifies JavaScript file is loaded)
if (typeof window !== 'undefined') {
  console.log('[CheckoutPage] ===== MODULE LOADED =====');
  console.log('[CheckoutPage] Module loaded at:', new Date().toISOString());
  console.log('[CheckoutPage] User-Agent:', navigator.userAgent);
  console.log('[CheckoutPage] URL:', window.location.href);
  logger.log('CheckoutPage module loaded', {
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString(),
  });
}

export default function CheckoutPage() {
  // CRITICAL: Log immediately when component renders (verifies React is working)
  if (typeof window !== 'undefined') {
    console.log('[CheckoutPage] ===== COMPONENT RENDERING =====');
    console.log('[CheckoutPage] Component rendering at:', new Date().toISOString());
    logger.log('CheckoutPage component rendering', { timestamp: new Date().toISOString() });
  }

  const params = useParams();
  const router = useRouter();
  // CRITICAL FIX: Memoize eventId to prevent infinite re-renders
  // useParams() returns a proxy that appears "new" on each render
  // MOBILE FIX: Convert to string to ensure stable reference across app switches
  const eventId = useMemo(() => {
    const id = params?.id;
    return typeof id === 'string' ? id : Array.isArray(id) ? id[0] : id;
  }, [params?.id]);
  const [event, setEvent] = useState<any>(null);
  const [ticketTypes, setTicketTypes] = useState<any[]>([]);
  const [selectedTickets, setSelectedTickets] = useState<{ [key: number]: number }>({});
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [discountError, setDiscountError] = useState('');
  const [discountSuccessMessage, setDiscountSuccessMessage] = useState('');
  const [availableDiscounts, setAvailableDiscounts] = useState<any[]>([]);
  const [emailError, setEmailError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const defaultHeroImageUrl = '/images/default_placeholder_hero_image.jpeg';
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(defaultHeroImageUrl);
  const [totalAmount, setTotalAmount] = useState(0);
  const [savedAmount, setSavedAmount] = useState(0);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [paymentEnabled, setPaymentEnabled] = useState(false);
  // CRITICAL FIX: Use ref to track fetch status without causing re-renders
  const isFetchingRef = useRef(false);
  // CRITICAL FIX: Track which eventId has been fetched to prevent re-fetching same ID
  const fetchedEventIdRef = useRef<string | string[] | null>(null);
  // MOBILE FIX: Track page visibility to prevent flicker on app switch
  const [isPageVisible, setIsPageVisible] = useState(true);
  // MOBILE DEBUG: Use ref to capture logs without causing re-renders
  const debugLogsRef = useRef<string[]>([]);
  const [showDebugLogs, setShowDebugLogs] = useState(false);
  const [displayedLogs, setDisplayedLogs] = useState<string[]>([]);

  useEffect(() => { setMounted(true); }, []);

  // MOBILE DEBUG: Intercept console logs for mobile debugging (using ref to prevent re-renders)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const addLog = (level: string, ...args: any[]) => {
      const logMessage = `[${level}] ${args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')}`;

      // CRITICAL FIX: Use ref instead of setState to prevent infinite re-renders
      debugLogsRef.current = [...debugLogsRef.current.slice(-50), logMessage];
    };

    console.log = (...args: any[]) => {
      originalLog.apply(console, args);
      if (args[0]?.includes?.('[') && (
        args[0]?.includes?.('UniversalPaymentCheckout') ||
        args[0]?.includes?.('DESKTOP ECE') ||
        args[0]?.includes?.('CheckoutPage') ||
        args[0]?.includes?.('PRB')  // CRITICAL: Capture Payment Request Button logs
      )) {
        addLog('LOG', ...args);
      }
    };

    console.error = (...args: any[]) => {
      originalError.apply(console, args);
      addLog('ERROR', ...args);
    };

    console.warn = (...args: any[]) => {
      originalWarn.apply(console, args);
      addLog('WARN', ...args);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  // Update displayed logs when user opens the panel
  useEffect(() => {
    if (showDebugLogs) {
      setDisplayedLogs([...debugLogsRef.current]);
    }
  }, [showDebugLogs]);

  // MOBILE FIX: Listen to page visibility changes to prevent flickering on app switch
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleVisibilityChange = () => {
      const visible = document.visibilityState === 'visible';
      console.log('[CheckoutPage] ⚠️ PAGE VISIBILITY CHANGED:', {
        visible,
        wasVisible: isPageVisible,
        timestamp: new Date().toISOString(),
        eventId,
        hasEvent: !!event,
        ticketTypesCount: ticketTypes.length,
      });
      setIsPageVisible(visible);

      // Don't trigger re-fetch when page becomes visible again
      // Data is already cached in state
      if (visible) {
        console.log('[CheckoutPage] ✅ Page became visible - NOT re-fetching (data already loaded)');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isPageVisible, eventId, event, ticketTypes.length]);

  // Clean up Clerk sync parameter from URL on mount (for cleaner URLs)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('__clerk_synced')) {
      // Remove Clerk sync parameter for cleaner URL
      urlParams.delete('__clerk_synced');
      const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
      // Use replace to avoid adding to history
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  useEffect(() => {
    async function fetchData() {
      // CRITICAL FIX: Prevent duplicate fetches using ref
      if (isFetchingRef.current) {
        console.log('[CheckoutPage] Fetch already in progress, skipping duplicate');
        logger.log('Fetch already in progress, skipping', { eventId });
        return;
      }

      // CRITICAL FIX: Prevent re-fetching the same eventId (mobile browser cache issue)
      if (fetchedEventIdRef.current === eventId) {
        console.log('[CheckoutPage] Event already fetched, skipping', { eventId });
        logger.log('Event already fetched, skipping re-fetch', { eventId, fetchedId: fetchedEventIdRef.current });
        return;
      }

      // CRITICAL: Log immediately to verify useEffect is executing on mobile
      logger.log('CheckoutPage useEffect started', { eventId });
      logger.log('Window object available', { hasWindow: typeof window !== 'undefined' });

      isFetchingRef.current = true;
      setLoading(true);

      // Enhanced mobile browser detection: Include WhatsApp and other mobile browsers
      const isMobile = typeof window !== 'undefined' && (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|WhatsApp|Mobile|CriOS|FxiOS/i.test(navigator.userAgent) ||
        window.innerWidth <= 768
      );

      // Log environment info for debugging - ALWAYS forward to CloudWatch
      const envInfo = {
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server-side',
        url: typeof window !== 'undefined' ? window.location.href : 'unknown',
        hasClerkSync: typeof window !== 'undefined' ? window.location.search.includes('__clerk_synced') : false,
        isMobile,
        eventId,
      };

      console.log('[CheckoutPage] Environment info:', envInfo);
      logger.log('Mobile browser detection', envInfo);

      try {
        // First, fetch event details to show hero image during loading
        const eventUrl = `/api/proxy/event-details/${eventId}`;
        console.log('[CheckoutPage] Fetching event details:', eventUrl);
        logger.log('About to fetch event details', { eventUrl, eventId, isMobile });

        // CRITICAL: Log BEFORE fetch to verify we reach this point
        logger.log('Fetch call initiated', {
          url: eventUrl,
          timestamp: new Date().toISOString(),
          isMobile,
        });

        const fetchStartTime = Date.now();
        let fetchError: any = null;

        try {
          const eventRes = await fetch(eventUrl, {
            cache: 'no-store',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          const fetchDuration = Date.now() - fetchStartTime;
          console.log('[CheckoutPage] Event response status:', eventRes.status, eventRes.statusText);

          // CRITICAL: Log fetch response to CloudWatch
          logger.log('Fetch response received', {
            status: eventRes.status,
            statusText: eventRes.statusText,
            duration: fetchDuration,
            url: eventUrl,
            isMobile,
          });

          if (!eventRes.ok) {
            const errorText = await eventRes.text();
            const errorDetails = {
              status: eventRes.status,
              statusText: eventRes.statusText,
              error: errorText,
              url: eventUrl,
              isMobile,
            };
            console.error('[CheckoutPage] Event fetch failed:', errorDetails);

            // CRITICAL: Forward error to CloudWatch
            logger.error('Event fetch failed', errorDetails);
            throw new Error(`Failed to load event: ${eventRes.status} ${eventRes.statusText}`);
          }

          const eventData = await eventRes.json();
          console.log('[CheckoutPage] Event data loaded:', eventData?.id || 'no id');
          logger.log('Event data loaded successfully', { eventId: eventData?.id, isMobile });
          setEvent(eventData);
        } catch (fetchErr: any) {
          // CRITICAL: Catch fetch errors (network failures, CORS, etc.)
          fetchError = fetchErr;
          const fetchDuration = Date.now() - fetchStartTime;
          console.error('[CheckoutPage] Fetch threw error:', fetchErr);

          logger.critical('Fetch call failed with exception', {
            error: fetchErr?.message || String(fetchErr),
            errorName: fetchErr?.name,
            errorStack: fetchErr?.stack,
            url: eventUrl,
            duration: fetchDuration,
            isMobile,
            eventId,
          });

          // Re-throw to be caught by outer catch block
          throw fetchErr;
        }

        // Fetch hero image immediately (prioritize homepage hero, then regular hero, then flyer, then featured)
        try {
          // Try homepage hero image first
          let mediaRes = await fetch(`/api/proxy/event-medias?eventId.equals=${eventId}&isHomePageHeroImage.equals=true`, {
            cache: 'no-store',
          });
          if (mediaRes.ok) {
            const mediaData = await mediaRes.json();
            const mediaArray = Array.isArray(mediaData) ? mediaData : (mediaData ? [mediaData] : []);
            if (mediaArray.length > 0 && mediaArray[0].fileUrl) {
              setHeroImageUrl(mediaArray[0].fileUrl);
            } else {
              // Try regular hero image
              mediaRes = await fetch(`/api/proxy/event-medias?eventId.equals=${eventId}&isHeroImage.equals=true`, {
                cache: 'no-store',
              });
              if (mediaRes.ok) {
                const heroMediaData = await mediaRes.json();
                const heroMediaArray = Array.isArray(heroMediaData) ? heroMediaData : (heroMediaData ? [heroMediaData] : []);
                if (heroMediaArray.length > 0 && heroMediaArray[0].fileUrl) {
                  setHeroImageUrl(heroMediaArray[0].fileUrl);
                } else {
                  // Try flyer image
                  const flyerRes = await fetch(`/api/proxy/event-medias?eventId.equals=${eventId}&eventFlyer.equals=true`, {
                    cache: 'no-store',
                  });
                  if (flyerRes.ok) {
                    const flyerData = await flyerRes.json();
                    const flyerArray = Array.isArray(flyerData) ? flyerData : (flyerData ? [flyerData] : []);
                    if (flyerArray.length > 0 && flyerArray[0].fileUrl) {
                      setHeroImageUrl(flyerArray[0].fileUrl);
                    } else {
                      // Try featured image
                      const featuredRes = await fetch(`/api/proxy/event-medias?eventId.equals=${eventId}&isFeaturedImage.equals=true`, {
                        cache: 'no-store',
                      });
                      if (featuredRes.ok) {
                        const featuredData = await featuredRes.json();
                        if (Array.isArray(featuredData) && featuredData.length > 0 && featuredData[0].fileUrl) {
                          setHeroImageUrl(featuredData[0].fileUrl);
                        } else {
                          setHeroImageUrl(defaultHeroImageUrl);
                        }
                      } else {
                        setHeroImageUrl(defaultHeroImageUrl);
                      }
                    }
                  } else {
                    setHeroImageUrl(defaultHeroImageUrl);
                  }
                }
              } else {
                setHeroImageUrl(defaultHeroImageUrl);
              }
            }
          } else {
            setHeroImageUrl(defaultHeroImageUrl);
          }
        } catch (mediaErr) {
          console.error('[CheckoutPage] Error fetching hero image:', mediaErr);
          setHeroImageUrl(defaultHeroImageUrl);
        }

        // Fetch ticket types for this event (only active ones)
        const ticketUrl = `/api/proxy/event-ticket-types?eventId.equals=${eventId}&isActive.equals=true`;
        console.log('[CheckoutPage] Fetching ticket types:', ticketUrl);

        const ticketRes = await fetch(ticketUrl, {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('[CheckoutPage] Ticket types response status:', ticketRes.status);

        if (!ticketRes.ok) {
          const errorText = await ticketRes.text();
          console.error('[CheckoutPage] Ticket types fetch failed:', {
            status: ticketRes.status,
            statusText: ticketRes.statusText,
            error: errorText,
            url: ticketUrl,
            isMobile,
          });
          // Don't throw - allow page to load with empty ticket types
          setTicketTypes([]);
        } else {
          const ticketData = await ticketRes.json();
          console.log('[CheckoutPage] Ticket types loaded:', Array.isArray(ticketData) ? ticketData.length : 'not array');
          setTicketTypes(Array.isArray(ticketData) ? ticketData : []);
        }

        // Fetch discount codes for this event
        const discountUrl = `/api/proxy/discount-codes?eventId.equals=${eventId}&isActive.equals=true`;
        console.log('[CheckoutPage] Fetching discount codes:', discountUrl);

        const discountRes = await fetch(discountUrl, {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('[CheckoutPage] Discount codes response status:', discountRes.status);

        if (discountRes.ok) {
          const discountData = await discountRes.json();
          console.log('[CheckoutPage] Discount codes loaded:', Array.isArray(discountData) ? discountData.length : 'not array');
          setAvailableDiscounts(Array.isArray(discountData) ? discountData : []);
        } else {
          console.warn('[CheckoutPage] Discount codes fetch failed:', discountRes.status);
          setAvailableDiscounts([]);
        }
      } catch (e: any) {
        // Enhanced error logging for mobile debugging
        const errorDetails = {
          message: e?.message || String(e),
          stack: e?.stack,
          name: e?.name,
          isMobile,
          url: typeof window !== 'undefined' ? window.location.href : 'unknown',
          eventId,
        };

        console.error('[CheckoutPage] CRITICAL ERROR loading checkout page:', errorDetails);

        // Log to console.error for mobile browser debugging
        if (isMobile) {
          console.error('[CheckoutPage] MOBILE ERROR DETAILS:', JSON.stringify(errorDetails, null, 2));
        }

        // Forward critical errors to CloudWatch via client logger
        logger.critical('Failed to load checkout page', {
          error: errorDetails.message,
          eventId,
          isMobile,
          userAgent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
          url: errorDetails.url,
        });

        setEvent(null);
        setTicketTypes([]);
        setHeroImageUrl(defaultHeroImageUrl);
        setAvailableDiscounts([]);
      } finally {
        setLoading(false);
        isFetchingRef.current = false;
        // Mark this eventId as fetched (success or failure)
        fetchedEventIdRef.current = eventId;
      }
    }
    if (eventId) fetchData();
  }, [eventId]);

  // Reactive calculation for total and discount
  useEffect(() => {
    const subtotal = Object.entries(selectedTickets).reduce((total, [ticketId, quantity]) => {
      const ticket = ticketTypes.find(t => t.id === parseInt(ticketId));
      return total + (ticket?.price || 0) * quantity;
    }, 0);

    let finalAmount = subtotal;
    let amountSaved = 0;

    if (appliedDiscount) {
      if (appliedDiscount.discountType === 'PERCENTAGE') {
        const discountValue = (subtotal * appliedDiscount.discountValue) / 100;
        amountSaved = discountValue;
        finalAmount = subtotal - discountValue;
      } else if (appliedDiscount.discountType === 'FIXED') {
        amountSaved = appliedDiscount.discountValue;
        finalAmount = Math.max(0, subtotal - appliedDiscount.discountValue);
      }
    }

    setTotalAmount(finalAmount);
    setSavedAmount(amountSaved);
  }, [selectedTickets, ticketTypes, appliedDiscount]);

  // Validate discount code
  const validateAndApplyDiscount = (code: string) => {
    if (!code.trim()) {
      setAppliedDiscount(null);
      setDiscountError('');
      setDiscountSuccessMessage('');
      return null;
    }

    const discount = availableDiscounts.find(
      d => d.code.toLowerCase() === code.toLowerCase() && d.isActive
    );

    if (!discount) {
      setDiscountError('Invalid discount code');
      setDiscountSuccessMessage('');
      setAppliedDiscount(null);
      return null;
    }

    // Check if discount is expired
    if (discount.expiryDate) {
      const expiryDate = new Date(discount.expiryDate);
      if (expiryDate < new Date()) {
        setDiscountError('Discount code has expired');
        setDiscountSuccessMessage('');
        setAppliedDiscount(null);
        return null;
      }
    }

    setAppliedDiscount(discount);
    setDiscountError('');
    setDiscountSuccessMessage(`Discount "${discount.code}" applied successfully!`);
    return discount;
  };

  const handleDiscountApply = () => {
    setDiscountError('');
    validateAndApplyDiscount(discountCode);
  };

  // Build cart for UniversalPaymentCheckout
  const cart = useMemo(() => {
    return Object.entries(selectedTickets)
      .filter(([, quantity]) => quantity > 0)
      .map(([ticketId, quantity]) => {
        const ticketType = ticketTypes.find(t => t.id === parseInt(ticketId));
        return { ticketType, quantity };
      })
      .filter(item => item.ticketType);
  }, [selectedTickets, ticketTypes]);

  const amountCents = useMemo(() => Math.round(totalAmount * 100), [totalAmount]);

  // CRITICAL FIX: Memoize customer info to prevent unnecessary re-renders
  // These don't need to trigger Stripe Elements remounting
  const customerInfo = useMemo(() => ({
    email,
    name: firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || undefined,
    phone: phone || undefined,
  }), [email, firstName, lastName, phone]);

  // Enable payment when form is valid
  // Only enable after user has interacted with the form (prevents auto-fill from triggering payment)
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = email && emailRegex.test(email) && cart.length > 0 && amountCents > 0;
    // Only enable if user has actually selected tickets (not just auto-filled)
    const hasUserSelectedTickets = Object.values(selectedTickets).some(qty => qty > 0);
    setPaymentEnabled(isValid && hasUserSelectedTickets);
  }, [email, cart, amountCents, selectedTickets]);

  // Handle payment success
  const handlePaymentSuccess = (transactionId: string) => {
    console.log('[CheckoutPage] Payment successful, transactionId:', transactionId);
    // Redirect to success page with transaction ID
    router.push(`/event/success?transactionId=${transactionId}&eventId=${eventId}`);
  };

  // Handle payment error
  const handlePaymentError = (error: string) => {
    console.error('[CheckoutPage] Payment error:', error);
    alert(`Payment error: ${error}`);
  };

  if (loading || !mounted) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        {/* Hero Image Section */}
        <section className="hero-section" style={{
          position: 'relative',
          marginTop: '0',
          backgroundColor: 'transparent',
          minHeight: '400px',
          overflow: 'hidden',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 0 0 0',
          opacity: 0.7
        }}>
          <img
            src={heroImageUrl || defaultHeroImageUrl}
            alt="Event Hero"
            className="hero-image"
            style={{
              margin: '0 auto',
              padding: '0',
              display: 'block',
              width: '100%',
              maxWidth: '100%',
              height: 'auto',
              objectFit: 'cover',
              borderRadius: '0'
            }}
          />
        </section>

        {/* Loading Message Overlay */}
        <div className="flex-grow flex flex-col items-center justify-center min-h-[400px] p-6" style={{
          marginTop: '-300px',
          position: 'relative',
          zIndex: 10
        }}>
          <Image
            src="/images/selling-tickets-vector-loading-image.jpg"
            alt="Ticket Loading"
            width={180}
            height={180}
            className="mb-4 rounded shadow-lg bg-white p-4"
            priority
          />
          <div className="text-xl font-bold text-teal-700 mb-2 bg-white px-4 py-2 rounded shadow">Please wait while your tickets are being loaded...</div>
          <div className="text-gray-600 text-base text-center bg-white px-4 py-2 rounded shadow">This may take a few moments.<br />Please do not close or refresh this page.</div>
        </div>
      </div>
    );
  }

  // CRITICAL FIX: Only show "event not found" if we're done loading AND event is still null
  // This prevents premature "event not found" message during mobile browser re-hydration
  if (!event && !loading) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-red-600">Event not found.</div>;
  }

  const hasTicketsSelected = Object.values(selectedTickets).some(qty => qty > 0);
  const emailIsValid = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canCheckout = hasTicketsSelected && emailIsValid && amountCents > 0;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col" style={{ overflowX: 'hidden' }}>
      {/* Hero Section */}
      <section className="hero-section" style={{
        position: 'relative',
        marginTop: '0',
        backgroundColor: 'transparent',
        minHeight: '400px',
        overflow: 'hidden',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '80px 0 0 0'
      }}>
        <img
          src={heroImageUrl || defaultHeroImageUrl}
          alt="Event Hero"
          className="hero-image"
          style={{
            margin: '0 auto',
            padding: '0',
            display: 'block',
            width: '100%',
            maxWidth: '100%',
            height: 'auto',
            objectFit: 'cover',
            borderRadius: '0'
          }}
        />
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          {/* Event Details & Form Section */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{event.title}</h1>

              <div className="space-y-4 mb-6">
                {event.startDate && (
                  <div className="flex items-start gap-3">
                    <FaCalendarAlt className="text-teal-600 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-800">Date</p>
                      <p className="text-gray-600">
                        {formatInTimeZone(event.startDate, event.timezone || 'America/New_York', 'EEEE, MMMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                )}

                {event.startTime && event.endTime && (
                  <div className="flex items-start gap-3">
                    <FaClock className="text-teal-600 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-800">Time</p>
                      <p className="text-gray-600">{event.startTime} - {event.endTime}</p>
                    </div>
                  </div>
                )}

                {event.location && (
                  <div className="flex items-start gap-3">
                    <FaMapMarkerAlt className="text-teal-600 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-800">Location</p>
                      <LocationDisplay location={event.location} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Ticket Selection */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Tickets</h2>

              {ticketTypes.length === 0 ? (
                <p className="text-gray-600">No tickets available for this event.</p>
              ) : (
                <div className="space-y-4">
                  {ticketTypes.map((ticket) => (
                    <div key={ticket.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-900">{ticket.name}</h3>
                          {ticket.description && (
                            <p className="text-sm text-gray-600 mt-1">{ticket.description}</p>
                          )}
                          <p className="text-xl font-bold text-teal-600 mt-2">
                            ${ticket.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              const currentQty = selectedTickets[ticket.id] || 0;
                              if (currentQty > 0) {
                                setSelectedTickets({ ...selectedTickets, [ticket.id]: currentQty - 1 });
                              }
                            }}
                            className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-teal-500 disabled:opacity-50"
                            disabled={(selectedTickets[ticket.id] || 0) === 0}
                          >
                            -
                          </button>
                          <span className="text-lg font-semibold w-8 text-center">
                            {selectedTickets[ticket.id] || 0}
                          </span>
                          <button
                            onClick={() => {
                              const currentQty = selectedTickets[ticket.id] || 0;
                              setSelectedTickets({ ...selectedTickets, [ticket.id]: currentQty + 1 });
                            }}
                            className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-teal-500"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Information</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setEmailError(false);
                    }}
                    className={`w-full px-4 py-2 border rounded-md ${emailError ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="your@email.com"
                    required
                  />
                  {emailError && <p className="text-red-500 text-sm mt-1">Please enter a valid email address</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      placeholder="First Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      placeholder="Last Name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </div>

            {/* Discount Code */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Discount Code</h2>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => {
                    setDiscountCode(e.target.value);
                    setDiscountError('');
                    setDiscountSuccessMessage('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md"
                  placeholder="Enter discount code"
                />
                <button
                  onClick={handleDiscountApply}
                  className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700"
                >
                  Apply
                </button>
              </div>

              {discountError && (
                <p className="text-red-500 text-sm mt-2">{discountError}</p>
              )}
              {discountSuccessMessage && (
                <p className="text-green-600 text-sm mt-2">{discountSuccessMessage}</p>
              )}
              {appliedDiscount && (
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">
                    <strong>{appliedDiscount.code}</strong> applied: {appliedDiscount.discountType === 'PERCENTAGE'
                      ? `${appliedDiscount.discountValue}% off`
                      : `$${appliedDiscount.discountValue} off`}
                  </p>
                </div>
              )}
            </div>

            {/* Order Summary & Payment - Full Width at Bottom */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Summary</h2>

              <div className="space-y-2 mb-4">
                {cart.length === 0 ? (
                  <p className="text-gray-600 text-sm">No tickets selected.</p>
                ) : (
                  cart.map((item) => (
                    <div key={item.ticketType.id} className="flex justify-between text-sm">
                      <span>{item.ticketType.name} x {item.quantity}</span>
                      <span>${(item.ticketType.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))
                )}
              </div>

              {appliedDiscount && (
                <div className="border-t border-gray-200 pt-2 mb-2">
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount ({appliedDiscount.code})</span>
                    <span>-${savedAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Options Section */}
              {/* CRITICAL FIX: Always render payment component to prevent unmount/remount flickering */}
              {/* Use enabled prop to control behavior instead of conditional rendering */}
              <div className="mt-6 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Options</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Choose your preferred payment method. We accept Apple Pay, Google Pay, and all major credit cards.
                </p>
                <UniversalPaymentCheckout
                  cart={cart}
                  eventId={eventId as string}
                  email={customerInfo.email}
                  customerName={customerInfo.name}
                  customerPhone={customerInfo.phone}
                  discountCodeId={appliedDiscount?.id || null}
                  enabled={paymentEnabled}
                  amountCents={amountCents}
                  paymentUseCase={PaymentUseCase.TICKET_SALE}
                  returnUrl={`${window.location.origin}/event/success`}
                  cancelUrl={window.location.origin}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  onLoadingChange={setIsProcessing}
                />
              </div>

              {!canCheckout && (
                <div className="mt-6 p-4 bg-gray-50 rounded-md text-center text-gray-600">
                  {!hasTicketsSelected && <p>Please select at least one ticket</p>}
                  {hasTicketsSelected && !emailIsValid && <p>Please enter a valid email address</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE DEBUG: Debug log viewer - floating button */}
      {/* CRITICAL: Enable in production for mobile debugging */}
      <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setShowDebugLogs(!showDebugLogs)}
            className="bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-purple-700"
          >
            {showDebugLogs ? 'Hide' : 'Show'} Debug Logs ({debugLogsRef.current.length})
          </button>
          {showDebugLogs && (
            <div className="mt-2 bg-black text-white p-4 rounded-lg shadow-xl max-w-2xl max-h-96 overflow-auto">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">Debug Console Logs</h3>
                <button
                  onClick={() => {
                    debugLogsRef.current = [];
                    setDisplayedLogs([]);
                  }}
                  className="text-xs bg-red-600 px-2 py-1 rounded"
                >
                  Clear
                </button>
              </div>
              <div className="text-xs font-mono space-y-1">
                {displayedLogs.length === 0 ? (
                  <p className="text-gray-400">No logs captured yet</p>
                ) : (
                  displayedLogs.map((log, index) => (
                    <div key={index} className="border-b border-gray-700 pb-1">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
    </div>
  );
}


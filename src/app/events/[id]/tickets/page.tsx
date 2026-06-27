'use client';

import Image from 'next/image';
import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaTags, FaCreditCard, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaMapPin, FaTicketAlt, FaUser, FaEnvelope, FaMoneyBillWave, FaReceipt } from 'react-icons/fa';
import { Modal } from '@/components/Modal';
import { StripePaymentRequestButton } from '@/components/StripePaymentRequestButton';
import StripeDesktopCheckout from '@/components/StripeDesktopCheckout';
import { formatInTimeZone } from 'date-fns-tz';
import LocationDisplay from '@/components/LocationDisplay';

export default function TicketingPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.id;
  const [event, setEvent] = useState<any>(null);
  const [ticketTypes, setTicketTypes] = useState<any[]>([]);
  const [selectedTickets, setSelectedTickets] = useState<{ [key: number]: number }>({});
  const [email, setEmail] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [discountError, setDiscountError] = useState('');
  const [discountSuccessMessage, setDiscountSuccessMessage] = useState('');
  const [availableDiscounts, setAvailableDiscounts] = useState<any[]>([]);
  const [emailError, setEmailError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const [savedAmount, setSavedAmount] = useState(0);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showCancelledMessage, setShowCancelledMessage] = useState(false);
  const [cancelledPaymentInfo, setCancelledPaymentInfo] = useState<any>(null);
  const [expressCheckoutLoading, setExpressCheckoutLoading] = useState(true);

  useEffect(() => { setMounted(true); }, []);

  // Check for cancelled payment parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const cancelled = urlParams.get('payment_cancelled');
      const pi = urlParams.get('pi');
      const status = urlParams.get('status');

      if (cancelled === 'true' && pi) {
        console.log('[TICKETS] Payment cancelled detected:', { pi, status });
        setCancelledPaymentInfo({ pi, status });
        setShowCancelledMessage(true);

        // Clear the URL parameters to prevent showing the message again on refresh
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('payment_cancelled');
        newUrl.searchParams.delete('pi');
        newUrl.searchParams.delete('status');
        window.history.replaceState({}, '', newUrl.toString());
      }
    }
  }, []);

  const defaultHeroImageUrl = '/images/default_placeholder_hero_image.jpeg';

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch event details
        const eventRes = await fetch(`/api/proxy/event-details/${eventId}`);
        const eventData = await eventRes.json();
        setEvent(eventData);

        // Store event details early for loading page
        if (eventData) {
          sessionStorage.setItem('eventTitle', eventData.title || '');
          sessionStorage.setItem('eventLocation', eventData.location || '');
        }

        // Fetch ticket types for this event (only active ones)
        const ticketRes = await fetch(`/api/proxy/event-ticket-types?eventId.equals=${eventId}&isActive.equals=true`);
        const ticketData = await ticketRes.json();
        setTicketTypes(Array.isArray(ticketData) ? ticketData : []);

        // Fetch discount codes for this event
        const discountRes = await fetch(`/api/proxy/discount-codes?eventId.equals=${eventId}&isActive.equals=true`);
        if (discountRes.ok) {
          const discountData = await discountRes.json();
          setAvailableDiscounts(Array.isArray(discountData) ? discountData : []);
        }

        // --- Hero image selection logic (match home page) ---
        let imageUrl = null;
        // 1. Try flyer
        const flyerRes = await fetch(`/api/proxy/event-medias?eventId.equals=${eventId}&eventFlyer.equals=true`);
        if (flyerRes.ok) {
          const flyerData = await flyerRes.json();
          const flyerArray = Array.isArray(flyerData) ? flyerData : (flyerData ? [flyerData] : []);
          if (flyerArray.length > 0 && flyerArray[0].fileUrl) {
            imageUrl = flyerArray[0].fileUrl;
          }
        }
        // 2. If no flyer, try featured
        if (!imageUrl) {
          // Try to get featured image
          let featuredImageUrl;
          try {
            const featuredRes = await fetch(`/api/proxy/event-medias?eventId.equals=${eventId}&isFeaturedImage.equals=true`);
            if (featuredRes.ok) {
              const featuredData = await featuredRes.json();
              if (Array.isArray(featuredData) && featuredData.length > 0) {
                featuredImageUrl = featuredData[0].fileUrl;
              }
            }
          } catch (error) {
            console.error('Error fetching featured image:', error);
          }
        }
        // 3. Fallback to default
        if (!imageUrl) {
          imageUrl = defaultHeroImageUrl;
        }
        setHeroImageUrl(imageUrl);

        // Store hero image URL for loading page (enhanced buffering strategy)
        if (imageUrl) {
          console.log('Tickets page - storing hero image URL:', imageUrl);
          // TODO: Implement hero image buffering if needed
        }
      } catch (e) {
        setEvent(null);
        setTicketTypes([]);
        setHeroImageUrl(defaultHeroImageUrl);
      } finally {
        setLoading(false);
      }
    }
    if (eventId) fetchData();
    // eslint-disable-next-line
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
        amountSaved = subtotal * (appliedDiscount.discountValue / 100);
      } else if (appliedDiscount.discountType === 'FIXED_AMOUNT') {
        amountSaved = Math.min(subtotal, appliedDiscount.discountValue);
      }
      finalAmount = Math.max(0, subtotal - amountSaved);

      if (amountSaved > 0) {
        setDiscountSuccessMessage(`Discount '${appliedDiscount.code}' applied! You saved $${amountSaved.toFixed(2)}.`);
      }
    } else {
      setDiscountSuccessMessage('');
    }

    setTotalAmount(finalAmount);
    setSavedAmount(amountSaved);
  }, [selectedTickets, appliedDiscount, ticketTypes]);

  const handleTicketChange = (ticketId: number, quantity: number) => {
    console.log('handleTicketChange called:', { ticketId, quantity, selectedTickets });

    const ticketType = ticketTypes.find(t => t.id === ticketId);
    if (!ticketType) {
      console.log('Ticket type not found for ID:', ticketId);
      return;
    }

    // Check if completely sold out - handle null, undefined, and zero values
    const remaining = ticketType.remainingQuantity ?? 0;
    const isSoldOut = remaining == null || remaining <= 0;

    console.log('Ticket availability check:', {
      ticketName: ticketType.name,
      remaining,
      isSoldOut,
      currentSelected: selectedTickets[ticketId] || 0
    });

    if (isSoldOut) {
      console.log(`Cannot select tickets for ${ticketType.name} - sold out`);
      return;
    }

    // Calculate the maximum quantity that can be selected
    const maxOrderQuantity = ticketType.maxQuantityPerOrder ?? 10;
    const maxSelectable = Math.min(remaining, maxOrderQuantity);
    const newQuantity = Math.max(0, Math.min(quantity, maxSelectable));

    console.log('Quantity calculation:', {
      quantity,
      maxOrderQuantity,
      maxSelectable,
      newQuantity
    });

    if (newQuantity >= 0) {
      console.log('Updating selectedTickets:', { ticketId, newQuantity });
      setSelectedTickets(prev => {
        const updated = { ...prev, [ticketId]: newQuantity };
        console.log('New selectedTickets state:', updated);
        return updated;
      });
      // Clear email to force re-validation and PRB recalculation with new total
      setEmail('');
      // Trigger immediate email validation to show user they need to enter email
      if (newQuantity > 0) {
        setEmailError(true); // Show email error immediately when tickets are selected
      } else {
        setEmailError(false); // Hide email error when no tickets are selected
      }
    }
  };

  const calculateSubtotal = () => {
    return Object.entries(selectedTickets).reduce((total, [ticketId, quantity]) => {
      const ticket = ticketTypes.find(t => t.id === parseInt(ticketId));
      return total + (ticket?.price || 0) * quantity;
    }, 0);
  };

  const isTicketTypeAvailable = (ticketType: any, quantity: number) => {
    if (!ticketType) return false;
    const remaining = ticketType.remainingQuantity ?? 0;
    const maxOrderQuantity = ticketType.maxQuantityPerOrder ?? 10;
    // Handle null, undefined, and zero values for sold out check
    return remaining != null && remaining > 0 && remaining >= Math.min(quantity, maxOrderQuantity);
  };

  const emailIsValid = useMemo(() => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, [email]);

  // Derived flags used for validations and enabling/disabling actions
  const hasTicketsSelected = Object.values(selectedTickets).some(q => q > 0);
  const hasUnavailableTickets = Object.entries(selectedTickets).some(([ticketId, quantity]) => {
    if (quantity === 0) return false;
    const ticket = ticketTypes.find(t => t.id === parseInt(ticketId));
    if (!ticket) return false;
    const remaining = ticket.remainingQuantity ?? 0;
    // Handle null, undefined, and zero values for sold out check
    return remaining == null || remaining <= 0; // Only consider completely sold out tickets
  });
  const canCheckout = hasTicketsSelected && emailIsValid && !hasUnavailableTickets;

  const validateAndApplyDiscount = (code: string) => {
    if (Object.values(selectedTickets).every(q => q === 0)) {
      setDiscountError('Please select tickets before applying a discount.');
      return null;
    }

    setDiscountError('');
    const codeToValidate = code.trim().toLowerCase();

    if (!codeToValidate) {
      setAppliedDiscount(null); // Clear discount if input is empty
      return null;
    }

    const codeToApply = availableDiscounts.find(d => d.code.toLowerCase() === codeToValidate);

    if (codeToApply) {
      if (codeToApply.usesCount >= (codeToApply.maxUses || Infinity)) {
        setDiscountError('This discount code has reached its maximum usage limit.');
        setAppliedDiscount(null);
        return null;
      } else {
        setAppliedDiscount(codeToApply); // Success! Set the discount object.
        return codeToApply;
      }
    } else {
      setDiscountError('Invalid code. Please clear the field or enter a valid code to proceed.');
      setAppliedDiscount(null);
      return null;
    }
  };

  const handleApplyDiscount = () => {
    // Validation 1: No tickets selected
    if (Object.values(selectedTickets).every(q => q === 0)) {
      setDiscountError('Please select at least one ticket before applying a discount.');
      return;
    }
    // Validation 2: Discount code is empty
    if (!discountCode.trim()) {
      setDiscountError('Please enter the discount code.');
      return;
    }
    setDiscountError('');
    validateAndApplyDiscount(discountCode);
  };

  const handleCheckout = async () => {
    // 1. Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setEmailError(true);
      return;
    }

    // 2. Auto-apply discount if code is entered but not applied
    let finalDiscount = appliedDiscount;
    if (discountCode && (!appliedDiscount || appliedDiscount.code.toLowerCase() !== discountCode.toLowerCase())) {
      finalDiscount = validateAndApplyDiscount(discountCode);
    }

    // Block checkout if there is a discount code error and the field is not empty
    if (discountError && discountCode.trim()) {
      setShowDiscountModal(true);
      return;
    }

    // 3. Build cart.
    const cart = Object.entries(selectedTickets)
      .filter(([, quantity]) => quantity > 0)
      .map(([ticketId, quantity]) => {
        const ticketType = ticketTypes.find(t => t.id === parseInt(ticketId));
        return { ticketType, quantity };
      });

    if (cart.length === 0) {
      alert('Your cart is empty. Please select at least one ticket.');
      return;
    }

    // 4. Check payment_flow_mode and manual_payment_enabled, route accordingly
    const shouldUseManualPayment =
      event?.paymentFlowMode === 'MANUAL_ONLY' ||
      (event?.paymentFlowMode === 'HYBRID' && event?.manualPaymentEnabled === true);

    if (shouldUseManualPayment) {
      // Route to manual checkout
      const params = new URLSearchParams();
      params.set('cart', JSON.stringify(cart.map(item => ({
        ticketTypeId: item.ticketType.id,
        quantity: item.quantity,
      }))));
      if (finalDiscount?.id) {
        params.set('discountCodeId', finalDiscount.id.toString());
      }
      params.set('email', email);
      router.push(`/events/${eventId}/manual-checkout?${params.toString()}`);
      return;
    }

    // 5. Default: Start processing and call Stripe API directly.
    setIsProcessing(true);

    try {
      const response = await fetch('/api/stripe/event-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cart,
          discountCodeId: finalDiscount?.id || null,
          eventId,
          email,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session.');
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Could not proceed to checkout. Please try again.');
      setIsProcessing(false);
    }
  };

  // Define renderOrderSummary function here, after all the required functions and variables
  const renderOrderSummary = () => {
    // Debug logging to help identify any undefined variables
    console.log('[renderOrderSummary] Debug variables:', {
      availableDiscounts: availableDiscounts?.length,
      discountCode,
      appliedDiscount: appliedDiscount?.id,
      totalAmount,
      hasUnavailableTickets,
      hasTicketsSelected,
      emailIsValid,
      canCheckout,
      email,
      eventId
    });

    // Safety check - only render if component is ready
    if (!mounted || loading || !eventId) {
      console.log('[renderOrderSummary] Component not ready, returning loading state');
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Loading payment options...</p>
        </div>
      );
    }

    return (
      <>
        {/* Discount Code Section */}
        {availableDiscounts.length > 0 && (
          <div className="mb-6">
            <label htmlFor="discountCode" className="block text-sm font-medium text-gray-700 mb-2">
              Discount Code
            </label>
            <div className="space-y-3">
              <input
                type="text"
                id="discountCode"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                placeholder="Enter discount code"
                className="w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
              />
              <button
                onClick={handleApplyDiscount}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 disabled:bg-blue-300 font-semibold flex items-center justify-center gap-2"
              >
                <FaTags />
                Apply
              </button>
            </div>
            {discountError && <p className="text-red-500 text-sm mt-2">{discountError}</p>}
            {discountSuccessMessage && <p className="text-green-600 text-sm mt-2">{discountSuccessMessage}</p>}
          </div>
        )}

        {/* Total */}
        <div className="border-t border-gray-200 pt-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-medium text-gray-600">Total:</span>
            <span className="text-2xl font-bold text-gray-900">${totalAmount.toFixed(2)}</span>
          </div>

          {/* Warning for sold out tickets */}
          {hasUnavailableTickets && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center text-red-700 text-sm">
                <span className="mr-2">⚠️</span>
                <span>Some selected tickets are sold out</span>
              </div>
            </div>
          )}
        </div>

        {/* Email and Checkout */}
        <div>
          {/* Show requirement indicator when tickets are selected */}
          {hasTicketsSelected && (
            <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center text-blue-700 text-sm">
                <span className="mr-2">📧</span>
                <span>Email required to enable payment options</span>
              </div>
            </div>
          )}

          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email for ticket confirmation
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError(false);
            }}
            className={`mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base ${emailError ? 'border-red-500' : 'border-gray-400'}`}
            required
            placeholder="you@example.com"
          />
          {emailError && (
            <p className="text-red-500 text-xs mt-1">
              {email ? 'Please enter a valid email address.' : 'Please enter your email address to proceed with payment.'}
            </p>
          )}
        </div>

        {/* Desktop payment method guidance */}
        {typeof window !== 'undefined' && window.innerWidth > 768 && canCheckout && (
          <div className="mt-3 mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center text-blue-700 text-sm">
              <span className="mr-2">💳</span>
              <span>Please select a pay method or click any of the payment buttons below</span>
            </div>
          </div>
        )}

        {/* Wallets: Desktop uses Express Checkout (Apple/Google/Link); Mobile uses PRB */}
        <div className="mt-4">
          {/* Simple viewport check; SSR-safe since this is a client component */}
          {typeof window !== 'undefined' && window.innerWidth > 768 ? (
            <StripeDesktopCheckout
              cart={Object.entries(selectedTickets)
                .filter(([, quantity]) => quantity > 0)
                .map(([ticketId, quantity]) => ({
                  ticketType: { id: parseInt(ticketId) },
                  quantity,
                }))}
              eventId={String(eventId)}
              email={email}
              discountCodeId={appliedDiscount?.id ?? null}
              enabled={canCheckout}
              amountCents={Math.round(totalAmount * 100)}
              onInvalidClick={() => {
                if (!emailIsValid) setEmailError(true);
                if (!hasTicketsSelected) alert('Please select at least one ticket.');
                if (hasUnavailableTickets) alert('Some selected tickets are sold out. Please adjust your selection.');
              }}
              onLoadingChange={setExpressCheckoutLoading}
            />
          ) : (
            <div
              onClick={() => {
                const hasTickets = Object.values(selectedTickets).some(q => q > 0);
                const validEmail = emailIsValid;
                console.log('[PRB VALIDATION] Placeholder clicked', { hasTickets, validEmail });
                if (!(hasTickets && validEmail)) {
                  if (!validEmail) setEmailError(true);
                  if (!hasTickets) alert('Please select at least one ticket.');
                }
                if (hasUnavailableTickets) alert('Some selected tickets are sold out. Please adjust your selection.');
              }}
              role="button"
              aria-label="Apple Pay / Google Pay"
            >
              <StripePaymentRequestButton
                cart={Object.entries(selectedTickets)
                  .filter(([, quantity]) => quantity > 0)
                  .map(([ticketId, quantity]) => ({
                    ticketType: { id: parseInt(ticketId) },
                    quantity,
                  }))}
                eventId={String(eventId)}
                email={email}
                discountCodeId={appliedDiscount?.id ?? null}
                enabled={canCheckout}
                showPlaceholder
                amountCents={Math.round(totalAmount * 100)}
                onInvalidClick={() => {
                  console.log('[PRB VALIDATION] onInvalidClick fired');
                  if (!emailIsValid) setEmailError(true);
                  if (!hasTicketsSelected) alert('Please select at least one ticket.');
                  if (hasUnavailableTickets) alert('Some selected tickets are sold out. Please adjust your selection.');
                }}
              />
            </div>
          )}
          <div className="text-xs text-gray-700 mt-2">Apple/Google/Link</div>
        </div>

        <div className="mt-6 relative">
          {/* Loading overlay for credit card section - only on desktop when Express Checkout is loading */}
          {typeof window !== 'undefined' && window.innerWidth > 768 && expressCheckoutLoading && canCheckout && (
            <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-500 mx-auto mb-2"></div>
                <p className="text-xs text-gray-600">Loading payment options...</p>
              </div>
            </div>
          )}

          <div className="text-base font-extrabold text-gray-800 mb-3">OR</div>
          <div className="text-sm font-semibold text-gray-700 mb-2">Pay with credit card</div>
          {/* Wrapper captures clicks even when the button is disabled to surface validation errors */}
          <div
            role="button"
            aria-label="Pay with credit card"
            onClick={() => {
              if (!canCheckout) {
                if (!emailIsValid) setEmailError(true);
                if (!hasTicketsSelected) alert('Please select at least one ticket.');
                if (hasUnavailableTickets) alert('Some selected tickets are sold out. Please adjust your selection.');
                return;
              }
            }}
          >
            <button
              type="button"
              onClick={() => {
                if (!canCheckout) return; // Guard (should be handled by wrapper)
                handleCheckout();
              }}
              className="w-full inline-flex items-center justify-center bg-gradient-to-r from-teal-500 to-green-500 text-white font-bold py-4 px-5 rounded-xl shadow hover:from-teal-600 hover:to-green-600 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isProcessing || !canCheckout || (typeof window !== 'undefined' && window.innerWidth > 768 && expressCheckoutLoading)}
            >
              <FaCreditCard className="mr-3" size={22} />
              {hasUnavailableTickets ? 'Tickets Sold Out' : 'Pay with credit card'}
            </button>
          </div>
        </div>
      </>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col" style={{ overflowX: 'hidden' }}>
        {/* HERO SECTION - Full width bleeding to header */}
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
          <Image
            src={heroImageUrl || defaultHeroImageUrl}
            alt="Event Hero"
            width={1200}
            height={400}
            className="hero-image object-cover"
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
            priority
          />
          <div className="hero-overlay" style={{ opacity: 0.1, height: '5px', padding: '20' }}></div>
        </section>

        {/* Responsive Hero Image CSS */}
        <style dangerouslySetInnerHTML={{
          __html: `
            .hero-image {
              width: 100%;
              max-width: 100%;
              height: auto;
              object-fit: cover;
              object-position: center;
              display: block;
              margin: 0 auto;
              padding: 0;
              border-radius: 0;
            }

            .hero-section {
              min-height: 15vh;
              background-color: transparent !important;
              padding: 80px 0 0 0 !important;
              width: 100% !important;
              display: flex;
              align-items: center;
              justify-content: center;
              overflow: hidden;
            }

            @media (max-width: 768px) {
              .hero-image {
                width: 100%;
                max-width: 100%;
                height: auto;
                padding: 0;
                border-radius: 0;
              }

              .hero-section {
                padding: 95px 0 15px 0 !important;
                min-height: 12vh !important;
              }
            }

            @media (max-width: 480px) {
              .hero-image {
                width: 100%;
                padding: 0;
                border-radius: 0;
              }

              .hero-section {
                padding: 90px 0 10px 0 !important;
                min-height: 10vh !important;
              }
            }
          `
        }} />

        {/* Loading content - flex-grow to push footer down */}
        <div className="flex-grow flex flex-col items-center justify-center min-h-[200px] p-6 animate-pulse" style={{ marginTop: '150px', paddingTop: '60px' }}>
          <Image
            src="/images/selling-tickets-vector-loading-image.jpg"
            alt="Ticket Loading"
            width={180}
            height={180}
            className="mb-4 rounded shadow-lg"
            priority
          />
          <div className="text-xl font-bold text-teal-700 mb-2">Please wait while your tickets are being loaded...</div>
          <div className="text-gray-600 text-base text-center">This may take a few moments.<br />Please do not close or refresh this page.</div>
        </div>
      </div>
    );
  }
  if (!event) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-red-600">Event not found.</div>;
  }

  // --- HERO SECTION (prompt-compliant) ---
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col" style={{ overflowX: 'hidden' }}>
      {/* HERO SECTION - Full width bleeding to header */}
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
        <div className="hero-overlay" style={{ opacity: 0.1, height: '5px', padding: '20' }}></div>
      </section>

      {/* Responsive Hero Image CSS */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .hero-image {
            width: 100%;
            max-width: 100%;
            height: auto;
            object-fit: cover;
            object-position: center;
            display: block;
            margin: 0 auto;
            padding: 0;
            border-radius: 0;
          }

          .hero-section {
            min-height: 15vh;
            background-color: transparent !important;
            padding: 80px 0 0 0 !important;
            width: 100% !important;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }

          @media (max-width: 768px) {
            .hero-image {
              width: 100%;
              max-width: 100%;
              height: auto;
              padding: 0;
              border-radius: 0;
            }

            .hero-section {
              padding: 95px 0 15px 0 !important;
              min-height: 12vh !important;
            }
          }

          @media (max-width: 480px) {
            .hero-image {
              width: 100%;
              padding: 0;
              border-radius: 0;
            }

            .hero-section {
              padding: 90px 0 10px 0 !important;
              min-height: 10vh !important;
            }
          }
        `
      }} />

      {/* Cancelled Payment Message */}
      {showCancelledMessage && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Payment Cancelled
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Your payment was cancelled. You can try again with a different payment method.</p>
                  {cancelledPaymentInfo && (
                    <p className="mt-1 text-xs text-yellow-600">
                      Payment ID: {cancelledPaymentInfo.pi} (Status: {cancelledPaymentInfo.status})
                    </p>
                  )}
                </div>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => setShowCancelledMessage(false)}
                    className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-md text-sm font-medium hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Event Details Card */}
        <div className="bg-teal-50 rounded-xl shadow-lg p-6 md:p-8 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            {event.title}
          </h2>
          {event.caption && (
            <div className="text-lg text-teal-700 font-semibold mb-2">{event.caption}</div>
          )}
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-gray-700">
              <span className="text-xl">📅</span>
              <span className="font-semibold">
                {formatInTimeZone(event.startDate, event.timezone || 'America/New_York', 'EEEE, MMMM d, yyyy')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <span className="text-xl">🕐</span>
              <span className="font-semibold">
                {formatTime(event.startTime)}{event.endTime ? ` - ${formatTime(event.endTime)}` : ''} ({formatInTimeZone(event.startDate, event.timezone || 'America/New_York', 'zzz')})
              </span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2 text-gray-700">
                <LocationDisplay location={event.location} />
              </div>
            )}
            {event.venueName && (
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-xl">🏢</span>
                <span className="font-semibold">{event.venueName}</span>
              </div>
            )}
          </div>
          <p className="text-gray-700 text-base">{event.description}</p>
        </div>

        {/* Ticket Selection Section */}
        <div className="bg-slate-50 rounded-xl shadow-lg p-6 md:p-8 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">Select Your Tickets</h2>
          <div className="space-y-6">
            {ticketTypes.length === 0 && (
              <div className="text-center text-gray-500 py-8">No ticket types available for this event.</div>
            )}
            {ticketTypes.map(ticket => {
              // Debug: Log ticket data to understand what backend is returning
              console.log('Ticket data:', {
                id: ticket.id,
                name: ticket.name,
                availableQuantity: ticket.availableQuantity,
                soldQuantity: ticket.soldQuantity,
                remainingQuantity: ticket.remainingQuantity
              });

              // Handle remainingQuantity logic:
              // 1. If backend remainingQuantity is a valid number (not null/undefined), use it
              // 2. If backend remainingQuantity is null/undefined, treat as sold out (0)
              // 3. Only calculate from availableQuantity - soldQuantity if we need a fallback
              const calculatedRemaining = (ticket.availableQuantity ?? 0) - (ticket.soldQuantity ?? 0);
              const remainingQuantity = (ticket.remainingQuantity !== null && ticket.remainingQuantity !== undefined)
                ? ticket.remainingQuantity
                : 0; // Treat null/undefined remainingQuantity as sold out

              // Check if tickets are sold out - handle null, undefined, and zero values
              const isSoldOut = remainingQuantity == null || remainingQuantity <= 0;
              const maxOrderQuantity = ticket.maxQuantityPerOrder ?? 10;

              // Debug: Log sold out status
              console.log('Sold out check for ticket:', {
                ticketId: ticket.id,
                ticketName: ticket.name,
                remainingQuantity,
                isSoldOut,
                availableQuantity: ticket.availableQuantity,
                soldQuantity: ticket.soldQuantity
              });

              // Debug: Log if we're about to render sold out image
              if (isSoldOut) {
                console.log('Rendering sold out image for ticket:', ticket.id, ticket.name);
              }

              return (
                <div key={ticket.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 border border-gray-200 rounded-lg bg-white shadow-sm relative">
                  {/* Sold Out Image Only */}
                  {isSoldOut && (
                    <div className="absolute top-4 right-4 z-10">
                      <Image
                        src="/images/tickets_sold_out.jpg"
                        alt="Tickets Sold Out"
                        width={60}
                        height={60}
                        className="rounded shadow-sm"
                        onLoad={() => console.log('Sold out image loaded for ticket:', ticket.id)}
                        onError={(e) => console.error('Sold out image failed to load for ticket:', ticket.id, e)}
                      />
                    </div>
                  )}

                  <div className="mb-4 sm:mb-0">
                    <h3 className="text-xl font-semibold text-gray-900">{ticket.name}</h3>
                    <p className="text-lg font-bold text-blue-600 mt-1">${ticket.price.toFixed(2)}</p>
                    <p className="text-sm text-gray-600 mt-2">{ticket.description}</p>

                    {/* Low stock warning only */}
                    {!isSoldOut && remainingQuantity != null && remainingQuantity <= 5 && remainingQuantity > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-orange-600 font-medium">
                          ⚠️ Low stock - only {remainingQuantity} left!
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        console.log('Minus button clicked for ticket:', ticket.id, 'current count:', selectedTickets[ticket.id] || 0);
                        handleTicketChange(ticket.id, (selectedTickets[ticket.id] || 0) - 1);
                      }}
                      className="bg-gray-200 text-gray-700 px-3 py-1 rounded-l-md hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                      disabled={isSoldOut || (selectedTickets[ticket.id] || 0) <= 0}
                    >
                      -
                    </button>
                    <span className="px-4 py-1 bg-white border-t border-b">{selectedTickets[ticket.id] || 0}</span>
                    <button
                      onClick={() => {
                        console.log('Plus button clicked for ticket:', ticket.id, 'current count:', selectedTickets[ticket.id] || 0);
                        handleTicketChange(ticket.id, (selectedTickets[ticket.id] || 0) + 1);
                      }}
                      className="bg-gray-200 text-gray-700 px-3 py-1 rounded-r-md hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                      disabled={isSoldOut || (selectedTickets[ticket.id] || 0) >= Math.min(remainingQuantity, maxOrderQuantity)}
                    >
                      +
                    </button>
                  </div>

                  {/* Quantity validation warning */}
                  {selectedTickets[ticket.id] > 0 && remainingQuantity != null && selectedTickets[ticket.id] > remainingQuantity && (
                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                      ⚠️ Only {remainingQuantity} tickets available for this selection
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary Section - Full width below tickets */}
        <div className="bg-slate-50 rounded-xl shadow-lg p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Order Summary</h2>
          {renderOrderSummary()}
        </div>
      </div>
      <Modal open={showDiscountModal} onClose={() => setShowDiscountModal(false)} title="Discount Code Error">
        <div className="text-center">
          <p className="text-lg">
            Please enter valid discount code or clear the field before proceeding.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={() => setShowDiscountModal(false)}
              className="bg-teal-100 hover:bg-teal-200 text-teal-800 px-4 py-2 rounded-md flex items-center gap-2"
            >
              OK
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function formatTime(time: string): string {
  if (!time) return '';
  // Accepts 'HH:mm' or 'hh:mm AM/PM' and returns 'hh:mm AM/PM'
  if (time.match(/AM|PM/i)) return time;
  const [hourStr, minute] = time.split(':');
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour.toString().padStart(2, '0')}:${minute} ${ampm}`;
}

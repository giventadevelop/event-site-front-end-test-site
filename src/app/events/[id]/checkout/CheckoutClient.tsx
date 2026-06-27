'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaTags } from 'react-icons/fa';
import { formatInTimeZone } from 'date-fns-tz';
import LocationDisplay from '@/components/LocationDisplay';
import UniversalPaymentCheckout from '@/components/UniversalPaymentCheckout';
import { Modal } from '@/components/Modal';
import { PaymentUseCase } from '@/types';
import type { CheckoutData } from './CheckoutServerData';

// CRITICAL FIX: Move PaymentSection outside component to prevent recreation
const PaymentSection = React.memo(({
  cart,
  eventId,
  email,
  customerName,
  customerPhone,
  discountCodeId,
  enabled,
  amountCents,
  paymentUseCase,
  returnUrl,
  cancelUrl,
  onInvalidClick,
  onSuccess,
  onError,
  onLoadingChange,
}: {
  cart: Array<{ ticketType: any; quantity: number }>;
  eventId: string;
  email: string;
  customerName?: string;
  customerPhone?: string;
  discountCodeId: number | null;
  enabled: boolean;
  amountCents: number;
  paymentUseCase: PaymentUseCase;
  returnUrl: string;
  cancelUrl: string;
  onInvalidClick: () => void;
  onSuccess: (transactionId: string) => void;
  onError: (error: string) => void;
  onLoadingChange: (loading: boolean) => void;
}) => {
  return (
    <UniversalPaymentCheckout
      cart={cart}
      eventId={eventId}
      email={email}
      customerName={customerName}
      customerPhone={customerPhone}
      discountCodeId={discountCodeId}
      enabled={enabled}
      amountCents={amountCents}
      paymentUseCase={paymentUseCase}
      returnUrl={returnUrl}
      cancelUrl={cancelUrl}
      onInvalidClick={onInvalidClick}
      onSuccess={onSuccess}
      onError={onError}
      onLoadingChange={onLoadingChange}
    />
  );
}, (prevProps, nextProps) => {
  const cartEqual = JSON.stringify(prevProps.cart) === JSON.stringify(nextProps.cart);
  return (
    cartEqual &&
    prevProps.eventId === nextProps.eventId &&
    prevProps.email === nextProps.email &&
    prevProps.customerName === nextProps.customerName &&
    prevProps.customerPhone === nextProps.customerPhone &&
    prevProps.discountCodeId === nextProps.discountCodeId &&
    prevProps.enabled === nextProps.enabled &&
    prevProps.amountCents === nextProps.amountCents &&
    prevProps.paymentUseCase === nextProps.paymentUseCase &&
    prevProps.returnUrl === nextProps.returnUrl &&
    prevProps.cancelUrl === nextProps.cancelUrl
  );
});

PaymentSection.displayName = 'PaymentSection';

interface CheckoutClientProps {
  initialData: CheckoutData;
  eventId: string;
}

export default function CheckoutClient({ initialData, eventId }: CheckoutClientProps) {
  const router = useRouter();

  // Initialize with server data - NO LOADING STATE NEEDED!
  const [event] = useState(initialData.event);
  const [ticketTypes] = useState(initialData.ticketTypes);
  const [availableDiscounts] = useState(initialData.discounts);
  const [heroImageUrl] = useState(initialData.heroImageUrl);

  // Debug: Log hero image URL on mount
  useEffect(() => {
    console.log('[CheckoutClient] 🖼️ Hero image URL received:', heroImageUrl);
    console.log('[CheckoutClient] 🖼️ Initial data heroImageUrl:', initialData.heroImageUrl);
    console.log('[CheckoutClient] 🖼️ Event ID:', eventId);
  }, [heroImageUrl, initialData.heroImageUrl, eventId]);

  // Form state
  const [selectedTickets, setSelectedTickets] = useState<{ [key: number]: number }>({});
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [discountError, setDiscountError] = useState('');
  const [discountSuccessMessage, setDiscountSuccessMessage] = useState('');
  const [emailError, setEmailError] = useState(false);
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
        console.log('[CheckoutClient] Payment cancelled detected:', { pi, status });
        setCancelledPaymentInfo({ pi, status });
        setShowCancelledMessage(true);

        // Clear URL parameters
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('payment_cancelled');
        newUrl.searchParams.delete('pi');
        newUrl.searchParams.delete('status');
        window.history.replaceState({}, '', newUrl.toString());
      }
    }
  }, []);

  // Reactive calculation for total and discount changes
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

  // Note: maxQuantityPerOrder and minQuantityPerOrder come from ticket DTO
  // If maxQuantityPerOrder is null/undefined, tickets are unlimited per order
  // If minQuantityPerOrder is null/undefined, defaults to 1 per database schema

  // Helper function to calculate remaining quantity
  const calculateRemainingQuantity = (ticket: any): number => {
    if (!ticket) return 0;

    // Priority 1: Use remainingQuantity from backend if available
    if (ticket.remainingQuantity != null && ticket.remainingQuantity !== undefined) {
      const remaining = Math.max(0, ticket.remainingQuantity);
      console.log(`[calculateRemainingQuantity] Ticket ${ticket.id} (${ticket.name}): Using backend remainingQuantity=${remaining}`);
      return remaining;
    }

    // Priority 2: Calculate from availableQuantity - soldQuantity
    const availableQty = ticket.availableQuantity ?? 0;
    const soldQty = ticket.soldQuantity ?? 0;

    // If availableQuantity is null/undefined/0, treat as unlimited (Infinity)
    if (availableQty === null || availableQty === undefined || availableQty === 0) {
      console.log(`[calculateRemainingQuantity] Ticket ${ticket.id} (${ticket.name}): availableQuantity is ${availableQty}, treating as unlimited (Infinity)`);
      return Infinity; // Treat as unlimited
    }

    const calculatedRemaining = availableQty - soldQty;
    const result = Math.max(0, calculatedRemaining);
    console.log(`[calculateRemainingQuantity] Ticket ${ticket.id} (${ticket.name}): Calculated remaining=${result} (available=${availableQty}, sold=${soldQty})`);
    return result;
  };

  const handleTicketChange = (ticketId: number, quantity: number) => {
    const ticketType = ticketTypes.find(t => t.id === ticketId);
    if (!ticketType) return;

    const remaining = calculateRemainingQuantity(ticketType);
    // Mark as sold out if remaining quantity is less than or equal to 20 to avoid race conditions
    const isSoldOut = remaining <= 20;

    // CRITICAL: Allow decrementing even if sold out (user may want to deselect tickets they already selected)
    // Only prevent INCREASING quantity when sold out, allow DECREASING (including to 0)
    const currentQty = selectedTickets[ticketId] || 0;
    if (isSoldOut && quantity > currentQty) {
      // Only block if trying to increase quantity when sold out
      console.log(`[CheckoutClient] Cannot increase tickets for ${ticketType.name} - sold out (remaining: ${remaining})`);
      return;
    }
    // Allow decreasing (quantity < currentQty) or setting to 0 even when sold out

    // Use actual DTO values - if maxQuantityPerOrder is null/undefined, treat as unlimited (Infinity)
    const maxOrderQuantity = ticketType.maxQuantityPerOrder ?? Infinity;
    const minOrderQuantity = ticketType.minQuantityPerOrder ?? 1; // Default to 1 per database schema

    // Calculate max selectable: minimum of remaining quantity and max per order (if set)
    const maxSelectable = maxOrderQuantity === Infinity
      ? remaining
      : Math.min(remaining, maxOrderQuantity);

    // Validate quantity against constraints
    let newQuantity = quantity;
    const isDecreasing = quantity < currentQty;

    // CRITICAL: Always allow setting to 0 (user can deselect tickets)
    // Also allow decreasing below minimum (user may want to deselect)
    // Only enforce minimum when INCREASING or when setting a new quantity
    if (quantity === 0) {
      newQuantity = 0;
      console.log(`[CheckoutClient] User deselecting ticket ${ticketId} - setting quantity to 0`);
    } else if (isDecreasing) {
      // User is decreasing - allow it even if below minimum (they're deselecting)
      // But still enforce maximum and remaining quantity limits
      if (quantity > maxSelectable) {
        newQuantity = maxSelectable;
      }
      if (quantity > remaining) {
        newQuantity = remaining;
      }
      console.log(`[CheckoutClient] User decreasing ticket ${ticketId} from ${currentQty} to ${quantity} (allowing below minimum)`);
    } else {
      // User is increasing or setting a new quantity - enforce all constraints
      // If quantity is below minimum, clamp to minimum
      if (quantity > 0 && quantity < minOrderQuantity) {
        newQuantity = minOrderQuantity;
      }
      // If quantity exceeds maximum, clamp to maximum
      if (quantity > maxSelectable) {
        newQuantity = maxSelectable;
      }
      // Ensure quantity doesn't exceed remaining
      if (quantity > remaining) {
        newQuantity = remaining;
      }
    }

    // Always allow setting quantity (including 0)
    if (newQuantity >= 0) {
      console.log(`[CheckoutClient] Updating ticket ${ticketId} quantity from ${selectedTickets[ticketId] || 0} to ${newQuantity}`);
      setSelectedTickets(prev => {
        const updated = { ...prev, [ticketId]: newQuantity };
        // Remove ticket from state if quantity is 0 (cleanup)
        if (newQuantity === 0) {
          const { [ticketId]: _, ...rest } = updated;
          return rest;
        }
        return updated;
      });
      setEmail('');
      if (newQuantity > 0) {
        setEmailError(true);
      } else {
        setEmailError(false);
      }
    }
  };

  const emailIsValid = useMemo(() => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, [email]);

  const hasTicketsSelected = Object.values(selectedTickets).some(q => q > 0);

  // Check for tickets that are unavailable (sold out) or inactive
  const hasUnavailableTickets = Object.entries(selectedTickets).some(([ticketId, quantity]) => {
    if (quantity === 0) return false;
    const ticket = ticketTypes.find(t => t.id === parseInt(ticketId));
    if (!ticket) return false;
    // Check if ticket is inactive
    if (ticket.isActive === false) return true;
    // Check if ticket is sold out (remaining quantity <= 20 to avoid race conditions)
    const remaining = calculateRemainingQuantity(ticket);
    return remaining <= 20;
  });

  // Check for tickets that violate minimum quantity requirements (only for active tickets)
  const hasInvalidMinQuantity = Object.entries(selectedTickets).some(([ticketId, quantity]) => {
    if (quantity === 0) return false; // 0 is allowed (deselected)
    const ticket = ticketTypes.find(t => t.id === parseInt(ticketId));
    if (!ticket || ticket.isActive === false) return false; // Skip inactive tickets
    const minOrderQuantity = ticket.minQuantityPerOrder ?? 1;
    return quantity > 0 && quantity < minOrderQuantity;
  });

  // Check for tickets that violate maximum quantity requirements (only for active tickets)
  const hasInvalidMaxQuantity = Object.entries(selectedTickets).some(([ticketId, quantity]) => {
    if (quantity === 0) return false;
    const ticket = ticketTypes.find(t => t.id === parseInt(ticketId));
    if (!ticket || ticket.isActive === false) return false; // Skip inactive tickets
    const maxOrderQuantity = ticket.maxQuantityPerOrder ?? Infinity;
    const remaining = calculateRemainingQuantity(ticket);
    const maxAllowed = maxOrderQuantity === Infinity ? remaining : Math.min(remaining, maxOrderQuantity);
    return quantity > maxAllowed;
  });

  // Check for tickets that exceed available quantity (only for active tickets)
  const hasExceededAvailable = Object.entries(selectedTickets).some(([ticketId, quantity]) => {
    if (quantity === 0) return false;
    const ticket = ticketTypes.find(t => t.id === parseInt(ticketId));
    if (!ticket || ticket.isActive === false) return false; // Skip inactive tickets
    const remaining = calculateRemainingQuantity(ticket);
    return quantity > remaining;
  });

  // Validate that firstName and lastName are provided
  const nameIsValid = firstName.trim().length > 0 && lastName.trim().length > 0;

  // Can checkout only if all validations pass
  const canCheckout = hasTicketsSelected &&
                      emailIsValid &&
                      nameIsValid &&
                      !hasUnavailableTickets &&
                      !hasInvalidMinQuantity &&
                      !hasInvalidMaxQuantity &&
                      !hasExceededAvailable;

  const validateAndApplyDiscount = (code: string) => {
    if (Object.values(selectedTickets).every(q => q === 0)) {
      setDiscountError('Please select tickets before applying a discount.');
      return null;
    }

    setDiscountError('');
    const codeToValidate = code.trim().toLowerCase();

    if (!codeToValidate) {
      setAppliedDiscount(null);
      return null;
    }

    const codeToApply = availableDiscounts.find(d => d.code.toLowerCase() === codeToValidate);

    if (codeToApply) {
      // Check if discount code has reached maximum uses
      if (codeToApply.usesCount >= (codeToApply.maxUses || Infinity)) {
        setDiscountError('This discount code has reached its maximum usage limit.');
        setAppliedDiscount(null);
        return null;
      }

      // Check date validity if validFrom or validTo are set
      const now = new Date();

      if (codeToApply.validFrom) {
        const validFromDate = new Date(codeToApply.validFrom);
        if (now < validFromDate) {
          setDiscountError(`This discount code is not valid yet. It becomes valid on ${validFromDate.toLocaleDateString()}.`);
          setAppliedDiscount(null);
          return null;
        }
      }

      if (codeToApply.validTo) {
        const validToDate = new Date(codeToApply.validTo);
        if (now > validToDate) {
          setDiscountError(`This discount code has expired. It was valid until ${validToDate.toLocaleDateString()}.`);
          setAppliedDiscount(null);
          return null;
        }
      }

      // All validations passed
      setAppliedDiscount(codeToApply);
      return codeToApply;
    } else {
      setDiscountError('Invalid code. Please clear the field or enter a valid code to proceed.');
      setAppliedDiscount(null);
      return null;
    }
  };

  const handleApplyDiscount = () => {
    if (Object.values(selectedTickets).every(q => q === 0)) {
      setDiscountError('Please select at least one ticket before applying a discount.');
      return;
    }
    if (!discountCode.trim()) {
      setDiscountError('Please enter the discount code.');
      return;
    }
    setDiscountError('');
    validateAndApplyDiscount(discountCode);
  };

  const handlePaymentSuccess = useCallback((transactionId: string) => {
    console.log('[CheckoutClient] Payment successful, transactionId:', transactionId);
    router.push(`/event/success?transactionId=${transactionId}&eventId=${eventId}`);
  }, [router, eventId]);

  const handlePaymentError = useCallback((error: string) => {
    // Error is already displayed via ErrorDialog in UniversalPaymentCheckout
    // No need for additional alert - just log for debugging
    console.error('[CheckoutClient] Payment error:', error);
  }, []);

  const paymentCart = useMemo(() => {
    return Object.entries(selectedTickets)
      .filter(([, quantity]) => quantity > 0)
      .map(([ticketId, quantity]) => {
        const ticketType = ticketTypes.find(t => t.id === parseInt(ticketId));
        return { ticketType, quantity };
      })
      .filter(item => item.ticketType && item.ticketType.isActive !== false); // Only include active tickets
  }, [selectedTickets, ticketTypes]);

  const paymentProps = useMemo(() => ({
    cart: paymentCart,
    eventId: String(eventId),
    email,
    customerName: firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || undefined,
    customerPhone: phone || undefined,
    discountCodeId: appliedDiscount?.id ?? null,
    enabled: canCheckout,
    amountCents: Math.round(totalAmount * 100),
    paymentUseCase: PaymentUseCase.TICKET_SALE,
    returnUrl: typeof window !== 'undefined' ? `${window.location.origin}/event/success` : '/event/success',
    cancelUrl: typeof window !== 'undefined' ? window.location.origin : '/',
  }), [
    paymentCart,
    eventId,
    email,
    firstName,
    lastName,
    phone,
    appliedDiscount?.id,
    canCheckout,
    totalAmount,
  ]);

  const handleInvalidClick = useCallback(() => {
    if (!emailIsValid) setEmailError(true);
    if (!hasTicketsSelected) {
      alert('Please select at least one ticket.');
      return;
    }
    if (!nameIsValid) {
      alert('Please enter your first name and last name.');
      return;
    }
    if (hasUnavailableTickets) {
      alert('Some selected tickets are sold out. Please adjust your selection.');
      return;
    }
    if (hasInvalidMinQuantity) {
      alert('Some selected tickets do not meet the minimum quantity requirement. Please adjust your selection to meet the minimum required quantity.');
      return;
    }
    if (hasInvalidMaxQuantity || hasExceededAvailable) {
      alert('Some selected tickets exceed the maximum allowed quantity or available tickets. Please adjust your selection.');
      return;
    }
  }, [emailIsValid, hasTicketsSelected, nameIsValid, hasUnavailableTickets, hasInvalidMinQuantity, hasInvalidMaxQuantity, hasExceededAvailable]);

  const handleLoadingChange = useCallback((loading: boolean) => {
    setExpressCheckoutLoading(loading);
  }, []);

  const renderOrderSummary = useCallback(() => {
    if (!mounted || !eventId) {
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
        <div className="mb-6">
          <label htmlFor="discountCode" className="block text-sm font-medium text-gray-700 mb-2">
            Discount Code {availableDiscounts.length > 0 && <span className="text-gray-500 text-sm">(Optional)</span>}
          </label>
          <div className="space-y-3">
            <input
              type="text"
              id="discountCode"
              value={discountCode}
              onChange={(e) => {
                setDiscountCode(e.target.value);
                if (discountError) setDiscountError('');
                if (discountSuccessMessage) setDiscountSuccessMessage('');
              }}
              placeholder="Enter discount code"
              className="w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
            />
            <button
              type="button"
              onClick={handleApplyDiscount}
              className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 disabled:bg-blue-300 font-semibold flex items-center justify-center gap-2"
              disabled={!discountCode.trim()}
            >
              <FaTags />
              Apply
            </button>
          </div>
          {discountError && <p className="text-red-500 text-sm mt-2">{discountError}</p>}
          {discountSuccessMessage && <p className="text-green-600 text-sm mt-2">{discountSuccessMessage}</p>}
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

        {/* Total */}
        <div className="border-t border-gray-200 pt-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-medium text-gray-600">Total:</span>
            <span className="text-2xl font-bold text-gray-900">${totalAmount.toFixed(2)}</span>
          </div>

          {/* Debug: Show selected tickets breakdown */}
          {process.env.NODE_ENV === 'development' && hasTicketsSelected && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
              <div className="font-semibold mb-2">Debug: Selected Tickets</div>
              <div className="space-y-1">
                {Object.entries(selectedTickets).map(([ticketId, quantity]) => {
                  if (quantity === 0) return null;
                  const ticket = ticketTypes.find(t => t.id === parseInt(ticketId));
                  return (
                    <div key={ticketId}>
                      {ticket?.name || `Ticket ${ticketId}`}: {quantity} × ${ticket?.price.toFixed(2) || '0.00'} = ${((ticket?.price || 0) * quantity).toFixed(2)}
                    </div>
                  );
                })}
              </div>
              <div className="mt-2 pt-2 border-t border-blue-300">
                <div>Total Quantity: {Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0)}</div>
                <div>Cart Items: {paymentCart.length}</div>
                <div>Cart Breakdown: {JSON.stringify(paymentCart.map(item => ({
                  ticketTypeId: item.ticketType.id,
                  quantity: item.quantity
                })))}</div>
              </div>
            </div>
          )}

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

        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
            placeholder="John"
            required
          />
        </div>

        {/* Last Name */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
            placeholder="Doe"
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number (optional)
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        {/* Payment Instructions Message - Show after payment is initialized */}
        {!expressCheckoutLoading && canCheckout && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start text-blue-700 text-sm">
              <span className="mr-2 mt-0.5">ℹ️</span>
              <span>Please enter all details about the card including zip code. All fields are required.</span>
            </div>
          </div>
        )}

        {/* Payment Section */}
        <div className="mt-4">
          <PaymentSection
            {...paymentProps}
            onInvalidClick={handleInvalidClick}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onLoadingChange={handleLoadingChange}
          />
        </div>
      </>
    );
  }, [mounted, eventId, availableDiscounts, discountCode, appliedDiscount, totalAmount, hasTicketsSelected, hasUnavailableTickets, email, emailIsValid, emailError, firstName, lastName, phone, paymentCart, paymentProps, handleInvalidClick, handlePaymentSuccess, handlePaymentError, handleLoadingChange, discountError, discountSuccessMessage, handleApplyDiscount]);

  const defaultHeroImageUrl = '/images/default_placeholder_hero_image.jpeg';

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col" style={{ overflowX: 'hidden' }}>
      {/* HERO SECTION */}
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
          onError={(e) => {
            console.error('[CheckoutClient] ❌ Hero image failed to load:', heroImageUrl || defaultHeroImageUrl);
            console.error('[CheckoutClient] Image error event:', e);
          }}
          onLoad={() => {
            console.log('[CheckoutClient] ✅ Hero image loaded successfully:', heroImageUrl || defaultHeroImageUrl);
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
            {ticketTypes.filter(ticket => ticket.isActive !== false).length === 0 && (
              <div className="text-center text-gray-500 py-8">No active ticket types available for this event.</div>
            )}
            {ticketTypes
              .filter(ticket => ticket.isActive !== false) // Only show active tickets
              .map(ticket => {
              const remainingQuantity = calculateRemainingQuantity(ticket);
              // Mark as sold out if remainingQuantity is less than or equal to 20 to avoid race conditions and overselling
              // CRITICAL: Only mark as sold out if remainingQuantity is a finite number (not Infinity)
              // Also check that it's a valid number (not null/undefined/NaN)
              const isSoldOut = typeof remainingQuantity === 'number' &&
                                !isNaN(remainingQuantity) &&
                                remainingQuantity !== Infinity &&
                                remainingQuantity <= 20;
              // Use actual DTO values - if maxQuantityPerOrder is null/undefined, treat as unlimited (Infinity)
              const maxOrderQuantity = ticket.maxQuantityPerOrder ?? Infinity;
              const minOrderQuantity = ticket.minQuantityPerOrder ?? 1; // Default to 1 per database schema

              // Debug logging for ALL tickets to verify sold-out detection
              console.log(`[CheckoutClient] Ticket ${ticket.id} (${ticket.name}): remainingQuantity=${remainingQuantity} (type: ${typeof remainingQuantity}), isSoldOut=${isSoldOut}, availableQuantity=${ticket.availableQuantity}, soldQuantity=${ticket.soldQuantity}, backendRemainingQuantity=${ticket.remainingQuantity}`);

              if (isSoldOut) {
                console.log(`[CheckoutClient] ⚠️⚠️⚠️ SOLD OUT DETECTED: Ticket ${ticket.id} (${ticket.name}) - remainingQuantity=${remainingQuantity} <= 20`);
              }

              return (
                <div key={ticket.id} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 border rounded-lg shadow-sm relative ${
                  isSoldOut
                    ? 'border-red-300 bg-red-50/20'
                    : 'border-gray-200 bg-white'
                }`}>
                  {isSoldOut && (
                    <div className="absolute top-4 right-4 z-20">
                      <Image
                        src="/images/tickets_sold_out.jpg"
                        alt="Tickets Sold Out"
                        width={60}
                        height={60}
                        className="rounded shadow-sm"
                      />
                    </div>
                  )}

                  <div className="mb-4 sm:mb-0 flex-1 min-w-0 pr-4">
                    <h3 className="text-xl font-semibold text-gray-900">{ticket.name}</h3>
                    <p className="text-lg font-bold text-blue-600 mt-1">${ticket.price.toFixed(2)}</p>
                    {ticket.description && (
                      <p className="text-sm text-gray-600 mt-2 mb-2">{ticket.description}</p>
                    )}

                    {/* Show min/max quantity per order limits - desktop only */}
                    {minOrderQuantity > 1 && (
                      <p className="hidden sm:block text-xs text-gray-500 mt-1">
                        Min {minOrderQuantity} per order
                      </p>
                    )}
                    {maxOrderQuantity !== Infinity && maxOrderQuantity < Number.MAX_SAFE_INTEGER && (
                      <p className="hidden sm:block text-xs text-gray-500 mt-1">
                        Max {maxOrderQuantity} per order
                      </p>
                    )}

                    {!isSoldOut && remainingQuantity <= 30 && remainingQuantity > 20 && (
                      <div className="mt-3">
                        <p className="text-sm text-orange-600 font-medium">
                          ⚠️ Low stock - only {remainingQuantity} left!
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Controls and messages container - responsive layout */}
                  <div className="w-full sm:w-auto flex flex-col gap-3 mt-4 sm:mt-0">
                    {/* Min/Max limit messages - shown above controls on mobile only */}
                    {minOrderQuantity > 1 && (
                      <p className="sm:hidden text-xs text-gray-500 text-center sm:text-left mb-1">
                        Min {minOrderQuantity} per order
                      </p>
                    )}
                    {maxOrderQuantity !== Infinity && maxOrderQuantity < Number.MAX_SAFE_INTEGER && (
                      <p className="sm:hidden text-xs text-gray-500 text-center sm:text-left mb-1">
                        Max {maxOrderQuantity} per order
                      </p>
                    )}

                    {/* Ticket selection controls */}
                    <div className={`flex items-center justify-center sm:justify-start gap-3 ${isSoldOut ? 'opacity-50 pointer-events-none' : ''}`}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const currentQty = selectedTickets[ticket.id] || 0;
                          handleTicketChange(ticket.id, currentQty - 1);
                        }}
                        className="bg-gray-200 text-gray-700 px-3 py-1 rounded-l-md hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                        disabled={isSoldOut || (() => {
                          const currentQty = selectedTickets[ticket.id] || 0;
                          // Disable if already at 0, OR if sold out and no tickets selected
                          // Allow deselecting if user already has tickets selected (even if sold out)
                          return currentQty <= 0 || (isSoldOut && currentQty === 0);
                        })()}
                      >
                        -
                      </button>
                      <span className="px-4 py-1 bg-white border-t border-b border-gray-200 min-w-[3rem] text-center">
                        {selectedTickets[ticket.id] || 0}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const currentQty = selectedTickets[ticket.id] || 0;
                          handleTicketChange(ticket.id, currentQty + 1);
                        }}
                        className="bg-gray-200 text-gray-700 px-3 py-1 rounded-r-md hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                        disabled={isSoldOut || (() => {
                          const currentQty = selectedTickets[ticket.id] || 0;
                          const maxAllowed = maxOrderQuantity === Infinity
                            ? remainingQuantity
                            : Math.min(remainingQuantity, maxOrderQuantity);
                          return currentQty >= maxAllowed;
                        })()}
                      >
                        +
                      </button>
                    </div>

                    {/* Validation messages - shown below controls with proper spacing */}
                    {(() => {
                      const currentQty = selectedTickets[ticket.id] || 0;
                      const hasValidationIssues =
                        currentQty > 0 && (
                          currentQty < minOrderQuantity ||
                          currentQty > remainingQuantity ||
                          (maxOrderQuantity !== Infinity && currentQty > maxOrderQuantity)
                        );

                      if (!hasValidationIssues && currentQty === 0) return null;

                      return (
                        <div className="w-full space-y-1.5 mt-2">
                          {/* Error: Below minimum quantity - CRITICAL */}
                          {currentQty > 0 && currentQty < minOrderQuantity && (
                            <div className="p-2 bg-red-50 border border-red-300 rounded text-xs text-red-800 break-words leading-tight">
                              <span className="font-semibold">Min {minOrderQuantity} required.</span> Select {minOrderQuantity} or set to 0 to cancel.
                            </div>
                          )}
                          {/* Error: Selected more than available */}
                          {currentQty > remainingQuantity && (
                            <div className="p-2 bg-red-50 border border-red-300 rounded text-xs text-red-800 break-words leading-tight">
                              <span className="font-semibold">Only {remainingQuantity} available.</span> Please reduce selection.
                            </div>
                          )}
                          {/* Error: Exceeds maximum per order limit */}
                          {maxOrderQuantity !== Infinity &&
                           currentQty > maxOrderQuantity &&
                           currentQty <= remainingQuantity && (
                            <div className="p-2 bg-red-50 border border-red-300 rounded text-xs text-red-800 break-words leading-tight">
                              <span className="font-semibold">Max {maxOrderQuantity} per order.</span> Please reduce selection.
                            </div>
                          )}
                          {/* Info: Reached max per order limit (but not exceeded) */}
                          {maxOrderQuantity !== Infinity &&
                           currentQty === maxOrderQuantity &&
                           remainingQuantity > maxOrderQuantity &&
                           currentQty >= minOrderQuantity &&
                           currentQty <= remainingQuantity && (
                            <div className="p-1.5 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800 break-words leading-tight">
                              ℹ️ Max {maxOrderQuantity} per order
                            </div>
                          )}
                          {/* Info: At minimum quantity */}
                          {currentQty === minOrderQuantity &&
                           minOrderQuantity > 1 &&
                           currentQty <= remainingQuantity &&
                           (maxOrderQuantity === Infinity || currentQty <= maxOrderQuantity) && (
                            <div className="p-1.5 bg-green-50 border border-green-200 rounded text-xs text-green-800 break-words leading-tight">
                              ✓ Min requirement met ({minOrderQuantity} {minOrderQuantity === 1 ? 'ticket' : 'tickets'})
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary Section */}
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
  if (time.match(/AM|PM/i)) return time;
  const [hourStr, minute] = time.split(':');
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  if (hour === 0) hour = 12;
  return `${hour.toString().padStart(2, '0')}:${minute} ${ampm}`;
}

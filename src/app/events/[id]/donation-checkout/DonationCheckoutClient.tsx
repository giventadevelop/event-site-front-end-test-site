'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FaTags } from 'react-icons/fa';
import { formatInTimeZone } from 'date-fns-tz';
import LocationDisplay from '@/components/LocationDisplay';
import { Modal } from '@/components/Modal';
import { getAppUrl } from '@/lib/env';
import PredefinedDonationButtons from '@/components/donation/PredefinedDonationButtons';
import DonationAmountSelector from '@/components/donation/DonationAmountSelector';
import PrayerIntentionInput from '@/components/donation/PrayerIntentionInput';
import RecurringDonationToggle from '@/components/donation/RecurringDonationToggle';
import { initializeDonationPayment } from '../donation/ApiServerActions';
import { initializeTicketedFundraiserPayment } from './ApiServerActions';
import type { DonationCheckoutData } from './DonationCheckoutServerData';

interface DonationCheckoutClientProps {
  initialData: DonationCheckoutData;
  eventId: string;
}

/**
 * Donation Checkout Client Component
 * 
 * Handles two different flows:
 * 1. Ticketed Fundraiser Events: Shows ticket selection (like standard checkout) but routes to GiveButter
 * 2. DONATION_BASED or OFFERING Events: Shows donation/offering form
 * 
 * This is a separate checkout flow from /events/[id]/checkout for tracking purposes
 */
export default function DonationCheckoutClient({ initialData, eventId }: DonationCheckoutClientProps) {
  const router = useRouter();

  // Determine which flow to use
  const isTicketedFundraiser = initialData.isTicketedFundraiser;
  const isDonationOnly = initialData.isDonationBased && !isTicketedFundraiser;
  const isOffering = initialData.isOffering;

  // For ticketed fundraisers: Use ticket selection flow
  if (isTicketedFundraiser) {
    return <TicketedFundraiserCheckout initialData={initialData} eventId={eventId} />;
  }

  // For donation-only or offering events: Use donation form flow
  return <DonationFormCheckout initialData={initialData} eventId={eventId} isOffering={isOffering} />;
}

/**
 * Ticketed Fundraiser Checkout Component
 * Shows ticket selection similar to standard checkout, but payment routes to GiveButter
 */
function TicketedFundraiserCheckout({ initialData, eventId }: { initialData: DonationCheckoutData; eventId: string }) {
  const router = useRouter();
  const [event] = useState(initialData.event);
  const [ticketTypes] = useState(initialData.ticketTypes);
  const [availableDiscounts] = useState(initialData.discounts);
  const [heroImageUrl] = useState(initialData.heroImageUrl);

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
        console.log('[DonationCheckoutClient] Payment cancelled detected:', { pi, status });
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

  // Helper function to calculate remaining quantity
  const calculateRemainingQuantity = (ticket: any): number => {
    if (!ticket) return 0;

    if (ticket.remainingQuantity != null && ticket.remainingQuantity !== undefined) {
      const remaining = Math.max(0, ticket.remainingQuantity);
      return remaining;
    }

    const availableQty = ticket.availableQuantity ?? 0;
    const soldQty = ticket.soldQuantity ?? 0;

    if (availableQty === null || availableQty === undefined || availableQty === 0) {
      return Infinity;
    }

    const calculatedRemaining = availableQty - soldQty;
    return Math.max(0, calculatedRemaining);
  };

  const handleTicketChange = (ticketId: number, quantity: number) => {
    const ticketType = ticketTypes.find(t => t.id === ticketId);
    if (!ticketType) return;

    const remaining = calculateRemainingQuantity(ticketType);
    const isSoldOut = remaining <= 20;

    const currentQty = selectedTickets[ticketId] || 0;
    if (isSoldOut && quantity > currentQty) {
      return;
    }

    const maxOrderQuantity = ticketType.maxQuantityPerOrder ?? Infinity;
    const minOrderQuantity = ticketType.minQuantityPerOrder ?? 1;

    const maxSelectable = maxOrderQuantity === Infinity
      ? remaining
      : Math.min(remaining, maxOrderQuantity);

    let newQuantity = quantity;
    const isDecreasing = quantity < currentQty;

    if (quantity === 0) {
      newQuantity = 0;
    } else if (isDecreasing) {
      if (quantity > maxSelectable) {
        newQuantity = maxSelectable;
      }
      if (quantity > remaining) {
        newQuantity = remaining;
      }
    } else {
      if (quantity > 0 && quantity < minOrderQuantity) {
        newQuantity = minOrderQuantity;
      }
      if (quantity > maxSelectable) {
        newQuantity = maxSelectable;
      }
      if (quantity > remaining) {
        newQuantity = remaining;
      }
    }

    if (newQuantity >= 0) {
      setSelectedTickets(prev => {
        const updated = { ...prev, [ticketId]: newQuantity };
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

  // Build cart for payment
  const cart = useMemo(() => {
    return Object.entries(selectedTickets)
      .filter(([_, quantity]) => quantity > 0)
      .map(([ticketId, quantity]) => {
        const ticketType = ticketTypes.find(t => t.id === parseInt(ticketId));
        return {
          ticketType: ticketType!,
          quantity,
        };
      });
  }, [selectedTickets, ticketTypes]);

  const amountCents = Math.round(totalAmount * 100);
  const hasTickets = cart.length > 0;
  const customerName = `${firstName} ${lastName}`.trim() || undefined;
  const customerPhone = phone.trim() || undefined;
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [giveButterNotConfigured, setGiveButterNotConfigured] = useState(false);

  const appOrigin =
    typeof window !== 'undefined' ? window.location.origin : getAppUrl();

  // Success URL - use donation-checkout success route for tracking
  // For donation-checkout flow, redirect to donation success page (not standard ticket success)
  const returnUrl = `${appOrigin}/events/${eventId}/donation/success`;
  const cancelUrl = `${appOrigin}/events/${eventId}/donation-checkout`;

  // Handle payment initialization for ticketed fundraisers with GiveButter
  const handleCheckout = async () => {
    if (!hasTickets || !emailIsValid) {
      setEmailError(true);
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);
    setGiveButterNotConfigured(false);

    try {
      // Build items array for payment initialization
      const items = cart.map(item => ({
        itemType: 'TICKET',
        itemId: item.ticketType.id,
        description: item.ticketType.name,
        quantity: item.quantity,
        unitPrice: item.ticketType.price,
      }));

      // Call custom server action that sends paymentType and paymentProvider
      const response = await initializeTicketedFundraiserPayment({
        eventId: parseInt(eventId),
        items,
        amount: totalAmount,
        currency: 'USD',
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
        givebutterCampaignId: initialData.givebutterCampaignId,
        isFundraiser: initialData.isFundraiserEvent,
        isCharity: initialData.isCharityEvent,
        discountCodeId: appliedDiscount?.id || null,
        returnUrl,
        cancelUrl,
      });

      // Redirect to GiveButter checkout URL
      const checkoutUrl = response.checkoutUrl || response.sessionUrl;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
        return;
      }

      // No checkout URL: backend likely fell back to Stripe (GiveButter not configured)
      if (response.clientSecret) {
        setGiveButterNotConfigured(true);
        setPaymentError(
          'GiveButter is not configured for this organization. The payment system tried to use Stripe instead, but this page only supports GiveButter donation checkout. Please contact the event organizer to enable GiveButter, or use the standard ticket checkout below.'
        );
      } else {
        setPaymentError(
          'No checkout URL was returned. GiveButter may not be configured for this organization. Please contact the event organizer to enable GiveButter donation checkout.'
        );
      }
      setIsProcessing(false);
    } catch (error) {
      console.error('[TicketedFundraiserCheckout] Payment initialization error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize payment. Please try again.';
      setPaymentError(errorMessage);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image Section */}
      {heroImageUrl && (
        <div className="relative w-full h-64 sm:h-80 md:h-96 overflow-hidden">
          <Image
            src={heroImageUrl}
            alt={event.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
            {event.caption && (
              <p className="text-lg opacity-90">{event.caption}</p>
            )}
          </div>
        </div>
      )}

      {/* Ticket Selection Section */}
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">Select Tickets</h2>
          
          {/* Ticket Types */}
          <div className="space-y-4 mb-6">
            {ticketTypes.map((ticket) => {
              const quantity = selectedTickets[ticket.id] || 0;
              const remaining = calculateRemainingQuantity(ticket);
              const isSoldOut = remaining <= 20;

              return (
                <div key={ticket.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{ticket.name}</h3>
                      <p className="text-gray-600 text-sm">{ticket.description}</p>
                      <p className="text-teal-600 font-bold mt-1">${ticket.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleTicketChange(ticket.id, quantity - 1)}
                        disabled={quantity === 0}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                      >
                        -
                      </button>
                      <span className="w-12 text-center">{quantity}</span>
                      <button
                        onClick={() => handleTicketChange(ticket.id, quantity + 1)}
                        disabled={isSoldOut && quantity >= remaining}
                        className="px-3 py-1 border rounded disabled:opacity-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  {isSoldOut && (
                    <p className="text-red-500 text-sm">Limited availability</p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Customer Information */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError(false);
                }}
                className="w-full px-4 py-3 border rounded-xl focus:ring-blue-500 text-base"
                placeholder="Email *"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-blue-500 text-base"
                  placeholder="First Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 border rounded-xl focus:ring-blue-500 text-base"
                  placeholder="Last Name"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone (Optional)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl focus:ring-blue-500 text-base"
                placeholder="Phone (Optional)"
              />
            </div>
          </div>

          {/* Total */}
          {hasTickets && (
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>${totalAmount.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Payment Error Display */}
          {paymentError && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-red-800">{paymentError}</p>
                  {giveButterNotConfigured && (
                    <a
                      href={`/events/${eventId}/checkout`}
                      className="mt-3 inline-block text-sm font-medium text-teal-600 hover:text-teal-700 underline"
                    >
                      Use standard ticket checkout (Stripe) →
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Checkout Button */}
          {hasTickets && emailIsValid && (
            <button
              onClick={handleCheckout}
              disabled={isProcessing || !hasTickets || !emailIsValid}
              className="mt-6 w-full bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              type="button"
            >
              {isProcessing ? 'Processing...' : `Checkout - $${totalAmount.toFixed(2)}`}
            </button>
          )}

          {/* Return to Event Link */}
          <div className="mt-4 text-center">
            <a
              href={`/events/${eventId}`}
              className="text-teal-600 hover:text-teal-700 text-sm font-medium"
            >
              ← Return to Event
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Donation Form Checkout Component
 * Shows donation/offering form for DONATION_BASED or OFFERING events
 */
function DonationFormCheckout({ 
  initialData, 
  eventId, 
  isOffering 
}: { 
  initialData: DonationCheckoutData; 
  eventId: string; 
  isOffering: boolean;
}) {
  const router = useRouter();
  const [donationAmount, setDonationAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [prayerIntention, setPrayerIntention] = useState<string>('');
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const appOrigin =
    typeof window !== 'undefined' ? window.location.origin : getAppUrl();

  const handlePresetAmount = (amount: number) => {
    setDonationAmount(amount);
    setCustomAmount('');
    if (errors.amount) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.amount;
        return newErrors;
      });
    }
  };

  const handleCustomAmount = (value: string) => {
    setCustomAmount(value);
    const numValue = parseFloat(value);
    setDonationAmount(isNaN(numValue) ? null : numValue);
    if (errors.amount) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.amount;
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!donationAmount || donationAmount < 1) {
      newErrors.amount = 'Please select or enter a donation amount (minimum $1)';
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDonate = async () => {
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Use donation success route for tracking
      const successRoute = isOffering 
        ? `${appOrigin}/events/${eventId}/offering/success`
        : `${appOrigin}/events/${eventId}/donation/success`;
      
      const response = await initializeDonationPayment({
        eventId: parseInt(eventId),
        amount: donationAmount!,
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
        givebutterCampaignId: initialData.givebutterCampaignId,
        isFundraiser: initialData.isFundraiserEvent,
        isCharity: initialData.isCharityEvent,
        prayerIntention: prayerIntention.trim() || undefined,
        returnUrl: successRoute,
        cancelUrl: `${appOrigin}/events/${eventId}`,
      });

      const checkoutUrl = response.checkoutUrl || response.sessionUrl;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Donation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process donation. Please try again.';
      alert(errorMessage);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image Section */}
      {initialData.heroImageUrl && (
        <div className="relative w-full h-64 sm:h-80 md:h-96 overflow-hidden">
          <Image
            src={initialData.heroImageUrl}
            alt={initialData.event.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h1 className="text-3xl font-bold mb-2">{initialData.event.title}</h1>
            {initialData.event.caption && (
              <p className="text-lg opacity-90">{initialData.event.caption}</p>
            )}
          </div>
        </div>
      )}

      {/* Donation Form Section */}
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">
            {isOffering ? 'Make an Offering' : 'Make a Donation'}
          </h2>
          
          {/* Preset Donation Buttons */}
          <PredefinedDonationButtons
            onAmountSelect={handlePresetAmount}
            selectedAmount={donationAmount}
            presets={[5, 10, 25, 50, 100]}
          />

          {/* Custom Amount Input */}
          <DonationAmountSelector
            value={customAmount}
            onChange={handleCustomAmount}
            error={errors.amount}
          />

          {/* Donor Information Form */}
          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                id="email"
                type="email"
                placeholder="Email *"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.email;
                      return newErrors;
                    });
                  }
                }}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-blue-500 text-base ${
                  errors.email
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-400 focus:border-blue-500'
                }`}
              />
              {errors.email && (
                <div className="text-red-500 text-sm mt-1">{errors.email}</div>
              )}
            </div>

            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                id="firstName"
                type="text"
                placeholder="First Name *"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (errors.firstName) {
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.firstName;
                      return newErrors;
                    });
                  }
                }}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-blue-500 text-base ${
                  errors.firstName
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-400 focus:border-blue-500'
                }`}
              />
              {errors.firstName && (
                <div className="text-red-500 text-sm mt-1">{errors.firstName}</div>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                id="lastName"
                type="text"
                placeholder="Last Name *"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (errors.lastName) {
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.lastName;
                      return newErrors;
                    });
                  }
                }}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-blue-500 text-base ${
                  errors.lastName
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-400 focus:border-blue-500'
                }`}
              />
              {errors.lastName && (
                <div className="text-red-500 text-sm mt-1">{errors.lastName}</div>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone (Optional)
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="Phone (Optional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 text-base"
              />
            </div>

            {/* Prayer Intention */}
            <PrayerIntentionInput
              value={prayerIntention}
              onChange={setPrayerIntention}
              optional={true}
            />

            {/* Recurring Donation Toggle */}
            <RecurringDonationToggle
              enabled={isRecurring}
              onChange={setIsRecurring}
            />
          </div>

          {/* Error Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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
                          <span className="font-medium capitalize">{fieldName.replace(/([A-Z])/g, ' $1').trim()}:</span> {errorMessage}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Donate Button */}
          <button
            onClick={handleDonate}
            disabled={isProcessing || !donationAmount}
            className="mt-6 w-full bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            type="button"
          >
            {isProcessing ? 'Processing...' : `${isOffering ? 'Make Offering' : 'Donate'} ${donationAmount ? `$${donationAmount.toFixed(2)}` : ''}`}
          </button>

          {/* Return to Event Link */}
          <div className="mt-4 text-center">
            <a
              href={`/events/${eventId}`}
              className="text-teal-600 hover:text-teal-700 text-sm font-medium"
            >
              ← Return to Event
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

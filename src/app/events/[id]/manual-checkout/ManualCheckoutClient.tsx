'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import type { CheckoutData } from '../checkout/CheckoutServerData';
import type { EventDetailsDTO, ManualPaymentRequestDTO, ManualPaymentMethodType } from '@/types';
import { createManualPaymentRequestServer, fetchManualPaymentMethodsServer } from '@/app/admin/manual-payments/ApiServerActions';
import { withTenantId } from '@/lib/withTenantId';

interface ManualCheckoutClientProps {
  initialData: CheckoutData;
  eventId: string;
  event: EventDetailsDTO;
}

const MANUAL_PAYMENT_METHODS: Array<{
  value: ManualPaymentMethodType;
  label: string;
  description: string;
  logo: string; // SVG path or emoji
  color: string; // Color for the payment method
}> = [
    {
      value: 'ZELLE_MANUAL',
      label: 'Zelle',
      description: 'Send money directly to the organizer via Zelle',
      logo: '💸',
      color: 'blue'
    },
    {
      value: 'VENMO_MANUAL',
      label: 'Venmo',
      description: 'Send money directly to the organizer via Venmo',
      logo: '💳',
      color: 'indigo'
    },
    {
      value: 'CASH_APP_MANUAL',
      label: 'Cash App',
      description: 'Send money directly to the organizer via Cash App',
      logo: '💵',
      color: 'green'
    },
    {
      value: 'CASH',
      label: 'Cash',
      description: 'Pay with cash at the event',
      logo: '💵',
      color: 'yellow'
    },
    {
      value: 'CHECK',
      label: 'Check',
      description: 'Pay with a check',
      logo: '📝',
      color: 'purple'
    },
    {
      value: 'OTHER_MANUAL',
      label: 'Other',
      description: 'Other manual payment method',
      logo: '💼',
      color: 'gray'
    },
  ];

export default function ManualCheckoutClient({ initialData, eventId, event }: ManualCheckoutClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize with server data
  const [eventData] = useState(initialData.event);
  const [ticketTypes] = useState(initialData.ticketTypes);
  const [availableDiscounts] = useState(initialData.discounts);
  const [heroImageUrl] = useState(initialData.heroImageUrl);

  // Parse cart from URL params
  const cartFromParams = useMemo(() => {
    const cartParam = searchParams.get('cart');
    if (!cartParam) return [];
    try {
      return JSON.parse(cartParam);
    } catch {
      return [];
    }
  }, [searchParams]);

  // Form state
  const [selectedTickets, setSelectedTickets] = useState<{ [key: number]: number }>(() => {
    const tickets: { [key: number]: number } = {};
    cartFromParams.forEach((item: { ticketTypeId: number; quantity: number }) => {
      tickets[item.ticketTypeId] = item.quantity;
    });
    return tickets;
  });
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<ManualPaymentMethodType | ''>('');
  const [proofOfPaymentFile, setProofOfPaymentFile] = useState<File | null>(null);
  const [proofOfPaymentUrl, setProofOfPaymentUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableMethods, setAvailableMethods] = useState<Array<{ providerName: string; enabled: boolean }>>([]);
  const [paymentMethodError, setPaymentMethodError] = useState(false);
  const [contactInfoError, setContactInfoError] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [ticketSelectionError, setTicketSelectionError] = useState(false);
  const [acknowledgmentChecked, setAcknowledgmentChecked] = useState(false);
  const [acknowledgmentError, setAcknowledgmentError] = useState(false);

  // Fetch available manual payment methods
  useEffect(() => {
    async function fetchMethods() {
      try {
        const methods = await fetchManualPaymentMethodsServer();
        setAvailableMethods(methods);
      } catch (err) {
        console.error('Error fetching manual payment methods:', err);
      }
    }
    fetchMethods();
  }, []);

  // Helper function to calculate remaining quantity (same as checkout page)
  const calculateRemainingQuantity = (ticket: any): number => {
    if (!ticket) return 0;

    // Priority 1: Use remainingQuantity from backend if available
    if (ticket.remainingQuantity != null && ticket.remainingQuantity !== undefined) {
      const remaining = Math.max(0, ticket.remainingQuantity);
      return remaining;
    }

    // Priority 2: Calculate from availableQuantity - soldQuantity
    const availableQty = ticket.availableQuantity ?? 0;
    const soldQty = ticket.soldQuantity ?? 0;

    // If availableQuantity is null/undefined/0, treat as unlimited (Infinity)
    if (availableQty === null || availableQty === undefined || availableQty === 0) {
      return Infinity; // Treat as unlimited
    }

    const calculatedRemaining = availableQty - soldQty;
    return Math.max(0, calculatedRemaining);
  };

  // Handle ticket quantity changes (same as checkout page)
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
      return;
    }

    // Clear ticket selection error when user selects tickets
    if (ticketSelectionError && quantity > 0) {
      setTicketSelectionError(false);
      setError(null);
    }

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
    } else if (isDecreasing) {
      // User is decreasing - allow it even if below minimum (they're deselecting)
      // But still enforce maximum and remaining quantity limits
      if (quantity > maxSelectable) {
        newQuantity = maxSelectable;
      }
      if (quantity > remaining) {
        newQuantity = remaining;
      }
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
      setSelectedTickets(prev => {
        const updated = { ...prev, [ticketId]: newQuantity };
        // Remove ticket from state if quantity is 0 (cleanup)
        if (newQuantity === 0) {
          const { [ticketId]: _, ...rest } = updated;
          return rest;
        }
        return updated;
      });
    }
  };

  // Calculate total amount
  const totalAmount = useMemo(() => {
    return Object.entries(selectedTickets).reduce((total, [ticketId, quantity]) => {
      const ticket = ticketTypes.find(t => t.id === parseInt(ticketId));
      return total + (ticket?.price || 0) * quantity;
    }, 0);
  }, [selectedTickets, ticketTypes]);

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProofOfPaymentFile(file);
      // Create preview URL
      const url = URL.createObjectURL(file);
      setProofOfPaymentUrl(url);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent form from submitting normally

    console.log('[ManualCheckout] Form submission started');
    console.log('[ManualCheckout] Form data:', {
      email,
      selectedTickets,
      selectedPaymentMethod,
      acknowledgmentChecked,
      totalAmount,
    });

    // Clear all previous errors
    setError(null);
    setContactInfoError(false);
    setEmailError(null);
    setTicketSelectionError(false);
    setPaymentMethodError(false);
    setAcknowledgmentError(false);

    // Collect all validation errors at once
    const validationErrors: string[] = [];
    let hasTicketError = false;
    let hasEmailError = false;
    let hasPaymentMethodError = false;
    let hasAcknowledgmentError = false;

    // Validation - Ticket Selection
    const hasSelectedTickets = Object.keys(selectedTickets).some(
      ticketId => (selectedTickets[parseInt(ticketId)] || 0) > 0
    );
    if (!hasSelectedTickets) {
      validationErrors.push('Please select at least one ticket');
      hasTicketError = true;
    }

    // Validation - Contact Information
    if (!email || email.trim() === '') {
      validationErrors.push('Email is required');
      hasEmailError = true;
    } else {
      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        validationErrors.push('Please enter a valid email address');
        hasEmailError = true;
      }
    }

    // Payment Method Validation
    if (!selectedPaymentMethod) {
      validationErrors.push('Please select a payment method');
      hasPaymentMethodError = true;
    }

    // Acknowledgment Validation
    if (!acknowledgmentChecked) {
      validationErrors.push('Please acknowledge that tickets will be issued after payment confirmation');
      hasAcknowledgmentError = true;
    }

    // If there are any validation errors, set all error states and return
    if (validationErrors.length > 0) {
      setTicketSelectionError(hasTicketError);
      setContactInfoError(hasEmailError);
      setEmailError(hasEmailError ? (email && email.trim() ? 'Please enter a valid email address' : 'Email is required') : null);
      setPaymentMethodError(hasPaymentMethodError);
      setAcknowledgmentError(hasAcknowledgmentError);
      setError(validationErrors.join('. '));

      // Scroll to first error
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Upload proof of payment file to S3 if provided
      // For now, we'll create the payment request without the file URL
      // The file upload will be handled separately via the admin API

      // Create manual payment request
      // Backend expects: paymentMethodType (not manualPaymentMethodType), tenantId, and amountDue
      // Use withTenantId to inject tenantId per cursor rules

      // Convert selectedTickets object to array format for backend
      // selectedTickets format: { ticketTypeId: quantity, ... }
      // Backend expects: JSON string like '[{"ticketTypeId": 4151, "quantity": 1}]'
      const selectedTicketsArray = Object.entries(selectedTickets)
        .filter(([_, quantity]) => quantity > 0)
        .map(([ticketTypeId, quantity]) => ({
          ticketTypeId: parseInt(ticketTypeId),
          quantity: quantity,
        }));

      const paymentRequestPayload = withTenantId({
        eventId: parseInt(eventId),
        ticketTransactionId: null, // Will be created after payment is received
        manualPaymentMethodType: selectedPaymentMethod,
        amountDue: totalAmount, // Backend expects amountDue
        status: 'REQUESTED',
        // These fields may not be in DTO but backend accepts them
        requesterEmail: email,
        requesterName: firstName && lastName ? `${firstName} ${lastName}` : firstName || lastName || undefined,
        requesterPhone: phone || undefined,
        proofOfPaymentFileUrl: proofOfPaymentUrl || undefined,
        // Backend supports selectedTickets as JSON string for transaction item creation
        // Format: '[{"ticketTypeId": 4151, "quantity": 1}, {"ticketTypeId": 4152, "quantity": 2}]'
        selectedTickets: selectedTicketsArray.length > 0 ? JSON.stringify(selectedTicketsArray) : undefined,
      } as any); // Type assertion needed due to DTO mismatch

      console.log('[ManualCheckout] Payment request payload:', paymentRequestPayload);

      const paymentRequest = await createManualPaymentRequestServer(paymentRequestPayload);

      // Redirect to success page
      if (paymentRequest.id) {
        console.log('[ManualCheckout] Payment request created successfully, redirecting to success page:', paymentRequest.id);
        router.push(`/events/${eventId}/manual-checkout/success?requestId=${paymentRequest.id}`);
        // Don't set isSubmitting to false here - let the redirect happen
        return;
      } else {
        throw new Error('Payment request created but no ID returned');
      }
    } catch (err: any) {
      console.error('[ManualCheckout] Error creating manual payment request:', err);
      console.error('[ManualCheckout] Error details:', {
        message: err.message,
        stack: err.stack,
        status: err.status,
        errorData: err.errorData,
      });

      // Use the user-friendly error message from the error object
      const userMessage = err.message || 'Failed to create payment request. Please try again.';
      setError(userMessage);
      setIsSubmitting(false);

      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };


  // Main checkout form
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image */}
      {heroImageUrl && (
        <div className="relative w-full h-auto">
          <Image
            src={heroImageUrl}
            alt={eventData.title}
            width={1200}
            height={600}
            className="w-full h-auto object-contain"
            priority
          />
        </div>
      )}

      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Manual Payment Checkout</h2>

          {/* Error Display - User-friendly error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-lg shadow-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-semibold text-red-800 mb-1">
                    Unable to Submit Payment Request
                  </h3>
                  <p className="text-sm text-red-700">
                    {error}
                  </p>
                  <button
                    onClick={() => setError(null)}
                    className="mt-2 text-sm text-red-600 hover:text-red-800 underline focus:outline-none"
                    type="button"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Ticket Selection Section - Same as checkout page */}
            <div className={`rounded-xl shadow-lg p-6 md:p-8 mb-8 transition-all duration-300 ${ticketSelectionError
              ? 'bg-red-50 border-2 border-red-500'
              : 'bg-slate-50 border-2 border-gray-200'
              }`}>
              <h2 className={`text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2 ${ticketSelectionError ? 'text-red-700' : 'text-gray-800'
                }`}>
                Select Your Tickets
                {ticketSelectionError && (
                  <span className="text-sm font-normal text-red-600">(Required)</span>
                )}
              </h2>
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

                    return (
                      <div key={ticket.id} className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 border rounded-lg shadow-sm relative ${isSoldOut
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
              {ticketSelectionError && (
                <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-sm text-red-700 font-medium">
                    ⚠️ Please select at least one ticket to continue
                  </p>
                </div>
              )}
            </div>

            {/* Order Summary Section */}
            <div className="bg-slate-50 rounded-xl shadow-lg p-6 md:p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Order Summary</h2>
              {/* Selected Tickets Summary */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Selected Tickets</h3>
                <div className="space-y-2">
                  {Object.entries(selectedTickets).map(([ticketId, quantity]) => {
                    const ticket = ticketTypes.find(t => t.id === parseInt(ticketId));
                    if (!ticket || quantity === 0) return null;
                    return (
                      <div key={ticketId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span>{ticket.name} × {quantity}</span>
                        <span className="font-medium">${(ticket.price * quantity).toFixed(2)}</span>
                      </div>
                    );
                  })}
                  {Object.entries(selectedTickets).filter(([, qty]) => qty > 0).length === 0 && (
                    <p className="text-gray-500 text-sm py-4">No tickets selected. Please select tickets above.</p>
                  )}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total:</span>
                    <span>${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className={`rounded-xl p-6 transition-all duration-300 ${contactInfoError
              ? 'bg-red-50 border-2 border-red-500 shadow-md'
              : 'bg-white border-2 border-gray-200'
              }`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${contactInfoError ? 'text-red-700' : 'text-gray-800'
                }`}>
                Contact Information
                {contactInfoError && (
                  <span className="text-sm font-normal text-red-600">(Required fields missing)</span>
                )}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${contactInfoError && emailError ? 'text-red-700' : 'text-gray-700'
                    }`}>
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      // Clear errors when user starts typing
                      if (emailError) {
                        setEmailError(null);
                        setContactInfoError(false);
                        setError(null);
                      }
                    }}
                    className={`w-full border rounded-lg px-4 py-2 transition-all ${emailError
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500'
                      }`}
                  />
                  {emailError && (
                    <p className="mt-1 text-sm text-red-600">{emailError}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>
              {contactInfoError && emailError && (
                <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-sm text-red-700 font-medium">
                    ⚠️ {emailError}
                  </p>
                </div>
              )}
            </div>

            {/* Payment Method Selection */}
            <div className={`rounded-xl p-6 transition-all duration-300 ${paymentMethodError
              ? 'bg-red-50 border-2 border-red-500 shadow-md'
              : 'bg-white border-2 border-gray-200'
              }`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${paymentMethodError ? 'text-red-700' : 'text-gray-800'
                }`}>
                Select Payment Method <span className="text-red-500">*</span>
                {paymentMethodError && (
                  <span className="text-sm font-normal text-red-600">(Required)</span>
                )}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MANUAL_PAYMENT_METHODS.map((method) => {
                  const isEnabled = availableMethods.length === 0 ||
                    availableMethods.some(m => m.providerName === method.value && m.enabled);
                  if (!isEnabled) return null;

                  const isSelected = selectedPaymentMethod === method.value;
                  const colorClasses = {
                    blue: isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300',
                    indigo: isSelected ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300',
                    green: isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300',
                    yellow: isSelected ? 'border-yellow-500 bg-yellow-50' : 'border-gray-200 hover:border-yellow-300',
                    purple: isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300',
                    gray: isSelected ? 'border-gray-500 bg-gray-50' : 'border-gray-200 hover:border-gray-300',
                  };

                  return (
                    <label
                      key={method.value}
                      className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${colorClasses[method.color as keyof typeof colorClasses]
                        } ${paymentMethodError && !isSelected ? 'ring-2 ring-red-300' : ''}`}
                      onClick={() => {
                        setSelectedPaymentMethod(method.value);
                        setPaymentMethodError(false);
                        setError(null);
                      }}
                    >
                      {/* Radio Button - Visible */}
                      <div className="flex-shrink-0 mr-4">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.value}
                          checked={isSelected}
                          onChange={(e) => {
                            setSelectedPaymentMethod(e.target.value as ManualPaymentMethodType);
                            setPaymentMethodError(false);
                            setError(null);
                          }}
                          className="w-5 h-5 text-teal-600 border-gray-300 focus:ring-2 focus:ring-teal-500 cursor-pointer"
                        />
                      </div>
                      {/* Logo/Icon */}
                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white border-2 border-gray-300 flex items-center justify-center text-2xl mr-4">
                        {method.logo}
                      </div>
                      {/* Label and Description */}
                      <div className="flex-1 min-w-0">
                        <div className={`font-semibold text-base ${isSelected ? 'text-gray-900' : 'text-gray-800'
                          }`}>
                          {method.label}
                        </div>
                        <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {method.description}
                        </div>
                      </div>
                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="flex-shrink-0 ml-2">
                          <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </label>
                  );
                })}
              </div>
              {paymentMethodError && (
                <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-sm text-red-700 font-medium">
                    ⚠️ Please select a payment method to continue
                  </p>
                </div>
              )}
            </div>

            {/* Proof of Payment Upload */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Proof of Payment (Optional)</h3>
              <p className="text-sm text-gray-600 mb-2">
                Upload a screenshot or photo of your payment confirmation if available.
              </p>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              {proofOfPaymentUrl && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  {proofOfPaymentFile?.type.startsWith('image/') ? (
                    <Image
                      src={proofOfPaymentUrl}
                      alt="Proof of payment preview"
                      width={200}
                      height={200}
                      className="rounded-lg"
                    />
                  ) : (
                    <p className="text-sm text-gray-600">File: {proofOfPaymentFile?.name}</p>
                  )}
                </div>
              )}
            </div>

            {/* Acknowledgment */}
            <div className={`rounded-xl p-6 transition-all duration-300 ${acknowledgmentError
              ? 'bg-red-50 border-2 border-red-500 shadow-md'
              : 'bg-yellow-50 border-2 border-yellow-200'
              }`}>
              <h3 className={`text-lg font-semibold mb-4 flex items-center gap-2 ${acknowledgmentError ? 'text-red-700' : 'text-gray-800'
                }`}>
                Acknowledgment
                {acknowledgmentError && (
                  <span className="text-sm font-normal text-red-600">(Required)</span>
                )}
              </h3>
              <label className="flex items-start cursor-pointer">
                <span className="relative flex items-center justify-center mr-3 mt-1">
                  <input
                    type="checkbox"
                    checked={acknowledgmentChecked}
                    onChange={(e) => {
                      setAcknowledgmentChecked(e.target.checked);
                      // Clear errors when checkbox is checked
                      if (e.target.checked) {
                        setAcknowledgmentError(false);
                        setError(null);
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className={`custom-checkbox ${acknowledgmentError ? 'border-red-500' : ''}`}
                  />
                  <span className="custom-checkbox-tick">
                    {acknowledgmentChecked && (
                      <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l5 5L19 7" />
                      </svg>
                    )}
                  </span>
                </span>
                <span className={`text-sm flex-1 ${acknowledgmentError ? 'text-red-700' : 'text-gray-700'
                  }`}>
                  I understand that tickets will be issued after the organizer confirms receipt of my payment.
                </span>
              </label>
              {acknowledgmentError && (
                <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                  <p className="text-sm text-red-700 font-medium">
                    ⚠️ Please acknowledge this statement to continue
                  </p>
                </div>
              )}
            </div>

            {/* Submit Button - Admin Action Button Pattern */}
            <div className="flex justify-end mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex-shrink-0 h-14 rounded-xl bg-teal-100 hover:bg-teal-200 disabled:bg-teal-100 disabled:hover:bg-teal-100 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                title="Submit Payment Request"
                aria-label="Submit Payment Request"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-teal-200 disabled:bg-teal-100 flex items-center justify-center">
                  {isSubmitting ? (
                    <svg className="animate-spin w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <span className="font-semibold text-teal-700">{isSubmitting ? 'Submitting...' : 'Submit Payment Request'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

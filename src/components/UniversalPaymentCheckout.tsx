'use client';

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import type {
  PaymentSessionResponse,
  PaymentInitializeRequest,
  PaymentProviderType,
  PaymentUseCase,
  PaymentItem,
} from '@/types';
import { PaymentProviderType as ProviderType } from '@/types';
import StripeDesktopCheckout from './StripeDesktopCheckout';
import StripePaymentRequestButton from './StripePaymentRequestButton';
import ZelleManualPayment from './payments/ZelleManualPayment';
import ErrorDialog from './ErrorDialog';
import {
  normalizePaymentError,
  logPaymentError,
  getUserFriendlyErrorMessage,
  retryWithBackoff,
  PaymentErrorType,
} from '@/lib/payments/errorHandling';
import { initializePayment as initializePaymentApi } from '@/lib/payments/paymentApi';

type CartItem = {
  ticketType: { id: number; name: string; price: number; description?: string };
  quantity: number;
};

type Props = {
  cart: CartItem[];
  eventId: number | string;
  email?: string;
  customerName?: string;
  customerPhone?: string;
  discountCodeId?: number | null;
  enabled: boolean;
  amountCents: number;
  paymentUseCase?: PaymentUseCase;
  returnUrl?: string;
  cancelUrl?: string;
  onInvalidClick?: () => void;
  onLoadingChange?: (loading: boolean) => void;
  onSuccess?: (transactionId: string) => void;
  onError?: (error: string) => void;
};

/**
 * UniversalPaymentCheckout - Provider-agnostic payment component
 *
 * This component:
 * 1. Calls backend /api/proxy/payments/initialize to get payment session
 * 2. Renders provider-specific UI based on providerType returned
 * 3. Handles loading states, errors, and success flows
 */
export default function UniversalPaymentCheckout(props: Props) {
  const {
    cart,
    eventId,
    email,
    customerName,
    customerPhone,
    discountCodeId,
    enabled,
    amountCents,
    paymentUseCase = PaymentUseCase.TICKET_SALE,
    returnUrl,
    cancelUrl,
    onInvalidClick,
    onLoadingChange,
    onSuccess,
    onError,
  } = props;

  const [paymentSession, setPaymentSession] = useState<PaymentSessionResponse | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [providerType, setProviderType] = useState<PaymentProviderType | null>(null);
  const [isOpeningAcp, setIsOpeningAcp] = useState(false);

  // Memoize cart items string for stable dependency checking
  const cartKey = useMemo(() => {
    return cart.map(item => `${item.ticketType.id}:${item.quantity}`).join(',');
  }, [cart]);

  // Track the cart key for the current session to avoid unnecessary re-initialization
  const sessionCartKeyRef = useRef<string | null>(null);

  // CRITICAL FIX: Track last initialized cart key to prevent re-initialization loops
  const lastInitializedCartKeyRef = useRef<string | null>(null);

  // CRITICAL FIX: Track if we've successfully initialized to prevent re-runs
  const hasInitializedRef = useRef(false);

  // CRITICAL FIX: Use ref to track payment session to avoid state-triggered re-renders
  const paymentSessionRef = useRef<PaymentSessionResponse | null>(null);

  // Sync ref with state
  useEffect(() => {
    paymentSessionRef.current = paymentSession;
  }, [paymentSession]);

  // CRITICAL FIX: Track previous enabled state to prevent session clear on initial enable
  // Only clear session when going from enabled=true to enabled=false (form becomes invalid)
  // Don't clear on initial mount when going from false/undefined to true
  const enabledRef = useRef<boolean>(enabled);

  // CRITICAL FIX: Use ref instead of state to prevent re-renders on mobile browsers
  // Track if payment section has been interacted with or is visible
  const paymentSectionActiveRef = useRef(false);
  const [paymentSectionActive, setPaymentSectionActive] = useState(false);
  const paymentSectionRef = useRef<HTMLDivElement>(null);

  // CRITICAL FIX: Track last onLoadingChange call to prevent infinite loops
  // Only call onLoadingChange when state actually changes
  const lastLoadingStateRef = useRef<boolean | null>(null);

  // CRITICAL FIX: Track if we've auto-activated payment section to prevent re-runs
  const hasAutoActivatedRef = useRef(false);
  const safeOnLoadingChange = useCallback((loading: boolean) => {
    // Only call if state actually changed
    if (lastLoadingStateRef.current === loading) {
      return;
    }
    lastLoadingStateRef.current = loading;
    try {
      onLoadingChange?.(loading);
    } catch (error) {
      console.error('[UniversalPaymentCheckout] Error calling onLoadingChange:', error);
    }
  }, [onLoadingChange]);

  // CRITICAL FIX: Prevent multiple simultaneous initializations
  const isInitializingRef = useRef(false);

  // CRITICAL FIX: Track last initialization attempt timestamp to prevent rapid re-runs
  const lastInitAttemptRef = useRef<number>(0);
  const INIT_DEBOUNCE_MS = 1000; // Wait 1 second between initialization attempts

  // CRITICAL FIX: Memoize returnUrl and cancelUrl to prevent changing on every render
  // Mobile browsers can regenerate window.location.origin during re-hydration
  const memoizedReturnUrl = useMemo(() => {
    return returnUrl || (typeof window !== 'undefined' ? `${window.location.origin}/event/success` : '/event/success');
  }, [returnUrl]);

  const memoizedCancelUrl = useMemo(() => {
    return cancelUrl || (typeof window !== 'undefined' ? window.location.origin : '/');
  }, [cancelUrl]);

  // CRITICAL FIX: Removed separate auto-activation effect to prevent re-render loops
  // Auto-activation is now handled inside the main initialization effect (see line ~294)
  // This eliminates the separate effect that was causing dependency change triggers

  // Use Intersection Observer to detect when payment section is visible (fallback)
  // CRITICAL FIX: Disable IntersectionObserver completely - it's causing re-activation loops
  // Auto-activation is handled in the main effect when form is valid
  useEffect(() => {
    // DISABLED: IntersectionObserver causes re-activation loops
    // Auto-activation is handled in main effect when enabled && cart.length > 0 && email
    return;
  }, []);

  // Initialize payment session when enabled, cart is ready, AND payment section is active
  useEffect(() => {
    // CRITICAL FIX: Capture cartKey at the start of effect for cleanup comparison
    const effectCartKey = cartKey;

    // CRITICAL FIX: Check guard FIRST before any other logic to prevent race conditions
    // Also check if we're already initializing for this exact cart
    if (isInitializingRef.current && lastInitializedCartKeyRef.current === cartKey) {
      console.log('[UniversalPaymentCheckout] ⚠️ SKIP - Already initializing for this exact cart (early guard)', {
        cartKey,
        lastInitialized: lastInitializedCartKeyRef.current,
      });
      return;
    }
    if (isInitializingRef.current) {
      console.log('[UniversalPaymentCheckout] ⚠️ SKIP - Already initializing payment session (guard check)');
      return;
    }

    // CRITICAL FIX: Prevent re-initialization if we already initialized for this exact cart
    // Use ref instead of state to avoid re-render triggers
    // Check this FIRST before any other logic to prevent unnecessary work
    if (hasInitializedRef.current && lastInitializedCartKeyRef.current === cartKey && paymentSessionRef.current) {
      console.log('[UniversalPaymentCheckout] ✅ SKIP - Already initialized for this cart:', {
        cartKey,
        lastInitialized: lastInitializedCartKeyRef.current,
        hasSession: !!paymentSessionRef.current,
        transactionId: paymentSessionRef.current?.transactionId,
      });
      return;
    }

    // CRITICAL FIX: Also check if we're currently initializing for this exact cart
    // This prevents duplicate initializations when cleanup runs during async operation
    if (isInitializingRef.current && lastInitializedCartKeyRef.current === cartKey) {
      console.log('[UniversalPaymentCheckout] ✅ SKIP - Already initializing for this cart:', {
        cartKey,
        lastInitialized: lastInitializedCartKeyRef.current,
      });
      return;
    }

    // CRITICAL FIX: Debounce rapid re-runs (prevent initialization spam)
    // Only apply debounce if we've already initialized before
    if (hasInitializedRef.current) {
      const now = Date.now();
      const timeSinceLastAttempt = now - lastInitAttemptRef.current;
      if (timeSinceLastAttempt < INIT_DEBOUNCE_MS) {
        console.log('[UniversalPaymentCheckout] ⚠️ SKIP - Too soon since last attempt:', {
          timeSinceLastAttempt,
          debounceMs: INIT_DEBOUNCE_MS,
        });
        return;
      }
    }

    console.log('[UniversalPaymentCheckout] EFFECT TRIGGERED - Dependencies changed:', {
      enabled,
      cartLength: cart.length,
      hasEmail: !!email,
      cartKey,
      paymentSectionActive: paymentSectionActiveRef.current,
      hasExistingSession: !!paymentSessionRef.current,
      sessionCartKey: sessionCartKeyRef.current,
      isInitializing: isInitializingRef.current,
      hasInitialized: hasInitializedRef.current,
      lastInitializedCartKey: lastInitializedCartKeyRef.current,
      timestamp: new Date().toISOString(),
    });

    if (!enabled || cart.length === 0 || !email) {
      // CRITICAL FIX: Only clear session if we were previously enabled
      // Don't clear on initial mount when going from false -> true (prevents flickering)
      // Only clear when form becomes invalid after being valid (true -> false)
      if (enabledRef.current === true) {
        console.log('[UniversalPaymentCheckout] Form became incomplete, clearing session', {
          enabled,
          previousEnabled: enabledRef.current,
          cartLength: cart.length,
          hasEmail: !!email
        });
        // CRITICAL FIX: Update refs FIRST before state
        paymentSessionRef.current = null;
        sessionCartKeyRef.current = null;
        hasInitializedRef.current = false;
        lastInitializedCartKeyRef.current = null;
        // CRITICAL: Reset activation flags
        paymentSectionActiveRef.current = false;
        hasAutoActivatedRef.current = false;

        // Then update state
        setPaymentSession(null);
        setProviderType(null);
      } else {
        console.log('[UniversalPaymentCheckout] Form not yet valid, skipping session clear (prevent initial flicker)', {
          enabled,
          previousEnabled: enabledRef.current
        });
      }
      enabledRef.current = enabled;
      return;
    }

    // Update ref to track current enabled state
    enabledRef.current = enabled;

    // Lazy initialization: Only initialize when payment section is visible/interacted with
    // This prevents unnecessary backend calls when user is just filling out form fields
    // CRITICAL FIX: Auto-activate if form is valid (don't wait for IntersectionObserver)
    if (!paymentSectionActiveRef.current) {
      // Auto-activate if form is complete and we haven't already activated
      if (enabled && cart.length > 0 && email && !hasAutoActivatedRef.current) {
        console.log('[UniversalPaymentCheckout] CRITICAL FIX: Auto-activating payment section (form is valid)');
        paymentSectionActiveRef.current = true;
        hasAutoActivatedRef.current = true;
      } else {
      console.log('[UniversalPaymentCheckout] Payment section not yet active, deferring initialization');
      return;
    }
    }

    // CRITICAL FIX: Don't re-initialize if we already have a valid session for the same cart
    // Use ref instead of state to avoid re-render triggers
    // Check BOTH paymentSessionRef AND providerTypeRef (from state) to ensure we have everything
    const currentProviderType = providerType; // Capture from state
    // CRITICAL: Check refs FIRST - they persist even if state hasn't updated yet
    // Don't require providerType from state - get it from ref if available
    if (paymentSessionRef.current && sessionCartKeyRef.current === cartKey) {
      // If we have a session ref but state hasn't caught up, update state now
      if (!paymentSession && paymentSessionRef.current) {
        console.log('[UniversalPaymentCheckout] ⚠️ STATE CATCH-UP - Updating state from ref');
        const sessionProviderType = (paymentSessionRef.current as any).providerType || providerType;
        setPaymentSession(paymentSessionRef.current);
        if (sessionProviderType) {
          setProviderType(sessionProviderType);
        }
      }

      console.log('[UniversalPaymentCheckout] ✅ SKIP RE-INIT - Session already exists for cart:', {
        cartKey,
        existingCartKey: sessionCartKeyRef.current,
        transactionId: paymentSessionRef.current.transactionId,
        providerType: providerType || (paymentSessionRef.current as any).providerType,
        hasState: !!paymentSession,
        hasRef: !!paymentSessionRef.current,
      });
      // Mark as initialized to prevent future re-runs
      hasInitializedRef.current = true;
      lastInitializedCartKeyRef.current = cartKey;
      // CRITICAL: Ensure paymentSectionActiveRef is set so we don't re-trigger
      paymentSectionActiveRef.current = true;
      // CRITICAL: MUST also update state, not just ref, to prevent parent unmounting
      if (!paymentSectionActive) {
        setPaymentSectionActive(true);
      }
      hasAutoActivatedRef.current = true;
      return;
    }

    // CRITICAL FIX: Set guard IMMEDIATELY before any async operations
    // This prevents race conditions where multiple effects run simultaneously
    isInitializingRef.current = true;
    lastInitAttemptRef.current = Date.now();

    console.log('[UniversalPaymentCheckout] ⚡ INITIALIZING PAYMENT SESSION', {
      cartKey,
      previousCartKey: sessionCartKeyRef.current,
      hasExistingSession: !!paymentSessionRef.current,
      timestamp: new Date().toISOString(),
    });

    let cancelled = false;

    const initializePaymentSession = async () => {
      // CRITICAL FIX: Double-check guard and cancelled flag before starting async operation
      if (cancelled) {
        console.log('[UniversalPaymentCheckout] ⚠️ SKIP - Already cancelled before async started');
        isInitializingRef.current = false;
        return;
      }

      if (isInitializingRef.current === false) {
        console.log('[UniversalPaymentCheckout] ⚠️ SKIP - Guard was reset before async started');
        return;
      }

      setIsInitializing(true);
      setInitializationError(null);

      // CRITICAL FIX: Use safe callback that prevents duplicate calls
      safeOnLoadingChange(true);

      try {
        // Build payment items from cart
        const items: PaymentItem[] = cart.map(item => ({
          itemType: 'TICKET',
          itemId: item.ticketType.id,
          description: item.ticketType.name,
          quantity: item.quantity,
          unitPrice: item.ticketType.price,
        }));

        // Build initialization request
        const request: PaymentInitializeRequest = {
          paymentUseCase,
          amount: amountCents / 100, // Convert cents to dollars
          currency: 'USD', // TODO: Get from tenant settings
          items,
          customerEmail: email,
          customerName,
          customerPhone,
          returnUrl: memoizedReturnUrl,
          cancelUrl: memoizedCancelUrl,
          eventId: typeof eventId === 'string' ? parseInt(eventId) : eventId,
          discountCode: discountCodeId ? String(discountCodeId) : undefined,
        };

        // Debug logging for customer information and discount
        console.log('[UniversalPaymentCheckout] Payment initialization request:', {
          customerEmail: request.customerEmail,
          customerName: request.customerName || 'NOT_PROVIDED',
          customerPhone: request.customerPhone || 'NOT_PROVIDED',
          discountCode: request.discountCode || 'NOT_PROVIDED',
          eventId: request.eventId,
          itemsCount: request.items.length,
          items: request.items.map(item => ({
            itemType: item.itemType,
            itemId: item.itemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        });

        // Retry initialization with exponential backoff for network errors
        // Use the imported initializePaymentApi function (not the local one)
        const session = await retryWithBackoff(
          () => initializePaymentApi(request),
          {
            maxRetries: 2,
            retryDelay: 1000,
            retryableErrors: [PaymentErrorType.NETWORK_ERROR, PaymentErrorType.TIMEOUT_ERROR],
          }
        );

        // Debug logging
        console.log('[UniversalPaymentCheckout] Payment session received:', {
          transactionId: session?.transactionId,
          provider: session?.provider,
          providerType: session?.providerType,
          hasClientSecret: !!session?.clientSecret,
          hasPublishableKey: !!session?.publishableKey,
          hasPublicKey: !!(session as any)?.publicKey, // Backend might use 'publicKey' instead
          hasSessionUrl: !!session?.sessionUrl,
          status: session?.status,
          cancelled: cancelled, // Log cancelled state
          cartKey: cartKey,
          effectCartKey: effectCartKey,
        });

        // Normalize response: handle backend field differences
        // 1. Map 'provider' (enum/string) to 'providerType' (enum)
        const providerValue = session.provider || session.providerType;
        let normalizedProviderType: PaymentProviderType | null = null;

        if (providerValue) {
          // Handle both string and enum values
          let providerStr: string;
          if (typeof providerValue === 'string') {
            providerStr = providerValue.toUpperCase().trim();
          } else if (typeof providerValue === 'object' && providerValue !== null) {
            // Handle enum object (e.g., { name: 'STRIPE' } or enum.toString())
            providerStr = String(providerValue).toUpperCase().trim();
            // Try to extract name property if it exists
            if ('name' in providerValue && typeof (providerValue as any).name === 'string') {
              providerStr = (providerValue as any).name.toUpperCase().trim();
            }
          } else {
            providerStr = String(providerValue).toUpperCase().trim();
          }

          // Map to PaymentProviderType enum (exact match first, then contains)
          if (providerStr === 'STRIPE') {
            normalizedProviderType = ProviderType.STRIPE;
          } else if (providerStr === 'PAYPAL') {
            normalizedProviderType = ProviderType.PAYPAL;
          } else if (providerStr === 'REVOLUT') {
            normalizedProviderType = ProviderType.REVOLUT;
          } else if (providerStr === 'ZEFFY') {
            normalizedProviderType = ProviderType.ZEFFY;
          } else if (providerStr === 'ZELLE') {
            normalizedProviderType = ProviderType.ZELLE;
          } else if (providerStr === 'CEFI') {
            normalizedProviderType = ProviderType.CEFI;
          } else if (providerStr === 'GIVEBUTTER') {
            normalizedProviderType = ProviderType.GIVEBUTTER;
          } else {
            // Fallback: try contains match
            if (providerStr.includes('STRIPE')) {
              normalizedProviderType = ProviderType.STRIPE;
            } else if (providerStr.includes('PAYPAL')) {
              normalizedProviderType = ProviderType.PAYPAL;
            } else if (providerStr.includes('REVOLUT')) {
              normalizedProviderType = ProviderType.REVOLUT;
            } else if (providerStr.includes('ZEFFY')) {
              normalizedProviderType = ProviderType.ZEFFY;
            } else if (providerStr.includes('ZELLE')) {
              normalizedProviderType = ProviderType.ZELLE;
            } else if (providerStr.includes('CEFI')) {
              normalizedProviderType = ProviderType.CEFI;
            } else if (providerStr.includes('GIVEBUTTER')) {
              normalizedProviderType = ProviderType.GIVEBUTTER;
            } else {
              console.warn('[UniversalPaymentCheckout] Unknown provider value:', providerValue, providerStr);
            }
          }
        }

        // 2. Normalize publishableKey (handle publicKey vs publishableKey)
        const normalizedPublishableKey = session.publishableKey || (session as any).publicKey || undefined;

        // 3. Build normalized session
        const normalizedSession: PaymentSessionResponse = {
          ...session,
          providerType: normalizedProviderType || session.providerType,
          publishableKey: normalizedPublishableKey,
        };

        // CRITICAL FIX: Check cancelled flag and log for debugging
        // Note: cancelled is only set to true if cartKey changed, so we should be able to save
        if (cancelled) {
          console.log('[UniversalPaymentCheckout] ⚠️ SKIP STATE UPDATE - Operation was cancelled (cart changed)', {
            cartKey,
            effectCartKey,
            transactionId: normalizedSession?.transactionId,
          });
          // Still reset loading state even if cancelled
          safeOnLoadingChange(false);
        } else {
          console.log('[UniversalPaymentCheckout] ✅ SAVING PAYMENT SESSION', {
            cartKey,
            transactionId: normalizedSession?.transactionId,
            providerType: normalizedProviderType || normalizedSession.providerType,
          });

          // CRITICAL FIX: Update ref FIRST before state to prevent race conditions
          // Set ALL refs synchronously BEFORE any state updates
          paymentSessionRef.current = normalizedSession;
          sessionCartKeyRef.current = cartKey; // Track which cart this session is for
          hasInitializedRef.current = true;
          lastInitializedCartKeyRef.current = cartKey;
          // CRITICAL: Ensure paymentSectionActiveRef is set so effect doesn't re-trigger
          paymentSectionActiveRef.current = true;
          // CRITICAL: Mark as auto-activated to prevent re-activation
          hasAutoActivatedRef.current = true;

          // CRITICAL FIX: Batch state updates to prevent multiple re-renders
          // CRITICAL: MUST call setPaymentSectionActive(true) to update state, not just ref
          // This prevents parent component from unmounting/remounting due to stale state
          setPaymentSectionActive(true);
          setPaymentSession(normalizedSession);
          setProviderType(normalizedProviderType || normalizedSession.providerType || null);
          safeOnLoadingChange(false);

          // CRITICAL: Log ref state after setting to verify persistence
          console.log('[UniversalPaymentCheckout] ✅ REFS SET AFTER SAVING:', {
            hasPaymentSessionRef: !!paymentSessionRef.current,
            hasSessionCartKey: !!sessionCartKeyRef.current,
            hasInitialized: hasInitializedRef.current,
            paymentSectionActive: paymentSectionActiveRef.current,
            transactionId: paymentSessionRef.current?.transactionId,
          });
        }
      } catch (error) {
        if (cancelled) return;

        const paymentError = normalizePaymentError(error, {
          eventId: typeof eventId === 'string' ? parseInt(eventId) : eventId,
        });

        // Log error for monitoring
        logPaymentError(paymentError, {
          cart: JSON.stringify(cart),
          email,
          amountCents,
          paymentUseCase,
        });

        // Get user-friendly error message
        const errorMessage = getUserFriendlyErrorMessage(paymentError);
        // Use a more user-friendly message for payment initialization failures
        const userFriendlyMessage = errorMessage || "The payment option is not available right now. Please try again later or contact support if the problem persists.";
        setInitializationError(userFriendlyMessage);
        onError?.(userFriendlyMessage);
        safeOnLoadingChange(false);
      } finally {
        // CRITICAL FIX: Always reset initialization flag in finally block
        // This ensures the guard is reset even if the async operation is cancelled
        // Reset guard FIRST before any other cleanup
        isInitializingRef.current = false;

        if (!cancelled) {
          setIsInitializing(false);
        } else {
          // If cancelled, still reset loading state but don't update session
          setIsInitializing(false);
          safeOnLoadingChange(false);
        }
      }
    };

    initializePaymentSession();

    // Cleanup function to prevent state updates if component unmounts or dependencies change
    return () => {
      // CRITICAL FIX: Only cancel if cartKey actually changed
      // If cartKey is the same, let the operation complete (prevents losing payment session)
      const currentCartKey = cartKey;
      if (effectCartKey !== currentCartKey) {
        console.log('[UniversalPaymentCheckout] Cleanup: Cart changed, cancelling operation', {
          oldCartKey: effectCartKey,
          newCartKey: currentCartKey,
        });
      cancelled = true;
      } else {
        console.log('[UniversalPaymentCheckout] Cleanup: Dependencies changed but cartKey same, allowing operation to complete', {
          cartKey: effectCartKey,
        });
        // Don't cancel - let the operation complete since cart hasn't changed
      }
      // CRITICAL FIX: DO NOT reset guard in cleanup - let the async operation handle it
      // The guard will be reset in the finally block of initializePaymentSession
    };
    // CRITICAL FIX: Removed customerName and customerPhone from dependencies
    // These fields don't need to trigger re-initialization - they're just passed in the request
    // This prevents flickering when user types in name/phone fields
    // NOTE: safeOnLoadingChange is NOT in deps - it's only used inside the effect, not as a trigger
    // This prevents the callback from causing re-runs when parent recreates it
    // CRITICAL: paymentSession is NOT in deps - it's only checked via ref to prevent re-runs when state updates
  }, [enabled, cartKey, email, amountCents, paymentUseCase, eventId, discountCodeId, memoizedReturnUrl, memoizedCancelUrl]);

  // Handle error dialog close
  const handleCloseErrorDialog = useCallback(() => {
    setInitializationError(null);
    // Reset payment section state to allow retry
    paymentSectionActiveRef.current = true;
    setPaymentSectionActive(true);
  }, []);

  // Render loading state
  if (isInitializing) {
    return (
      <>
        <ErrorDialog
          isOpen={!!initializationError}
          onClose={handleCloseErrorDialog}
          title="Payment Unavailable"
          message={initializationError || "The payment option is not available right now. Please try again later or contact support if the problem persists."}
        />
        <div ref={paymentSectionRef} className="flex flex-col items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Initializing payment...</p>
        </div>
      </>
    );
  }

  // Render provider-specific UI
  // CRITICAL FIX: Check refs first (they're set synchronously), then fall back to state
  // This prevents "No payment session" message when state update is pending
  const effectivePaymentSession = paymentSessionRef.current || paymentSession;
  // CRITICAL: Also get providerType from ref if available (from session object)
  const effectiveProviderType = providerType || (paymentSessionRef.current as any)?.providerType || null;

  if (!effectivePaymentSession || !effectiveProviderType) {
    // CRITICAL FIX: If refs show we have a session but state doesn't, wait for state to catch up
    // This prevents flickering when state update is pending
    if (paymentSessionRef.current && (!paymentSession || !providerType)) {
      console.log('[UniversalPaymentCheckout] ⚠️ WAITING - Ref has session but state pending, showing loading...', {
        hasPaymentSessionRef: !!paymentSessionRef.current,
        hasPaymentSessionState: !!paymentSession,
        hasProviderTypeState: !!providerType,
        hasProviderTypeRef: !!(paymentSessionRef.current as any)?.providerType,
        transactionId: paymentSessionRef.current?.transactionId,
      });
      // Show loading state while waiting for state to update
      return (
        <>
          <ErrorDialog
            isOpen={!!initializationError}
            onClose={handleCloseErrorDialog}
            title="Payment Unavailable"
            message={initializationError || "The payment option is not available right now. Please try again later or contact support if the problem persists."}
          />
          <div ref={paymentSectionRef} className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Loading payment options...</p>
          </div>
        </>
      );
    }

    // Debug logging
    console.log('[UniversalPaymentCheckout] No payment session or provider type:', {
      hasPaymentSession: !!effectivePaymentSession,
      hasProviderType: !!effectiveProviderType,
      paymentSessionFromState: !!paymentSession,
      paymentSessionFromRef: !!paymentSessionRef.current,
      providerType,
      enabled,
      cartLength: cart.length,
      hasEmail: !!email,
      paymentSectionActive,
      hasInitialized: hasInitializedRef.current,
      sessionCartKey: sessionCartKeyRef.current,
    });

    return (
      <>
        <ErrorDialog
          isOpen={!!initializationError}
          onClose={handleCloseErrorDialog}
          title="Payment Unavailable"
          message={initializationError || "The payment option is not available right now. Please try again later or contact support if the problem persists."}
        />
        <div
          ref={paymentSectionRef}
          className="text-center p-8 text-muted-foreground"
          onClick={() => {
            // Activate payment section when user clicks/interacts with it
            if (!paymentSectionActiveRef.current) {
              console.log('[UniversalPaymentCheckout] Payment section activated by user interaction');
              paymentSectionActiveRef.current = true;
              setPaymentSectionActive(true);
            }
          }}
        >
          <p>Please complete the form above to proceed with payment.</p>
          {process.env.NODE_ENV === 'development' && (
            <p className="text-xs mt-2 text-gray-500">
              Debug: enabled={String(enabled)}, cart={cart.length}, email={email ? 'yes' : 'no'}, active={String(paymentSectionActive)}
            </p>
          )}
        </div>
      </>
    );
  }

  // Render Stripe Elements (default)
  // CRITICAL FIX: Use effectivePaymentSession (from ref or state) instead of just state
  // Use publishableKey from session or fallback to env var (for backward compatibility)
  const stripePublishableKey = effectivePaymentSession.publishableKey || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  if (effectiveProviderType === ProviderType.STRIPE && effectivePaymentSession.clientSecret && stripePublishableKey) {
    console.log('[UniversalPaymentCheckout] Rendering Stripe Elements UI');
    return (
      <>
        <ErrorDialog
          isOpen={!!initializationError}
          onClose={handleCloseErrorDialog}
          title="Payment Unavailable"
          message={initializationError || "The payment option is not available right now. Please try again later or contact support if the problem persists."}
        />
        <div ref={paymentSectionRef} className="space-y-4">
          {/* Apple Pay / Google Pay Button */}
          <StripePaymentRequestButton
            cart={cart}
            eventId={eventId}
            email={email}
            customerName={customerName}
            customerPhone={customerPhone}
            discountCodeId={discountCodeId}
            enabled={enabled}
            showPlaceholder={true}
            amountCents={amountCents}
            publishableKey={stripePublishableKey}
            onInvalidClick={onInvalidClick}
          />

          {/* Stripe Elements Card Form */}
          <StripeDesktopCheckout
            cart={cart}
            eventId={eventId}
            email={email}
            discountCodeId={discountCodeId}
            enabled={enabled && !isInitializing}
            amountCents={amountCents}
            publishableKey={stripePublishableKey}
            clientSecret={effectivePaymentSession.clientSecret}
            transactionId={effectivePaymentSession.transactionId}
            onInvalidClick={onInvalidClick}
            onLoadingChange={onLoadingChange}
          />
        </div>
      </>
    );
  }

  // Debug: Log why Stripe Elements aren't rendering
  if (effectiveProviderType === ProviderType.STRIPE) {
    console.warn('[UniversalPaymentCheckout] Stripe provider but missing required fields:', {
      hasClientSecret: !!effectivePaymentSession?.clientSecret,
      hasPublishableKey: !!effectivePaymentSession?.publishableKey,
      hasEnvPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      hasSessionUrl: !!effectivePaymentSession?.sessionUrl,
      paymentSession: effectivePaymentSession,
    });

    // Show helpful error message if we have clientSecret but missing publishableKey
    if (effectivePaymentSession.clientSecret && !stripePublishableKey) {
      return (
        <>
          <ErrorDialog
            isOpen={true}
            onClose={handleCloseErrorDialog}
            title="Payment Configuration Error"
            message="Payment session initialized but Stripe publishable key is missing. Please contact support."
          />
          <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
            <p className="text-destructive font-semibold mb-2">Payment Configuration Error</p>
            <p className="text-sm text-muted-foreground">
              Payment session initialized but Stripe publishable key is missing. Please contact support.
            </p>
            {process.env.NODE_ENV === 'development' && (
              <p className="text-xs mt-2 text-gray-500">
                Debug: transactionId={effectivePaymentSession.transactionId}, providerType={effectiveProviderType}
              </p>
            )}
          </div>
        </>
      );
    }
  }

  // Handle Stripe Instant Checkout (ACP)
  const handleInstantCheckout = useCallback(() => {
    if (!paymentSession?.sessionUrl) return;

    setIsOpeningAcp(true);
    onLoadingChange?.(true);

    // Open in new window/tab for better UX
    const checkoutWindow = window.open(
      paymentSession.sessionUrl,
      'stripe-checkout',
      'width=500,height=600,scrollbars=yes'
    );

    // Poll for window closure or success
    const pollInterval = setInterval(() => {
      if (checkoutWindow?.closed) {
        clearInterval(pollInterval);
        setIsOpeningAcp(false);
        onLoadingChange?.(false);

        // Check payment status
        if (effectivePaymentSession?.transactionId) {
          // TODO: Poll payment status and call onSuccess if succeeded
          // This will be implemented when backend status endpoint is ready
        }
      }
    }, 500);

    // Cleanup after 30 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      setIsOpeningAcp(false);
      onLoadingChange?.(false);
    }, 30 * 60 * 1000);
  }, [paymentSession, onLoadingChange]);

  // Render Stripe Instant Checkout (ACP) button
  if (providerType === ProviderType.STRIPE && paymentSession.sessionUrl) {
    return (
      <>
        <ErrorDialog
          isOpen={!!initializationError}
          onClose={handleCloseErrorDialog}
          title="Payment Unavailable"
          message={initializationError || "The payment option is not available right now. Please try again later or contact support if the problem persists."}
        />
        <div className="space-y-4">
        <button
          onClick={handleInstantCheckout}
          disabled={isOpeningAcp}
          className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isOpeningAcp ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Opening checkout...</span>
            </>
          ) : (
            <>
              <span>⚡</span>
              <span>Instant Checkout (Beta)</span>
            </>
          )}
        </button>
        <p className="text-xs text-muted-foreground text-center">
          Powered by Stripe Instant Checkout • One-tap wallet payments
        </p>
        {paymentSession.metadata?.acpEnabled && (
          <p className="text-xs text-primary text-center font-medium">
            ✨ AI agent-compatible checkout
          </p>
        )}
      </div>
      </>
    );
  }

  // Render PayPal button (will be implemented in Task 5)
  if (providerType === ProviderType.PAYPAL) {
    return (
      <>
        <ErrorDialog
          isOpen={!!initializationError}
          onClose={handleCloseErrorDialog}
          title="Payment Unavailable"
          message={initializationError || "The payment option is not available right now. Please try again later or contact support if the problem persists."}
        />
        <div className="space-y-4">
          <div id="paypal-button-container" className="w-full"></div>
          <p className="text-xs text-muted-foreground text-center">
            PayPal checkout will be available here
          </p>
        </div>
      </>
    );
  }

  // Render Revolut redirect button (will be implemented in Task 6)
  if (providerType === ProviderType.REVOLUT && paymentSession.sessionUrl) {
    return (
      <>
        <ErrorDialog
          isOpen={!!initializationError}
          onClose={handleCloseErrorDialog}
          title="Payment Unavailable"
          message={initializationError || "The payment option is not available right now. Please try again later or contact support if the problem persists."}
        />
        <div className="space-y-4">
        <button
          onClick={() => {
            if (paymentSession.sessionUrl) {
              window.location.href = paymentSession.sessionUrl;
            }
          }}
          className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 font-semibold"
        >
          Pay with Revolut
        </button>
        <p className="text-xs text-muted-foreground text-center">
          You will be redirected to Revolut to complete your payment
        </p>
      </div>
      </>
    );
  }

  // Render Zeffy embed (will be implemented in Task 7)
  if (providerType === ProviderType.ZEFFY) {
    return (
      <>
        <ErrorDialog
          isOpen={!!initializationError}
          onClose={handleCloseErrorDialog}
          title="Payment Unavailable"
          message={initializationError || "The payment option is not available right now. Please try again later or contact support if the problem persists."}
        />
        <div className="space-y-4">
        <div id="zeffy-embed-container" className="w-full"></div>
        <p className="text-xs text-muted-foreground text-center">
          Zeffy donation widget will be available here
        </p>
      </div>
      </>
    );
  }

  // Render Givebutter redirect button (for fundraiser events)
  if (providerType === ProviderType.GIVEBUTTER && paymentSession.sessionUrl) {
    return (
      <>
        <ErrorDialog
          isOpen={!!initializationError}
          onClose={handleCloseErrorDialog}
          title="Payment Unavailable"
          message={initializationError || "The payment option is not available right now. Please try again later or contact support if the problem persists."}
        />
        <div className="space-y-4">
        <button
          onClick={() => {
            if (paymentSession.sessionUrl) {
              window.location.href = paymentSession.sessionUrl;
            }
          }}
          className="w-full bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 font-semibold"
        >
          Pay with Givebutter
        </button>
        <p className="text-xs text-muted-foreground text-center">
          You will be redirected to Givebutter to complete your payment
        </p>
        <p className="text-xs text-green-600 text-center font-medium">
          ✨ Zero-fee payment processing
        </p>
      </div>
      </>
    );
  }

  // Render Zelle manual instructions
  if (providerType === ProviderType.ZELLE && paymentSession) {
    const handleZelleConfirm = async () => {
      // Call backend to create pending transaction
      try {
        const response = await fetch('/api/proxy/payments/zelle/manual', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            transactionId: effectivePaymentSession.transactionId,
            amount: amountCents / 100,
            currency: 'USD', // TODO: Get from tenant settings
            customerEmail: email,
            customerName,
            customerPhone,
            eventId: typeof eventId === 'string' ? parseInt(eventId) : eventId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create Zelle payment transaction');
        }

        onSuccess?.(effectivePaymentSession.transactionId);
      } catch (error) {
        const paymentError = normalizePaymentError(error);
        logPaymentError(paymentError);
        throw error;
      }
    };

    return (
      <>
        <ErrorDialog
          isOpen={!!initializationError}
          onClose={handleCloseErrorDialog}
          title="Payment Unavailable"
          message={initializationError || "The payment option is not available right now. Please try again later or contact support if the problem persists."}
        />
        <ZelleManualPayment
          paymentSession={paymentSession}
          amount={amountCents / 100}
          currency="USD" // TODO: Get from tenant settings
          onConfirm={handleZelleConfirm}
          onCancel={onInvalidClick}
        />
      </>
    );
  }

  // Fallback for unknown provider
  return (
    <>
      <ErrorDialog
        isOpen={!!initializationError}
        onClose={handleCloseErrorDialog}
        title="Payment Unavailable"
        message={initializationError || "The payment option is not available right now. Please try again later or contact support if the problem persists."}
      />
      <div className="bg-warning/10 border border-warning rounded-lg p-4">
        <p className="text-warning font-semibold">Unsupported Payment Provider</p>
        <p className="text-sm text-muted-foreground mt-2">
          Provider type: {providerType}
        </p>
      </div>
    </>
  );
}


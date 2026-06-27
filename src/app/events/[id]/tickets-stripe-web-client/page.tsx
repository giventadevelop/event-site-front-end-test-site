'use client';

import Image from 'next/image';
import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaTags, FaCreditCard, FaCalendarAlt, FaClock, FaMapMarkerAlt, FaMapPin, FaTicketAlt, FaUser, FaEnvelope, FaMoneyBillWave, FaReceipt } from 'react-icons/fa';
import { Modal } from '@/components/Modal';
import { StripePaymentRequestButton } from '@/components/StripePaymentRequestButton';
import StripeDesktopCheckout from '@/components/StripeDesktopCheckout';
import { formatInTimeZone } from 'date-fns-tz';
import { getAppUrl } from '@/lib/env';
import LocationDisplay from '@/components/LocationDisplay';

export default function TicketingPage() {
  // Define default hero image URL before using it in state
  const defaultHeroImageUrl = '/images/default_placeholder_hero_image.jpeg';

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
  const [heroImageUrl, setHeroImageUrl] = useState<string>(defaultHeroImageUrl); // Initialize with default
  const [heroImageError, setHeroImageError] = useState(false);
  const [totalAmount, setTotalAmount] = useState(0);
  const [savedAmount, setSavedAmount] = useState(0);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showCancelledMessage, setShowCancelledMessage] = useState(false);
  const [cancelledPaymentInfo, setCancelledPaymentInfo] = useState<any>(null);
  const [expressCheckoutLoading, setExpressCheckoutLoading] = useState(true);
  const [errorDialog, setErrorDialog] = useState<{ open: boolean; title: string; message: string }>({
    open: false,
    title: '',
    message: ''
  });

  useEffect(() => { setMounted(true); }, []);

  // Load discount code from URL params or sessionStorage (if coming from checkout page)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check URL params first
    const urlParams = new URLSearchParams(window.location.search);
    const discountCodeFromUrl = urlParams.get('discountCode') || urlParams.get('discount');

    if (discountCodeFromUrl) {
      console.log('[TicketingPage] Found discount code in URL:', discountCodeFromUrl);
      setDiscountCode(discountCodeFromUrl);
      // Auto-apply discount code after a short delay to ensure availableDiscounts are loaded
      setTimeout(() => {
        if (availableDiscounts.length > 0) {
          validateAndApplyDiscount(discountCodeFromUrl);
        }
      }, 500);
      return;
    }

    // Check sessionStorage as fallback
    const discountCodeFromStorage = sessionStorage.getItem(`discountCode_${eventId}`);
    if (discountCodeFromStorage) {
      console.log('[TicketingPage] Found discount code in sessionStorage:', discountCodeFromStorage);
      setDiscountCode(discountCodeFromStorage);
      // Auto-apply discount code after a short delay
      setTimeout(() => {
        if (availableDiscounts.length > 0) {
          validateAndApplyDiscount(discountCodeFromStorage);
        }
      }, 500);
    }
  }, [eventId, availableDiscounts.length]);

  // Debug: Log hero image URL changes
  useEffect(() => {
    console.log('[TicketingPage] 🖼️ Hero image URL changed:', heroImageUrl);
    console.log('[TicketingPage] 🖼️ Hero image error state:', heroImageError);
    console.log('[TicketingPage] 🖼️ Default hero image URL:', defaultHeroImageUrl);
  }, [heroImageUrl, heroImageError, defaultHeroImageUrl]);

  // Handle error dialog close - redirect to home page
  const handleErrorDialogClose = () => {
    setErrorDialog({ open: false, title: '', message: '' });
    router.push('/');
  };

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

  // Generic error handler function
  const showErrorDialog = (title: string, message: string) => {
    console.log('[TicketingPage] showErrorDialog called:', { title, message });
    setErrorDialog({
      open: true,
      title,
      message
    });
    // Ensure loading is false so dialog can be seen
    setLoading(false);
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        // Fetch event details
        const eventRes = await fetch(`/api/proxy/event-details/${eventId}`);
        if (!eventRes.ok) {
          let errorText = '';
          let errorDetails = '';

          try {
            errorText = await eventRes.text();
            // Try to parse as JSON to extract error details
            try {
              const errorJson = JSON.parse(errorText);
              errorDetails = errorJson.details || errorJson.error || errorText;
            } catch {
              // If not JSON, use the text as-is
              errorDetails = errorText;
            }
          } catch {
            errorText = 'Unknown error';
            errorDetails = 'Unknown error';
          }

          let errorTitle = 'Loading Error';
          let errorMessage = 'Unable to load event details.';

          if (eventRes.status === 404) {
            errorTitle = 'Event Not Found';
            errorMessage = 'Event not found. Please check the event ID and try again.';
          } else if (eventRes.status === 500) {
            errorTitle = 'Server Error';
            // Extract user-friendly message from server error details
            // Server message format: "Error: Network error: Unable to reach authentication server. Please check your connection and try again."
            if (errorDetails && errorDetails.includes('Network error')) {
              // Provide user-friendly, short message for network/authentication errors
              if (errorDetails.includes('Unable to reach') || errorDetails.includes('authentication server')) {
                errorMessage = 'Unable to connect to the server. Please try again in a moment.';
              } else {
                errorMessage = 'Connection error. Please check your internet and try again.';
              }
            } else if (errorDetails && (errorDetails.includes('authentication') || errorDetails.includes('auth'))) {
              errorMessage = 'Authentication service is temporarily unavailable. Please try again in a few moments.';
            } else if (errorDetails && errorDetails !== errorText) {
              // Use server-provided error details if available
              errorMessage = errorDetails;
            } else {
              errorMessage = 'Server error occurred while loading event details. Please try again later or contact support.';
            }
          } else if (eventRes.status >= 400 && eventRes.status < 500) {
            errorTitle = 'Request Error';
            errorMessage = errorDetails && errorDetails !== errorText
              ? errorDetails
              : 'Invalid request. Please refresh the page and try again.';
          } else {
            errorMessage = 'Unable to load event details. Please try again later.';
          }

          console.error('[TicketingPage] Failed to fetch event:', eventRes.status, errorText);
          // CRITICAL: Show error dialog and ensure it's visible even during loading
          console.log('[TicketingPage] Setting error dialog:', { errorTitle, errorMessage });
          console.log('[TicketingPage] 🖼️ Setting hero image to default on error:', defaultHeroImageUrl);
          setLoading(false); // Stop loading FIRST so error dialog can be seen
          setErrorDialog({
            open: true,
            title: errorTitle,
            message: errorMessage
          });
          setEvent(null);
          setTicketTypes([]);
          // CRITICAL: Always set hero image to default when error occurs
          setHeroImageUrl(defaultHeroImageUrl);
          setHeroImageError(false); // Reset error state
          console.log('[TicketingPage] 🖼️ Hero image state updated to:', defaultHeroImageUrl);
          return;
        }
        const eventData = await eventRes.json();
        setEvent(eventData);

        // Store event details early for loading page
        if (eventData) {
          sessionStorage.setItem('eventTitle', eventData.title || '');
          sessionStorage.setItem('eventLocation', eventData.location || '');
        }

        // Fetch ticket types for this event (only active ones)
        const ticketRes = await fetch(`/api/proxy/event-ticket-types?eventId.equals=${eventId}&isActive.equals=true`);
        if (!ticketRes.ok) {
          console.error('[TicketingPage] Failed to fetch ticket types:', ticketRes.status);
          // Don't show error dialog for ticket types - just use empty array
          setTicketTypes([]);
        } else {
          const ticketData = await ticketRes.json();
          setTicketTypes(Array.isArray(ticketData) ? ticketData : []);
        }

        // Fetch discount codes for this event
        const discountRes = await fetch(`/api/proxy/discount-codes?eventId.equals=${eventId}&isActive.equals=true`);
        if (discountRes.ok) {
          const discountData = await discountRes.json();
          setAvailableDiscounts(Array.isArray(discountData) ? discountData : []);
        }

        // --- Hero image selection logic (match checkout page priority order) ---
        // Priority: Homepage Hero > Regular Hero > Flyer > Featured Image > Default
        let imageUrl = defaultHeroImageUrl;
        const baseUrl = getAppUrl();

        try {
          console.log('[TicketingPage] 🔍 Starting hero image fetch for eventId:', eventId);

          // 1. Try homepage hero image first (same as checkout page)
          const homepageHeroUrl = `${baseUrl}/api/proxy/event-medias?eventId.equals=${eventId}&isHomePageHeroImage.equals=true`;
          console.log('[TicketingPage] 📸 Attempting homepage hero image:', homepageHeroUrl);

          let mediaRes = await fetch(homepageHeroUrl, { cache: 'no-store' });
          console.log('[TicketingPage] Homepage hero response status:', mediaRes.status);

          if (mediaRes.ok) {
            const mediaData = await mediaRes.json();
            const mediaArray = Array.isArray(mediaData) ? mediaData : (mediaData ? [mediaData] : []);
            console.log('[TicketingPage] Homepage hero results:', mediaArray.length, 'items found');
            if (mediaArray.length > 0 && mediaArray[0].fileUrl) {
              imageUrl = mediaArray[0].fileUrl;
              console.log('[TicketingPage] ✅ Using homepage hero image:', imageUrl);
            }
          } else {
            const errorText = await mediaRes.text();
            console.log('[TicketingPage] Homepage hero error response:', errorText);
          }

          // 2. If no homepage hero, try regular hero image
          if (imageUrl === defaultHeroImageUrl) {
            const regularHeroUrl = `${baseUrl}/api/proxy/event-medias?eventId.equals=${eventId}&isHeroImage.equals=true`;
            console.log('[TicketingPage] 📸 Attempting regular hero image:', regularHeroUrl);

            mediaRes = await fetch(regularHeroUrl, { cache: 'no-store' });
            console.log('[TicketingPage] Regular hero response status:', mediaRes.status);

            if (mediaRes.ok) {
              const heroMediaData = await mediaRes.json();
              const heroMediaArray = Array.isArray(heroMediaData) ? heroMediaData : (heroMediaData ? [heroMediaData] : []);
              console.log('[TicketingPage] Regular hero results:', heroMediaArray.length, 'items found');
              if (heroMediaArray.length > 0 && heroMediaArray[0].fileUrl) {
                imageUrl = heroMediaArray[0].fileUrl;
                console.log('[TicketingPage] ✅ Using regular hero image:', imageUrl);
              }
            } else {
              const errorText = await mediaRes.text();
              console.log('[TicketingPage] Regular hero error response:', errorText);
            }
          }

          // 3. If no hero image, try flyer
          if (imageUrl === defaultHeroImageUrl) {
            const flyerUrl = `${baseUrl}/api/proxy/event-medias?eventId.equals=${eventId}&eventFlyer.equals=true`;
            console.log('[TicketingPage] 📸 Attempting flyer:', flyerUrl);

            const flyerRes = await fetch(flyerUrl, { cache: 'no-store' });
            console.log('[TicketingPage] Flyer response status:', flyerRes.status);

            if (flyerRes.ok) {
              const flyerData = await flyerRes.json();
              const flyerArray = Array.isArray(flyerData) ? flyerData : (flyerData ? [flyerData] : []);
              console.log('[TicketingPage] Flyer results:', flyerArray.length, 'items found');
              if (flyerArray.length > 0 && flyerArray[0].fileUrl) {
                imageUrl = flyerArray[0].fileUrl;
                console.log('[TicketingPage] ✅ Using flyer image:', imageUrl);
              }
            } else {
              const errorText = await flyerRes.text();
              console.log('[TicketingPage] Flyer error response:', errorText);
            }
          }

          // 4. If no flyer, try featured image
          if (imageUrl === defaultHeroImageUrl) {
            const featuredUrl = `${baseUrl}/api/proxy/event-medias?eventId.equals=${eventId}&isFeaturedImage.equals=true`;
            console.log('[TicketingPage] 📸 Attempting featured image:', featuredUrl);

            const featuredRes = await fetch(featuredUrl, { cache: 'no-store' });
            console.log('[TicketingPage] Featured response status:', featuredRes.status);

            if (featuredRes.ok) {
              const featuredData = await featuredRes.json();
              const featuredArray = Array.isArray(featuredData) ? featuredData : (featuredData ? [featuredData] : []);
              console.log('[TicketingPage] Featured results:', featuredArray.length, 'items found');
              if (featuredArray.length > 0 && featuredArray[0].fileUrl) {
                imageUrl = featuredArray[0].fileUrl;
                console.log('[TicketingPage] ✅ Using featured image:', imageUrl);
              }
            } else {
              const errorText = await featuredRes.text();
              console.log('[TicketingPage] Featured error response:', errorText);
            }
          }

          if (imageUrl === defaultHeroImageUrl) {
            console.warn('[TicketingPage] ⚠️ No hero image found, using default:', defaultHeroImageUrl);
          }
        } catch (error) {
          console.error('[TicketingPage] ❌ Error fetching hero image:', error);
          console.error('[TicketingPage] Error details:', error instanceof Error ? error.message : String(error));
          // Use default image on error
        }

        setHeroImageUrl(imageUrl);
        setHeroImageError(false); // Reset error state when new image URL is set

        // Store hero image URL for loading page (enhanced buffering strategy)
        if (imageUrl) {
          console.log('Tickets page - storing hero image URL:', imageUrl);
          // TODO: Implement hero image buffering if needed
        }
      } catch (e) {
        console.error('[TicketingPage] Error fetching data:', e);
        setEvent(null);
        setTicketTypes([]);
        setHeroImageUrl(defaultHeroImageUrl);
        setHeroImageError(false); // Reset error state

        // Determine error message based on error type
        let errorTitle = 'Loading Error';
        let errorMessage = 'Unable to load event details. Please refresh the page or contact support if the problem persists.';

        if (e instanceof TypeError && e.message.includes('fetch')) {
          errorTitle = 'Connection Error';
          errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
        } else if (e instanceof Error) {
          if (e.message.includes('Network') || e.message.includes('Failed to fetch')) {
            errorTitle = 'Network Error';
            errorMessage = 'Network connection failed. Please check your internet connection and try again.';
          } else {
            errorMessage = e.message || errorMessage;
          }
        }

        // CRITICAL: Set error dialog directly and stop loading
        setErrorDialog({
          open: true,
          title: errorTitle,
          message: errorMessage
        });
        setLoading(false); // Stop loading so error dialog can be seen
      } finally {
        // Only set loading to false if not already set in catch block
        // (catch block already sets it, but keep this for safety)
        if (loading) {
          setLoading(false);
        }
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

  // ENHANCED: Helper function to calculate remaining quantity (from checkout page)
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

  // ENHANCED: handleTicketChange with improved validations (from checkout page)
  const handleTicketChange = (ticketId: number, quantity: number) => {
    console.log('handleTicketChange called:', { ticketId, quantity, selectedTickets });

    const ticketType = ticketTypes.find(t => t.id === ticketId);
    if (!ticketType) {
      console.log('Ticket type not found for ID:', ticketId);
      return;
    }

    const remaining = calculateRemainingQuantity(ticketType);
    // ENHANCED: Mark as sold out if remaining quantity is less than or equal to 20 to avoid race conditions
    const isSoldOut = remaining <= 20;

    // CRITICAL: Allow decrementing even if sold out (user may want to deselect tickets they already selected)
    // Only prevent INCREASING quantity when sold out, allow DECREASING (including to 0)
    const currentQty = selectedTickets[ticketId] || 0;
    if (isSoldOut && quantity > currentQty) {
      // Only block if trying to increase quantity when sold out
      console.log(`[TicketingPage] Cannot increase tickets for ${ticketType.name} - sold out (remaining: ${remaining})`);
      return;
    }
    // Allow decreasing (quantity < currentQty) or setting to 0 even when sold out

    // ENHANCED: Use actual DTO values - if maxQuantityPerOrder is null/undefined, treat as unlimited (Infinity)
    const maxOrderQuantity = ticketType.maxQuantityPerOrder ?? Infinity;
    const minOrderQuantity = ticketType.minQuantityPerOrder ?? 1; // Default to 1 per database schema

    // Calculate max selectable: minimum of remaining quantity and max per order (if set)
    const maxSelectable = maxOrderQuantity === Infinity
      ? remaining
      : Math.min(remaining, maxOrderQuantity);

    // ENHANCED: Validate quantity against constraints
    let newQuantity = quantity;
    const isDecreasing = quantity < currentQty;

    // CRITICAL: Always allow setting to 0 (user can deselect tickets)
    // Also allow decreasing below minimum (user may want to deselect)
    // Only enforce minimum when INCREASING or when setting a new quantity
    if (quantity === 0) {
      newQuantity = 0;
      console.log(`[TicketingPage] User deselecting ticket ${ticketId} - setting quantity to 0`);
    } else if (isDecreasing) {
      // User is decreasing - allow it even if below minimum (they're deselecting)
      // But still enforce maximum and remaining quantity limits
      if (quantity > maxSelectable) {
        newQuantity = maxSelectable;
      }
      if (quantity > remaining) {
        newQuantity = remaining;
      }
      console.log(`[TicketingPage] User decreasing ticket ${ticketId} from ${currentQty} to ${quantity} (allowing below minimum)`);
    } else {
      // User is increasing or setting a new quantity - enforce all constraints
      // If quantity is below minimum, clamp to minimum
      if (quantity > 0 && quantity < minOrderQuantity) {
        newQuantity = minOrderQuantity;
        console.log(`[TicketingPage] Quantity ${quantity} below minimum ${minOrderQuantity}, clamping to minimum`);
      }
      // If quantity exceeds maximum, clamp to maximum
      if (quantity > maxSelectable) {
        newQuantity = maxSelectable;
        console.log(`[TicketingPage] Quantity ${quantity} exceeds maximum ${maxSelectable}, clamping to maximum`);
      }
      // Ensure quantity doesn't exceed remaining
      if (quantity > remaining) {
        newQuantity = remaining;
        console.log(`[TicketingPage] Quantity ${quantity} exceeds remaining ${remaining}, clamping to remaining`);
      }
    }

    // Always allow setting quantity (including 0)
    if (newQuantity >= 0) {
      console.log('Updating selectedTickets:', { ticketId, newQuantity });
      setSelectedTickets(prev => {
        const updated = { ...prev, [ticketId]: newQuantity };
        // Remove ticket from state if quantity is 0 (cleanup)
        if (newQuantity === 0) {
          const { [ticketId]: _, ...rest } = updated;
          return rest;
        }
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
    const remaining = calculateRemainingQuantity(ticketType);
    const maxOrderQuantity = ticketType.maxQuantityPerOrder ?? Infinity;
    const maxSelectable = maxOrderQuantity === Infinity ? remaining : Math.min(remaining, maxOrderQuantity);
    // Handle null, undefined, and zero values for sold out check
    return remaining > 20 && remaining >= Math.min(quantity, maxSelectable);
  };

  const emailIsValid = useMemo(() => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }, [email]);

  // ENHANCED: Derived flags used for validations and enabling/disabling actions (from checkout page)
  const hasTicketsSelected = Object.values(selectedTickets).some(q => q > 0);

  // ENHANCED: Check for tickets that are unavailable (sold out) - using remaining <= 20 threshold
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

  // ENHANCED: Check for tickets that violate minimum quantity requirements
  const hasInvalidMinQuantity = Object.entries(selectedTickets).some(([ticketId, quantity]) => {
    if (quantity === 0) return false; // 0 is allowed (deselected)
    const ticket = ticketTypes.find(t => t.id === parseInt(ticketId));
    if (!ticket || ticket.isActive === false) return false; // Skip inactive tickets
    const minOrderQuantity = ticket.minQuantityPerOrder ?? 1;
    return quantity > 0 && quantity < minOrderQuantity;
  });

  // ENHANCED: Check for tickets that violate maximum quantity requirements
  const hasInvalidMaxQuantity = Object.entries(selectedTickets).some(([ticketId, quantity]) => {
    if (quantity === 0) return false;
    const ticket = ticketTypes.find(t => t.id === parseInt(ticketId));
    if (!ticket || ticket.isActive === false) return false; // Skip inactive tickets
    const maxOrderQuantity = ticket.maxQuantityPerOrder ?? Infinity;
    const remaining = calculateRemainingQuantity(ticket);
    const maxAllowed = maxOrderQuantity === Infinity ? remaining : Math.min(remaining, maxOrderQuantity);
    return quantity > maxAllowed;
  });

  // ENHANCED: Check for tickets that exceed available quantity
  const hasExceededAvailable = Object.entries(selectedTickets).some(([ticketId, quantity]) => {
    if (quantity === 0) return false;
    const ticket = ticketTypes.find(t => t.id === parseInt(ticketId));
    if (!ticket || ticket.isActive === false) return false; // Skip inactive tickets
    const remaining = calculateRemainingQuantity(ticket);
    return quantity > remaining;
  });

  const canCheckout = hasTicketsSelected && emailIsValid && !hasUnavailableTickets && !hasInvalidMinQuantity && !hasInvalidMaxQuantity && !hasExceededAvailable;

  const validateAndApplyDiscount = (code: string, autoApply = false) => {
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
      // Store discount code in sessionStorage for persistence across page navigation
      if (typeof window !== 'undefined' && eventId) {
        sessionStorage.setItem(`discountCode_${eventId}`, codeToApply.code);
      }
      return codeToApply;
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
    try {
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

      // ENHANCED: Additional validation checks with error dialog
      if (hasUnavailableTickets) {
        setErrorDialog({
          open: true,
          title: 'Tickets Unavailable',
          message: 'Some selected tickets are sold out. Please adjust your selection and try again.'
        });
        return;
      }
      if (hasInvalidMinQuantity) {
        setErrorDialog({
          open: true,
          title: 'Invalid Quantity',
          message: 'Some selected tickets do not meet the minimum quantity requirement. Please adjust your selection to meet the minimum required quantity.'
        });
        return;
      }
      if (hasInvalidMaxQuantity) {
        setErrorDialog({
          open: true,
          title: 'Invalid Quantity',
          message: 'Some selected tickets exceed the maximum quantity per order. Please adjust your selection.'
        });
        return;
      }
      if (hasExceededAvailable) {
        setErrorDialog({
          open: true,
          title: 'Insufficient Tickets',
          message: 'Some selected tickets exceed the available quantity. Please adjust your selection.'
        });
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
        setErrorDialog({
          open: true,
          title: 'Empty Cart',
          message: 'Your cart is empty. Please select at least one ticket before proceeding to checkout.'
        });
        return;
      }

      // 4. Start processing and call Stripe API directly.
      setIsProcessing(true);

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
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create checkout session.');
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL returned.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      let errorMessage = 'Could not proceed to checkout. Please try again or contact support if the problem persists.';

      if (error instanceof TypeError && error.message.includes('fetch')) {
        errorMessage = 'Network connection failed. Please check your internet connection and try again.';
      } else if (error instanceof Error) {
        errorMessage = error.message || errorMessage;
      }

      showErrorDialog('Checkout Error', errorMessage);
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

          {/* ENHANCED: Warning messages for various validation issues */}
          {hasUnavailableTickets && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center text-red-700 text-sm">
                <span className="mr-2">⚠️</span>
                <span>Some selected tickets are sold out</span>
              </div>
            </div>
          )}
          {hasInvalidMinQuantity && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center text-yellow-700 text-sm">
                <span className="mr-2">⚠️</span>
                <span>Some tickets do not meet the minimum quantity requirement</span>
              </div>
            </div>
          )}
          {hasInvalidMaxQuantity && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center text-yellow-700 text-sm">
                <span className="mr-2">⚠️</span>
                <span>Some tickets exceed the maximum quantity per order</span>
              </div>
            </div>
          )}
          {hasExceededAvailable && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center text-red-700 text-sm">
                <span className="mr-2">⚠️</span>
                <span>Some tickets exceed the available quantity</span>
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
          {/* Show message when email is entered but no tickets are selected */}
          {email && emailIsValid && !hasTicketsSelected && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center text-yellow-700 text-sm">
                <span className="mr-2">⚠️</span>
                <span>Please select tickets to initialize payment</span>
              </div>
            </div>
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
                if (!hasTicketsSelected) {
                  showErrorDialog('Selection Required', 'Please select at least one ticket to proceed with payment.');
                } else if (hasUnavailableTickets) {
                  showErrorDialog('Tickets Sold Out', 'Some selected tickets are sold out. Please adjust your selection and try again.');
                } else if (hasInvalidMinQuantity) {
                  showErrorDialog('Minimum Quantity Required', 'Some tickets do not meet the minimum quantity requirement. Please adjust your selection to meet the minimum required quantity.');
                } else if (hasInvalidMaxQuantity) {
                  showErrorDialog('Maximum Quantity Exceeded', 'Some tickets exceed the maximum quantity per order. Please reduce your selection.');
                } else if (hasExceededAvailable) {
                  showErrorDialog('Quantity Exceeded', 'Some tickets exceed the available quantity. Please reduce your selection.');
                }
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
                  if (!hasTickets) {
                    showErrorDialog('Selection Required', 'Please select at least one ticket to proceed with payment.');
                  }
                }
                if (hasUnavailableTickets) {
                  showErrorDialog('Tickets Sold Out', 'Some selected tickets are sold out. Please adjust your selection and try again.');
                } else if (hasInvalidMinQuantity) {
                  showErrorDialog('Minimum Quantity Required', 'Some tickets do not meet the minimum quantity requirement. Please adjust your selection to meet the minimum required quantity.');
                } else if (hasInvalidMaxQuantity) {
                  showErrorDialog('Maximum Quantity Exceeded', 'Some tickets exceed the maximum quantity per order. Please reduce your selection.');
                } else if (hasExceededAvailable) {
                  showErrorDialog('Quantity Exceeded', 'Some tickets exceed the available quantity. Please reduce your selection.');
                }
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
                  if (!hasTicketsSelected) {
                    showErrorDialog('Selection Required', 'Please select at least one ticket to proceed with payment.');
                  } else if (hasUnavailableTickets) {
                    showErrorDialog('Tickets Sold Out', 'Some selected tickets are sold out. Please adjust your selection and try again.');
                  } else if (hasInvalidMinQuantity) {
                    showErrorDialog('Minimum Quantity Required', 'Some tickets do not meet the minimum quantity requirement. Please adjust your selection to meet the minimum required quantity.');
                  } else if (hasInvalidMaxQuantity) {
                    showErrorDialog('Maximum Quantity Exceeded', 'Some tickets exceed the maximum quantity per order. Please reduce your selection.');
                  } else if (hasExceededAvailable) {
                    showErrorDialog('Quantity Exceeded', 'Some tickets exceed the available quantity. Please reduce your selection.');
                  }
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
                if (!hasTicketsSelected) {
                  showErrorDialog('Selection Required', 'Please select at least one ticket to proceed with payment.');
                } else if (hasUnavailableTickets) {
                  showErrorDialog('Tickets Sold Out', 'Some selected tickets are sold out. Please adjust your selection and try again.');
                } else if (hasInvalidMinQuantity) {
                  showErrorDialog('Minimum Quantity Required', 'Some tickets do not meet the minimum quantity requirement. Please adjust your selection to meet the minimum required quantity.');
                } else if (hasInvalidMaxQuantity) {
                  showErrorDialog('Maximum Quantity Exceeded', 'Some tickets exceed the maximum quantity per order. Please reduce your selection.');
                } else if (hasExceededAvailable) {
                  showErrorDialog('Quantity Exceeded', 'Some tickets exceed the available quantity. Please reduce your selection.');
                }
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
              {hasUnavailableTickets ? 'Tickets Sold Out' :
                hasInvalidMinQuantity || hasInvalidMaxQuantity || hasExceededAvailable ? 'Invalid Selection' :
                  'Pay with credit card'}
            </button>
          </div>
        </div>
      </>
    );
  };

  if (loading && !errorDialog.open) {
    return (
      <>
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
              key={`hero-loading-${heroImageUrl || defaultHeroImageUrl}`}
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
              onError={() => {
                console.warn('[TicketingPage] ⚠️ Hero image failed to load, falling back to default:', heroImageUrl);
                setHeroImageError(true);
                setHeroImageUrl(defaultHeroImageUrl);
              }}
              onLoad={() => {
                if (heroImageUrl && heroImageUrl !== defaultHeroImageUrl) {
                  console.log('[TicketingPage] ✅ Hero image loaded successfully:', heroImageUrl);
                }
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

        {/* Error Dialog - Always render even during loading */}
        <Modal open={errorDialog.open} onClose={handleErrorDialogClose} title={errorDialog.title}>
          <div className="text-center">
            <p className="text-lg">
              {errorDialog.message}
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={handleErrorDialogClose}
                className="bg-teal-100 hover:bg-teal-200 text-teal-800 px-4 py-2 rounded-md flex items-center gap-2"
              >
                OK
              </button>
            </div>
          </div>
        </Modal>
      </>
    );
  }
  // If no event and no error dialog, show "Event not found" message
  // But if error dialog is open, still render the page with hero image and error dialog
  if (!event && !errorDialog.open && !loading) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center text-xl text-red-600">Event not found.</div>
        {/* Error Dialog - Always render */}
        <Modal open={errorDialog.open} onClose={handleErrorDialogClose} title={errorDialog.title}>
          <div className="text-center">
            <p className="text-lg">
              {errorDialog.message}
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={handleErrorDialogClose}
                className="bg-teal-100 hover:bg-teal-200 text-teal-800 px-4 py-2 rounded-md flex items-center gap-2"
              >
                OK
              </button>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  // Always render hero section even if event is null (when error dialog is showing)
  // This ensures the default hero image is always visible

  // Debug: Log current state before rendering
  console.log('[TicketingPage] 🖼️ Rendering hero section with:', {
    heroImageUrl,
    defaultHeroImageUrl,
    heroImageError,
    event: !!event,
    loading,
    errorDialogOpen: errorDialog.open
  });

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
          key={`hero-${heroImageUrl || defaultHeroImageUrl}`}
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
            console.warn('[TicketingPage] ⚠️ Hero image failed to load, falling back to default:', heroImageUrl);
            setHeroImageError(true);
            setHeroImageUrl(defaultHeroImageUrl);
            // Prevent infinite loop if default also fails
            if ((e.target as HTMLImageElement).src === defaultHeroImageUrl) {
              console.error('[TicketingPage] ❌ Default hero image also failed to load');
            }
          }}
          onLoad={() => {
            if (heroImageUrl && heroImageUrl !== defaultHeroImageUrl && !heroImageError) {
              console.log('[TicketingPage] ✅ Hero image loaded successfully:', heroImageUrl);
            }
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

      {/* Only render event details if event exists (prevents crash when error occurs) */}
      {event && (
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
                  {(() => {
                    try {
                      if (!event.startDate) {
                        return 'Date TBD';
                      }
                      const date = new Date(event.startDate);
                      if (isNaN(date.getTime())) {
                        throw new Error('Invalid date');
                      }
                      return formatInTimeZone(date, event.timezone || 'America/New_York', 'EEEE, MMMM d, yyyy');
                    } catch (error) {
                      console.error('[TicketingPage] Date formatting error:', error);
                      showErrorDialog(
                        'Event Date Error',
                        'There was an issue displaying the event date. Please contact support if this problem persists.'
                      );
                      return 'Date TBD';
                    }
                  })()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-xl">🕐</span>
                <span className="font-semibold">
                  {(() => {
                    try {
                      const timeStr = formatTime(event.startTime);
                      const endTimeStr = event.endTime ? ` - ${formatTime(event.endTime)}` : '';
                      let timezoneStr = '';
                      if (event.startDate) {
                        const date = new Date(event.startDate);
                        if (!isNaN(date.getTime())) {
                          timezoneStr = ` (${formatInTimeZone(date, event.timezone || 'America/New_York', 'zzz')})`;
                        }
                      }
                      return `${timeStr}${endTimeStr}${timezoneStr}`;
                    } catch (error) {
                      console.error('[TicketingPage] Time formatting error:', error);
                      return event.startTime || 'Time TBD';
                    }
                  })()}
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
                // ENHANCED: Use calculateRemainingQuantity helper
                const remaining = calculateRemainingQuantity(ticket);
                // ENHANCED: Mark as sold out if remaining quantity is less than or equal to 20 to avoid race conditions
                const isSoldOut = remaining <= 20;
                const maxOrderQuantity = ticket.maxQuantityPerOrder ?? Infinity;
                const minOrderQuantity = ticket.minQuantityPerOrder ?? 1;
                const maxSelectable = maxOrderQuantity === Infinity ? remaining : Math.min(remaining, maxOrderQuantity);
                const currentQty = selectedTickets[ticket.id] || 0;

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
                        />
                      </div>
                    )}

                    <div className="mb-4 sm:mb-0">
                      <h3 className="text-xl font-semibold text-gray-900">{ticket.name}</h3>
                      <p className="text-lg font-bold text-blue-600 mt-1">${ticket.price.toFixed(2)}</p>
                      <p className="text-sm text-gray-600 mt-2">{ticket.description}</p>

                      {/* ENHANCED: Show min/max quantity requirements */}
                      {!isSoldOut && (
                        <div className="mt-2 text-xs text-gray-500">
                          {minOrderQuantity > 1 && (
                            <span>Min: {minOrderQuantity} tickets</span>
                          )}
                          {minOrderQuantity > 1 && maxOrderQuantity !== Infinity && <span> • </span>}
                          {maxOrderQuantity !== Infinity && (
                            <span>Max: {maxOrderQuantity} per order</span>
                          )}
                        </div>
                      )}

                      {/* ENHANCED: Low stock warning - only show if not sold out */}
                      {!isSoldOut && remaining != null && remaining <= 5 && remaining > 0 && (
                        <div className="mt-3">
                          <p className="text-sm text-orange-600 font-medium">
                            ⚠️ Low stock - only {remaining} left!
                          </p>
                        </div>
                      )}

                      {/* Validation messages - shown below ticket info with proper spacing (matching checkout page pattern) */}
                      {(() => {
                        const hasValidationIssues =
                          currentQty > 0 && (
                            currentQty < minOrderQuantity ||
                            currentQty > remaining ||
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
                            {currentQty > remaining && (
                              <div className="p-2 bg-red-50 border border-red-300 rounded text-xs text-red-800 break-words leading-tight">
                                <span className="font-semibold">Only {remaining} available.</span> Please reduce selection.
                              </div>
                            )}
                            {/* Error: Exceeds maximum per order limit */}
                            {maxOrderQuantity !== Infinity &&
                              currentQty > maxOrderQuantity &&
                              currentQty <= remaining && (
                                <div className="p-2 bg-red-50 border border-red-300 rounded text-xs text-red-800 break-words leading-tight">
                                  <span className="font-semibold">Max {maxOrderQuantity} per order.</span> Please reduce selection.
                                </div>
                              )}
                            {/* Info: Reached max per order limit (but not exceeded) */}
                            {maxOrderQuantity !== Infinity &&
                              currentQty === maxOrderQuantity &&
                              remaining > maxOrderQuantity &&
                              currentQty >= minOrderQuantity &&
                              currentQty <= remaining && (
                                <div className="p-1.5 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800 break-words leading-tight">
                                  ℹ️ Max {maxOrderQuantity} per order
                                </div>
                              )}
                            {/* Info: At minimum quantity */}
                            {currentQty === minOrderQuantity &&
                              minOrderQuantity > 1 &&
                              currentQty <= remaining &&
                              (maxOrderQuantity === Infinity || currentQty <= maxOrderQuantity) && (
                                <div className="p-1.5 bg-green-50 border border-green-200 rounded text-xs text-green-800 break-words leading-tight">
                                  ✓ Min requirement met ({minOrderQuantity} {minOrderQuantity === 1 ? 'ticket' : 'tickets'})
                                </div>
                              )}
                          </div>
                        );
                      })()}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          console.log('Minus button clicked for ticket:', ticket.id, 'current count:', currentQty);
                          handleTicketChange(ticket.id, currentQty - 1);
                        }}
                        className="bg-gray-200 text-gray-700 px-3 py-1 rounded-l-md hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                        disabled={currentQty <= 0}
                      >
                        -
                      </button>
                      <span className="px-4 py-1 bg-white border-t border-b">{currentQty}</span>
                      <button
                        onClick={() => {
                          console.log('Plus button clicked for ticket:', ticket.id, 'current count:', currentQty);
                          handleTicketChange(ticket.id, currentQty + 1);
                        }}
                        className="bg-gray-200 text-gray-700 px-3 py-1 rounded-r-md hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                        disabled={isSoldOut || currentQty >= maxSelectable}
                      >
                        +
                      </button>
                    </div>
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
      )}
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

      {/* Error Dialog - copied from checkout page pattern */}
      <Modal open={errorDialog.open} onClose={handleErrorDialogClose} title={errorDialog.title}>
        <div className="text-center">
          <p className="text-lg">
            {errorDialog.message}
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={handleErrorDialogClose}
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


import type { EventDetailsDTO } from '@/types';
import { isTicketedFundraiserEvent } from '@/lib/donation/utils';
import { isTicketedEventCube } from '@/lib/eventcube/utils';

export interface HeroOverlayInfo {
  image: string;
  href: string;
  alt: string;
}

/**
 * Returns overlay info for "Buy Tickets" / "Fundraiser" / "Register Here" CTA
 * shown at bottom-right of hero or featured event image.
 * Only returns a value for upcoming (today or future) events: ticketed, ticketed fundraiser, or registration-required.
 */
export function getOverlayInfo(event: EventDetailsDTO | null): HeroOverlayInfo | null {
  if (!event || !event.id) return null;

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const eventDateStr = event.startDate ? event.startDate.split('T')[0] : null;

  if (!eventDateStr) return null;

  const isToday = eventDateStr === todayStr;
  const isFuture = eventDateStr > todayStr;
  const isUpcomingLocal = isToday || isFuture;

  if (!isUpcomingLocal) return null;

  const isTicketedFundraiser = isTicketedFundraiserEvent(event);

  if (isTicketedFundraiser) {
    return {
      image: '/images/buy_tickets_click_here_fundraiser.png',
      href: `/events/${event.id}/givebutter-checkout`,
      alt: 'Buy Tickets',
    };
  }

  if (isTicketedEventCube(event)) {
    return {
      image: '/images/buy_tickets_click_here_red.webp',
      href: `/events/${event.id}/eventcube-checkout`,
      alt: 'Buy Tickets',
    };
  }

  if (event.admissionType?.toUpperCase() === 'TICKETED') {
    const checkoutRoute =
      event.manualPaymentEnabled === true &&
      (event.paymentFlowMode === 'MANUAL_ONLY' || event.paymentFlowMode === 'HYBRID')
        ? `/events/${event.id}/manual-checkout`
        : `/events/${event.id}/checkout`;

    return {
      image: '/images/buy_tickets_click_here_red.webp',
      href: checkoutRoute,
      alt: 'Buy Tickets',
    };
  }

  if (event.isRegistrationRequired === true) {
    return {
      image: '/images/register_here_button.jpg',
      href: `/events/${event.id}/register`,
      alt: 'Register Here',
    };
  }

  return null;
}

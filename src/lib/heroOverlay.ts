import type { EventDetailsDTO } from '@/types';
import {
  isExternalTicketedEvent,
  isTicketedEventCube,
  resolveBuyTicketsTarget,
} from '@/lib/eventcube/utils';
import { isTicketedFundraiserEvent } from '@/lib/donation/utils';

export interface HeroOverlayInfo {
  image: string;
  href: string;
  alt: string;
  /** When true, open href in a new tab (external vendor). */
  external?: boolean;
}

/**
 * Returns overlay info for "Buy Tickets" / "Fundraiser" / "Register Here" CTA
 * shown at bottom-right of hero or featured event image.
 * Only returns a value for upcoming (today or future) events: ticketed, ticketed fundraiser, or registration-required.
 *
 * Buy Tickets priority: Event Cube → external ticket URL → Givebutter fundraiser → internal.
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

  if (isTicketedEventCube(event) || isExternalTicketedEvent(event) || isTicketedFundraiserEvent(event) || event.admissionType?.toUpperCase() === 'TICKETED') {
    const target = resolveBuyTicketsTarget(event);
    if (target) {
      const isFundraiserImage = isTicketedFundraiserEvent(event) && !isTicketedEventCube(event) && !isExternalTicketedEvent(event);
      return {
        image: isFundraiserImage
          ? '/images/buy_tickets_click_here_fundraiser.png'
          : '/images/buy_tickets_click_here_red.webp',
        href: target.href,
        alt: 'Buy Tickets',
        external: target.kind === 'external',
      };
    }
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

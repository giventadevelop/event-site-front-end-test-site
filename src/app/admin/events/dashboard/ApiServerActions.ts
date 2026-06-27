import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getAppUrl, getApiBaseUrl } from '@/lib/env';
import type { EventDetailsDTO, EventAttendeeDTO, EventAttendeeGuestDTO } from '@/types';

// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}

export interface EventDashboardData {
  eventDetails: EventDetailsDTO | null;
  totalAttendees: number;
  totalGuests: number;
  capacityUtilization: number;
  registrationTrends: Array<{
    date: string;
    count: number;
  }>;
  ageGroupStats: Array<{
    ageGroup: string;
    count: number;
    percentage: number;
  }>;
  relationshipStats: Array<{
    relationship: string;
    count: number;
    percentage: number;
  }>;
  specialRequirements: Array<{
    requirement: string;
    count: number;
  }>;
  recentRegistrations: EventAttendeeDTO[];
  topEvents: Array<{
    eventId: number;
    title: string;
    attendeeCount: number;
  }>;
}

/**
 * Fetch comprehensive dashboard data for event management
 */
export async function fetchEventDashboardData(eventId: number | null): Promise<EventDashboardData | null> {
  try {
    const baseUrl = getAppUrl();

    // Fetch event details if specific event is requested
    let eventDetails: EventDetailsDTO | null = null;
    if (eventId) {
      const eventResponse = await fetch(`${baseUrl}/api/proxy/event-details/${eventId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });

      if (eventResponse.ok) {
        eventDetails = await eventResponse.json();
      }
    }

    // Fetch all events for overview (limit to 50 for performance)
    // Create abort controller for timeout
    const eventsController = new AbortController();
    const eventsTimeout = setTimeout(() => eventsController.abort(), 15000);
    const eventsResponse = await fetch(`${baseUrl}/api/proxy/event-details?sort=startDate,desc&size=50`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      signal: eventsController.signal,
    });
    clearTimeout(eventsTimeout);

    if (!eventsResponse.ok) {
      throw new Error(`Failed to fetch events: ${eventsResponse.status}`);
    }

    const events = await eventsResponse.json();
    const eventsArray = Array.isArray(events) ? events : [];

    // Fetch attendees for the specific event or all events (limit to 500 for performance)
    const attendeeParams = eventId
      ? `eventId.equals=${eventId}&sort=registrationDate,desc`
      : 'sort=registrationDate,desc&size=500';

    const attendeesController = new AbortController();
    const attendeesTimeout = setTimeout(() => attendeesController.abort(), 15000);
    const attendeesResponse = await fetch(`${baseUrl}/api/proxy/event-attendees?${attendeeParams}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      signal: attendeesController.signal,
    });
    clearTimeout(attendeesTimeout);

    if (!attendeesResponse.ok) {
      throw new Error(`Failed to fetch attendees: ${attendeesResponse.status}`);
    }

    const attendees = await attendeesResponse.json();
    const attendeesArray = Array.isArray(attendees) ? attendees : [];

    // Fetch guests for attendees (limit to 500 for performance)
    const guestParams = eventId
      ? `eventAttendee.eventId.equals=${eventId}&size=500`
      : 'size=500';

    const guestsController = new AbortController();
    const guestsTimeout = setTimeout(() => guestsController.abort(), 15000);
    const guestsResponse = await fetch(`${baseUrl}/api/proxy/event-attendee-guests?${guestParams}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
      signal: guestsController.signal,
    });
    clearTimeout(guestsTimeout);

    if (!guestsResponse.ok) {
      throw new Error(`Failed to fetch guests: ${guestsResponse.status}`);
    }

    const guests = await guestsResponse.json();
    const guestsArray = Array.isArray(guests) ? guests : [];

    // Calculate statistics
    const totalAttendees = attendeesArray.length;
    const totalGuests = guestsArray.length;

    const capacityUtilization = eventDetails && eventDetails.capacity
      ? Math.round((totalAttendees / eventDetails.capacity) * 100)
      : 0;

    // Registration trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const registrationTrends = calculateRegistrationTrends(attendeesArray, thirtyDaysAgo);

    // Age group statistics
    const ageGroupStats = calculateAgeGroupStats(guestsArray);

    // Relationship statistics
    const relationshipStats = calculateRelationshipStats(guestsArray);

    // Special requirements
    const specialRequirements = calculateSpecialRequirements(attendeesArray, guestsArray);

    // Recent registrations (all attendees, sorted by registration date descending)
    const recentRegistrations = attendeesArray;

    // Top events by attendance
    const topEvents = calculateTopEvents(eventsArray, attendeesArray);

    return {
      eventDetails,
      totalAttendees,
      totalGuests,
      capacityUtilization,
      registrationTrends,
      ageGroupStats,
      relationshipStats,
      specialRequirements,
      recentRegistrations,
      topEvents,
    };
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return null;
  }
}

function calculateRegistrationTrends(attendees: EventAttendeeDTO[], startDate: Date): Array<{ date: string; count: number }> {
  const trends: { [key: string]: number } = {};

  // Initialize last 30 days with 0 counts
  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    trends[dateStr] = 0;
  }

  // Count registrations by date
  attendees.forEach(attendee => {
    if (attendee.registrationDate) {
      const dateStr = attendee.registrationDate.split('T')[0];
      if (trends.hasOwnProperty(dateStr)) {
        trends[dateStr]++;
      }
    }
  });

  return Object.entries(trends)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function calculateAgeGroupStats(guests: EventAttendeeGuestDTO[]): Array<{ ageGroup: string; count: number; percentage: number }> {
  const stats: { [key: string]: number } = {};

  guests.forEach(guest => {
    const ageGroup = guest.ageGroup || 'Unknown';
    stats[ageGroup] = (stats[ageGroup] || 0) + 1;
  });

  const total = guests.length;

  return Object.entries(stats)
    .map(([ageGroup, count]) => ({
      ageGroup,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count);
}

function calculateRelationshipStats(guests: EventAttendeeGuestDTO[]): Array<{ relationship: string; count: number; percentage: number }> {
  const stats: { [key: string]: number } = {};

  guests.forEach(guest => {
    const relationship = guest.relationship || 'Unknown';
    stats[relationship] = (stats[relationship] || 0) + 1;
  });

  const total = guests.length;

  return Object.entries(stats)
    .map(([relationship, count]) => ({
      relationship,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }))
    .sort((a, b) => b.count - a.count);
}

function calculateSpecialRequirements(attendees: EventAttendeeDTO[], guests: EventAttendeeGuestDTO[]): Array<{ requirement: string; count: number }> {
  const requirements: { [key: string]: number } = {};

  // Count attendee special requirements
  attendees.forEach(attendee => {
    if (attendee.specialRequirements) {
      const reqs = attendee.specialRequirements.split(',').map(r => r.trim()).filter(r => r);
      reqs.forEach(req => {
        requirements[req] = (requirements[req] || 0) + 1;
      });
    }
  });

  // Count guest special requirements
  guests.forEach(guest => {
    if (guest.specialRequirements) {
      const reqs = guest.specialRequirements.split(',').map(r => r.trim()).filter(r => r);
      reqs.forEach(req => {
        requirements[req] = (requirements[req] || 0) + 1;
      });
    }
  });

  return Object.entries(requirements)
    .map(([requirement, count]) => ({ requirement, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 requirements
}

function calculateTopEvents(events: EventDetailsDTO[], attendees: EventAttendeeDTO[]): Array<{ eventId: number; title: string; attendeeCount: number }> {
  const eventStats: { [key: number]: { title: string; count: number } } = {};

  // Initialize with event titles
  events.forEach(event => {
    eventStats[event.id] = { title: event.title, count: 0 };
  });

  // Count attendees per event
  attendees.forEach(attendee => {
    if (attendee.eventId && eventStats[attendee.eventId]) {
      eventStats[attendee.eventId].count++;
    }
  });

  return Object.entries(eventStats)
    .map(([eventId, data]) => ({
      eventId: parseInt(eventId),
      title: data.title,
      attendeeCount: data.count
    }))
    .sort((a, b) => b.attendeeCount - a.attendeeCount)
    .slice(0, 10); // Top 10 events
}

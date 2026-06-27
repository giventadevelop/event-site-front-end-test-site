import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import EventRegistrationForm from '@/components/EventRegistrationForm';
import { getAppUrl } from '@/lib/env';
import type { EventDetailsDTO } from '@/types';

interface RegistrationPageProps {
  searchParams: {
    eventId?: string;
  };
}

async function fetchEventDetails(eventId: number): Promise<EventDetailsDTO | null> {
  try {
    const baseUrl = getAppUrl();
    const response = await fetch(`${baseUrl}/api/proxy/event-details/${eventId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch event details: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching event details:', error);
    return null;
  }
}

function LoadingSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-8 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function RegistrationPage({ searchParams }: RegistrationPageProps) {
  const eventId = searchParams.eventId ? parseInt(searchParams.eventId) : null;

  if (!eventId || isNaN(eventId)) {
    notFound();
  }

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <RegistrationPageContent eventId={eventId} />
    </Suspense>
  );
}

async function RegistrationPageContent({ eventId }: { eventId: number }) {
  const eventDetails = await fetchEventDetails(eventId);

  if (!eventDetails) {
    notFound();
  }

  return (
    <EventRegistrationForm
      eventId={eventId}
      eventTitle={eventDetails.title}
      eventDetails={eventDetails}
    />
  );
}

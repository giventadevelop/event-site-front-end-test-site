'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { EventForm, defaultEvent } from '@/components/EventForm';
import type { EventDetailsDTO, EventTypeDetailsDTO, UserProfileDTO } from '@/types';
import Link from 'next/link';
// Icons removed - using inline SVGs instead
import { createCalendarEventServer } from '../../ApiServerActions';
import { useAuth, useUser } from '@clerk/nextjs';
import SaveStatusDialog, { type SaveStatus } from '@/components/SaveStatusDialog';

export default function CreateEventPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const copyFromId = searchParams?.get('copyFrom');
  const [eventTypes, setEventTypes] = useState<EventTypeDetailsDTO[]>([]);
  const [initialEvent, setInitialEvent] = useState<EventDetailsDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const { userId } = useAuth();
  const { user } = useUser();
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveMessage, setSaveMessage] = useState<string>('');

  useEffect(() => {
    fetch('/api/proxy/event-type-details')
      .then(res => res.ok ? res.json() : [])
      .then(data => setEventTypes(Array.isArray(data) ? data : []));
  }, []);

  // Fetch event to copy if copyFromId is provided
  useEffect(() => {
    if (copyFromId) {
      fetch(`/api/proxy/event-details/${copyFromId}`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch event');
          return res.json();
        })
        .then((event: EventDetailsDTO) => {
          // Create a copy of the event retaining original dates
          const copiedEvent: EventDetailsDTO = {
            ...event,
            id: undefined, // Remove ID so it's treated as a new event
            title: event.title ? `${event.title} (Copy)` : '',
            // Retain original start and end dates
            startDate: event.startDate || '', // YYYY-MM-DD format - EventForm will convert to MM/DD/YYYY for display
            endDate: event.endDate || '', // YYYY-MM-DD format - EventForm will convert to MM/DD/YYYY for display
            createdAt: '',
            updatedAt: '',
            createdBy: undefined,
          };

          setInitialEvent(copiedEvent);
        })
        .catch(err => {
          console.error('Error fetching event to copy:', err);
          // Error is handled silently - user can still create a new event
        });
    }
  }, [copyFromId]);

  async function handleSubmit(event: EventDetailsDTO) {
    setLoading(true);
    setSaveStatus('saving');
    setSaveMessage('Please wait while we create your event...');

    try {
      const now = new Date().toISOString();
      const eventToSend = {
        ...event,
        createdAt: now,
        updatedAt: now,
      };
      const res = await fetch('/api/proxy/event-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventToSend),
      });

      if (!res.ok) {
        let errorMessage = 'Failed to create event';
        try {
          const errorText = await res.text();
          // Try to parse as JSON (JHipster error format)
          try {
            const errorJson = JSON.parse(errorText);
            // Extract meaningful error message
            if (errorJson.detail) {
              // Parse JHipster error detail
              const detail = errorJson.detail;
              if (detail.includes('Unable to bind parameter')) {
                errorMessage = 'Invalid data format. Please check all fields and try again.';
              } else if (detail.includes('null') && detail.includes('Unknown Types value')) {
                errorMessage = 'Some required fields are missing or invalid. Please review your event configuration and try again.';
              } else if (detail.includes('recurrence_weekly_days') && detail.includes('integer[]')) {
                errorMessage = 'Recurrence configuration error. Please check your recurrence settings and try again.';
              } else if (detail.includes('could not execute batch')) {
                errorMessage = 'Database error occurred while saving. Please check all fields and try again.';
              } else {
                // Use detail but truncate if too long
                errorMessage = detail.length > 150 ? detail.substring(0, 150) + '...' : detail;
              }
            } else if (errorJson.message) {
              errorMessage = errorJson.message;
            } else if (errorJson.title) {
              errorMessage = errorJson.title;
            }
          } catch {
            // Not JSON, use text as-is but make it more concise
            if (errorText.length > 200) {
              errorMessage = errorText.substring(0, 200) + '...';
            } else {
              errorMessage = errorText;
            }
          }
        } catch {
          errorMessage = 'Failed to create event. Please try again.';
        }
        throw new Error(errorMessage);
      }

      const newEvent = await res.json();
      let userProfile: UserProfileDTO | null = null;
      if (userId) {
        const profileRes = await fetch(`/api/proxy/user-profiles/by-user/${userId}`);
        if (profileRes.ok) {
          userProfile = await profileRes.json();
        }
      }

      // Try to create calendar event (non-blocking)
      try {
        if (userProfile) {
          await createCalendarEventServer(newEvent, userProfile);
        }
      } catch (calendarErr: any) {
        // Calendar error is non-critical, just log it
        console.warn('Calendar event creation failed:', calendarErr);
      }

      // Show success message
      setSaveStatus('success');
      setSaveMessage('Your event has been created successfully. Redirecting to manage events...');

      // Redirect after a brief delay
      setTimeout(() => {
        router.push('/admin/manage-events');
      }, 1500);
    } catch (e: any) {
      setSaveStatus('error');
      const userMessage = e.message || 'Failed to create event. Please try again.';
      setSaveMessage(userMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-[80%] max-w-5xl mx-auto p-4" style={{ paddingTop: '118px' }}>
      {/* Responsive Button Group */}
      <div className="w-full mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <Link
            href="/admin"
            className="flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-lg shadow-md p-4 text-xs transition-all group"
            title="Admin Home"
            aria-label="Admin Home"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <span className="font-semibold text-center leading-tight">Admin Home</span>
          </Link>
          <Link
            href="/admin/manage-usage"
            className="flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg shadow-md p-4 text-xs transition-all group"
            title="Manage Usage"
            aria-label="Manage Usage"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="font-semibold text-center leading-tight">Manage Usage</span>
          </Link>
          <Link
            href="/admin/manage-events"
            className="flex flex-col items-center justify-center bg-green-50 hover:bg-green-100 text-green-800 rounded-lg shadow-md p-4 text-xs transition-all group"
            title="Manage Events"
            aria-label="Manage Events"
          >
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="font-semibold text-center leading-tight">Manage Events</span>
          </Link>
        </div>
      </div>
      <h1 className="text-2xl font-bold mb-4">
        {copyFromId ? 'Create Event (Copy)' : 'Create Event'}
      </h1>
      {copyFromId && initialEvent && (
        <div className="bg-blue-50 text-blue-800 p-3 rounded mb-4 border border-blue-200">
          <p className="text-sm">
            <strong>Copying from Event ID {copyFromId}:</strong> All fields have been pre-populated.
            Start date set to today and end date set to tomorrow. Please review and update as needed.
          </p>
        </div>
      )}
      <div className="border rounded p-4 bg-white shadow-sm min-h-[200px]">
        <EventForm
          event={initialEvent || defaultEvent}
          eventTypes={eventTypes}
          onSubmit={handleSubmit}
          loading={loading}
        />
      </div>

      {/* Save Status Dialog */}
      <SaveStatusDialog
        isOpen={saveStatus !== 'idle'}
        status={saveStatus}
        message={saveMessage}
        onClose={() => {
          if (saveStatus === 'error') {
            setSaveStatus('idle');
            setSaveMessage('');
          }
        }}
      />
    </div>
  );
}
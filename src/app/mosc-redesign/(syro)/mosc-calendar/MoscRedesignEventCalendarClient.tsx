'use client';

import CalendarClient from '@/app/calendar/CalendarClient';
import type { CalendarEventDTO } from '@/app/calendar/ApiServerActions';

/**
 * Event calendar (database API) with MOSC redesign Syro styling — aligned with liturgical calendar.
 */
export default function MoscRedesignEventCalendarClient(props: {
  initialEvents: CalendarEventDTO[];
  initialYear: number;
  initialMonth: number;
  focusGroup?: string;
  initialView?: 'month' | 'week' | 'day';
  initialDate?: Date;
}) {
  return (
    <CalendarClient
      basePath="/mosc-redesign/mosc-calendar"
      theme="syro"
      {...props}
    />
  );
}

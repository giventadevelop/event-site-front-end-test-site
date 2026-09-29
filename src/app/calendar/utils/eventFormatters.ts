import type { CalendarEventDTO } from '../ApiServerActions';
import type { CalendarEvent } from '../types/calendar.types';

export function toCalendarEvents(dtos: CalendarEventDTO[]) {
  return dtos.map(d => ({
    id: d.id,
    title: d.title,
    caption: d.caption,
    startDate: d.startDate,
    endDate: d.endDate ?? d.startDate,
    startTime: d.startTime,
    endTime: d.endTime,
    location: d.location,
    timezone: d.timezone,
  }));
}

/** Local calendar day as YYYY-MM-DD (no UTC shift). */
export function toLocalYmd(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** True when the event is active on the given YYYY-MM-DD (inclusive start/end). */
export function eventOccursOnDate(event: CalendarEvent, ymd: string): boolean {
  const end = event.endDate || event.startDate;
  return event.startDate <= ymd && end >= ymd;
}

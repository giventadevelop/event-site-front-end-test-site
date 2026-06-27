import type { CalendarEventDTO } from '../ApiServerActions';

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



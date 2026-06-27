export interface CalendarEvent {
  id: number;
  title: string;
  caption?: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string;  // YYYY-MM-DD
  startTime: string; // HH:mm:ss
  endTime: string;   // HH:mm:ss
  location?: string;
  timezone: string;  // IANA
}

export type CalendarView = 'month' | 'week' | 'day';



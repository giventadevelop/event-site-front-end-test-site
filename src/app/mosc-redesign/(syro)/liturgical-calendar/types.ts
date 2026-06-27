import type { LiturgyReading } from '@/lib/strapi/liturgyDays';

export type LiturgyCalendarView = 'month' | 'week' | 'day';
export type LiturgyLanguage = 'en' | 'ml';

export interface LiturgyCalendarItem {
  id: number;
  documentId: string;
  title: string;
  season: string;
  startDate: string;
  readings: LiturgyReading[];
  /** True when ML tab shows English because Strapi ML fields are not Unicode Malayalam */
  malayalamUsingEnglishFallback?: boolean;
}

export interface LiturgyCalendarDayDetail extends LiturgyCalendarItem {
  dayHeadingEn: string;
  dayHeadingMalylm: string;
  seasonNameEn: string;
  seasonNameMalylm: string;
}

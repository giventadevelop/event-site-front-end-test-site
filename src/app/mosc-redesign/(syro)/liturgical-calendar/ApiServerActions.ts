'use server';

import {
  fetchLiturgyDayByDate,
  fetchLiturgyDaysForMonth,
  getLiturgyStrapiConfigured,
  mapLiturgyDayToReadings,
  type LiturgyDay,
} from '@/lib/strapi/liturgyDays';
import { liturgyDayNeedsMalayalamReimport } from '@/lib/malayalam/liturgyText';
import type { LiturgyCalendarDayDetail, LiturgyCalendarItem, LiturgyLanguage } from './types';

const LITURGY_DATA_SOURCE = process.env.LITURGY_DATA_SOURCE || 'external';

function isStrapiEnabled(): boolean {
  return LITURGY_DATA_SOURCE === 'strapi' && getLiturgyStrapiConfigured();
}

/** Readable label shown when no Unicode Malayalam / English title exists for a day. */
const TITLE_PLACEHOLDER: Record<LiturgyLanguage, string> = {
  en: 'Liturgy reading',
  ml: 'ലിറ്റർജി വായന',
};

function mapDayToCalendarItem(day: LiturgyDay, lng: LiturgyLanguage): LiturgyCalendarItem {
  const readings = mapLiturgyDayToReadings(day, lng);
  const isEn = lng === 'en';
  const malayalamUsingEnglishFallback =
    !isEn && liturgyDayNeedsMalayalamReimport(day);

  const resolvedTitle = isEn
    ? day.dayHeadingEn
    : readings[0]?.liturgy_day_heading || day.dayHeadingEn;
  const resolvedSeason = isEn
    ? day.seasonNameEn
    : readings[0]?.season_name || day.seasonNameEn;

  // resolvedTitle/Season are already cleaned (legacy gibberish becomes '').
  // Never render an empty/garbled title — fall back to a readable placeholder.
  const title = resolvedTitle.trim() || TITLE_PLACEHOLDER[lng];
  const season = resolvedSeason.trim();

  return {
    id: day.id,
    documentId: day.documentId,
    title,
    season,
    startDate: day.date,
    readings,
    malayalamUsingEnglishFallback: malayalamUsingEnglishFallback || undefined,
  };
}

export async function fetchLiturgyDaysForMonthServer(
  year: number,
  month: number,
  lng: LiturgyLanguage = 'en'
): Promise<LiturgyCalendarItem[]> {
  if (!isStrapiEnabled()) {
    console.warn('[LiturgyCalendar] Strapi not configured or LITURGY_DATA_SOURCE !== strapi');
    return [];
  }

  const result = await fetchLiturgyDaysForMonth(year, month);
  return result.days.map((day) => mapDayToCalendarItem(day, lng));
}

export async function fetchLiturgyDayByDateServer(
  date: string,
  lng: LiturgyLanguage = 'en'
): Promise<LiturgyCalendarDayDetail | null> {
  if (!isStrapiEnabled()) return null;

  const day = await fetchLiturgyDayByDate(date);
  if (!day) return null;

  const item = mapDayToCalendarItem(day, lng);
  return {
    ...item,
    dayHeadingEn: day.dayHeadingEn,
    dayHeadingMalylm: day.dayHeadingMalylm,
    seasonNameEn: day.seasonNameEn,
    seasonNameMalylm: day.seasonNameMalylm,
  };
}

export async function getLiturgyCalendarConfiguredServer(): Promise<boolean> {
  return isStrapiEnabled();
}

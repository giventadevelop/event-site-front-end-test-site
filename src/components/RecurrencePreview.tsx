'use client';

import React, { useMemo } from 'react';
import { generateOccurrenceDates, formatOccurrenceDate, type RecurrencePattern } from '@/lib/recurrenceUtils';

interface RecurrencePreviewProps {
  startDate: string;
  startTime: string;
  timezone: string;
  pattern: RecurrencePattern | '';
  interval: number;
  endType: 'END_DATE' | 'OCCURRENCES';
  endDate?: string;
  occurrences?: number;
  weeklyDays?: number[];
  monthlyDay?: number | 'LAST' | null;
}

export default function RecurrencePreview({
  startDate,
  startTime,
  timezone,
  pattern,
  interval,
  endType,
  endDate,
  occurrences,
  weeklyDays,
  monthlyDay,
}: RecurrencePreviewProps) {
  const previewDates = useMemo(() => {
    if (!pattern || !startDate) {
      return [];
    }

    try {
      const start = new Date(startDate + 'T00:00:00');
      if (isNaN(start.getTime())) {
        return [];
      }

      const end = endType === 'END_DATE' && endDate ? new Date(endDate + 'T00:00:00') : undefined;
      const maxOccurrences = endType === 'OCCURRENCES' ? (occurrences || 10) : 10;

      const dates = generateOccurrenceDates(
        start,
        pattern as RecurrencePattern,
        interval,
        end,
        maxOccurrences,
        weeklyDays,
        monthlyDay === null ? undefined : monthlyDay,
        timezone
      );

      return dates.slice(0, 10); // Show first 10
    } catch (error) {
      console.error('Error generating preview dates:', error);
      return [];
    }
  }, [startDate, startTime, timezone, pattern, interval, endType, endDate, occurrences, weeklyDays, monthlyDay]);

  if (!pattern || previewDates.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <details className="cursor-pointer">
        <summary className="font-medium text-gray-800 mb-2">
          Preview of recurring events ({previewDates.length} {previewDates.length === 1 ? 'occurrence' : 'occurrences'} shown)
        </summary>
        <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
          {previewDates.map((date, index) => (
            <div key={index} className="text-sm text-gray-700 py-1 border-b border-gray-200 last:border-b-0">
              <strong>Event {index + 1}:</strong> {formatOccurrenceDate(date, startTime, timezone)}
            </div>
          ))}
          {previewDates.length === 10 && (
            <p className="text-xs text-gray-500 mt-2 italic">
              (Showing first 10 occurrences. More may exist based on your end condition.)
            </p>
          )}
        </div>
      </details>
    </div>
  );
}


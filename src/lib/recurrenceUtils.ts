/**
 * Recurrence utility functions for calculating event occurrence dates
 */

export type RecurrencePattern = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
export type RecurrenceEndType = 'END_DATE' | 'OCCURRENCES';

/**
 * Validate recurrence end date (must be after start date and within 5 years)
 */
export function validateRecurrenceEndDate(
  startDate: Date,
  endDate: Date
): { valid: boolean; error?: string } {
  if (endDate <= startDate) {
    return { valid: false, error: 'End date must be after start date' };
  }

  const maxEndDate = new Date(startDate);
  maxEndDate.setFullYear(maxEndDate.getFullYear() + 5);

  if (endDate > maxEndDate) {
    return { valid: false, error: 'End date cannot be more than 5 years from start date' };
  }

  return { valid: true };
}

/**
 * Calculate the next occurrence date based on pattern and current date
 */
export function calculateNextOccurrence(
  startDate: Date,
  pattern: RecurrencePattern,
  interval: number,
  currentDate: Date,
  weeklyDays?: number[],
  monthlyDay?: number | 'LAST'
): Date | null {
  if (currentDate < startDate) {
    return new Date(startDate);
  }

  let nextDate = new Date(currentDate);

  switch (pattern) {
    case 'DAILY':
      nextDate.setDate(nextDate.getDate() + interval);
      break;

    case 'WEEKLY':
    case 'BIWEEKLY':
      if (!weeklyDays || weeklyDays.length === 0) {
        return null;
      }
      const weeks = pattern === 'BIWEEKLY' ? 2 : interval;
      nextDate = findNextWeeklyOccurrence(nextDate, weeklyDays, weeks);
      break;

    case 'MONTHLY':
      if (monthlyDay === 'LAST') {
        nextDate = findLastDayOfMonth(nextDate);
        if (nextDate <= currentDate) {
          nextDate = addMonths(nextDate, interval);
          nextDate = findLastDayOfMonth(nextDate);
        }
      } else if (monthlyDay) {
        nextDate = new Date(nextDate);
        nextDate.setDate(monthlyDay);
        if (nextDate <= currentDate) {
          nextDate = addMonths(nextDate, interval);
          nextDate.setDate(monthlyDay);
        }
      } else {
        return null;
      }
      break;

    default:
      return null;
  }

  return nextDate;
}

/**
 * Generate list of occurrence dates based on recurrence configuration
 */
export function generateOccurrenceDates(
  startDate: Date,
  pattern: RecurrencePattern,
  interval: number,
  endDate?: Date,
  maxOccurrences?: number,
  weeklyDays?: number[],
  monthlyDay?: number | 'LAST',
  timezone?: string
): Date[] {
  const occurrences: Date[] = [];
  let currentDate = new Date(startDate);
  let count = 0;
  const maxCount = maxOccurrences || 1000;

  // Validate weekly/monthly requirements
  if ((pattern === 'WEEKLY' || pattern === 'BIWEEKLY') && (!weeklyDays || weeklyDays.length === 0)) {
    return occurrences;
  }

  if (pattern === 'MONTHLY' && monthlyDay === undefined) {
    return occurrences;
  }

  while (count < maxCount) {
    // Check if we've exceeded the end date
    if (endDate && currentDate > endDate) {
      break;
    }

    occurrences.push(new Date(currentDate));
    count++;

    // Calculate next occurrence
    const nextDate = calculateNextOccurrence(
      startDate,
      pattern,
      interval,
      currentDate,
      weeklyDays,
      monthlyDay
    );

    if (!nextDate || nextDate <= currentDate) {
      break;
    }

    currentDate = nextDate;
  }

  return occurrences;
}

/**
 * Find next occurrence for weekly/biweekly pattern
 */
function findNextWeeklyOccurrence(
  currentDate: Date,
  weeklyDays: number[],
  weeks: number
): Date {
  const result = new Date(currentDate);
  const currentDay = result.getDay(); // 0 = Sunday, 6 = Saturday

  // Find next day in the week
  const sortedDays = [...weeklyDays].sort((a, b) => a - b);
  const nextDayInWeek = sortedDays.find(day => day > currentDay);

  if (nextDayInWeek !== undefined) {
    // Next occurrence is in the same week
    result.setDate(result.getDate() + (nextDayInWeek - currentDay));
    return result;
  }

  // Next occurrence is in the next interval
  const firstDay = sortedDays[0];
  const daysUntilNextWeek = 7 - currentDay + firstDay;
  result.setDate(result.getDate() + daysUntilNextWeek + (weeks - 1) * 7);
  return result;
}

/**
 * Add months to a date, handling month-end edge cases
 */
function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const currentDay = result.getDate();
  result.setMonth(result.getMonth() + months);

  // Handle month-end edge cases (e.g., Jan 31 + 1 month = Feb 28/29)
  if (result.getDate() !== currentDay) {
    result.setDate(0); // Go to last day of previous month
  }

  return result;
}

/**
 * Find last day of month
 */
function findLastDayOfMonth(date: Date): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1);
  result.setDate(0); // Last day of current month
  return result;
}

/**
 * Format occurrence date for display
 */
export function formatOccurrenceDate(
  date: Date,
  startTime?: string,
  timezone?: string
): string {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  let formatted = date.toLocaleDateString('en-US', options);

  if (startTime) {
    // Format time (assuming HH:mm format)
    const [hours, minutes] = startTime.split(':');
    const hour12 = parseInt(hours, 10) % 12 || 12;
    const ampm = parseInt(hours, 10) >= 12 ? 'PM' : 'AM';
    formatted += ` at ${hour12}:${minutes} ${ampm}`;
  }

  return formatted;
}


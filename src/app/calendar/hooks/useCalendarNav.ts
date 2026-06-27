import { useState } from 'react';
import type { CalendarView } from '../types/calendar.types';

export function useCalendarNav(initialYear: number, initialMonth: number) {
  const [year, setYear] = useState(initialYear);
  const [month, setMonth] = useState(initialMonth);
  const [view, setView] = useState<CalendarView>('month');

  function prev() {
    if (view !== 'month') return;
    if (month === 1) {
      setYear(year - 1);
      setMonth(12);
    } else {
      setMonth(month - 1);
    }
  }
  function next() {
    if (view !== 'month') return;
    if (month === 12) {
      setYear(year + 1);
      setMonth(1);
    } else {
      setMonth(month + 1);
    }
  }
  function today() {
    const t = new Date();
    setYear(t.getFullYear());
    setMonth(t.getMonth() + 1);
  }

  return { year, month, view, setView, setYear, setMonth, prev, next, today };
}



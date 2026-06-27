'use client';

import { useLayoutEffect } from 'react';
import HomeParticleBackground from '@/components/HomeParticleBackground';

/**
 * Applies the homepage design system to the Calendar page (see design.md).
 */
export default function CalendarPageBackground() {
  useLayoutEffect(() => {
    document.body.classList.add('home-page-background');
    document.body.classList.add('calendar-page-background');
    return () => {
      document.body.classList.remove('home-page-background');
      document.body.classList.remove('calendar-page-background');
    };
  }, []);

  return <HomeParticleBackground />;
}

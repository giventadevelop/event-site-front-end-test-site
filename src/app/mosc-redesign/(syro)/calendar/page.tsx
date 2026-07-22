import { redirect } from 'next/navigation';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calendar',
  description: 'Church calendar for the Malankara Orthodox Syrian Church.',
  keywords: ['Calendar', 'Malankara Orthodox Syrian Church', 'MOSC'],
};

/** Legacy URL — liturgical calendar moved to /mosc-redesign/liturgical-calendar */
export default function CalendarLegacyRedirectPage() {
  redirect('/mosc-redesign/liturgical-calendar');
}

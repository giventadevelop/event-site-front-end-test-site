import { redirect } from 'next/navigation';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Catholicate',
  description: 'Learn about the Catholicate of the Malankara Orthodox Syrian Church.',
  keywords: ['Catholicate', 'Malankara Orthodox Syrian Church', 'MOSC'],
};

/**
 * Redirect to the single Catholicate introduction page.
 * Content previously at /mosc/catholicate/catholicate is now at /mosc/catholicate-intro.
 */
export default function CatholicateOverviewRedirect() {
  redirect('/mosc-redesign/catholicate-intro');
}

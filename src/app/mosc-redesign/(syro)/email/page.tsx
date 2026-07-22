import { redirect } from 'next/navigation';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Email',
  description: 'Email tools for the Malankara Orthodox Syrian Church site.',
  keywords: ['Email', 'Malankara Orthodox Syrian Church', 'MOSC'],
};

export default function LegacyEmailPageRedirect() {
  // Preserve backward compatibility but move traffic to the new route
  redirect('/mosc-redesign/contact-form-email');
}












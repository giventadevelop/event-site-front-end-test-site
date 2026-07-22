import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kalpana Downloads (Legacy)',
  description: 'Legacy Kalpana downloads.',
  keywords: ['Kalpana Downloads (Legacy)', 'Malankara Orthodox Syrian Church', 'MOSC'],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
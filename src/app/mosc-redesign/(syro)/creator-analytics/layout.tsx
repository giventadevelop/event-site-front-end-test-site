import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Creator Analytics',
  description: 'Creator analytics for the MOSC redesign site.',
  keywords: ['Creator Analytics', 'Malankara Orthodox Syrian Church', 'MOSC'],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
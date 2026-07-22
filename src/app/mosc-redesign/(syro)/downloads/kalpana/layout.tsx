import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kalpana Downloads',
  description: 'Download Kalpana and official circulars of the Malankara Orthodox Syrian Church.',
  keywords: ['Kalpana Downloads', 'Malankara Orthodox Syrian Church', 'MOSC'],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
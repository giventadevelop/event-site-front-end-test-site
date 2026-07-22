import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Prayer Books',
  description: 'Download prayer books from the Malankara Orthodox Syrian Church.',
  keywords: ['Prayer Books', 'Malankara Orthodox Syrian Church', 'MOSC'],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
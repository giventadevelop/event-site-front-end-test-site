import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDF Downloads',
  description: 'Download PDF documents from the Malankara Orthodox Syrian Church.',
  keywords: ['PDF Downloads', 'Malankara Orthodox Syrian Church', 'MOSC'],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
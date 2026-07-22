import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Photo Downloads',
  description: 'Download photos from the Malankara Orthodox Syrian Church.',
  keywords: ['Photo Downloads', 'Malankara Orthodox Syrian Church', 'MOSC'],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Photo Downloads (Legacy)',
  description: 'Legacy photo downloads.',
  keywords: ['Photo Downloads (Legacy)', 'Malankara Orthodox Syrian Church', 'MOSC'],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
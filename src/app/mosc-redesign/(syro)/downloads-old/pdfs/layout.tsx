import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PDF Downloads (Legacy)',
  description: 'Legacy PDF downloads.',
  keywords: ['PDF Downloads (Legacy)', 'Malankara Orthodox Syrian Church', 'MOSC'],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
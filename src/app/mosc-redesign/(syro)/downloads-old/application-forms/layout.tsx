import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Application Forms (Legacy)',
  description: 'Legacy application form downloads.',
  keywords: ['Application Forms (Legacy)', 'Malankara Orthodox Syrian Church', 'MOSC'],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
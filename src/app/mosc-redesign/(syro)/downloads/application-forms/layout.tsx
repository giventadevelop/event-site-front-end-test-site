import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Application Forms',
  description: 'Download application forms from the Malankara Orthodox Syrian Church.',
  keywords: ['Application Forms', 'Malankara Orthodox Syrian Church', 'MOSC'],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
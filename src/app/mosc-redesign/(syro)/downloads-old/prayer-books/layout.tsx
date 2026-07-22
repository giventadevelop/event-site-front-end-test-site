import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Prayer Books (Legacy)',
  description: 'Legacy prayer book downloads.',
  keywords: ['Prayer Books (Legacy)', 'Malankara Orthodox Syrian Church', 'MOSC'],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
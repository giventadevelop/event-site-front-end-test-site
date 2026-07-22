import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'Downloads',
    template: '%s | Malankara Orthodox Syrian Church',
  },
  description:
    'Official documents, Kalpana, prayer books, PDFs, and downloadable resources of the Malankara Orthodox Syrian Church.',
  keywords: [
    'Downloads',
    'official documents',
    'Kalpana',
    'prayer books',
    'PDF',
    'Malankara Orthodox Syrian Church',
  ],
};

export default function DownloadsLayout({ children }: { children: React.ReactNode }) {
  return children;
}

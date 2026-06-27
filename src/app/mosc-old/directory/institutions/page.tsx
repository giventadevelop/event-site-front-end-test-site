import { Metadata } from 'next';
import EntriesListPage from '../entries/EntriesListPage';

export const metadata: Metadata = {
  title: 'Institutions | Directory | Malankara Orthodox Syrian Church',
  description: 'Directory of institutions of the Malankara Orthodox Syrian Church.',
  keywords: ['MOSC Directory', 'Institutions'],
};

export default function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  return <EntriesListPage directoryType="institutions" searchParams={searchParams} />;
}

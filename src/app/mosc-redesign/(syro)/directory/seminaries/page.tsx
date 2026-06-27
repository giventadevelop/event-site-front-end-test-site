import { Metadata } from 'next';
import EntriesListPage from '../entries/EntriesListPage';

export const metadata: Metadata = {
  title: 'Seminaries | Directory | Malankara Orthodox Syrian Church',
  description: 'Directory of seminaries of the Malankara Orthodox Syrian Church.',
  keywords: ['MOSC Directory', 'Seminaries'],
};

export default function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  return <EntriesListPage directoryType="seminaries" searchParams={searchParams} />;
}

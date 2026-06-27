import { Metadata } from 'next';
import EntriesListPage from '../entries/EntriesListPage';

export const metadata: Metadata = {
  title: 'Church Dignitaries | Directory | Malankara Orthodox Syrian Church',
  description: 'Directory of church dignitaries of the Malankara Orthodox Syrian Church.',
  keywords: ['MOSC Directory', 'Church Dignitaries'],
};

export default function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  return <EntriesListPage directoryType="church-dignitaries" searchParams={searchParams} />;
}

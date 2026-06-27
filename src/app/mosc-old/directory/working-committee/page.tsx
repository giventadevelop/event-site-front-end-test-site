import { Metadata } from 'next';
import EntriesListPage from '../entries/EntriesListPage';

export const metadata: Metadata = {
  title: 'Working Committee | Directory | Malankara Orthodox Syrian Church',
  description: 'Directory of the Working Committee of the Malankara Orthodox Syrian Church.',
  keywords: ['MOSC Directory', 'Working Committee'],
};

export default function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  return <EntriesListPage directoryType="working-committee" searchParams={searchParams} />;
}

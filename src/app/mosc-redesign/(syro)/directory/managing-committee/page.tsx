import { Metadata } from 'next';
import EntriesListPage from '../entries/EntriesListPage';

export const metadata: Metadata = {
  title: 'The Managing Committee | Directory | Malankara Orthodox Syrian Church',
  description: 'Directory of the Managing Committee of the Malankara Orthodox Syrian Church.',
  keywords: ['MOSC Directory', 'Managing Committee'],
};

export default function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  return <EntriesListPage directoryType="managing-committee" searchParams={searchParams} />;
}

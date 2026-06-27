import { Metadata } from 'next';
import EntriesListPage from '../entries/EntriesListPage';

export const metadata: Metadata = {
  title: 'Spiritual Organisations | Directory | Malankara Orthodox Syrian Church',
  description: 'Directory of spiritual organisations of the Malankara Orthodox Syrian Church.',
  keywords: ['MOSC Directory', 'Spiritual Organisations'],
};

export default function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  return <EntriesListPage directoryType="spiritual-organisations" searchParams={searchParams} />;
}

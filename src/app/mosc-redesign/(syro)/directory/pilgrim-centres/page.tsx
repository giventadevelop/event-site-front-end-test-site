import { Metadata } from 'next';
import EntriesListPage from '../entries/EntriesListPage';

export const metadata: Metadata = {
  title: 'Pilgrim Centres | Directory | Malankara Orthodox Syrian Church',
  description: 'Directory of pilgrim centres of the Malankara Orthodox Syrian Church.',
  keywords: ['MOSC Directory', 'Pilgrim Centres'],
};

export default function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  return <EntriesListPage directoryType="pilgrim-centres" searchParams={searchParams} />;
}

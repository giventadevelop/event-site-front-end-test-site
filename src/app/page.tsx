import type { Metadata } from 'next';
import HomePageClient from './HomePageClient';
import { fetchFeaturedEventsForHomepageServer } from '@/lib/homepage/fetchFeaturedEventsServer';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Upcoming events, tickets, membership, and community updates.',
  keywords: ['home', 'events', 'tickets', 'membership', 'Event Site Manager'],
};

export default async function HomePage() {
  const initialFeaturedEvents = await fetchFeaturedEventsForHomepageServer();
  return <HomePageClient initialFeaturedEvents={initialFeaturedEvents} />;
}

import HomePageClient from './HomePageClient';
import { fetchFeaturedEventsForHomepageServer } from '@/lib/homepage/fetchFeaturedEventsServer';

export default async function HomePage() {
  const initialFeaturedEvents = await fetchFeaturedEventsForHomepageServer();
  return <HomePageClient initialFeaturedEvents={initialFeaturedEvents} />;
}

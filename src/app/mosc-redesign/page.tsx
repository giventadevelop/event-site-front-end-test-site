import type { Metadata } from 'next';
import { getSaintEntriesData } from '@/app/mosc-redesign/(syro)/saints-cms/getSaintEntriesData';
import type { MoscRedesignSaint } from '@/components/mosc-redesign/MoscRedesignSaintsCarousel';
import MoscRedesignHomeClient from './MoscRedesignHomeClient';
import {
  mapSaintEntriesToCarouselSaints,
  pickHomepageCarouselSaintEntries,
} from './mapSaintEntriesToCarouselSaints';
import {
  DEFAULT_CURRENT_CATHOLICOS,
  getCurrentCatholicosData,
} from './getCurrentCatholicosData';
import type { CurrentCatholicosProfile } from './types/currentCatholicos';
import { getDevalokamAramanaLiveOrRecent } from '@/lib/youtube/devalokamAramanaLive';
import type { DevalokamAramanaStream } from '@/lib/youtube/devalokamAramanaLive';

export const metadata: Metadata = {
  title: 'Home',
  description:
    'Official Malankara Orthodox Syrian Church website — news, saints, holy synod, directory, and more.',
  keywords: [
    'Malankara Orthodox Syrian Church',
    'home',
    'MOSC',
    'Orthodox',
    'Saint Thomas',
  ],
};

export const dynamic = 'force-dynamic';

export default async function MoscRedesignHomePage() {
  let saints: MoscRedesignSaint[] = [];
  let currentCatholicos: CurrentCatholicosProfile = DEFAULT_CURRENT_CATHOLICOS;
  let youtubeLive: DevalokamAramanaStream | null = null;

  try {
    const { entries } = await getSaintEntriesData();
    saints = mapSaintEntriesToCarouselSaints(pickHomepageCarouselSaintEntries(entries));
  } catch (error) {
    console.error('[mosc-redesign home] Failed to load saint entries from Strapi:', error);
  }

  try {
    currentCatholicos = await getCurrentCatholicosData();
  } catch (error) {
    console.error('[mosc-redesign home] Failed to load current Catholicos from Strapi:', error);
  }

  try {
    youtubeLive = await getDevalokamAramanaLiveOrRecent();
  } catch (error) {
    console.error('[mosc-redesign home] Failed to load Devalokam Aramana YouTube stream:', error);
  }

  return (
    <MoscRedesignHomeClient
      saints={saints}
      currentCatholicos={currentCatholicos}
      youtubeLive={youtubeLive}
    />
  );
}

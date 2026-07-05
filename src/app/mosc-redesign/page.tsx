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

export const dynamic = 'force-dynamic';

export default async function MoscRedesignHomePage() {
  let saints: MoscRedesignSaint[] = [];
  let currentCatholicos: CurrentCatholicosProfile = DEFAULT_CURRENT_CATHOLICOS;

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

  return (
    <MoscRedesignHomeClient saints={saints} currentCatholicos={currentCatholicos} />
  );
}

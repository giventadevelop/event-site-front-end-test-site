import React from 'react';
import SyroHomeHeroSection from './components/SyroHomeHeroSection';
import SyroBannerShortcuts from './components/SyroBannerShortcuts';
import SyroCircularNotification from './components/SyroCircularNotification';
import SyroAboutSection from './components/SyroAboutSection';
import SyroCatholicosSection from './components/SyroCatholicosSection';
import SyroLiturgySection from './components/SyroLiturgySection';
import SyroLocationsSection from './components/SyroLocationsSection';

export const metadata = {
  title: 'Home',
  description:
    'Malankara Orthodox Syrian Church - Saint Thomas Christian Community. Explore our heritage, spiritual resources, and community.',
};

/**
 * Syro landing: matches static index.html structure and styling.
 * Sections: hero, shortcuts, circular notification, about, saints slider, cardinal, liturgy, locations.
 */
export default function SyroLandingPage() {
  return (
    <div className="flex flex-col flex-1 w-full">
      <SyroHomeHeroSection />
      <SyroBannerShortcuts />
      <SyroCircularNotification />
      <SyroAboutSection />
      <SyroCatholicosSection />
      <SyroLiturgySection />
      <SyroLocationsSection />
    </div>
  );
}

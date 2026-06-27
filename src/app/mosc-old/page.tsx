import React from 'react';
import HeroSection from './components/HeroSection';
import WelcomeSection from './components/WelcomeSection';
import AboutOurChurchSection from './components/AboutOurChurchSection';
import AnnouncementsSection from './components/AnnouncementsSection';
import PrayerTimesSection from './components/PrayerTimesSection';

export const metadata = {
  title: 'Home',
  description: 'Welcome to the Malankara Orthodox Syrian Church - Saint Thomas Christian Community. Explore our rich heritage, spiritual resources, and community services.',
};

export default function MOSCHomePage() {
  return (
    <div className="bg-background">
      {/* Hero Section with Patriarch Info */}
      <HeroSection />

      {/* Welcome Section */}
      <WelcomeSection />

      {/* About Our Church Section */}
      <AboutOurChurchSection />

      {/* Recent Announcements Section */}
      <AnnouncementsSection />

      {/* Daily Prayer Schedule Section */}
      <PrayerTimesSection />
    </div>
  );
}
import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import NavigationBreadcrumb from '../../components/ui/NavigationBreadcrumb';
import HeroSection from './components/HeroSection';
import WelcomeSection from './components/WelcomeSection';
import AboutOurChurchSection from './components/AboutOurChurchSection';
import AnnouncementsSection from './components/AnnouncementsSection';
import QuickLinksSection from './components/QuickLinksSection';
import PrayerTimesSection from './components/PrayerTimesSection';

const Homepage = () => {
  return (
    <>
      <Helmet>
        <title>Malankara Orthodox Syrian Church - Saint Thomas Christian Community</title>
        <meta name="description" content="Welcome to the Malankara Orthodox Syrian Church, tracing our origins to the Apostolic ministry of St. Thomas in India. Join our sacred community rooted in ancient traditions." />
        <meta name="keywords" content="Malankara Orthodox Syrian Church, Saint Thomas Christians, Oriental Orthodox, Kerala Church, Indian Orthodox Church" />
        <meta property="og:title" content="Malankara Orthodox Syrian Church - Saint Thomas Christian Community" />
        <meta property="og:description" content="Experience the rich liturgical traditions and theological heritage of the Oriental Orthodox Church with our vibrant community of believers." />
        <meta property="og:type" content="website" />
        <link rel="canonical" href="/homepage" />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        <NavigationBreadcrumb />

        <main>
          <HeroSection />
          <WelcomeSection />
          <AboutOurChurchSection />
          <AnnouncementsSection />
          <QuickLinksSection />
          <PrayerTimesSection />
        </main>

        <footer className="bg-card border-t border-border py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">✠</span>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-xl text-foreground">
                    Malankara Orthodox Syrian Church
                  </h3>
                  <p className="font-caption text-sm text-muted-foreground">
                    Saint Thomas Christian Community
                  </p>
                </div>
              </div>

              <p className="font-body text-muted-foreground mb-4 max-w-2xl mx-auto">
                Preserving the apostolic tradition established by St. Thomas the Apostle in India,
                serving our community with faith, love, and spiritual guidance.
              </p>

              <div className="border-t border-border pt-6">
                <p className="font-caption text-sm text-muted-foreground">
                  © {new Date()?.getFullYear()} Malankara Orthodox Syrian Church. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Homepage;
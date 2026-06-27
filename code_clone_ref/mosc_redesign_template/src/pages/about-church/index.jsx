import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import NavigationBreadcrumb from '../../components/ui/NavigationBreadcrumb';
import ChurchHistorySection from './components/ChurchHistorySection';
import TheologicalFoundations from './components/TheologicalFoundations';
import OrganizationalStructure from './components/OrganizationalStructure';
import QuickFactsPanel from './components/QuickFactsPanel';
import ImageGallery from './components/ImageGallery';

const AboutChurch = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>About Church - Malankara Orthodox Syrian Church</title>
        <meta name="description" content="Learn about the history, beliefs, and organizational structure of the Malankara Orthodox Syrian Church, founded by St. Thomas the Apostle in 52 AD." />
        <meta name="keywords" content="Malankara Orthodox, Syrian Church, St. Thomas, Oriental Orthodox, Church history, Christian faith" />
      </Helmet>
      <Header />
      <NavigationBreadcrumb />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-heading font-bold text-foreground mb-4">
            About Our Church
          </h1>
          <p className="text-lg font-body text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Discover the rich history, theological foundations, and organizational structure of the 
            Malankara Orthodox Syrian Church, a living testament to nearly two millennia of 
            Christian faith in India.
          </p>
        </div>

        {/* Main Content Layout */}
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-8">
            <ChurchHistorySection />
            <TheologicalFoundations />
            <OrganizationalStructure />
            <ImageGallery />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <QuickFactsPanel />
            </div>
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="mt-16 bg-primary/5 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-heading font-semibold text-foreground mb-4">
            Join Our Community
          </h2>
          <p className="text-muted-foreground font-body mb-6 max-w-2xl mx-auto">
            Experience the rich traditions and warm fellowship of the Malankara Orthodox Syrian Church. 
            Find a parish near you and become part of our global family of faith.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact-and-locations"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-body font-medium hover:bg-primary/90 reverent-transition"
            >
              Find a Parish
            </a>
            <a
              href="/services-and-worship"
              className="inline-flex items-center justify-center px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-body font-medium hover:bg-secondary/90 reverent-transition"
            >
              Worship Services
            </a>
          </div>
        </div>
      </main>
      {/* Footer */}
      <footer className="bg-card border-t border-border mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-sm font-body text-muted-foreground">
              © {new Date()?.getFullYear()} Malankara Orthodox Syrian Church. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutChurch;
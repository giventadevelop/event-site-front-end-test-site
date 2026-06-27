import React from 'react';
import SpiritualOrganizationsContent from './components/SpiritualOrganizationsContent';
import SpiritualOrganizationsSidebar from './components/SpiritualOrganizationsSidebar';

const SpiritualOrganizationsPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background to-muted py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center sacred-shadow">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h1 className="font-heading font-semibold text-3xl lg:text-4xl text-foreground">
                Spiritual Organisations
              </h1>
            </div>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto">
              Discover the various spiritual organizations and ministries within the Malankara Orthodox Syrian Church,
              each dedicated to serving our community and spreading the Gospel through different avenues of ministry.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-3">
              <SpiritualOrganizationsContent />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <SpiritualOrganizationsSidebar />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SpiritualOrganizationsPage;

import React from 'react';
import QuickLinks from '@/components/holy-synod/QuickLinks';
import SpiritualOrganizationsSidebar from '../SpiritualOrganizationsSidebar';

export const metadata = {
  title: 'Malankara Orthodox Baskiyoma Association | MOSC',
  description: 'Malankara Orthodox Baskiyoma Association. President H. G. Dr. Mathews Mar Thimothios Metropolitan. Vice Presidents Fr. Solu Koshy Raju, Smt. Jessy Varghese. Secretary Rachel P Jose.',
};

const MalankaraOrthodoxBaskiyomaAssociationPage = () => {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="Malankara Orthodox Baskiyoma Association">👥</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              Malankara Orthodox Baskiyoma Association
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Office bearers of the Malankara Orthodox Baskiyoma Association.
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-background rounded-lg sacred-shadow p-8">
                {/* Office Bearers */}
                <div className="space-y-6">
                  <h3 className="font-heading font-semibold text-xl text-foreground border-b border-border pb-2">
                    President
                  </h3>
                  <p className="font-body text-muted-foreground">
                    H. G. Dr. Mathews Mar Thimothios Metropolitan
                  </p>

                  <h3 className="font-heading font-semibold text-xl text-foreground border-b border-border pb-2 mt-8">
                    Vice Presidents
                  </h3>
                  <div className="font-body text-muted-foreground space-y-2">
                    <p>Fr. Solu Koshy Raju</p>
                    <p>Smt. Jessy Varghese</p>
                  </div>

                  <h3 className="font-heading font-semibold text-xl text-foreground border-b border-border pb-2 mt-8">
                    Secretary
                  </h3>
                  <p className="font-body text-muted-foreground">
                    Rachel P Jose
                  </p>
                  <p className="font-body text-muted-foreground">
                    Ph: +91 9497675787
                  </p>
                </div>
              </div>
            </div>

            <SpiritualOrganizationsSidebar currentHref="/mosc-old/spiritual-organizations/malankara-orthodox-baskiyoma-association" />
          </div>
        </div>
      </section>

      <QuickLinks />
    </div>
  );
};

export default MalankaraOrthodoxBaskiyomaAssociationPage;
import React from 'react';
import QuickLinks from '@/components/holy-synod/QuickLinks';
import SpiritualOrganizationsSidebar from '../SpiritualOrganizationsSidebar';

export const metadata = {
  title: 'The Servants of the Cross | MOSC',
  description: 'The Servants of the Cross. President H. G. Geevarghese Mar Coorilos Metropolitan. General Secretary Fr. Somu K. Samuel. Office: Carmel Dayara, Kandanad.',
};

const TheServantsOfTheCrossPage = () => {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="The Servants of the Cross">✝️</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              The Servants of the Cross
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Office bearers and contact for The Servants of the Cross.
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
                <div className="space-y-6">
                  <h3 className="font-heading font-semibold text-xl text-foreground border-b border-border pb-2">
                    President
                  </h3>
                  <p className="font-body text-muted-foreground">
                    H. G. Geevarghese Mar Coorilos Metropolitan
                  </p>

                  <h3 className="font-heading font-semibold text-xl text-foreground border-b border-border pb-2 mt-8">
                    General Secretary
                  </h3>
                  <p className="font-body text-muted-foreground">
                    Fr. Somu K. Samuel
                  </p>
                  <p className="font-body text-muted-foreground">
                    Ph: +91 9447933220
                  </p>

                  <h3 className="font-heading font-semibold text-xl text-foreground border-b border-border pb-2 mt-8">
                    Office Address
                  </h3>
                  <p className="font-body text-muted-foreground">
                    Carmel Dayara. Kandanad
                  </p>
                  <p className="font-body text-muted-foreground">
                    Ph: 0484 2792159
                  </p>
                </div>
              </div>
            </div>

            <SpiritualOrganizationsSidebar currentHref="/mosc-old/spiritual-organizations/the-servants-of-the-cross" />
          </div>
        </div>
      </section>

      <QuickLinks />
    </div>
  );
};

export default TheServantsOfTheCrossPage;

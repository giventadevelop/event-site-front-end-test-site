import React from 'react';
import QuickLinks from '@/components/holy-synod/QuickLinks';
import SpiritualOrganizationsSidebar from '../SpiritualOrganizationsSidebar';

export const metadata = {
  title: "St. Paul's & St.Thomas Suvishesha Sangam National Association for Mission Studies | MOSC",
  description: "St. Paul's & St.Thomas Suvishesha Sangam National Association for Mission Studies. President H.G. Dr. Yuhanon Mar Thevodoros Metropolitan. Office: St.Paul's M.T.C, Mavelikara. Ph: 0479 2302473, 2342709.",
};

const StPaulsStThomasSuvisheshaSangamNationalAssociationForMissionStudiesPage = () => {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="St. Paul's & St.Thomas Suvishesha Sangam National Association for Mission Studies">✟</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              St. Paul&apos;s & St.Thomas Suvishesha Sangam National Association for Mission Studies
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              President and office contact for the St. Paul&apos;s & St.Thomas Suvishesha Sangam National Association for Mission Studies.
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
                {/* Office Bearers / Contact */}
                <div className="space-y-6">
                  <h3 className="font-heading font-semibold text-xl text-foreground border-b border-border pb-2">
                    President
                  </h3>
                  <p className="font-body text-muted-foreground">
                    H.G. Dr. Yuhanon Mar Thevodoros Metropolitan
                  </p>

                  <h3 className="font-heading font-semibold text-xl text-foreground border-b border-border pb-2 mt-8">
                    Office Address
                  </h3>
                  <p className="font-body text-muted-foreground">
                    St.Paul&apos;s M.T.C , Mavelikara
                  </p>
                  <p className="font-body text-muted-foreground">
                    Ph: 0479 2302473, 2342709
                  </p>
                  <p className="font-body text-muted-foreground">
                    Email:{' '}
                    <a href="mailto:stpaulsmtc@yahoo.com" className="text-primary hover:underline">
                      stpaulsmtc@yahoo.com
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <SpiritualOrganizationsSidebar currentHref="/mosc-old/spiritual-organizations/st-pauls-st-thomas-suvishesha-sangam-national-association-for-mission-studies" />
          </div>
        </div>
      </section>

      <QuickLinks />
    </div>
  );
};

export default StPaulsStThomasSuvisheshaSangamNationalAssociationForMissionStudiesPage;
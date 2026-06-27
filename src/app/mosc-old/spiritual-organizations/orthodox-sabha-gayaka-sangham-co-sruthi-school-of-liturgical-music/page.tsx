import React from 'react';
import QuickLinks from '@/components/holy-synod/QuickLinks';
import SpiritualOrganizationsSidebar from '../SpiritualOrganizationsSidebar';

export const metadata = {
  title: 'Orthodox Sabha Gayaka Sangham C/o Sruthi School of Liturgical Music | MOSC',
  description: 'Orthodox Sabha Gayaka Sangham C/o Sruthi School of Liturgical Music. Director H. G. Dr. Zacharias Mar Aprem Metropolitan. Contact: sruthischoolofmusic89@rediffmail.com.',
};

const OrthodoxSabhaGayakaSanghamCoSruthiSchoolOfLiturgicalMusicPage = () => {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="Orthodox Sabha Gayaka Sangham C/o Sruthi School of Liturgical Music">🎵</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              Orthodox Sabha Gayaka Sangham C/o Sruthi School of Liturgical Music
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Director and contact for the Orthodox Sabha Gayaka Sangham, Sruthi School of Liturgical Music.
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
                    Director
                  </h3>
                  <p className="font-body text-muted-foreground">
                    H. G. Dr. Zacharias Mar Aprem Metropolitan
                  </p>

                  <h3 className="font-heading font-semibold text-xl text-foreground border-b border-border pb-2 mt-8">
                    Email
                  </h3>
                  <p className="font-body text-muted-foreground">
                    <a href="mailto:sruthischoolofmusic89@rediffmail.com" className="text-primary hover:underline">
                      sruthischoolofmusic89@rediffmail.com
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <SpiritualOrganizationsSidebar currentHref="/mosc-old/spiritual-organizations/orthodox-sabha-gayaka-sangham-co-sruthi-school-of-liturgical-music" />
          </div>
        </div>
      </section>

      <QuickLinks />
    </div>
  );
};

export default OrthodoxSabhaGayakaSanghamCoSruthiSchoolOfLiturgicalMusicPage;
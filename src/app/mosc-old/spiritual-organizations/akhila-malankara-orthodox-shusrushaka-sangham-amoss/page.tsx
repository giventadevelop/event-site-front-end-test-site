import React from 'react';
import QuickLinks from '@/components/holy-synod/QuickLinks';
import SpiritualOrganizationsSidebar from '../SpiritualOrganizationsSidebar';

export const metadata = {
  title: 'Akhila Malankara Orthodox Shusrushaka Sangham (AMOSS) | MOSC',
  description: 'AMOSS gives instructions to altar boys for uniformity in worship, trains attendants in church tradition and ritual. President H. G. Dr. Yuhanon Mar Thevodoros Metropolitan.',
};

const AkhilaMalankaraOrthodoxShusrushakaSanghamAmossPage = () => {
  return (
    <div className="bg-background">
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="AMOSS">⛪</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              Akhila Malankara Orthodox Shusrushaka Sangham (AMOSS)
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              AMOSS is a movement working to give instructions to the altar boys of all parishes in the Malankara Church for uniformity in worship and to serve systematically.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-background rounded-lg sacred-shadow p-8">
                <div className="space-y-6 font-body text-muted-foreground leading-relaxed">
                  <p>
                    AMOSS objectives: (1) To give instructions to the altar boys of all parishes in the Malankara Church to make uniformity in the worship of the church and to serve systematically. (2) To mould people who have God&apos;s grace, dedication, who follow spiritual & sacramental life, and who have worldly experience to reside as servants in the sacramental service of the holy church. (3) To train attendants to practice the holy church&apos;s tradition and ritual service without any alteration and to perform it timely with all its meaning and value and to ordain and make them members of the church&apos;s serving community. The training to these altar boys is given under the supervision of &quot;SRUTI&quot; in the Kottayam Theological Seminary.
                  </p>
                  <p>
                    The activities under AMOSS are: Periodical training programmes at the diocese and zonal levels. Annual conferences aiming in the upliftment and encouragement of youngsters as the altar boys. AMOSS have units in almost all parishes.
                  </p>
                </div>

                <div className="mt-10 space-y-6">
                  <h3 className="font-heading font-semibold text-xl text-foreground border-b border-border pb-2">
                    President
                  </h3>
                  <p className="font-body text-muted-foreground">
                    H. G. Dr. Yuhanon Mar Thevodoros Metropolitan
                  </p>

                  <h3 className="font-heading font-semibold text-xl text-foreground border-b border-border pb-2 mt-8">
                    Vice President
                  </h3>
                  <p className="font-body text-muted-foreground">
                    Fr. Jose Thomas Poovathumkal
                  </p>
                  <p className="font-body text-muted-foreground">
                    Ph: 9447231131
                  </p>

                  <h3 className="font-heading font-semibold text-xl text-foreground border-b border-border pb-2 mt-8">
                    General Secretary
                  </h3>
                  <p className="font-body text-muted-foreground">
                    Biju V. Panthaplave
                  </p>
                  <p className="font-body text-muted-foreground">
                    Ph: 9447558620
                  </p>

                  <h3 className="font-heading font-semibold text-xl text-foreground border-b border-border pb-2 mt-8">
                    Treasurer
                  </h3>
                  <p className="font-body text-muted-foreground">
                    Roy M. Muthoottu
                  </p>
                  <p className="font-body text-muted-foreground">
                    Ph: 9847032251
                  </p>
                </div>
              </div>
            </div>

            <SpiritualOrganizationsSidebar currentHref="/mosc-old/spiritual-organizations/akhila-malankara-orthodox-shusrushaka-sangham-amoss" />
          </div>
        </div>
      </section>

      <QuickLinks />
    </div>
  );
};

export default AkhilaMalankaraOrthodoxShusrushakaSanghamAmossPage;

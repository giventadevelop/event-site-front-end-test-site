import React from 'react';
import QuickLinks from '@/components/holy-synod/QuickLinks';
import SpiritualOrganizationsSidebar from '../SpiritualOrganizationsSidebar';

export const metadata = {
  title: 'Akhila Malankara Prayer Group Association | MOSC',
  description: 'The Akhila Malankara Prayer Group Association monitors and streamlines prayer and reading habits in prayer groups across parishes. President H.G Abraham Mar Ephiphanios Metropolitan.',
};

const AkhilaMalankaraPrayerGroupAssociationPage = () => {
  return (
    <div className="bg-background">
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="Akhila Malankara Prayer Group Association">🙏</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              Akhila Malankara Prayer Group Association
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The Akhila Malankara Prayer Group Association has been constituted to monitor and streamline the prayer and reading habits of congregations in different prayer groups functioning in the various parishes under the Malankara Syrian Orthodox Christian Church.
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
                    The objective of this group is to ascertain the inculcation of firm faith, love of the church and brotherhood and bring about the spiritual, material and educational upliftment of the people. A unit consists of 20-30 heads of families and grown-up men. However, the women and children of these families can participate in these meetings. Once in a week (preferably Sunday) the prayer meetings are conducted at a convenient time in different houses or in a common place of convenience.
                  </p>
                  <p>
                    Each unit has the vicar of the parish as the president and should have a secretary who should maintain the credit and debit account as well as the report. Once in three months, a common meeting as per the directions of the Vicar is to be convened with a general Secretary to oversee the conduct of the meeting.
                  </p>
                </div>

                <div className="mt-10 space-y-6">
                  <h3 className="font-heading font-semibold text-xl text-foreground border-b border-border pb-2">
                    President
                  </h3>
                  <p className="font-body text-muted-foreground">
                    H.G Abraham Mar Ephiphanios Metropolitan
                  </p>

                  <h3 className="font-heading font-semibold text-xl text-foreground border-b border-border pb-2 mt-8">
                    Vice President
                  </h3>
                  <p className="font-body text-muted-foreground">
                    Fr. Johnson Kallittathil
                  </p>
                  <p className="font-body text-muted-foreground">
                    Ph: 9447463066
                  </p>

                  <h3 className="font-heading font-semibold text-xl text-foreground border-b border-border pb-2 mt-8">
                    General Secretary
                  </h3>
                  <p className="font-body text-muted-foreground">
                    Fr. Geevarghese John
                  </p>
                  <p className="font-body text-muted-foreground">
                    Ph: 9447211799
                  </p>
                </div>
              </div>
            </div>

            <SpiritualOrganizationsSidebar currentHref="/mosc-old/spiritual-organizations/akhila-malankara-prayer-group-association" />
          </div>
        </div>
      </section>

      <QuickLinks />
    </div>
  );
};

export default AkhilaMalankaraPrayerGroupAssociationPage;

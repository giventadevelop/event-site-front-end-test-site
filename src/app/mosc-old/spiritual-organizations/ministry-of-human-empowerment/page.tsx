import React from 'react';
import QuickLinks from '@/components/holy-synod/QuickLinks';
import SpiritualOrganizationsSidebar from '../SpiritualOrganizationsSidebar';

export const metadata = {
  title: 'Ministry of Human Empowerment | MOSC',
  description: 'MOHE is a Department of Malankara Orthodox Syrian Church. It aims to explore, enlighten and empower human potential through awareness campaigns. Main thrust: Family Empowerment.',
};

const MinistryOfHumanEmpowermentPage = () => {
  return (
    <div className="bg-background">
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="Ministry of Human Empowerment">💪</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              Ministry of Human Empowerment
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              MOHE is a Department of Malankara Orthodox Syrian Church. It aims to explore, enlighten and empower the human potential of the society through various awareness campaigns. The main thrust of this Ministry is Family Empowerment.
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
                    In an era of privatization, globalization and urbanization, the lifestyle of human kind has changed tremendously. Technology has made the geography a history. This incredible progress of the society has not just pumped in the comfort and luxury and made mankind techno savvy but ipso facto to all revolving evil in the universe. The de facto of today&apos;s degrading human standard is due to the erosion of values, disintegration of families, drug addiction, gay and lesbian issues, Satan worship etc. In order to improve the life style, modus operandi of living need to be rectified with deep rooted Christian values, moral policing, righteous and fruitful life. The Ministry of Human Empowerment (MOHE) through its various projects endeavors to empower and enrich our families. The MOHE is neither a governmental organization nor religious group, spiritual organization /association but a distinct department of Malankara Orthodox Church.
                  </p>
                  <h3 className="font-heading font-semibold text-xl text-foreground border-b border-border pb-2 mt-8">
                    Family Empowerment and Welfare Programme
                  </h3>
                  <p>
                    Family plays a vital role in building up human resources in the society. Family ambience tends to mould and nurture an individual&apos;s character consisting of good moral values, habits and sensitivity towards societal issues. The focal point of the MOHE is to evaluate, guide and enhance family values. The Ministry aims to cater the needs of various segments of the family like children, youth, senior citizens, couples and women as they together contribute to the harmonious existence of church and society. Looking at the contemporary problems, the Church feels to create a department which caters holistically the ebb and flows of society. Through awareness campaigns , workshop, talks and seminars the Ministry looks forward to modulate and fixate the individual&apos;s psychological, physiological and spiritually issues.
                  </p>
                </div>

                <div className="mt-10 space-y-6">
                  <h3 className="font-heading font-semibold text-xl text-foreground border-b border-border pb-2">
                    President
                  </h3>
                  <p className="font-body text-muted-foreground">
                    H. G. Geevarghese Mar Coorilos Metropolitan
                  </p>

                  <h3 className="font-heading font-semibold text-xl text-foreground border-b border-border pb-2 mt-8">
                    Director
                  </h3>
                  <p className="font-body text-muted-foreground">
                    Fr. P. A. Philip
                  </p>
                  <p className="font-body text-muted-foreground">
                    Ph: +91 9496155461
                  </p>

                  <h3 className="font-heading font-semibold text-xl text-foreground border-b border-border pb-2 mt-8">
                    Contact Us
                  </h3>
                  <p className="font-body text-muted-foreground">
                    The Ministry of Human Empowerment<br />
                    Catholicate Palace, Devalokam P.O,<br />
                    Kottayam, Kerala- 686004
                  </p>
                  <p className="font-body text-muted-foreground">
                    Phone: 0481-2572800, 0481-2578500, 2578499<br />
                    Mobile: +91 9496155461
                  </p>
                  <p className="font-body text-muted-foreground">
                    Email:{' '}
                    <a href="mailto:hrm@mosc.in" className="text-primary hover:underline">
                      hrm@mosc.in
                    </a>
                  </p>
                  <p className="font-body text-muted-foreground">
                    Website:{' '}
                    <a href="https://hrm.mosc.in" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      hrm.mosc.in
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <SpiritualOrganizationsSidebar currentHref="/mosc-old/spiritual-organizations/ministry-of-human-empowerment" />
          </div>
        </div>
      </section>

      <QuickLinks />
    </div>
  );
};

export default MinistryOfHumanEmpowermentPage;

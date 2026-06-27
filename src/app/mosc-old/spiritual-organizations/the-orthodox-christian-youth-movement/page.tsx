import React from 'react';
import QuickLinks from '@/components/holy-synod/QuickLinks';
import SpiritualOrganizationsSidebar from '../SpiritualOrganizationsSidebar';

export const metadata = {
  title: 'The Orthodox Christian Youth Movement | MOSC',
  description: 'OCYM is the Youth-wing of the Malankara Orthodox Syrian Church. President H. G. Dr. Geevarghese Mar Yulios Metropolitan. Central Office: St. Thomas Bhavan, Kottayam.',
};

const TheOrthodoxChristianYouthMovementPage = () => {
  return (
    <div className="bg-background">
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="OCYM">🌟</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              The Orthodox Christian Youth Movement
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The Orthodox Christian Youth Movement (OCYM), the Youth-wing of the Malankara Orthodox Syrian Church, contributes to the Church and community in the three-fold path of worship, study and service. It aims at molding the minds and visions of the youth against the background of the contemporary issues.
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
                    A spiritual organisation with the name Yuvajana Sangam was working effectively in various places and parishes. It was in 1933 that the attempts to bring together the local youth fellowships and to start a Parish–Centered Syrian Yuvajana Sangam was materialized with the active leadership of Joseph Mar Severios Valakuzhyil Episcopa (President) and Rev Fr TS Abraham (Secretary). The historic conference in 1936 held at Mavelikara broadened the vision and the Sangam was established as the official wing of the Church. The year 1958 was decisive when the annual conference held in Puthupally officially accepted the title &quot;The Orthodox Christian Youth Movement&quot; and initiatives were taken to start a monthly publication (now Orthodox Yuvajanam).
                  </p>
                </div>

                <div className="mt-10 space-y-6">
                  <h3 className="font-heading font-semibold text-xl text-foreground border-b border-border pb-2">
                    Leadership
                  </h3>
                  <p className="font-body text-muted-foreground">
                    <strong className="text-foreground">President:</strong> H. G. Dr. Geevarghese Mar Yulios Metropolitan
                  </p>
                  <p className="font-body text-muted-foreground">
                    <strong className="text-foreground">Vice President:</strong> Fr. Shiji Koshy, Ph: +91 9496466192
                  </p>
                  <p className="font-body text-muted-foreground">
                    <strong className="text-foreground">General Secretary:</strong> Fr. Viju Elias, Ph: 91 94475 07880
                  </p>
                  <p className="font-body text-muted-foreground">
                    <strong className="text-foreground">Treasurer:</strong> Sri. Pearl Kanneth, Ph: +91 99462 91947
                  </p>

                  <h3 className="font-heading font-semibold text-xl text-foreground border-b border-border pb-2 mt-8">
                    Central Office
                  </h3>
                  <p className="font-body text-muted-foreground">
                    Orthodox Christian Youth Movement of the East<br />
                    St. Thomas Bhavan, Orthodox Youth Centre,<br />
                    Old Seminary Road, Chungam, Kottayam, Kerala, India 689 001
                  </p>
                  <p className="font-body text-muted-foreground">
                    Contact Number: 0481 – 2583997
                  </p>
                  <p className="font-body text-muted-foreground">
                    Email:{' '}
                    <a href="mailto:indianocym@gmail.com" className="text-primary hover:underline">
                      indianocym@gmail.com
                    </a>
                  </p>
                  <p className="font-body text-muted-foreground">
                    Website:{' '}
                    <a href="https://www.ocymonline.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      www.ocymonline.org
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <SpiritualOrganizationsSidebar currentHref="/mosc-old/spiritual-organizations/the-orthodox-christian-youth-movement" />
          </div>
        </div>
      </section>

      <QuickLinks />
    </div>
  );
};

export default TheOrthodoxChristianYouthMovementPage;

import React from 'react';
import QuickLinks from '@/components/holy-synod/QuickLinks';
import SpiritualOrganizationsSidebar from '../SpiritualOrganizationsSidebar';

export const metadata = {
  title: 'Mar Gregorios Orthodox Christian Student Movement (MGOCSM) | MOSC',
  description: 'MGOCSM is the student wing of the Malankara Orthodox Syrian Church. Founded 1907. President H. G. Dr. Abraham Mar Seraphim Metropolitan. General Secretary Fr. Dr. Vivek Varughese.',
};

const MarGregoriosOrthodoxChristianStudentMovementMgocsmPage = () => {
  return (
    <div className="bg-background">
      <section className="py-16 bg-gradient-to-br from-background to-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary rounded-lg flex items-center justify-center mx-auto mb-6 sacred-shadow-lg">
              <span className="text-primary-foreground text-4xl font-bold" role="img" aria-label="MGOCSM">🎓</span>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              Mar Gregorios Orthodox Christian Student Movement (MGOCSM)
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              MGOCSM is the student wing of the Malankara Orthodox Syrian Church. The Syrian Student Conference was founded in 1907; the first conference was convened on January 1st, 1908 at Tiruvalla. It assumed its present name MGOCSM in 1960. Ours is the oldest Christian student organization in India. Motto: Worship – Service – Study.
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
                    MGOCSM have been maintaining inter-disciplinary contacts in the academic field by the formation of its wings: college student&apos;s wing, high school student&apos;s wing, University teacher&apos;s association, School teacher&apos;s association, Medical Auxiliary, Technical Auxiliary, Missionary forum, Literary forum, Publication wing, etc. Student centers at Kottayam, Trivandrum, and other locations provide hostel facilities, chapel, auditorium, reading room and guest rooms. MGOCSM Book shop and publishing house at Kottayam continues to function purposefully. The movement has prepared and provided able and outstanding leaders for the Church from time to time.
                  </p>
                </div>

                <div className="mt-10 space-y-6">
                  <h3 className="font-heading font-semibold text-xl text-foreground border-b border-border pb-2">
                    President
                  </h3>
                  <p className="font-body text-muted-foreground">
                    H. G. Dr. Abraham Mar Seraphim Metropolitan
                  </p>

                  <h3 className="font-heading font-semibold text-xl text-foreground border-b border-border pb-2 mt-8">
                    Executive Vice President
                  </h3>
                  <p className="font-body text-muted-foreground">
                    H. G. Dr. Zacharias Mar Aprem Metropolitan
                  </p>

                  <h3 className="font-heading font-semibold text-xl text-foreground border-b border-border pb-2 mt-8">
                    General Secretary
                  </h3>
                  <p className="font-body text-muted-foreground">
                    Fr. Dr. Vivek Varughese
                  </p>
                  <p className="font-body text-muted-foreground">
                    Ph: +91 8547783374
                  </p>

                  <h3 className="font-heading font-semibold text-xl text-foreground border-b border-border pb-2 mt-8">
                    Contact Address
                  </h3>
                  <p className="font-body text-muted-foreground">
                    MGOCSM Student Centre, College Road, Kottayam, Kerala- 686 001
                  </p>
                  <p className="font-body text-muted-foreground">
                    Ph: 0481 2567338
                  </p>
                  <p className="font-body text-muted-foreground">
                    Website:{' '}
                    <a href="https://www.mgocsmmosc.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      www.mgocsmmosc.com
                    </a>
                  </p>
                  <p className="font-body text-muted-foreground">
                    Email:{' '}
                    <a href="mailto:mgocsmoffice@yahoo.com" className="text-primary hover:underline">
                      mgocsmoffice@yahoo.com
                    </a>
                  </p>
                </div>
              </div>
            </div>

            <SpiritualOrganizationsSidebar currentHref="/mosc-old/spiritual-organizations/mar-gregorios-orthodox-christian-student-movement-mgocsm" />
          </div>
        </div>
      </section>

      <QuickLinks />
    </div>
  );
};

export default MarGregoriosOrthodoxChristianStudentMovementMgocsmPage;

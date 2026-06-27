import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '@/components/holy-synod/SynodMembersSidebar';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'H.G. Dr. Yakoob Mar Irenaios Metropolitan',
  description: 'Biography and information about H.G. Dr. Yakoob Mar Irenaios Metropolitan.',
};

const HisGraceJacobMarIreniosPage = () => {
  return (
    <div className="bg-background">
      {/* Main Content */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-background rounded-lg sacred-shadow p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Featured Portrait - Left Side - Large Display */}
                  <div className="flex-shrink-0 flex justify-center md:justify-start">
                    <div className="relative w-72 h-[28rem] md:w-80 md:h-[32rem] lg:w-96 lg:h-[36rem] rounded-lg overflow-hidden sacred-shadow-lg">
                      <Image
                        src="/images/holy-synod/irne.jpg"
                        alt="H.G. Dr. Yakoob Mar Irenaios Metropolitan"
                        fill
                        sizes="(max-width: 768px) 288px, (max-width: 1024px) 320px, 384px"
                        className="object-cover object-top"
                        style={{
                          objectPosition: 'center 15%'
                        }}
                        priority
                      />
                    </div>
                  </div>

                  {/* Content - Right Side of Image */}
                  <div className="flex-1">
                    <h3 className="font-heading font-semibold text-2xl text-foreground mb-6">
                      H.G. Dr. Yakoob Mar Irenaios Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        His Grace was born on 15 August 1949 to Mr T. O Cherian Mrs Kunjelyamma Cherian of Aruvidan Pallikal Family, Kallupara. He did his high-schooling at MGD High School, Puthussery and pre-degree course at Chengannur Christian College. He had his bachelors and masters in English literature from Madras University. Thereupon, he did his BEd and MEd from Kerala University. He took an additional MA in philosophy from Kerala University and then did his PhD. Coming to the theological front, His Grace did his BD degree from Serampore University and D Th from St Peter’s Pontifical Institute Bangalore, MTh from the US. He was ordained a deacon in 1970 by late His Grace Thoma Mar Dionysius and a priest in 1975 by H.H. Baselios Marthoma Didymos I. He became a Ramban on 19 December 1992. On 16 August 1993, HH Baselios Mar Thoma Mathews II consecrated him as Episcopa and named as Jacob Mar Irenios. In August 1995, he was given charge of the Malabar Diocese as the Assistant Metropolitan. When Zacharia Mar Dionysius departed for the eternal life, His Grace was given the charge of Madras Diocese. His Grace has served the church in different capacities as President, Orthodox Youth Movement, President Orthodox Sunday School Association, President Orthodox Bala Samajam, President MOC publications, President Divya Bodhanam, Manager MOC Colleges. His Grace is presently given the charge of Kochi Diocese.
                      </p>

                      <div className="mt-6 pt-6 border-t border-border">
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Address: Zion Seminary, Koratty East P.O. 680 308, Chalakkudy.
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Tel. 0480-2734818,
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Mob: 9495703344
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Email: marirenaios@yahoo.co.in drmarirenaios@gmail.com
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links - Horizontal Below Main Content (desktop only in column) */}
              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <SynodMembersSidebar />
            </div>
          </div>
          {/* Quick Links - mobile only: just above footer */}
          <div className="mt-8 lg:hidden">
            <QuickLinks />
          </div>
        </div>
      </section>
    </div>
  );
};

export default HisGraceJacobMarIreniosPage;

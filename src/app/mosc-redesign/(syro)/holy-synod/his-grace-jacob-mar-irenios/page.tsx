import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '../../components/SynodMembersSidebar';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'H.G. Dr. Yakoob Mar Irenaios Metropolitan',
  description: 'His Grace Dr. Yakoob Mar Irenaios (Jacob Mar Irenios), Metropolitan of Kochi Diocese. Former President of Orthodox Youth Movement, Sunday School Association, and MOC publications.',
};

const HisGraceJacobMarIreniosPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="H.G. Dr. Yakoob Mar Irenaios Metropolitan"
        breadcrumbFrom="holy-synod"
      />
      {/* Main Content */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                {/* Featured Image - Top */}
                <div className="mb-8 flex justify-center">
                  <Image src="/images/holy-synod/irne.jpg" alt="H.G. Dr. Yakoob Mar Irenaios Metropolitan" width={125} height={75} className="rounded-lg w-full max-w-[125px] h-auto object-contain" priority />
                  </div>

                {/* Content - Below Image */}
                <div>
                    <h3 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                      H.G. Dr. Yakoob Mar Irenaios Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        His Grace was born on 15 August 1949 to Mr T. O Cherian and Mrs Kunjelyamma Cherian of Aruvidan Pallikal Family, Kallupara. He did his high-schooling at MGD High School, Puthussery and pre-degree course at Chengannur Christian College. He had his bachelors and masters in English literature from Madras University. Thereupon, he did his BEd and MEd from Kerala University. He took an additional MA in philosophy from Kerala University and then did his PhD. Coming to the theological front, His Grace did his BD degree from Serampore University and D Th from St Peter’s Pontifical Institute Bangalore, MTh from the US. He was ordained a deacon in 1970 by late His Grace Thoma Mar Dionysius and a priest in 1975 by H.H. Baselios Marthoma Didymos I. He became a Ramban on 19 December 1992. On 16 August 1993, HH Baselios Mar Thoma Mathews II consecrated him as Episcopa and named as Jacob Mar Irenios. In August 1995, he was given charge of the Malabar Diocese as the Assistant Metropolitan. When Zacharia Mar Dionysius departed for the eternal life, His Grace was given the charge of Madras Diocese. His Grace has served the church in different capacities as President, Orthodox Youth Movement, President Orthodox Sunday School Association, President Orthodox Bala Samajam, President MOC publications, President Divya Bodhanam, Manager MOC Colleges. His Grace is presently given the charge of Kochi Diocese.
                      </p>

                      <h4 className="font-syro-display font-semibold text-lg text-syro-blue mt-8 mb-3">
                        Contact
                      </h4>
                      <div className="font-syro-primary text-syro-dark-gray leading-relaxed space-y-1">
                        <p>Zion Seminary, Koratty East P.O. 680 308, Chalakkudy</p>
                        <p>Tel.: 0480-2734818 | Mob: 9495703344</p>
                        <p>
                        Email:{' '}
                        <a
                          href="mailto:marirenaios@yahoo.co.in"
                          className="text-syro-blue hover:underline focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2 rounded"
                        >
                          marirenaios@yahoo.co.in
                        </a>
                        {' / '}
                        <a
                          href="mailto:drmarirenaios@gmail.com"
                          className="text-syro-blue hover:underline focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2 rounded"
                        >
                          drmarirenaios@gmail.com
                        </a>
                      </p>
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
            <div className="space-y-6 lg:col-span-1">
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

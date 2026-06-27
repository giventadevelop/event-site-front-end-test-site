import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '../../components/SynodMembersSidebar';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'H.G. Geevarghese Mar Coorilos Metropolitan',
  description: 'His Grace Geevarghese Mar Coorilos Metropolitan, Assistant Metropolitan of Mumbai Diocese. Former MGOCSM general secretary.',
};

const HisGraceGeevargheseMarCooriloseMetropolitanPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="H.G. Geevarghese Mar Coorilos Metropolitan"
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
                  <Image src="/images/holy-synod/coor.jpg" alt="H.G. Geevarghese Mar Coorilos Metropolitan" width={125} height={75} className="rounded-lg w-full max-w-[125px] h-auto object-contain" priority />
                  </div>

                {/* Content - Below Image */}
                <div>
                    <h3 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                      H.G. Geevarghese Mar Coorilos Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        His Grace was born on 7 October 1949 at Kollad, near Kottayam, to Mr PK Kurian and Mrs Mary Kurian of the Puliyeril family. After his schooling, young George had his pre-degree studies at CMS College Kottayam. He took his bachelors in arts from the Calicut University and MA from Sree Venkateshwara University. He did his BD from Orthodox Theological Seminary, Kottayam, and got post-graduate diploma in Pastoral Theology from Heythrop College London University and post-graduate diploma in Theology and Mission from Urban Theology Unit, Sheffield, UK.
                      </p>

                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        He was ordained a sub-deacon in 1970 and a deacon in 1974 by Catholicos HH Baselios Mathews I. Dn George became a priest in 1975 and served as Vicar, St Gregorios Church, London. He is known for his works among students and thus was serving the MGOCSM as general secretary for almost a decade. This paved way for Fr George to visit many foreign countries.
                      </p>

                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        He was elected to the Episcopal rank in 1989 and thus became a monk in 1990 and was subsequently ordained in 1991. Soon, he was appointed as the Assistant Metropolitan, Mumbai Diocese, and worked steadfast with late Dr Philipose Mar Theophilus for the progress of the Mumbai Diocese.
                      </p>

                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        His Grace has held many positions in the church and other Christian societies. He had attended many international conferences and interacted with many communities such as NCCI, CASA, WCC, and CMAI.
                      </p>

                      <h4 className="font-syro-display font-semibold text-lg text-syro-blue mt-8 mb-3">
                        Contact
                      </h4>
                      <div className="font-syro-primary text-syro-dark-gray leading-relaxed space-y-1">
                        <p>Bombay Orthodox Church Centre, Dr. Mar Theophilus Marg, Sector X-A, Vashi, Juhu Nagar, Navi Mumbai – 400 703</p>
                        <p>Tel.: 022-27669850, 022-27801427 | Mob: 09820333379</p>
                        <p>
                        E-mail:{' '}
                        <a
                          href="mailto:orthodox77@hotmail.com"
                          className="text-syro-blue hover:underline focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2 rounded"
                        >
                          orthodox77@hotmail.com
                        </a>
                        {', '}
                        <a
                          href="mailto:marcoorilos@yahoo.com"
                          className="text-syro-blue hover:underline focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2 rounded"
                        >
                          marcoorilos@yahoo.com
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

export default HisGraceGeevargheseMarCooriloseMetropolitanPage;

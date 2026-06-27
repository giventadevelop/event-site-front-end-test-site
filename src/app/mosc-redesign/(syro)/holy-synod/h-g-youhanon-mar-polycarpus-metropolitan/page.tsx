import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '../../components/SynodMembersSidebar';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'H.G. Yuhanon Mar Policarpos Metropolitan',
  description: 'His Grace Yuhanon Mar Policarpos, Metropolitan of Ankamaly Diocese. Founder and Principal of Baselius Vidya Nikethan; former Parumala Seminary Manager.',
};

const HGYouhanonMarPolycarpusMetropolitanPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="H.G. Yuhanon Mar Policarpos Metropolitan"
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
                  <Image src="/images/holy-synod/poly.jpg" alt="H.G. Yuhanon Mar Policarpos Metropolitan" width={125} height={75} className="rounded-lg w-full max-w-[125px] h-auto object-contain" priority />
                  </div>

                {/* Content - Below Image */}
                <div>
                    <h3 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                      H.G. Yuhanon Mar Policarpos Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        His Grace was born on 30th March 1955 as the son of Mr P.V. Zachariah and Mrs Annamma Zachariah of Panniyankara Parakunnil family in Vadakkanchery, Palakkad. His Grace is a member of Mar Gregorios Church, Thenidukku. His Grace had his schooling in Abhayakkad Chami Iyer High School, and graduated from S.N. College Alathoor. His Grace took his Masters degree in Sociology from the University of Kerala. His Grace learned Syriac from Very Rev. Thomas Ramban during the period 1973–1974. His Grace passed G.S.T in 1978 and B.D. in 1979 from the Orthodox Theological Seminary. His Grace was ordained sub-deacon on 25th March 1977, deacon on 8th December and priest on 7th January 1980. His Grace was ordained as Ramban by His Holiness Baselios Marthoma Didymos I Catholicos. His Grace received a diploma in 1990 from Geneva.
                      </p>

                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        His Grace served the church in several capacities – Sunday School Director, Cochin Diocese; Koratty Sion Seminary Manager, Parumala Seminary Manager, C.M.I Kerala Region Chaplain, Vettikal Health Centre Director, Thalakkod St Mary’s Boy’s Home Director & Board Member, Kolenchery Medical College Chaplain and Governing Body Member, Founder and Principal of Baselius Vidya Nikethan till 2006. He is serving the Ankamaly Diocese as its Metropolitan.
                      </p>

                      <h4 className="font-syro-display font-semibold text-lg text-syro-blue mt-8 mb-3">
                        Contact
                      </h4>
                      <div className="font-syro-primary text-syro-dark-gray leading-relaxed space-y-1">
                        <p>Thrikkunnathu Seminary PB No. 61, Aluva – 683 101</p>
                        <p>Ph: 0484 2622339 | Mob: 94474 75544</p>
                        <p>
                        Email:{' '}
                        <a
                          href="mailto:marpolicarpos@yahoo.com"
                          className="text-syro-blue hover:underline focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2 rounded"
                        >
                          marpolicarpos@yahoo.com
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

export default HGYouhanonMarPolycarpusMetropolitanPage;

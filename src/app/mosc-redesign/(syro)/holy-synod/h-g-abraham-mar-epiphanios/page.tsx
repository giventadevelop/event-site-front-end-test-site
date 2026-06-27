import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '../../components/SynodMembersSidebar';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'H. G. Abraham Mar Epiphanios Metropolitan',
  description: 'His Grace Abraham Mar Epiphanios, Metropolitan of Mavelikara Diocese. Former Manager of Parumala Seminary and Devalokam Catholicate Aramana; Vicar of St Thomas Cathedral.',
};

const HGAbrahamMarEpiphaniosPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="H. G. Abraham Mar Epiphanios Metropolitan"
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
                  <Image src="/images/holy-synod/mar-ephipanios.jpg" alt="H. G. Abraham Mar Epiphanios Metropolitan" width={125} height={75} className="rounded-lg w-full max-w-[125px] h-auto object-contain" priority />
                  </div>

                {/* Content - Below Image */}
                <div>
                    <h3 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                      H. G. Abraham Mar Epiphanios Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        His Grace was born on 17th September 1960 as the son of Mr V.A. Oommen and Mrs Gracy Oommen. His Grace is a member of St Mary’s Cathedral, Malaysia. His Grace had his education in Pathanamthitta Catholicate School and College and the Orthodox Theological Seminary, and holds his M.Th. degree from Serampore University. His Grace was ordained as deacon and priest in 1986 and 1987 respectively; on 31st March 2002 His Grace became Ramban. His Grace has spent a long time in the Ashrams in Parumala and Madras from 1990 to 1996. His Grace served as Vicar of St Thomas Cathedral from 1996 to 2002. Thereafter His Grace served as the Manager of Bishop’s House, Madras in 2003. From 2004–2006 His Grace served as the Manager at Parumala Seminary and Devalokam Catholicate Aramana.
                      </p>

                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        His Grace is serving the Mavelikara Diocese as its Metropolitan.
                      </p>

                      <h4 className="font-syro-display font-semibold text-lg text-syro-blue mt-8 mb-3">
                        Contact
                      </h4>
                      <div className="font-syro-primary text-syro-dark-gray leading-relaxed space-y-1">
                        <p>Theobhavan Aramana, Thazhakara – Post, Mavelikara, Kerala – 690 102</p>
                        <p>Mob: 9447908814</p>
                        <p>
                        Email:{' '}
                        <a
                          href="mailto:marepiphanios@gmail.com"
                          className="text-syro-blue hover:underline focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2 rounded"
                        >
                          marepiphanios@gmail.com
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

export default HGAbrahamMarEpiphaniosPage;

import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '../../components/SynodMembersSidebar';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'H.G. Geevarghese Mar Philoxenos Metropolitan',
  description: 'His Grace Geevarghese Mar Philoxenos, Metropolitan of Madras diocese. PhD Brisbane College of Theology; ordained Metropolitan 2022.',
};

const HGGeevargheseMarPhilaxenosMetropolitanPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="H.G. Geevarghese Mar Philoxenos Metropolitan"
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
                  <Image src="/images/holy-synod/Geevarghese-Mar-Philaxenos.png" alt="H.G. Geevarghese Mar Philoxenos Metropolitan" width={125} height={75} className="rounded-lg w-full max-w-[125px] h-auto object-contain" priority />
                  </div>

                {/* Content - Below Image */}
                <div>
                    <h3 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                      H.G. Geevarghese Mar Philoxenos Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        H. G. Geevarghese Mar Philoxenos Metropolitan was born in Maleth house, Arattupuzha as the son of Mr. M. G. George and Mrs. Accamma on 30 May 1972. His Grace belongs to the parish of St. Mary’s Church, Arattupuzha under Chengannur diocese. His Grace completed his primary education from Metropolitan High School, Puthenkavu (1987), following which he completed Pre-Degree (1989) from Christian College, Chengannur. Completed degree in Economics (1991-94) from Catholicate college, Pathanamthitta, and Postgraduation in Economics (1994-96) from Institute of Economics, Thiruvalla, he joined Old Seminary, Kottayam and completed GST and BD (1996-2000). Later, he took his PhD from Brisbane College of Theology (2011-13). He was ordained sub-deaconship in 1999, by H.G. Dr. Yacob Mar Irenios Metropolitan at St. Mary’s Church, Arattupuzha. He was ordained deaconship (2000), and priesthood on 17 May 2000 at Mount Tabor Dayara, Pathanapuram. He was chosen as a Metropolitan in the Malankara Syrian Christian Association held on 25 February 2022 at Kolencherry. He received the status of Ramban on 2 June 2022 at the Parumala Seminary. He was ordained as a Metropolitan by the name ‘Mar Philoxenos’ by H.H. Baselios Mar Thoma Mathews III Catholicos on 28 July 2022 at St. Mary’s Cathedral, Pazhanji. H.G. has taken charge of Madras diocese as Metropolitan since 3 November 2022.
                      </p>

                      <h4 className="font-syro-display font-semibold text-lg text-syro-blue mt-8 mb-3">
                        Contact
                      </h4>
                      <div className="font-syro-primary text-syro-dark-gray leading-relaxed space-y-1">
                        <p>Bishop&apos;s House, 4/51 Rajeswari Street, Mehta Nagar, Chennai – 600029</p>
                        <p>Mobile: +91 7025168747</p>
                        <p>
                        Email:{' '}
                        <a
                          href="mailto:madrasorthodoxdiocese@gmail.com"
                          className="text-syro-blue hover:underline focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2 rounded"
                        >
                          madrasorthodoxdiocese@gmail.com
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

export default HGGeevargheseMarPhilaxenosMetropolitanPage;

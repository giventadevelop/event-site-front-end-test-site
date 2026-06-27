import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '../../components/SynodMembersSidebar';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'H.G. Abraham Mar Stephanos Metropolitan',
  description: "His Grace Abraham Mar Stephanos, Metropolitan of UK, Europe, and Africa dioceses. M.Th. (FFRRC), MA Late Antiquity and Byzantine Studies, King's College London; ordained Metropolitan 2022.",
};

const HGAbrahamMarStephanosMetropolitanPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="H.G. Abraham Mar Stephanos Metropolitan"
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
                  <Image src="/images/holy-synod/Abraham-Mar-Stephanos.png" alt="H.G. Abraham Mar Stephanos Metropolitan" width={125} height={75} className="rounded-lg w-full max-w-[125px] h-auto object-contain" priority />
                  </div>

                {/* Content - Below Image */}
                <div>
                    <h3 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                      H.G. Abraham Mar Stephanos Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        Born to Late Mr. K. A. Thomas and Mrs. Annamma, Kadakkamannil House, Mylapra in Pathanamthitta on June 11, His Grace belongs to the parish of St. George Orthodox Church (Valiyapalli), Mylapra under Thumpamon diocese. His Grace completed his primary education from Seventh Day Adventist School, Pathanamthitta (1974-78), and Marthoma High School (1978-84), following which he completed Pre-Degree course (1984-86) as well as degree in Mathematics (1986-89) from Catholicate College, Pathanamthitta. He joined Kottayam Old Seminary (1995-99) and completed BD as well as GST. He also completed M.Th (2000-02) from FFRRC, and MA in Late Antiquity and Byzantine Studies from King&apos;s College, London. He was ordained sub-deaconship (1998) by H.G. Kuriakose Mar Clemis Metropolitan at Mar Basil Dayara, Pathanamthitta. Further, he was ordained deaconship (1999) by H.H. Baselios Mar Thoma Mathews II Catholicos at St. Thomas chapel in Old Seminary, Kottayam, and priesthood on 8 April 2000 by H.G. Kuriakose Mar Clemis Metropolitan at St. George Orthodox Church, Mylapra. He was chosen as Metropolitan in the Malankara Syrian Christian Association held at Kolencherry on 25 February 2022. He received the status of Ramban at the Parumala Seminary on 2 June 2022. He was ordained as Metropolitan by the name‘Mar Stephanos’ by H.H. Baselios Mar Thoma Mathews III Catholicos at St. Mary’s Cathedral, Pazhanji on 28 July 2022. H.G. has taken charge as Metropolitan of UK, Europe, and Africa dioceses since 3 November 2022.
                      </p>

                      <h4 className="font-syro-display font-semibold text-lg text-syro-blue mt-8 mb-3">
                        Contact
                      </h4>
                      <div className="font-syro-primary text-syro-dark-gray leading-relaxed space-y-1">
                        <p>Malankara House, 35 Hennman Close, Swindon, SN25 4ZW, UK</p>
                        <p>Mobile: 9846767680</p>
                        <p>
                        Email:{' '}
                        <a
                          href="mailto:abrahamstephanos@mosc.in"
                          className="text-syro-blue hover:underline focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2 rounded"
                        >
                          abrahamstephanos@mosc.in
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

export default HGAbrahamMarStephanosMetropolitanPage;

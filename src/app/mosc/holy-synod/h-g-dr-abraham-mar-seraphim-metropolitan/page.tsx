import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '../../components/SynodMembersSidebar';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'H.G. Dr. Abraham Mar Seraphim Metropolitan',
  description: 'His Grace Dr. Abraham Mar Seraphim, Metropolitan of Thumpamon Diocese. General Secretary, Mar Gregorios Orthodox Christian Movement of India; President, MGOCSM; D.Th., Chicago Theological Seminary.',
};

const HGDrAbrahamMarSeraphimMetropolitanPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="H.G. Dr. Abraham Mar Seraphim Metropolitan"
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
                  <Image src="/images/holy-synod/sera.png" alt="H.G. Dr. Abraham Mar Seraphim Metropolitan" width={125} height={75} className="rounded-lg w-full max-w-[125px] h-auto object-contain" priority />
                  </div>

                {/* Content - Below Image */}
                <div>
                    <h3 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                      H.G. Dr. Abraham Mar Seraphim Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        His Grace was born on 28 December 1969 as the son of Mr. V. A. Mathews and Mrs. Annie Mathews, Vaduthala Puthenveedu, Mathoor. He is a member of St. George Orthodox Valiyapally, Thumpamon Eram, under the Thumpamon Diocese. His academic journey began at Mahatma Gandhi University, where he earned a Bachelor’s Degree in Mathematics. He pursued theological studies at the Orthodox Theological Seminary, Kottayam, obtaining a Graduate Degree in Sacred Theology and a Bachelor of Divinity from the Senate of Serampore University. Furthering his education abroad, he earned a Master of Theology (M.Th.) from Dharmaram Theological College, Bangalore, and a Doctor of Theology (D.Th.) from Chicago Theological Seminary, USA. His writings and radical, spiritually profound speeches reflect his deep theological insight, inspiring audiences with messages of love, compassion, and faith. His Grace has held several key positions in the Church, including: General Secretary, Mar Gregorios Orthodox Christian Movement of India; Member, Managing Committee, Orthodox Church; Member, Governing Board, Thadakam Ashram, Coimbatore; Director, Santhinilayam Counselling Centre, Pathanamthitta. On 17 February 2010, he was elected as a Metropolitan candidate at the Malankara Association in Sasthamkotta and was consecrated as Metropolitan on 12 May 2010 at Mar Elia Cathedral, Kottayam. He served as the first Metropolitan of the Bangalore Diocese from 2010 to 2023 and has been the Metropolitan of the Thumpamon Diocese since 27 September 2023. He currently serves as President of the Mar Gregorios Orthodox Christian Student Movement (MGOCSM) and of the ARDRA Charitable Society.
                      </p>

                      <h4 className="font-syro-display font-semibold text-lg text-syro-blue mt-8 mb-3">
                        Contact
                      </h4>
                      <div className="font-syro-primary text-syro-dark-gray leading-relaxed space-y-1">
                        <p>Basil Aramana, Makkamkunnu, Pathanamthitta P.O.</p>
                        <p>Mobile: 9447963528</p>
                        <p>
                        Email:{' '}
                        <a
                          href="mailto:marseraphim@gmail.com"
                          className="text-syro-blue hover:underline focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2 rounded"
                        >
                          marseraphim@gmail.com
                        </a>
                        {', '}
                        <a
                          href="mailto:thumpamon2023@gmail.com"
                          className="text-syro-blue hover:underline focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2 rounded"
                        >
                          thumpamon2023@gmail.com
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

export default HGDrAbrahamMarSeraphimMetropolitanPage;

import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '../../components/SynodMembersSidebar';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'H.G. Dr. Zacharias Mar Aprem Metropolitan',
  description: 'His Grace Dr. Zacharias Mar Aprem, Metropolitan of Adoor–Kadampanad Diocese. President, Senate of Serampore University; Chief Editor, Malankara Sabha Magazine; Professor, Orthodox Theological Seminary, Kottayam.',
};

const HGDrZachariasMarApremMetropolitanPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="H.G. Dr. Zacharias Mar Aprem Metropolitan"
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
                  <Image src="/images/holy-synod/mar-aprem.jpg" alt="H.G. Dr. Zacharias Mar Aprem Metropolitan" width={125} height={75} className="rounded-lg w-full max-w-[125px] h-auto object-contain" priority />
                  </div>

                {/* Content - Below Image */}
                <div>
                    <h3 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                      H.G. Dr. Zacharias Mar Aprem Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        His Grace was born as the son of E.K. Kuriakose and Sossama Kuriakose. He is a member of St. George Valiyapally, Chungathara, Malabar Diocese. After taking his Bachelor&apos;s degree in Science from Malabar Christian College, Calicut, he joined the Orthodox Theological Seminary, Kottayam, for theological studies. From the Orthodox Theological Seminary, Kottayam, he received the Graduate Degree in Sacred Theology (GST) and the Bachelor of Divinity (B.D.) from the Senate of Serampore University. He then took his M.Th. from Gurukul Theological College &amp; Research Institute, Chennai (Serampore University), and earned his D.Th. from Sathri, Bangalore, under Serampore University, in Advaita Vedanta. His Grace has held several key positions in the Church: Professor at the Orthodox Theological Seminary, Kottayam; Registrar, Orthodox Seminary; Principal Secretary to H.H. Didymos I, the Catholicos; Chief Editor, Malankara Sabha Magazine; Member, Ecumenical Relations Committee; Member, Seminary Governing Board; Member, Bible Society (Kerala auxiliary). He is now serving as President of the Senate of Serampore University. His Grace&apos;s major area of study is Religion &amp; Philosophy. In addition to the responsibilities of the diocese, His Grace serves as Professor at the Orthodox Theological Seminary. His Grace is a noted singer and writer. He was elected as Metropolitan candidate on 17 February 2010 at the Malankara Association held at Sasthamkotta, and was consecrated as Metropolitan on 12 May 2010 at Mar Elia Cathedral, Kottayam, by H.H. Baselios Marthoma Didymos I. His Grace is serving the Adoor–Kadampanad Diocese as its Metropolitan.
                      </p>

                      <h4 className="font-syro-display font-semibold text-lg text-syro-blue mt-8 mb-3">
                        Contact
                      </h4>
                      <div className="font-syro-primary text-syro-dark-gray leading-relaxed space-y-1">
                        <p>Sreyas Aramana, Mar Epiphanios Centre, Kannamkodu, Adoor P.O., Pathanamthitta – 691 523</p>
                        <p>Tel: 04734 227117 | Mobile: 9447184303</p>
                        <p>
                        Email:{' '}
                        <a
                          href="mailto:2010aprem@gmail.com"
                          className="text-syro-blue hover:underline focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2 rounded"
                        >
                          2010aprem@gmail.com
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

export default HGDrZachariasMarApremMetropolitanPage;

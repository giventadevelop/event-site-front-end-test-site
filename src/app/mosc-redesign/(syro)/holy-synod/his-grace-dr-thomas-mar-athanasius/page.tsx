import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '../../components/SynodMembersSidebar';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'H. G. Dr. Thomas Mar Athanasius Metropolitan',
  description: 'His Grace Dr. Thomas Mar Athanasius Metropolitan, Bishop of Kandanad Diocese. Scholar, social worker, and author.',
};

const HisGraceDrThomasMarAthanasiusPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="H. G. Dr. Thomas Mar Athanasius Metropolitan"
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
                  <Image src="/images/holy-synod/ath.jpg" alt="H. G. Dr. Thomas Mar Athanasius Metropolitan" width={125} height={75} className="rounded-lg w-full max-w-[125px] h-auto object-contain" priority />
                  </div>

                {/* Content - Below Image */}
                <div>
                    <h3 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                      H. G. Dr. Thomas Mar Athanasius Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        His Grace was born on 28 June 1952 at Arikuzha, Thodupuzha, to Rev. Fr Yohannan Puttanil and Mrs Mariam. He did his schooling at Government UPS School Arikuzha and NSS High School, Manakad. Thereupon he joined New Man College, Thodupuzha and passed out his Pre-degree and Degree from there. He did his MA from St John’s College, Agra.
                      </p>

                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        In the theological front, he took his BD degree from Serampore College and United Theological College, Bangalore. And went for his DTh from Protestant Faculty, University of Munich.
                      </p>

                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        He was ordained a priest in 1990 and the very same year was consecrated as Bishop and was given the charge of Kandanad Diocese. He was a teacher at Syrian Orthodox Theological Seminary at Vettickal during 1990-95. From 1992, His Grace was the President of Kerala Council of Churches till 1998.
                      </p>

                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        Dr Athanasius is a known social worker and a philanthropist. He runs Swasraya Rehabilitation & Training Centre at Vettickal, Mulanthuruthy; Trinity Retirement Home, Kolenchery; Samanvaya Study and Dialogue Centre, Pampakuda; Sukhada Retreat Centre, Kolenchery; Santhula Hospital and Deaddiction Centre, Vadakara; and Giliyad, Retreat Centre & Orphanage, Vadkara.
                      </p>

                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        His Grace is an author of few well-known books. A Comparative Study of Theological Methodologies of Irenaeus and Sri Sankara (1990); Church and Society (1992); Neethi Samooham; and Anthyokya Malankara Bandham: Oru Punarchintanam are the main titles.
                      </p>

                      <div className="mt-6 pt-6 border-t border-syro-table-border">
                        <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2">
                          Address: Bishop’s House, Cathedral Road, Moovattupuzha,Kerala – 686 661 ph : 0485 2833401 Cell: 9447083340
                        </p>
                        <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-2">
                          Email:{' '}
                          <a
                            href="mailto:thomasmarathanasius@gmail.com"
                            className="text-syro-blue hover:underline focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2 rounded"
                          >
                            thomasmarathanasius@gmail.com
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

export default HisGraceDrThomasMarAthanasiusPage;

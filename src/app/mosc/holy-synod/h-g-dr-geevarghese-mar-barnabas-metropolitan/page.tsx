import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '../../components/SynodMembersSidebar';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'H.G. Dr. Geevarghese Mar Barnabas Metropolitan',
  description: 'His Grace Dr. Geevarghese Mar Barnabas, Metropolitan of Sultan Bathery diocese. DTh (Pontifical Academy, Rome), M.Th. Serampore; ordained Metropolitan 2022.',
};

const HGDrGeevargheseMarBarnabasMetropolitanPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="H.G. Dr. Geevarghese Mar Barnabas Metropolitan"
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
                  <Image src="/images/holy-synod/Geevarghese-Mar-Barnabas.png" alt="H.G. Dr. Geevarghese Mar Barnabas Metropolitan" width={125} height={75} className="rounded-lg w-full max-w-[125px] h-auto object-contain" priority />
                  </div>

                {/* Content - Below Image */}
                <div>
                    <h3 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                      H.G. Dr. Geevarghese Mar Barnabas Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        Born to Mr. Kochupappi and Mrs. Ammini in Kattuparambil House on April 10, 1973, His Grace belongs to the parish of St. Mary’s Orthodox Church, Muttam under Mavelikkara diocese. His Grace completed his primary education from NSS High School, Pallipad, Naduvattam (1983-88), and completed higher studies from T. K. Madhava Memorial College (1988-90) and Kerala University (1990-93). He joined Kottayam Old Seminary and completed GST (1994-98). He also pursued BD (1994-98) and M.Th. (2001–03) from Serampore University. H. G. did LSD (2004-06) and DTh (2006-09) from the Pontifical Academy of St. Thomas Aquinas, Rome. And his diploma from Serampore University in 2019. He was ordained sub-deaconship (1997) by H.G. Dr. Geevarghese Mar Osthathios Metropolitan at St. Peter’s and St. Paul’s church, Parumala. He was ordained deaconship (2003) by H. G. Dr. Stephanos Mar Theodosius Metropolitan, and priesthood by H.G. Dr. Geevarghese Mar Osthathios Metropolitan in 2004. H. G. was chosen as a Metropolitan in the Malankara Syrian Christian Association held at Kolencherry on 25 February 2022. H. G. received the status of Ramban at the Parumala Seminary on 2 June 2022. He was ordained as Metropolitan by the name ‘Mar Barnabas’ by H.H. Baselios Mar Thoma Mathews III Catholicos at St. Mary’s Cathedral, Pazhanji on 28 July 2022. H.G. has taken charge of Sultan Bathery diocese since 3 November 2022.
                      </p>

                      <h4 className="font-syro-display font-semibold text-lg text-syro-blue mt-8 mb-3">
                        Contact
                      </h4>
                      <div className="font-syro-primary text-syro-dark-gray leading-relaxed space-y-1">
                        <p>Nirmalagiri Aramana, Poomala, S. Bathery P.O., Wayanad – 673 592</p>
                        <p>Mobile: +91 9495912473</p>
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

export default HGDrGeevargheseMarBarnabasMetropolitanPage;

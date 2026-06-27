import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '../../components/SynodMembersSidebar';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'H.G. Zachariah Mar Severios Metropolitan',
  description: 'His Grace Zachariah Mar Severios, Metropolitan of Idukki diocese and Assistant Metropolitan of Kandanadu West. Author (pen-name Zacher); ordained Metropolitan 2022.',
};

const HGZachariaMarSeveriosMetropolitanPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="H.G. Zachariah Mar Severios Metropolitan"
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
                  <Image src="/images/holy-synod/zaker.jpg" alt="H.G. Zachariah Mar Severios Metropolitan" width={125} height={75} className="rounded-lg w-full max-w-[125px] h-auto object-contain" priority />
                  </div>

                {/* Content - Below Image */}
                <div>
                    <h3 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                      H.G. Zachariah Mar Severios Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        Born in Chirathilatt House as the son of Very Rev. C. John Cor- Episcopa and Mrs. Lissy on 19 August 1978, His Grace belongs to the parish of St. Mary’s Orthodox Church, Vakathanam-Puthenchantha under Kottayam diocese. His Grace completed primary education from J.M.H.S.S., Vakathanam (1991-94). H.G. completed Pre-Degree (1994-96) from K. G. College, Pampady; a degree in Law (1996-99) from Government Law College, Thiruvananthapuram; and postgraduation in Syriac literature (2007-09) from M.G. University, Kottayam. He joined Kottayam Old Seminary and completed GST (2001-06). His completion of BD (2001-06) course was from Serampore University. He was ordained sub-deaconship, deaconship, and priesthood in 2006 by H.G. Geevarghese Mar Ivanios Metropolitan at Njaliyakuzhi Dayara, Vakathanam. H. G. was chosen as a Metropolitan in the Malankara Syrian Christian Association held at Kolencherry, on 25 February 2022. H. G. received the status of Ramban at the Parumala Seminary on 2 June 2022. He was ordained as Metropolitan by the name ‘Mar Severios’ by H.H. Baselios Mar Thoma Mathews III Catholicos at St. Mary’s Cathedral, Pazhanji on 28 July 2022. H.G. has taken charge of Idukki diocese since 3 November 2022 and is also serving as the Assistant Metropolitan of Kandanadu West diocese. Additionally, H.G. has contributed significantly to the literary world under the pen-name ‘Zacher,’ authoring 19 books that enlighten and inspire readers.
                      </p>

                      <h4 className="font-syro-display font-semibold text-lg text-syro-blue mt-8 mb-3">
                        Contact
                      </h4>
                      <div className="font-syro-primary text-syro-dark-gray leading-relaxed space-y-1">
                        <p>Gedseemon Aramana, Chakkupallom, Kumily – 686 509</p>
                        <p>Mobile: +91 9495962966</p>
                        <p>
                        Email:{' '}
                        <a
                          href="mailto:idukkidiocese82@gmail.com"
                          className="text-syro-blue hover:underline focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2 rounded"
                        >
                          idukkidiocese82@gmail.com
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

export default HGZachariaMarSeveriosMetropolitanPage;

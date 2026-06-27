import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '../../components/SynodMembersSidebar';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'H.G. Dr. Thomas Mar Ivanios Metropolitan',
  description: 'His Grace Dr. Thomas Mar Ivanios, Metropolitan of the Diocese of South-West America. M.Th. (FFRRC), D.Min.; ordained Metropolitan 2022.',
};

const HGThomasMarIvaniosMetropolitanPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="H.G. Dr. Thomas Mar Ivanios Metropolitan"
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
                  <Image src="/images/holy-synod/Thomas-Mar-Ivanios.png" alt="H.G. Dr. Thomas Mar Ivanios Metropolitan" width={125} height={75} className="rounded-lg w-full max-w-[125px] h-auto object-contain" priority />
                  </div>

                {/* Content - Below Image */}
                <div>
                    <h3 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                      H.G. Dr. Thomas Mar Ivanios Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        Born to Late Mr. Thomas Chacko and Mrs. Annamma, in Pulluparampil house, Aleppey on 13 December 1969, His Grace Thomas Mar Ivanios Metropolitan belongs to the parish of St. Thomas Orthodox Church, Chennankari under Kottayam diocese. His Grace completed his school education from St. Joseph High School, Chennankari (1985), following which H.G. completed degree in Malayalam (1986-88) from SD College, Aleppey. He joined Kottayam Old Seminary in 1992 and completed GST (1992-96). Later, he did M.Th. (1997â€“99) from FFRRC and a degree in Doctor of Ministry (D. Min). He was ordained sub-deaconship, by H.G. Geevarghese Mar Ivanios Metropolitan at Orthodox Theological Seminary, Kottayam on 8 December 1996. He was ordained deaconship (1999) at Mar Baselios Dayara, Njaliyakuzhi, and priesthood at St. Thomas Orthodox church, Chennankari on 18 September 1999. He was chosen as Metropolitan in the Malankara Syrian Christian Association held at Kolencherry on 25 February 2022. He received the status of Ramban at the Parumala Seminary on 2 June 2022. He was ordained as a Metropolitan by the name â€˜Mar Ivaniosâ€™ by H.H. Baselios Mar Thoma Mathews III Catholicos at St. Maryâ€™s Cathedral, Pazhanji on 28 July 2022. H.G. has taken charge of the diocese of South-West America since 3 November 2022.
                      </p>

                      <h4 className="font-syro-display font-semibold text-lg text-syro-blue mt-8 mb-3">
                        Contact
                      </h4>
                      <div className="font-syro-primary text-syro-dark-gray leading-relaxed space-y-1">
                        <p>Urshlem (Indian Orthodox Church Center)</p>
                        <p>3101 Hopkins Road, Beasley, TX 77417, USA</p>
                        <p>Ph: +1 (713) 281-3871, +91 9511842199, 001-281-403-0670</p>
                        <p>
                        Email:{' '}
                        <a
                          href="mailto:thomasmarivanios@mosc.in"
                          className="text-syro-blue hover:underline focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2 rounded"
                        >
                          thomasmarivanios@mosc.in
                        </a>
                        {', '}
                        <a
                          href="mailto:diocesanoffice@ds-wa.org"
                          className="text-syro-blue hover:underline focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2 rounded"
                        >
                          diocesanoffice@ds-wa.org
                        </a>
                      </p>
                        <p>Web: www.ds-wa.org</p>
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

export default HGThomasMarIvaniosMetropolitanPage;

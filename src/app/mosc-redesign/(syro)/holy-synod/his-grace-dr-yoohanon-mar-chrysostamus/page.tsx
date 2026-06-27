import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '../../components/SynodMembersSidebar';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'H.G. Dr. Yuhanon Mar Chrisostomos Metropolitan',
  description: 'His Grace Dr. Yuhanon Mar Chrisostomos, Metropolitan of Niranam Diocese. Scholar, organizer, and missionary leader; former Secretary of Karunagiri MGD Ashram.',
};

const HisGraceDrYoohanonMarChrysostamusPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="H.G. Dr. Yuhanon Mar Chrisostomos Metropolitan"
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
                  <Image src="/images/holy-synod/chris.jpg" alt="H.G. Dr. Yuhanon Mar Chrisostomos Metropolitan" width={125} height={75} className="rounded-lg w-full max-w-[125px] h-auto object-contain" priority />
                  </div>

                {/* Content - Below Image */}
                <div>
                    <h3 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                      H.G. Dr. Yuhanon Mar Chrisostomos Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        His Grace was born in 1954 to Mr KV Yohannan and Mrs Aleyamma Yohannan, Mannil Puthen Purayil, Kottoor, Thiruvalla. Varghese had his early education in local schools at Kottoor, and college education at SB College, Chenganachery. After his BSc from the University of Kerala, he joined Orthodox Theological Seminary, Kottayam, and took his GST and BD from Serampore University. He did his MTh from United Theological College, Bangalore, and PhD from The San Francisco Theological Seminary.
                      </p>

                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        Metropolitan Geevarghese Mar Osthathios ordained Varghese John a deacon on 19 April 1982, and he received his priesthood from HH Baselios Marthoma Mathews II on 5 June 1982. On 28 January 1998, H.H. Baselios Marthoma Mathews II made him a Ramban at Parumala Seminary. Ramban Yoohanon was the Secretary of the Karunagiri MGD Ashram and Balabhavan. He has held the post of Principal, St Paul’s Mission Training Center, Mavelikkara, visiting faculty of St Thomas Orthodox Theological Seminary, Nagpur, coordinator of Malankara Orthodox Mission Board, St Thomas Karunya Guidance Center, Ulloor, Trivandrum, Karunya Vishranthi Bhavan Kattela, Trivandrum, Marriage Assistance Foundation (MAF), Sick Aid Foundation (SAF), Member of Malankara Association Managing Committee, Council Member of Parumala Seminary, Member of Catholic-Orthodox Dialogue Commission and many other posts of distinction. Besides being a scholar, exceptionally good organizer, and preacher at conventions, he has participated in and given leadership to many meetings and conferences.
                      </p>

                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        Yoohanon Ramban was elevated to the post of Metropolitan on 5 March 2005 by HH Baselios Mathews II along with His Grace Mar Gregorios, His Grace Mar Theophilos, and His Grace Mar Dionysius at Parumala Seminary. He took the mantle of Niranam Diocese from illustrious His Grace Mar Osthathios. His Grace has widely travelled in the Gulf, the US and in the European countries. He is working tirelessly to transform the Church into a missionary Church.
                      </p>

                      <h4 className="font-syro-display font-semibold text-lg text-syro-blue mt-8 mb-3">
                        Contact
                      </h4>
                      <div className="font-syro-primary text-syro-dark-gray leading-relaxed space-y-1">
                        <p>Bethany Aramana, Thiruvalla, Kerala – 689 101</p>
                        <p>Tel.: 0469-2701357 / 2603357 | Fax: 0469-2342709 | Mob: 9447045543</p>
                        <p>
                        Email:{' '}
                        <a
                          href="mailto:yuhanonmarchrysostomos@gmail.com"
                          className="text-syro-blue hover:underline focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2 rounded"
                        >
                          yuhanonmarchrysostomos@gmail.com
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

export default HisGraceDrYoohanonMarChrysostamusPage;

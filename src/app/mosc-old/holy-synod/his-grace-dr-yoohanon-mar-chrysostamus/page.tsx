import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '@/components/holy-synod/SynodMembersSidebar';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'H.G. Dr. Yuhanon Mar Chrisostomos Metropolitan',
  description: 'Biography and information about H.G. Dr. Yuhanon Mar Chrisostomos Metropolitan.',
};

const HisGraceDrYoohanonMarChrysostamusPage = () => {
  return (
    <div className="bg-background">
      {/* Main Content */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="bg-background rounded-lg sacred-shadow p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Featured Portrait - Left Side - Large Display */}
                  <div className="flex-shrink-0 flex justify-center md:justify-start">
                    <div className="relative w-72 h-[28rem] md:w-80 md:h-[32rem] lg:w-96 lg:h-[36rem] rounded-lg overflow-hidden sacred-shadow-lg">
                      <Image
                        src="/images/holy-synod/chris.jpg"
                        alt="H.G. Dr. Yuhanon Mar Chrisostomos Metropolitan"
                        fill
                        sizes="(max-width: 768px) 288px, (max-width: 1024px) 320px, 384px"
                        className="object-cover object-top"
                        style={{
                          objectPosition: 'center 15%'
                        }}
                        priority
                      />
                    </div>
                  </div>

                  {/* Content - Right Side of Image */}
                  <div className="flex-1">
                    <h3 className="font-heading font-semibold text-2xl text-foreground mb-6">
                      H.G. Dr. Yuhanon Mar Chrisostomos Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        His Grace was born in 1954 to Mr KV Yohannan and Mrs Aleyamma Yohannan, Mannil Puthen Purayil, Kottoor, Thiruvalla. Varghese had his early education in local schools at Kottoor, and college education at SB College, Chenganachery. After his BSc from the University of Kerala, he joined Orthodox Theological Seminary, Kottayam, and took his GST and BD from Serampore University. He did his MTh from United Theological College, Bangalore, and PhD from The San Francisco Theological Seminary.
                      </p>

                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        Yoohanon Ramaban was elevated to the post of Metropolitan on 5 March 2005 by HH Baselios Mathews II along with His Grace Mar Gregorios, His Grace Mar Theophilos, and His Grace Mar Dionysius at Parumala Seminary. He took the mantle of Niranam Diocese from illustrious His Grace Mar Osthathios. His Grace has widely travelled in the Gulf, the US and in the European countries. He is working tirelessly to transform the Church into a missionary Church.
                      </p>

                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        Mob: 9447045543
                      </p>

                      <div className="mt-6 pt-6 border-t border-border">
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Metropolitan Geevarghese Mar Osthathios ordained Varghese John a deacon on 19 April 1982, and got his priesthood from HH Baselios Marthoma Mathews II on 5 June 1982. On 28 January 1998, H.H. Baselios Marthoma Mathews II made him a Ramban at Parumala Seminary. Ramban Yoohanon was the Secretary of the Karunagiri MGD Ashram and Balabhavan. He has held the post of Principal, St Paul’s Mission Training Center, Mavelikkara, visiting faculty of St Thomas Orthodox Theological Seminary, Nagpur, coordinator of Malankara Orthodox Mission Board, St Thomas Karunya Guidance Center, Ulloor, Trivandrum, Karunya Vishranthi Bhavan Kattela, Trivandrum, Marriage Assistance Foundation (MAF), Sick Aid Foundation (SAF), Member of Malankara Association Managing Committee, Council Member of Parumala Seminary, Member of Catholic-Orthodox Dialogue Commission and many other posts of distinction. Besides being a scholar, exceptionally good organizer, preacher at conventions, he has participated in and given leadership to many meetings and also to many conferences.
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Present Address: Bethany Aramana, Thiruvalla, Kerala – 689 101 Tel.: 0469-2701357/2603357 Fax: 0469-2342709
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Email: yuhanonmarchrysostomos@gmail.com
                        </p>
                      </div>
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
            <div className="lg:col-span-1">
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

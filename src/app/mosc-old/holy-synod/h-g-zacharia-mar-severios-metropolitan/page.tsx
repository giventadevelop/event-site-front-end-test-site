import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '@/components/holy-synod/SynodMembersSidebar';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'H.G. Zachariah Mar Severios Metropolitan',
  description: 'Biography and information about H.G. Zachariah Mar Severios Metropolitan.',
};

const HGZachariaMarSeveriosMetropolitanPage = () => {
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
                        src="/images/holy-synod/zaker.jpg"
                        alt="H.G. Zachariah Mar Severios Metropolitan"
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
                      H.G. Zachariah Mar Severios Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        Born in Chirathilatt House as the son of Very Rev. C. John Cor- Episcopa and Mrs. Lissy on 19 th August, 1978, His Grace belongs to the parish of St. Mary’s Orthodox Church, Vakathanam-Puthenchantha under Kottayam diocese. His Grace completed primary education from J.M.H.S.S., Vakathanam (1991-94). H.G. completed Pre-Degree (1994-96) from K. G. College, Pampady ; a degree in Law (1996-99) from Government Law College, Thiruvananthapuram; and postgraduation in Syriac literature (2007-09) from M.G. University, Kottayam. He joined Kottayam Old Seminary and completed GST (2001-06). His completion of BD (2001-06) course was from Serampore University. He was ordained sub-deaconship, deaconship, and priesthood in 2006 by H.G. Geevarghese Mar Ivanios Metropolitan at Njaliyakuzhi Dayara, Vakathanam. H. G. was chosen as a Metropolitan in the Malankara Syrian Christian Association held at Kolencherry, on 25 th February 2022. H. G. received the status of Ramban at the Parumala Seminary on 2 nd June 2022. He was ordained as Metropolitan by the name ‘Mar Severios’ by H.H. Baselios Mar Thoma Mathews III Catholicos at St. Mary’s Cathedral, Pazhanji on 28 th July 2022. H.G. has taken charge of Idukki diocese since 3 rd November 2022 and also Serving as the Assistant metropolitan of Kandanadu West diocese. Additionally, H.G. has contributed significantly to the literary world under the pen-name ‘Zacher,’ authoring 19 books that enlighten and inspire readers.
                      </p>

                      <div className="mt-6 pt-6 border-t border-border">
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Address Gedseemon Aramana, Chakkupallom, Kumily - 686 509
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Mob: +91 9495962966
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Email: idukkidiocese82@gmail.com
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

export default HGZachariaMarSeveriosMetropolitanPage;

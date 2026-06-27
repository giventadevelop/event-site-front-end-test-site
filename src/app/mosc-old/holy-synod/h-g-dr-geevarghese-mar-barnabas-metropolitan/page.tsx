import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '@/components/holy-synod/SynodMembersSidebar';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'H.G. Dr. Geevarghese Mar Barnabas Metropolitan',
  description: 'Biography and information about H.G. Dr. Geevarghese Mar Barnabas Metropolitan.',
};

const HGDrGeevargheseMarBarnabasMetropolitanPage = () => {
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
                        src="/images/holy-synod/Geevarghese-Mar-Barnabas.png"
                        alt="H.G. Dr. Geevarghese Mar Barnabas Metropolitan"
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
                      H.G. Dr. Geevarghese Mar Barnabas Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        Born to Mr. Kochupappi and Mrs. Ammini in Kattuparambil House on April 10, 1973, His Grace belongs to the parish of St. Mary’s Orthodox Church, Muttam under Mavelikkara diocese. His Grace completed his primary education from NSS High School, Pallipad, Naduvattam (1983-88), and completed higher studies from T. K. Madhava Memorial College (1988-90) and Kerala University (1990-93). He joined Kottayam Old Seminary and completed GST (1994-98). He also pursued BD (1994-98) and M.Th (2001- 03) from Serampore University. H. G. did LSD (2004-06) and DTh (2006-09) from the Pontifical Academy of St. Thomas Aquinas, Rome. And his diploma from Serampore University in 2019. He was ordained sub-deaconship (1997) by H.G. Dr. Geevarghese Mar Osthathios Metropolitan at St. Peter’s and St. Paul’s church, Parumala. He was ordained deaconship (2003) by H. G. Dr. Stephanos Mar Theodosius Metropolitan, and priesthood by H.G. Dr. Geevarghese Mar Osthathios Metropolitan in 2004 . H. G. was chosen as a Metropolitan in the Malankara Syrian Christian Association held at Kolencherry on 25 th February 2022 . H. G. received the status of Ramban at the Parumala Seminary on 2 nd June 2022 . He was ordained as Metropolitan by the name ‘Mar Barnabas’ by H.H. Baselios Mar Thoma Mathews III Catholicos at St. Mary’s Cathedral, Pazhanji on 28 th July 2022 . H.G. has taken charge of Sultan Bathery diocese since 3 rd November 2022.
                      </p>

                      <div className="mt-6 pt-6 border-t border-border">
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Address Nirmalagiri Aramana, Poomala, S. Bathery P.O., Wayanad - 673 592
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Mob: +91 9495912473
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

export default HGDrGeevargheseMarBarnabasMetropolitanPage;

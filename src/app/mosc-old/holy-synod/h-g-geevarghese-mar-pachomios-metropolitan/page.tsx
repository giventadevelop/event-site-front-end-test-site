import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '@/components/holy-synod/SynodMembersSidebar';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'H.G. Geevarghese Mar Pachomios Metropolitan',
  description: 'Biography and information about H.G. Geevarghese Mar Pachomios Metropolitan.',
};

const HGGeevargheseMarPachomiosMetropolitanPage = () => {
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
                        src="/images/holy-synod/Geevarghese-Mar-Pachomios-300x193-1.jpg"
                        alt="H.G. Geevarghese Mar Pachomios Metropolitan"
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
                      H.G. Geevarghese Mar Pachomios Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        Born in Kochuparambil house as the son of Mr. K.M. Elias and Lt. Mrs. Omana on 6 th March 1973 , H. G. Geevarghese Mar Pachomios Metropolitan belongs to the parish of St. George Church, Mannathoor under the diocese of East Kandanad. His Grace completed his school education from Government High School, Mannathoor. He pursued higher education at St. Peters College, Kolencherry and Symbiosis Law college, Pune. Further, he joined Kottayam Old Seminary and completed BD (2003-08) and M.Th from PaurasthyaVidyapeedam, Vadavathoor(2019-21). He was ordained sub-deaconship , by H.G. Dr. Thomas Mar Athanasios Metropolitan at St. Thomas Cathedral, Muvattupuzha on 31 st January 2001 . He was ordained deacon on 30 th October 2009, and priesthood on 11 th December, and became Ramban on 14 th December. H. G. was chosen as a Metropolitan in the Malankara Syrian Christian Association held at Kolencherry on 25 th February 2022. He was ordained as a Metropolitan by the name ‘Mar Pachomios’ by H.H. Baselios Mar Thoma Mathews III Catholicos at St. Mary’s Cathedral, Pazhanji on 28 th July 2022. H.G. has taken charge of Malabar diocese as Metropolitan since 3 rd November 2022.
                      </p>

                      <div className="mt-6 pt-6 border-t border-border">
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Address Mount Hermon Aramana, Chathamangalam, N.I.T. Campus P.O., Kozhikode - 673 601.
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Mob: +91 9961932356
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Email: geevarghesemarpachomios@gmail.com, hermonaramana@gmail.com
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

export default HGGeevargheseMarPachomiosMetropolitanPage;

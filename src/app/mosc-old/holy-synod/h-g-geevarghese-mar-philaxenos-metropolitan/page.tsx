import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '@/components/holy-synod/SynodMembersSidebar';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'H.G. Geevarghese Mar Philoxenos Metropolitan',
  description: 'Biography and information about H.G. Geevarghese Mar Philoxenos Metropolitan.',
};

const HGGeevargheseMarPhilaxenosMetropolitanPage = () => {
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
                        src="/images/holy-synod/Geevarghese-Mar-Philaxenos.png"
                        alt="H.G. Geevarghese Mar Philoxenos Metropolitan"
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
                      H.G. Geevarghese Mar Philoxenos Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        H. G. Geevarghese Mar Philoxenos Metropolitan was born in Maleth house, Arattupuzha as the son of Mr. M. G. George and Mrs. Accamma on 30 th May 1972 . His Grace belongs to the parish of St. Mary’s Church, Arattupuzha under Chengannur diocese. His Grace completed his primary education from Metropolitan High School, Puthenkavu (1987), following which he completed Pre-Degree (1989) from Christian College, Chengannur. Completed degree in Economics (1991-94) from Catholicate college, Pathanamthitta, and Postgraduation in Economics (1994-96) from Institute of Economics, Thiruvalla, he joined Old Seminary, Kottayam and completed GST and BD (1996-2000). Later, he took his PhD from Brisbane College of Theology (2011-13). He was ordained sub-deaconship on 1999, by H.G. Dr. Yacob Mar Irenios Metropolitan at St. Mary’s Church, Arattupuzha. He was ordained deaconship (2000),and priesthood (17 th May 2000) at Mount Tabor Dayara, Pathanapuram . He was chosen as a Metropolitan in the Malankara Syrian Christian Association held on 25 th February 2022 at Kolencherry. He received the status of Ramban on 2 nd June 2022 at the Parumala Seminary. He was ordained as a Metropolitan by the name ‘Mar Philoxenos’ by H.H. Baselios Mar Thoma Mathews III Catholicos on 28 th July 2022 at St. Mary’s Cathedral, Pazhanji. H.G. has taken charge of Madras diocese as Metropolitan since 3 rd November 2022.
                      </p>

                      <div className="mt-6 pt-6 border-t border-border">
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Address: Bishop\'s House 4/51, Rajeswari Street, Mehta Nagar, Chennai - 600029.
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Mob: +91 7025168747 E-mail: madrasorthodoxdiocese@gmail.com
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

export default HGGeevargheseMarPhilaxenosMetropolitanPage;

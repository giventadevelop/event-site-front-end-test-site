import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '@/components/holy-synod/SynodMembersSidebar';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'H.G. Abraham Mar Stephanos Metropolitan',
  description: 'Biography and information about H.G. Abraham Mar Stephanos Metropolitan.',
};

const HGAbrahamMarStephanosMetropolitanPage = () => {
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
                        src="/images/holy-synod/Abraham-Mar-Stephanos.png"
                        alt="H.G. Abraham Mar Stephanos Metropolitan"
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
                      H.G. Abraham Mar Stephanos Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        Born to Late Mr. K. A. Thomas and Mrs. Annamma, Kadakkamannil House, Mylapra in Pathanamthitta on June 11, His Grace belongs to the parish of St. George Orthodox Church (Valiyapalli), Mylapra under Thumpamon diocese. His Grace completed his primary education from Seventh Day Adventist School, Pathanamthitta (1974-78), and Marthoma High School (1978-84), following which he completed Pre-Degree course (1984-86) as well as degree in Mathematics (1986-89) from Catholicate College, Pathanamthitta . He joined Kottayam Old Seminary (1995-99) and completed BD as well as GST . He also completed M.Th (2000-02) from FFRRC, and MA in Late Antiquity and Byzantine Studies from Kings College, London. He was ordained sub-deaconship (1998) by H.G. Kuriakose Mar Clemis Metropolitan at Mar Basil Dayara, Pathanamthitta. Further, he was ordained deaconship (1999) by L.L. H.H. Baselios Mar Thoma Mathews II Catholicos at St. Thomas chapel in Old Seminary, Kottayam , and priesthood on 8 th April 2000 by H.G. Kuriakose Mar Clemis Metropolitan at St. George Orthodox Church, Mylapra . He was chosen as Metropolitan in the Malankara Syrian Christian Association held at Kolencherry on 25 th February 2022 . He received the status of Ramban at the Parumala Seminary on 2 nd June 2022. He was ordained as Metropolitan by the name‘Mar Stephanos’ by H.H. Baselios MarThoma Mathews III Catholicos at St. Mary’s Cathedral, Pazhanji on 28 th July 2022 . H.G. has taken charge as Metropolitan of UK, Europe, and Africa dioceses since 3 rd November 2022.
                      </p>

                      <div className="mt-6 pt-6 border-t border-border">
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Address Malankara House, 35 Hennman Close, Swindon, SN254ZW, UK
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Mob. 9846767680
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Email: abrahamstephanos@mosc.in
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

export default HGAbrahamMarStephanosMetropolitanPage;

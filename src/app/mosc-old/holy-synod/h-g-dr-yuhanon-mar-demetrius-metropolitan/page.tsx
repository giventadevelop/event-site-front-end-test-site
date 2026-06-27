import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '@/components/holy-synod/SynodMembersSidebar';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'H.G. Dr. Youhanon Mar Demetrios Metropolitan',
  description: 'Biography and information about H.G. Dr. Youhanon Mar Demetrios Metropolitan.',
};

const HGDrYuhanonMarDemetriusMetropolitanPage = () => {
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
                        src="/images/holy-synod/del.jpg"
                        alt="H.G. Dr. Youhanon Mar Demetrios Metropolitan"
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
                      H.G. Dr. Youhanon Mar Demetrios Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        His Grace was Born on 18-12-1952 as the son of Palamoottil Mathews and Mercy. Home parish is St. Thomas Orthodox Cathedral, Kollam Diocese. After completing the formal education, His Grace took his MRE from Gordon-Conwell Theological Seminary in S. Hamilton, Massachusetts, after that received his Ph.D. From Fordham University, and M. R. E from Gorden Conwell Theological Seminary, America. His Grace is well versed in different languages such as Malayalam, Greek and Syriac. His Grace took several key positions of the church as Professor, Orthodox Theological Seminary, Kottayam, Secretary, Ecumenical Relations Committee, General Secretary, Orthodox Vydikasangam, Co-Secretary, Orthodox – Catholic Church Dialogue, Delegate, W. C. C Commission of Educational and Ecumenical Formation, Representative of the Church in many international Conferences, Registrar, F.F.R.R.C, Dean, Doctoral Studies. He is elected as the Metropolitan candidate on 17th February at the Malankara Association held at Sasthamkotta. He is consecrated as Metropolitan on 12th May 2010 at Mar Elia Cathedral, Kottayam.His Grace is serving the Delhi Diocese as its Metropolitan.
                      </p>

                      <div className="mt-6 pt-6 border-t border-border">
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Address: Delhi Orthodox Centre, 2 Institutional Area, Tughlakabad, New Delhi 110 062.
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Mob: 9810791894.
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Email:mar.demetrios@gmail.com
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

export default HGDrYuhanonMarDemetriusMetropolitanPage;

import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '@/components/holy-synod/SynodMembersSidebar';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'H.G. Dr.Yuhanon Mar Thevodoros Metropolitan',
  description: 'Biography and information about H.G. Dr.Yuhanon Mar Thevodoros Metropolitan.',
};

const HGYuhanonMarTheodorusMetropolitanPage = () => {
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
                        src="/images/holy-synod/mar-thevodoros.jpg"
                        alt="H.G. Dr.Yuhanon Mar Thevodoros Metropolitan"
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
                      H.G. Dr.Yuhanon Mar Thevodoros Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        He is elected as the Metropolitan candidate on 17th February at the Malankara Association held at Sasthamkotta. He is consecrated as Metropolitan on 12th May 2010 at Mar Elia Cathedral, Kottayam.His Grace is serving the Kottarakara - Punalur Diocese as its Metropolitan.
                      </p>

                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        His Grace was born on 10-02-1953 as the son of hoppil Thekkathil George and Thankamma Mavelikkara Diocese. His Grace is a member of Mavelikkara Vazhuvady Mar Baselios Church.. After taking his ,Masters Degree he joined the Orthodox Theological Seminary, Kottayam, for theological studies. From the Orthodox Theological Seminary, Kottayam, he took Graduate Degree in Sacred Theology (GST) and the Bachelor of Divinity (BD) degree at the Senate of Serampore University. He took his M. Th from Serampore University.
                      </p>

                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        His Grace took several key positions of the church Principal, Mavelikkara Mission Training Centre, Secretary, Malankara Orthodox Church mission society, Superior, St. Pauls Ashram Puthuppady, Managing Editor, Doothan Magazine, Secretary, Snehasandesham Sanchara Suvishasha Sangam, Member, St. Gregorios Balagram Board Yacharam.
                      </p>

                      <div className="mt-6 pt-6 border-t border-border">
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Address: Kottapuram Seminary, Pulamon P.O., Kottarakara Mob: 9447471408
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Email: stpaulsmtc@yahoo.com
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

export default HGYuhanonMarTheodorusMetropolitanPage;

import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '@/components/holy-synod/SynodMembersSidebar';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'H.G. Yakob Mar Elias Metropolitan',
  description: 'Biography and information about H.G. Yakob Mar Elias Metropolitan.',
};

const HGYakoobMarEliasMetropolitanPage = () => {
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
                        src="/images/holy-synod/mar-eliyas.jpg"
                        alt="H.G. Yakob Mar Elias Metropolitan"
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
                      H.G. Yakob Mar Elias Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        He is elected as the Metropolitan candidate on 17th February at the Malankara Association held at Sasthamkotta. He is consecrated as Metropolitan on 12th May 2010 at Mar Elia Cathedral, Kottayam.His Grace is serving the Brahmavar Diocese as its Metropolitan.
                      </p>

                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        His Grace was born on 24-02-1953 as the son of Chackaleth Viruthiyath Kizhakkethil Mathai and Mariamma. His Grace is a member of St. Elias Orthodox Church, Budhanoor, Chengannoor Diocese. After taking his Masters Degree from Kerala University, he joined the Orthodox Theological Seminary, Kottayam, for theological studies. From the Orthodox Theological Seminary, Kottayam, he took Graduate Degree in Sacred Theology (GST) and the Bachelor of Divinity (BD) degree at the Senate of Serampore University.
                      </p>

                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        His Grace took several key positions of the church Position held – Manager, Mar Elia Chapel, Sasthamkotta, Director, St. Basil Bible School, Vice President, Orthodox Christian Youth Movement, Secretary, Kottayam Diocese, Member, Ecumenical Relations Committee.Member, Mission Tranining Centre, Member, Mavelikkara, Orthodox Bible Preparation Committee, Member, Malankara Sabha Editorial Board, Member, Oriental and Anglican Forum.
                      </p>

                      <div className="mt-6 pt-6 border-t border-border">
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Address: Mount Horeb Bishop\'s House, Balikashram Road, Kankanady, Mangalore - 575 002, Karnataka, India
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Email: metropolitanelias@yahoo.com Ph: 0824- 2013157, 09483530018
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

export default HGYakoobMarEliasMetropolitanPage;

import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '@/components/holy-synod/SynodMembersSidebar';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'H.G. Dr. Zacharias Mar Aprem Metropolitan',
  description: 'Biography and information about H.G. Dr. Zacharias Mar Aprem Metropolitan.',
};

const HGDrZachariasMarApremMetropolitanPage = () => {
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
                        src="/images/holy-synod/mar-aprem.jpg"
                        alt="H.G. Dr. Zacharias Mar Aprem Metropolitan"
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
                      H.G. Dr. Zacharias Mar Aprem Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        He is elected as the Metropolitan candidate on 17th February 2010 at the Malankara Association held at Sasthamkotta. He is consecrated Metropolitan on 12th May 2010 at Mar Elia Cathedral Kottayam by H H Baselios Marthoma Didymus I . His Grace is serving the Adoor - Kadampanad Diocese as its Metropolitan.
                      </p>

                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        His Grace was born as the son of E.K. Kuriakose and Sossama Kuriakose. His Grace is a member of St. George Valiyapally, Chungathara , Malabar Diocese. After taking his Bachelors Degree in Science from Malabar Christian College, Calicut, he joined the Orthodox Theological Seminary, Kottayam, for theological studies. From the Orthodox Theological Seminary, Kottayam, he took Graduate Degree in Sacred Theology (GST) and the Bachelor of Divinity (BD) degree at the Senate of Serampore University. After taking his M. Th from Gurukul Theological College & Research Institute Chennai ( Serampore University). He earn his D.Th from Sathri, Banglore under Serampore University in Advaita Vedanta.
                      </p>

                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        His Grace took several key positions of the church as Prof. OTS Ktm , Registrar, Orthodox Seminary, Principal Secretary to H.H Didymos I Catholicos , Cheif Editor Malankara Sabha Magazine, Member Ecumenical Relations Committee, Seminary Governing Board , Bible Society (Kerala auxilary). Now he is serving as the President of Senet of Serampore University, His Grace\'s major area of study is Religion & Philosphy . In addition to the responsibilities of the diocese His grace is working as the professor, Orthodox Theological seminary His Grace is a Good singer and writer.
                      </p>

                      <div className="mt-6 pt-6 border-t border-border">
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Address: Sreyas Aramana, Mar Epiphanios Centre, Kannamkodu, Adoor P.O Pathanamthitta- 691523
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Telephone No:9447184303, 04734 227117
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Email: 2010aprem@gmail.com
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

export default HGDrZachariasMarApremMetropolitanPage;

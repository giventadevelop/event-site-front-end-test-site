import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '@/components/holy-synod/SynodMembersSidebar';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'H. G. Abraham Mar Epiphanios Metropolitan',
  description: 'Biography and information about H. G. Abraham Mar Epiphanios Metropolitan.',
};

const HGAbrahamMarEpiphaniosPage = () => {
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
                        src="/images/holy-synod/mar-ephipanios.jpg"
                        alt="H. G. Abraham Mar Epiphanios Metropolitan"
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
                      H. G. Abraham Mar Epiphanios Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        His Grace was born on 17th September 1960 as the son of Mr. V. A. Oommen and Mrs. Gracy Oommen. His Grace is a member of St. Mary\'s Cathedral, Malaysia. His Grace had his education in Pathanamthitta Catholicate School and College, the Orthodox Theological Seminary and stands with his M.Th. degree from Serampore University. His Grace was ordained as deacon and Priest in 1986 and 1987 respectively; on 31st March 2002 His Grace became Ramban. His Grace has spent a long time in the Ashrams in Parumala and Madras from 1990 to 1996. His Grace served as Vicar of St. Thomas Cathedral from 1996 to 2002. Thereafter His Grace served as the Manager of Bishop\'s House, Madras in 2003 From 2004-2006 His Grace was served as the Manager at Parumala Seminary and Devalokam Catholicate Aramana. His Grace is serving the Mavelikara Diocese as its Metropolitan.
                      </p>

                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        His Grace is serving the Mavelikara Diocese as its Metropolitan.
                      </p>

                      <div className="mt-6 pt-6 border-t border-border">
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Address: Theobhavan Aramana, Thazhakara – Post, Mavelikara, Kerala - 690102
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Mob: 9447908814
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Email: marepiphanios@gmail.com
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Address: Theobhavan Aramana, Thazhakara – Post, Mavelikara, Kerala - 690102
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Email: marepiphanios@gmail.com
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

export default HGAbrahamMarEpiphaniosPage;

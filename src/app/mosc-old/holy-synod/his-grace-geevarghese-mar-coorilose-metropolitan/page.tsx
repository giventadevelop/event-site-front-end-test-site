import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '@/components/holy-synod/SynodMembersSidebar';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'H.G.Geevarghese Mar Coorilos Metropolitan',
  description: 'Biography and information about H.G.Geevarghese Mar Coorilos Metropolitan.',
};

const HisGraceGeevargheseMarCooriloseMetropolitanPage = () => {
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
                        src="/images/holy-synod/coor.jpg"
                        alt="H.G.Geevarghese Mar Coorilos Metropolitan"
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
                      H.G.Geevarghese Mar Coorilos Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        His Grace was born on 7 October 1949 at Kollad, near Kottayam, to Mr PK Kurian and Mrs Mary Kurian of the Puliyeril family. After his schooling, young George had his pre-degree studies at CMS College Kottayam. He took his bachelors in arts from the Calicut University and MA from Sree Venkateshwara University. He did his BD from Orthodox Theological Seminary, Kottayam, and got post-graduate diploma in Pastoral Theology from Heythrop College London University and post-graduate diploma in Theology and Mission from Urban Theology Unit, Shefield, UK.
                      </p>

                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        He was elected to the Episcopal rank in 1989 and thus became a monk in 1990 and was subsequently ordained in 1991. Soon, he was appointed as the Assistant Metropolitan, Mumbai Dioceses, and worked steadfast with late Dr Philipose Mar Theophilus for the progress of the Mumbai Diocese.
                      </p>

                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        His Grace has held many positions in the church and other Christian societies. He had attended many international conferences and interacted with many communities such as NCCI, CASA, WCC, and CMAI.
                      </p>

                      <div className="mt-6 pt-6 border-t border-border">
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          He was ordained a sub-deacon in 1970 and a deacon in 1974 by Catholicos HH Baselios Mathews I. Dn George became a priest in 1975 and served as Vicar, St Gregorios Church, London. He is known for his works among students and thus was serving the MGOCSM as general secretary for almost a decade. This paved way for Fr George to visit many foreign countries.
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Present Address: Bombay Orthodox Church Centre, Dr.Mar Theophilus Marg, Sector X-A, Vashi, Juhu Nagar, Navi Mumbai - 400 703 Tel.: 022-27669850, 022-27801427 , Mob: 09820333379 E-mail: orthodox77@hotmail.com, marcoorilos@yahoo.com
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

export default HisGraceGeevargheseMarCooriloseMetropolitanPage;

import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '@/components/holy-synod/SynodMembersSidebar';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'H.G.Yuhanon Mar Policarpos Metropolitan',
  description: 'Biography and information about H.G.Yuhanon Mar Policarpos Metropolitan.',
};

const HGYouhanonMarPolycarpusMetropolitanPage = () => {
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
                        src="/images/holy-synod/poly.jpg"
                        alt="H.G.Yuhanon Mar Policarpos Metropolitan"
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
                      H.G.Yuhanon Mar Policarpos Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        His Grace was born on 30th March 1955 as the son of Mr.P.V.Zachariah and Mrs.Annamma Zachariah of Panniyankara Parakunnil family in Vadakkanchery, Palakkad. His Grace is a member of Mar.Gregorios Church, Thenidukku. His Grace had his schooling in AbhayakkadChami Iyer High School, and graduated from S.N.College Alathoor. His Grace took his Masters degree in Sociology from the University of Kerala. His Grace learned Syriac from Very Rev.Thomas Ramban during the period 1973 – 1974. His Grace passed G.S.T in 1978 and B D in 1979 from the Orthodox Theological Seminary. His Grace ordained sub-deacon on 25th March 1977, deacon on 8th December and priest on 7th January 1980. His Grace was ordained as Ramban by his Holiness Baselius Marthoma Didimus Catholicos. His Grace received a diploma in 1990 from Geneeva.
                      </p>

                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        His Grace served the church in several capacities – Sunday School Director; Cochin Diocese, Koratty Sion Seminary Manager, Parumala Seminary Manager, C.M.I Kerala Region Chaplain,Vettikal Health centre Director, Thalakkod St.Mary’s Boy’s Home Director & Board Member, Kolenchery Medical College Chaplain and Governing Body Member, Founder and Principal of Baselius Vidya Nikethan till 2006.He is serving the Ankamaly Diocese as its Metropolitan.
                      </p>

                      <div className="mt-6 pt-6 border-t border-border">
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Address: Thrikkunnathu Seminary PB NO.61, Aluva-683101.
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          ph: 0484 2622339 Mob: 94474 75544
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          email: marpolicarpos@yahoo.com
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

export default HGYouhanonMarPolycarpusMetropolitanPage;

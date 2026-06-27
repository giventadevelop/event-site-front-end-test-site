import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '@/components/holy-synod/SynodMembersSidebar';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'H. G. Mathews Mar Theodosius Metropolitan',
  description: 'Biography and information about H. G. Mathews Mar Theodosius Metropolitan.',
};

const HGMathewsMarTheodosiusPage = () => {
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
                        src="/images/holy-synod/thevo.jpg"
                        alt="H. G. Mathews Mar Theodosius Metropolitan"
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
                      H. G. Mathews Mar Theodosius Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        His Grace was born on 15th September 1955 as the eldest son of Mr.P.M.George and Mrs. Aleyamma George of Punchayil family in Pandankary, Edathua, Alapuzha. His Grace is a member of St. Mary\'s Orthodox Church, Padankary.
                      </p>

                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        His Grace’s early education was in Thalavady. After passing the S. S. L. C. Examination His Grace became a member of Perunad Bethany Ashram. Graduating in English literature as a student of Baselius College Kottayam, His Grace joined the Orthodox Theological Seminary, took his B. D. degree and was ordained as a priest in 1982.
                      </p>

                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        His Grace took M. A. in History from the University of Kerala and B.Ed. from Sardar Patel University. His Grace was the Principal of Bethany St. John\'s Higher Secondary School during the period between 1987 and 1996. His Grace had been the President of Perunad YMCA for a long time. His Grace is the Secretary of the Sanyasi-Sanyasini Sangham of the Malankara Orthodox Church.
                      </p>

                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        From 1996 His Grace has been the Superior of Bethany Ashram. His Grace has also served as the Manager of Angamuzhy Orthodox Centre and member of the Ecumenical Trust. His Grace was ordained as Ramban at Parumala on 4th December. His Grace was ordinated as bishop on 19 feb 2009 at Puthupally st george orthodox church.
                      </p>

                      <div className="mt-6 pt-6 border-t border-border">
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Email: mathewsmartheodosius@gmail.com
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

export default HGMathewsMarTheodosiusPage;

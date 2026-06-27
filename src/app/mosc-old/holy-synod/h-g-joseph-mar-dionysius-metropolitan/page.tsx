import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '@/components/holy-synod/SynodMembersSidebar';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata = {
  title: 'H.G.Dr. Joseph Mar Dionysius Metropolitan',
  description: 'Biography and information about H.G.Dr. Joseph Mar Dionysius Metropolitan.',
};

const HGJosephMarDionysiusMetropolitanPage = () => {
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
                        src="/images/holy-synod/cul.jpg"
                        alt="H.G.Dr. Joseph Mar Dionysius Metropolitan"
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
                      H.G.Dr. Joseph Mar Dionysius Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-body text-muted-foreground leading-relaxed mb-4">
                        His Grace was born on 15th June 1956 as the son of Mr. T. V. Mathai and Mrs. Aleyamma Mathai of Thekkil Kandathil family in Valanjavattom, Thiruvalla and a member of St. Mary\'s Orthodox Church, Valanjavattom in Niranam Diocese. Mar Dionysius became a member of Mount Tabor Ashram on 15th July 1971. He stood first in the Master\'s Degree Exam of Madras University and won the “Chithanass" award and the gold medal in 1981. His Grace took the M. Phil, Ph. D. Degrees from the University of Kerala and his B.D. degree from the University of Serampore. His Grace was ordained deacon in July 1980. He was ordained as a priest on 4th December 1985. He got Certificate in Advanced Christian Leadership Studies from the Haggai International Institute, Singapore in 2006, Honorary D-Lit Conferred by University of South America in 2017. His Grace took his MTH in Missiology from Faith Theological Seminary, recognized by Higher Education Department Govt. of Nagaland in 2019. His Grace was served as the Metropolitan of Calcutta Diocease from 2009 to 2022, and also served as the Director of St. Thomas Mission Bilai. His Grace also served as the Asst. Metropolitan of Delhi Diocese from 2009 – 2010. His Grace had been teaching in the Dept. of Zoology at St. Stephen\'s College Pathanapuram. From 2000, His Grace had been the director of the research department of Zoology. His Grace won the “Man of the year" award from American Biographical Institute in 2003 and St. Berchman\'s award for the Best University Teacher in 2008. His Grace is ever active as a guide and mentor in meditation, preacher, researcher and ecological theologian.H.G is the visiting faculty of St. Thomas Orthodox Theological Seminary Nagpur. H.G currently serves as the President of Orthodox Syrian Sunday School Association of the East, President of Akhila Malankara Balasamajam and President of Ecological Commission.
                      </p>

                      <div className="mt-6 pt-6 border-t border-border">
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Address: Bishops House, Cross Junction, Kollam, 691 001
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Mob: 9425553147, 9446181314
                        </p>
                        <p className="font-body text-muted-foreground leading-relaxed mb-2">
                          Email: josephdionysius@gmail.com
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

export default HGJosephMarDionysiusMetropolitanPage;

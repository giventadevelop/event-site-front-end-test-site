import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '../../components/SynodMembersSidebar';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'H.G. Dr. Joseph Mar Dionysius Metropolitan',
  description: 'His Grace Dr. Joseph Mar Dionysius, Metropolitan. Former Metropolitan of Calcutta Diocese; President of Orthodox Syrian Sunday School Association of the East, Akhila Malankara Balasamajam, and Ecological Commission.',
};

const HGJosephMarDionysiusMetropolitanPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="H.G. Dr. Joseph Mar Dionysius Metropolitan"
        breadcrumbFrom="holy-synod"
      />
      {/* Main Content */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                {/* Featured Image - Top */}
                <div className="mb-8 flex justify-center">
                  <Image src="/images/holy-synod/cul.jpg" alt="H.G. Dr. Joseph Mar Dionysius Metropolitan" width={125} height={75} className="rounded-lg w-full max-w-[125px] h-auto object-contain" priority />
                  </div>

                {/* Content - Below Image */}
                <div>
                    <h3 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                      H.G. Dr. Joseph Mar Dionysius Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        His Grace was born on 15th June 1956 as the son of Mr. T. V. Mathai and Mrs. Aleyamma Mathai of Thekkil Kandathil family in Valanjavattom, Thiruvalla and a member of St Mary’s Orthodox Church, Valanjavattom in Niranam Diocese. Mar Dionysius became a member of Mount Tabor Ashram on 15th July 1971. He stood first in the Master’s Degree Exam of Madras University and won the “Chithanass" award and the gold medal in 1981. His Grace took the M. Phil, Ph. D. Degrees from the University of Kerala and his B.D. degree from the University of Serampore. His Grace was ordained deacon in July 1980. He was ordained as a priest on 4th December 1985. He got Certificate in Advanced Christian Leadership Studies from the Haggai International Institute, Singapore in 2006, Honorary D-Lit Conferred by University of South America in 2017. His Grace took his M.Th. in Missiology from Faith Theological Seminary, recognized by Higher Education Department Govt. of Nagaland in 2019. His Grace served as the Metropolitan of Calcutta Diocese from 2009 to 2022, and also served as the Director of St. Thomas Mission Bilai. His Grace also served as the Asst. Metropolitan of Delhi Diocese from 2009 – 2010. His Grace had been teaching in the Dept. of Zoology at St Stephen’s College Pathanapuram. From 2000, His Grace had been the director of the research department of Zoology. His Grace won the “Man of the year" award from American Biographical Institute in 2003 and St Berchman’s award for the Best University Teacher in 2008. His Grace is ever active as a guide and mentor in meditation, preacher, researcher and ecological theologian. H.G. is the visiting faculty of St. Thomas Orthodox Theological Seminary Nagpur. H.G. currently serves as the President of Orthodox Syrian Sunday School Association of the East, President of Akhila Malankara Balasamajam and President of Ecological Commission.
                      </p>

                      <h4 className="font-syro-display font-semibold text-lg text-syro-blue mt-8 mb-3">
                        Contact
                      </h4>
                      <div className="font-syro-primary text-syro-dark-gray leading-relaxed space-y-1">
                        <p>Bishops House, Cross Junction, Kollam – 691 001</p>
                        <p>Mob: 9425553147, 9446181314</p>
                        <p>
                        Email:{' '}
                        <a
                          href="mailto:josephdionysius@gmail.com"
                          className="text-syro-blue hover:underline focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2 rounded"
                        >
                          josephdionysius@gmail.com
                        </a>
                      </p>
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
            <div className="space-y-6 lg:col-span-1">
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

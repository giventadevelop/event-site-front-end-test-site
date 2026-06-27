import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '../../components/SynodMembersSidebar';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'H. G. Mathews Mar Theodosius Metropolitan',
  description: 'His Grace Mathews Mar Theodosius, Metropolitan. Superior of Bethany Ashram; Secretary of Sanyasi-Sanyasini Sangham; former Principal of Bethany St John’s Higher Secondary School.',
};

const HGMathewsMarTheodosiusPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="H. G. Mathews Mar Theodosius Metropolitan"
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
                  <Image src="/images/holy-synod/thevo.jpg" alt="H. G. Mathews Mar Theodosius Metropolitan" width={125} height={75} className="rounded-lg w-full max-w-[125px] h-auto object-contain" priority />
                  </div>

                {/* Content - Below Image */}
                <div>
                    <h3 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                      H. G. Mathews Mar Theodosius Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        His Grace was born on 15th September 1955 as the eldest son of Mr P.M. George and Mrs Aleyamma George of Punchayil family in Pandankary, Edathua, Alapuzha. His Grace is a member of St Mary’s Orthodox Church, Padankary.
                      </p>

                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        His Grace’s early education was in Thalavady. After passing the S. S. L. C. Examination His Grace became a member of Perunad Bethany Ashram. Graduating in English literature as a student of Baselius College Kottayam, His Grace joined the Orthodox Theological Seminary, took his B. D. degree and was ordained as a priest in 1982.
                      </p>

                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        His Grace took M.A. in History from the University of Kerala and B.Ed. from Sardar Patel University. His Grace was the Principal of Bethany St John’s Higher Secondary School during the period between 1987 and 1996. His Grace had been the President of Perunad YMCA for a long time. His Grace is the Secretary of the Sanyasi-Sanyasini Sangham of the Malankara Orthodox Church.
                      </p>

                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        From 1996 His Grace has been the Superior of Bethany Ashram. His Grace has also served as the Manager of Angamuzhy Orthodox Centre and member of the Ecumenical Trust. His Grace was ordained as Ramban at Parumala on 4th December. His Grace was ordained as bishop on 19 February 2009 at Puthupally St George Orthodox Church.
                      </p>

                      <h4 className="font-syro-display font-semibold text-lg text-syro-blue mt-8 mb-3">
                        Contact
                      </h4>
                      <div className="font-syro-primary text-syro-dark-gray leading-relaxed space-y-1">
                        <p>
                        Email:{' '}
                        <a
                          href="mailto:mathewsmartheodosius@gmail.com"
                          className="text-syro-blue hover:underline focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2 rounded"
                        >
                          mathewsmartheodosius@gmail.com
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

export default HGMathewsMarTheodosiusPage;

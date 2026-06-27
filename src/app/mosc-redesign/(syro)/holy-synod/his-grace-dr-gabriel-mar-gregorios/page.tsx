import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '../../components/SynodMembersSidebar';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'H.G. Dr. Gabriel Mar Gregorios Metropolitan',
  description: 'His Grace Dr. Gabriel Mar Gregorios, Metropolitan of Trivandrum Diocese. Scholar in Biblical studies, former professor at Orthodox Seminary, Kottayam.',
};

const HisGraceDrGabrielMarGregoriosPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="H.G. Dr. Gabriel Mar Gregorios Metropolitan"
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
                  <Image src="/images/holy-synod/mar-gregorios.jpg" alt="H.G. Dr. Gabriel Mar Gregorios Metropolitan" width={125} height={75} className="rounded-lg w-full max-w-[125px] h-auto object-contain" priority />
                  </div>

                {/* Content - Below Image */}
                <div>
                    <h3 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                      H.G. Dr. Gabriel Mar Gregorios Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        His Grace was born on 10 February 1948 to Mr CM John and Mrs Aleyamma John, Vadakethazhethil, Kanjickal. He did schooling at St Stephen’s High School, Pathanapuram. He pursued his BA from Kerala University in English Literature. Subsequent to that, he joined the Serampore University and took his BD degree in 1974. He did his MTh from the Catholic University, Paris. His Grace pursued successfully a three-year Diploma Course in Biblical Hebrew, a two-year certificate course in Aramaic and advanced course in Biblical Greek at the Catholic University, Paris. His Grace also did Doctoral Research at the Lutheran School of Theology at Chicago on the topic “The Glory of God in St Paul” and took his PhD in New Testament from the Serampore University. He further did his Doctoral Research at the University of Cambridge. His Grace was ordained a deacon on 4 November 1969 by HH Mar Baselios Augen I. HH Baselios Mathews I ordained Dn Gabriel as priest on 8 January 1974. He distinctly served as vicar of many parishes such as Chenganachery, Jaipur, Dehuroad, Kuzhimattom, Mundakayam, Kanakappalam, Odanavattom Nellikunnam, and Pooyapally. He was a Professor at Orthodox Seminary, Kottayam. He was professed as a Monk on 7 August 2004 by HH Baselios Mathews II. The Malankara Syrian Christian Association met on 10 June 2004 at the Parumala Seminary, elected Fr Gabriel as a candidate to be ordained to the Episcopal Order and was ordained on 5 March 2005 by HH Baselios Mathews II. At present, His Grace is looking after the Trivandrum Diocese, which is very critical to the church in many ways.
                      </p>

                      <h4 className="font-syro-display font-semibold text-lg text-syro-blue mt-8 mb-3">
                        Contact
                      </h4>
                      <div className="font-syro-primary text-syro-dark-gray leading-relaxed space-y-1">
                        <p>Orthodox Church Centre, Ulloor, Trivandrum, Kerala – 695 011</p>
                        <p>Tel.: 0471-2442509 / 2552509 | Fax: 0471-2442509 | Cell: 9447166857</p>
                        <p>E-mail: gabrielmargregorios@gmail.com</p>
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

export default HisGraceDrGabrielMarGregoriosPage;

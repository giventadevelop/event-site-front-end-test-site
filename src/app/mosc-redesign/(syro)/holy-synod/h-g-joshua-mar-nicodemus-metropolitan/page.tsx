import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '../../components/SynodMembersSidebar';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'H. G. Dr. Joshua Mar Nicodimos Metropolitan',
  description: 'His Grace Dr. Joshua Mar Nicodimos, Metropolitan of Ranni–Nilackal Diocese. Superior, Holy Trinity Ashram, Angadi; President, Akhila Malankara Balasamajam; Doctor of Divinity (honoris causa), General Theological Seminary, New York.',
};

const HGJoshuaMarNicodemusMetropolitanPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="H. G. Dr. Joshua Mar Nicodimos Metropolitan"
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
                  <Image src="/images/holy-synod/mar-nicodimos.jpg" alt="H. G. Dr. Joshua Mar Nicodimos Metropolitan" width={125} height={75} className="rounded-lg w-full max-w-[125px] h-auto object-contain" priority />
                  </div>

                {/* Content - Below Image */}
                <div>
                    <h3 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                      H. G. Dr. Joshua Mar Nicodimos Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        His Grace was born on 8 October 1962 as the youngest son of Mr. Philipose Mathai and Mrs. Thankamma Mathai, Sankarathil Nediyavilayil, Kurampala, Pandalam. His home parish is St. Thomas Orthodox Valiyapally, Kurampala, Pandalam, in the diocese of Chengannoor. After completing formal education he secured M.A. in Sociology from Kerala University. He joined the Orthodox Theological Seminary, Kottayam, in 1982 and received the GST and B.D. degrees. In 1996 he received the S.T.M. from General Theological Seminary, New York, and in 2007 completed M.Th. in Spiritual Theology from the Indian Institute of Spirituality, Bangalore. In 1978 he joined the Holy Trinity Ashram, Angadi, Ranni, founded by H.G. Geevarghese Mar Dioscorus, as its first member. He became Korooyo in 1981 and Yaupadyakno in 1985. He was ordained full deacon on 27 April 1986 and priest on 1 November 1986 by H.G. Geevarghese Mar Dioscorus Metropolitan. He served as vicar of three parishes in Trivandrum and five parishes in the American dioceses from 1987 to 2003, and as Secretary to H.G. Geevarghese Mar Dioscorus at Trivandrum and H.G. Mathews Mar Barnabas Metropolitan in America. He served as Aramana Chaplain at Ulloor, Trivandrum, and manager of the American Diocese office in New York from 1988 to 2003. Upon the demise of Geevarghese Mar Dioscorus Metropolitan, he became Superior of the Holy Trinity Ashram in 1999 and continued until 2010. He was elevated as Yoohanon Ramban on 12 December 2003 by H.H. Baselios Marthoma Mathews II, the Catholicos. The Malankara Association held at Sasthamkotta on 17 February 2010 elected Yoohanon Ramban as bishop candidate, and on 12 May 2010 H.H. Baselios Marthoma Didymos I, the Catholicos, consecrated him as Metropolitan with the name Joshua Mar Nicodimos at Mar Elia Cathedral, Kottayam. On 15 August 2010 Joshua Mar Nicodimos was appointed as the first Metropolitan of the newly formed Nilackal Diocese. On 18 May 2011 the General Theological Seminary, New York, at its 188th Annual Commencement conferred upon him the degree of Doctor of Divinity, honoris causa. In February 2012 the Holy Episcopal Synod appointed him President of the Akhila Malankara Balasamajam. His Grace is serving the Ranni–Nilackal Diocese as its Metropolitan.
                      </p>

                      <h4 className="font-syro-display font-semibold text-lg text-syro-blue mt-8 mb-3">
                        Contact
                      </h4>
                      <div className="font-syro-primary text-syro-dark-gray leading-relaxed space-y-1">
                        <p>Nilackal Orthodox Diocesan Centre, St. Thomas Aramana, Pazhavangadi P.O., Ranni, Pathanamthitta – 689 673</p>
                        <p>Mobile: 9446600671</p>
                        <p>
                        Email:{' '}
                        <a
                          href="mailto:marnicodimos@gmail.com"
                          className="text-syro-blue hover:underline focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2 rounded"
                        >
                          marnicodimos@gmail.com
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

export default HGJoshuaMarNicodemusMetropolitanPage;

import React from 'react';
import Image from 'next/image';
import SynodMembersSidebar from '../../components/SynodMembersSidebar';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'H.G. Dr. Yuhanon Mar Thevodoros Metropolitan',
  description: "His Grace Dr. Yuhanon Mar Thevodoros, Metropolitan of Kottarakara–Punalur Diocese. Principal, Mavelikkara Mission Training Centre; Superior, St. Paul's Ashram Puthuppady; Managing Editor, Doothan Magazine.",
};

const HGYuhanonMarTheodorusMetropolitanPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="H.G. Dr. Yuhanon Mar Thevodoros Metropolitan"
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
                  <Image src="/images/holy-synod/mar-thevodoros.jpg" alt="H.G. Dr. Yuhanon Mar Thevodoros Metropolitan" width={125} height={75} className="rounded-lg w-full max-w-[125px] h-auto object-contain" priority />
                  </div>

                {/* Content - Below Image */}
                <div>
                    <h3 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                      H.G. Dr. Yuhanon Mar Thevodoros Metropolitan
                    </h3>

                    <div className="prose prose-lg max-w-none">
                      <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                        His Grace was born on 10 February 1953 as the son of Hoppil Thekkathil George and Thankamma, Mavelikkara Diocese. He is a member of Mavelikkara Vazhuvady Mar Baselios Church. After taking his Master&apos;s degree he joined the Orthodox Theological Seminary, Kottayam, for theological studies. From the Orthodox Theological Seminary, Kottayam, he received the Graduate Degree in Sacred Theology (GST) and the Bachelor of Divinity (B.D.) from the Senate of Serampore University, and his M.Th. from Serampore University. His Grace has held several key positions in the Church: Principal, Mavelikkara Mission Training Centre; Secretary, Malankara Orthodox Church Mission Society; Superior, St. Paul&apos;s Ashram Puthuppady; Managing Editor, Doothan Magazine; Secretary, Snehasandesham Sanchara Suvishasha Sangam; Member, St. Gregorios Balagram Board, Yacharam. He was elected as Metropolitan candidate on 17 February at the Malankara Association held at Sasthamkotta, and was consecrated as Metropolitan on 12 May 2010 at Mar Elia Cathedral, Kottayam. His Grace is serving the Kottarakara–Punalur Diocese as its Metropolitan.
                      </p>

                      <h4 className="font-syro-display font-semibold text-lg text-syro-blue mt-8 mb-3">
                        Contact
                      </h4>
                      <div className="font-syro-primary text-syro-dark-gray leading-relaxed space-y-1">
                        <p>Kottapuram Seminary, Pulamon P.O., Kottarakara</p>
                        <p>Mobile: 9447471408</p>
                        <p>
                        Email:{' '}
                        <a
                          href="mailto:stpaulsmtc@yahoo.com"
                          className="text-syro-blue hover:underline focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2 rounded"
                        >
                          stpaulsmtc@yahoo.com
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

export default HGYuhanonMarTheodorusMetropolitanPage;

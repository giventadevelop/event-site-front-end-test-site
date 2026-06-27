import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '../../components/QuickLinks';
import DiocesesSidebar from '../DiocesesSidebar';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'Diocese of Thrissur',
  description: 'Learn about the Diocese of Thrissur of the Malankara Orthodox Syrian Church.',
};

const dioceseofthrissurPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Diocese of Thrissur" breadcrumbFrom="dioceses" />

      {/* Main Content */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                {/* Featured Image - centered, contained (administration style) */}
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/dioceses/thrissur_diocese.png"
                    alt="Diocese of Thrissur"
                    width={175} height={175}
                    className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    Diocese of Thrissur
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The diocese was formed in 1982 with parishes in Thrissur and Palakkad districts. At the time of the formation of the diocese there were 32 parishes and 26 priests.The first metropolitan with independent charge of the diocese assumed the office on 26 December 1990. The present diocesan headquarters was completed in 1995. The consecration of the headquarters was done on July 20, 1995.The headquarters of the diocese is at Mannuthy.The Diocese leads to new vision under the spiritualÂ  leadership of H.G. Yuhanon Mar Meletius Metropolitan
                    </p>
                  <div className="mt-8 flex max-w-xl overflow-hidden rounded-lg border border-syro-table-border bg-syro-bg-gray shadow-syro-card">
                    <div className="w-[7px] flex-shrink-0 bg-syro-red" aria-hidden="true" />
                    <div className="flex-1 p-5 font-syro-primary text-syro-dark-gray leading-relaxed space-y-2 text-sm">
                      <p className="mb-1">
                        <span className="font-semibold">Office:</span>
                        <br />
                        Gedseemon Seminary, Mannuthy,
                        <br />
                        Trissur 680 651.
                      </p>
                      <p>
                        <span className="font-semibold">Phone:</span> 0487 2371039, 2371748
                      </p>
                      <p>
                        <a
                          href="https://maps.app.goo.gl/6iG8eUaocYz7Da2W8"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="syro-primary-button inline-flex items-center gap-2 w-fit"
                        >
                          <span>View on Map</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Quick Links - below content (desktop, same as administration) */}
              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6 lg:col-span-1">
              <DiocesesSidebar />
            </div>
          </div>
          <div className="mt-8 lg:hidden">
            <QuickLinks />
          </div>
        </div>
      </section>
    </div>
  );
};

export default dioceseofthrissurPage;
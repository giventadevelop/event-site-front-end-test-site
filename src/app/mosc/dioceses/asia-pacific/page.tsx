import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../components/QuickLinks';
import DiocesesSidebar from '../DiocesesSidebar';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'ASIA PACIFIC',
  description: 'Contact and office information for the Asia Pacific diocese of the Malankara Orthodox Syrian Church.',
};

const AsiaPacificPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="ASIA PACIFIC" breadcrumbFrom="dioceses" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/dioceses/asia-pacific-diocese.webp"
                    alt="ASIA PACIFIC"
                    width={175}
                    height={175}
                    className="rounded-lg object-contain"
                    style={{ width: '175px', height: '175px' }}
                    priority
                  />
                </div>

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    ASIA PACIFIC
                  </h2>

                  <div className="font-syro-primary text-syro-dark-gray leading-relaxed space-y-4">
                    <p className="mb-2">
                      <span className="font-semibold">Office:</span>
                      <br />
                      301/38 Oakden Street, Green Way
                      <br />
                      ACT, 2900, Canberra, Australia
                    </p>
                    <p className="mb-2">
                      <span className="font-semibold">Email:</span>{' '}
                      <a
                        href="mailto:asiapacificdiocese@gmail.com"
                        className="text-syro-blue hover:underline"
                      >
                        asiapacificdiocese@gmail.com
                      </a>
                    </p>
                    <p className="mb-2">
                      <span className="font-semibold">Phone:</span> +61 411 867 070
                    </p>
                    <p className="mb-6">
                      <a
                        href="https://maps.app.goo.gl/zFtLT6ZCji9KxfrU8"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="syro-primary-button inline-flex items-center gap-2"
                      >
                        <span>View on Map</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

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

export default AsiaPacificPage;

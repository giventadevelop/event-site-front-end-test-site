import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '../../components/QuickLinks';
import DiocesesSidebar from '../DiocesesSidebar';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'Diocese of Bombay',
  description: 'Learn about the Diocese of Bombay of the Malankara Orthodox Syrian Church.',
};

const dioceseofmumbaiPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Diocese of Bombay" breadcrumbFrom="dioceses" />

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
                    src="/images/dioceses/diocese-of-mumbai.jpg"
                    alt="Diocese of Bombay"
                    width={175} height={175}
                    className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    Diocese of Bombay
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The Diocese of Bombay was carved out of the outside Kerala diocese of the Malankara Orthodox Syrian Church in the year 1976.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      His grace Dr. Thomas Mar Makarios was the first Metropolitan with the headquarters as St.Mary's Church, Dadar. The diocese made rapid strides during the tenure if His grace Late Lamented Dr. Philipose Mar Theophilus who took over from Mar Makarios who moved to then newly formed Diocese in the year 1979. Mar Theophilus initially established his headquarters near St. Gregorios Church ,Chembur before moving out in the year 1988 to the present headquarters at the orthodox church centre, Vashi, Navi Mumbai.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Today the Diocese had grown to be a giant among the rest of the dioceses in many ways and more than 70 churches, schools, clinics, hostels etc are efficiently managed by about 50 sincere and dedicated priests along with the lay representatives opportunely
                    </p>
                  <div className="mt-8 flex max-w-xl overflow-hidden rounded-lg border border-syro-table-border bg-syro-bg-gray shadow-syro-card">
                    <div className="w-[7px] flex-shrink-0 bg-syro-red" aria-hidden="true" />
                    <div className="flex-1 p-5 font-syro-primary text-syro-dark-gray leading-relaxed space-y-2 text-sm">
                      <p className="mb-1">
                        <span className="font-semibold">Office:</span>
                        <br />
                        Orthodox Church Centre,
                        <br />
                        Dr. Mar Theophilus Marg,
                        <br />
                        Sector 10-A, Vashi, Juhu Nagar,
                        <br />
                        New Mumbai-400703
                      </p>
                      <p>
                        <span className="font-semibold">Phone:</span> 022 27801427, 27669850
                      </p>
                      <p>
                        <span className="font-semibold">E-mail:</span>{' '}
                        <a href="mailto:bombayaramana@gmail.com" className="text-syro-red hover:underline font-medium">bombayaramana@gmail.com</a>
                      </p>
                      <p>
                        <a
                          href="https://maps.app.goo.gl/tNeA8K4PTzanVnS1A"
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

export default dioceseofmumbaiPage;
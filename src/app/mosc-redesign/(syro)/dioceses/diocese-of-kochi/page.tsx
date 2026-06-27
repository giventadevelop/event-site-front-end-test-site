import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '../../components/QuickLinks';
import DiocesesSidebar from '../DiocesesSidebar';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'Diocese of Kochi',
  description: 'Learn about the Diocese of Kochi of the Malankara Orthodox Syrian Church.',
};

const dioceseofkochiPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Diocese of Kochi" breadcrumbFrom="dioceses" />

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
                    src="/images/dioceses/diocese-of-kochi.jpg"
                    alt="Diocese of Kochi"
                    width={175} height={175}
                    className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    Diocese of Kochi
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      KochiÂ  is one of the most prominentÂ Diocese throghout the hstory of Malankara Orthodox church. The DioceseÂ  of kochi is formed in 1876. The then formed , malabar, kunnamkuklam,Â  Sulthan Bathery are part of the Kochi Diocese.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Kodungalloor, the historical place where St.Thomas came on Ad 52, is with in the jurisdiction of Kochi Diocese. Among the Major churches established by St.Thomas such as Paloor, Malliankara,,Gokkamangalam are inside the area limit of this diocese.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      Important Historical events of malankara Church such as The Synod of Diampor(1599), Coonan Cross Oath (1653), The Mulamthuruthy Synod(1876)Â  are held in different places of Kochi Diocese.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      The first metroplitan of Kochi Diocese was tha Late Lamented Simeon Mar Dionysios Metropolitan. After the death of mar Dionysius , the Malankara Metropolitan H.G.Joseph Mar Dionysios Metropoltan took the charge.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      In 1958,when the Supreme Court verdict came,H.G.Paulose mar Severios was appointed as the Metropolitan of Kochi Diocese. The Present head quarters of the Kochi Diocese, The Zion Seminary was buit by H.G.Paulose mar Severios Metropolitan.
                    </p>
                  <div className="mt-8 flex max-w-xl overflow-hidden rounded-lg border border-syro-table-border bg-syro-bg-gray shadow-syro-card">
                    <div className="w-[7px] flex-shrink-0 bg-syro-red" aria-hidden="true" />
                    <div className="flex-1 p-5 font-syro-primary text-syro-dark-gray leading-relaxed space-y-2 text-sm">
                      <p className="mb-1">
                        <span className="font-semibold">Office:</span>
                        <br />
                        Zion Seminary, Koratty East P.O.,
                        <br />
                        Chirangara, Chalakkudy - 680 308.
                      </p>
                      <p>
                        <span className="font-semibold">Phone:</span> 0480 2732023, 2734818
                      </p>
                      <p>
                        <span className="font-semibold">E-mail:</span>{' '}
                        <a href="mailto:sionseminary@gmail.com" className="text-syro-red hover:underline font-medium">sionseminary@gmail.com</a>
                      </p>
                      <p>
                        <a
                          href="https://maps.app.goo.gl/3nE5uZRRKHmd82ej7"
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

export default dioceseofkochiPage;
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '../../components/QuickLinks';
import DiocesesSidebar from '../DiocesesSidebar';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'Diocese of Adoor â€“ Kadampanadu',
  description: 'Learn about the Diocese of Adoor â€“ Kadampanadu of the Malankara Orthodox Syrian Church.',
};

const dioceseofadoorkadampanaduPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Diocese of Adoor â€“ Kadampanadu" breadcrumbFrom="dioceses" />

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
                    src="/images/dioceses/kadampanadu diocese.jpg"
                    alt="Diocese of Adoor â€“ Kadampanadu"
                    width={175} height={175}
                    className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    Diocese of Adoor &#8211; Kadampanadu
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      One of the fastest growing Diocese of Malankara Orthodox Church whichÂ  came into existence by the Kalpana of His Holiness Moran Mar Baselios Marthoma Didymus-1, Catholicose of the East & Malankara Metropolitan.The Diocese started functioning on August 15, 2010. The new diocese is formedÂ  by taking churches from kollam diocese and consists of ... parishes.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      H.G. Zacharias mar Aprem appointed as the first metropolitanÂ  of Adoor - Kadampanadu diocese.Under the Spiritual Guidance and friutful leadership of mar Aprem Metropolitan ,the diocese started a couple of Spiritual and charitable initiatives.More over the diocese runs Sreyas Art and Graphics Dept., Sreyas Art and Theology Dept.,Sreyas Old age and retirement home etc.
                    </p>
                  <div className="mt-8 flex max-w-xl overflow-hidden rounded-lg border border-syro-table-border bg-syro-bg-gray shadow-syro-card">
                    <div className="w-[7px] flex-shrink-0 bg-syro-red" aria-hidden="true" />
                    <div className="flex-1 p-5 font-syro-primary text-syro-dark-gray leading-relaxed space-y-2 text-sm">
                      <p className="mb-1">
                        <span className="font-semibold">Office:</span>
                        <br />
                        Sreyas Aramana, Mar Epiphanios Centre,
                        <br />
                        Kannamcode, Adoor - 691 523.
                      </p>
                      <p>
                        <span className="font-semibold">Phone:</span> 04734 227117, 227271
                      </p>
                      <p>
                        <span className="font-semibold">E-mail:</span>{' '}
                        <a href="mailto:akdiocese@gmail.com" className="text-syro-red hover:underline font-medium">akdiocese@gmail.com</a>
                      </p>
                      <p>
                        <a
                          href="https://maps.app.goo.gl/cwHaQoKF4vZDRHY76"
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

export default dioceseofadoorkadampanaduPage;
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '../../components/QuickLinks';
import DiocesesSidebar from '../DiocesesSidebar';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'Diocese of Niranam',
  description: 'Learn about the Diocese of Niranam of the Malankara Orthodox Syrian Church.',
};

const dioceseofniranamPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Diocese of Niranam" breadcrumbFrom="dioceses" />

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
                    src="/images/dioceses/diocese-of-niranam.jpg"
                    alt="Diocese of Niranam"
                    width={175} height={175}
                    className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    Diocese of Niranam
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Niranam is a beautiful village situated in the delta of rivers Pampa and Manimala: part of Thiruvalla taluk and Pathanamthitta district. This is a typical Keralite agricultural village, full of paddy fields and coconut trees. Historically, Niranam has been famous for the missionary work of St. Thomas.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    In 1876, 22 churches were brought together in order to form the Niranam Diocese. Chathuruthi Geevarghese Mar Gregorios (Parumala Thirumeni) (1876-1902) became its first Metropolitan with Parumala Seminary as the headquarters. Pulikkotil Joseph Mar Dionysios, Vattasseril Geevarghese Mar Dionysius, Kallasseril Geevarghese Mar Gregorios, Thoma Mar Dionysius and Dr. Geevarghese Mar Osthathios administered the diocese. His Holiness Baselios Oughen Catholica Bava and His Holiness Baselios Mar Thoma Mathews I Catholica Bava directly administered the diocese.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    From 2007 onwards Dr. Yuhanon Mar Chrysostomos is the Head of the Diocese.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    There are 76 Churches including the Niranam Valiya Palli which was founded by St. Thomas, the Apostle, 6 Chapels, 1 Ramban, 76 priests, 6 deacons and 9 seminarians.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Karunagiri M.G.D Ashram, Balabhavan, Thiruvalla Marthamariam Mandiram Hostel and Home for the Aged are functioning under the charge of the diocese.
                  </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                    Bethany Aramana, which is on the western side of the cross-junction in Thiruvalla, is the diocesan headquarters. Mar Baselios Jubilee Conference Center is functioning adjacent to the diocesan center.
                  </p>

                  <div className="mt-8 flex max-w-xl overflow-hidden rounded-lg border border-syro-table-border bg-syro-bg-gray shadow-syro-card">
                    <div className="w-[7px] flex-shrink-0 bg-syro-red" aria-hidden="true" />
                    <div className="flex-1 p-5 font-syro-primary text-syro-dark-gray leading-relaxed space-y-2 text-sm">
                      <p className="mb-1">
                        <span className="font-semibold">Office:</span>
                        <br />
                        Bethany Aramana, Thiruvalla - 689 101
                      </p>
                      <p>
                        <span className="font-semibold">Phone:</span> 0469 2701357, 2603357
                      </p>
                      <p>
                        <span className="font-semibold">E-mail:</span>{' '}
                        <a href="mailto:dioceseofniranam@gmail.com" className="text-syro-red hover:underline font-medium">dioceseofniranam@gmail.com</a>
                      </p>
                      <p>
                        <a
                          href="https://maps.app.goo.gl/SQYDSNo6SKfTXmb37"
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

export default dioceseofniranamPage;
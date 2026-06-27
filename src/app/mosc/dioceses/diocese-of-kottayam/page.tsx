import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '../../components/QuickLinks';
import DiocesesSidebar from '../DiocesesSidebar';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata = {
  title: 'Diocese of Kottayam',
  description: 'Learn about the Diocese of Kottayam of the Malankara Orthodox Syrian Church.',
};

const dioceseofkottayamPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Diocese of Kottayam" breadcrumbFrom="dioceses" />

      {/* Main Content - layout and image style match /mosc/administration/administration */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                {/* Featured Image - centered, contained (administration style) */}
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/dioceses/diocese-of-kottayam.jpg"
                    alt="Diocese of Kottayam"
                    width={175} height={175}
                    className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
                    priority
                  />
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    Diocese of Kottayam
                  </h2>

                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      As per the decisions of the Mulamthuruthy Synod, Kottayam Diocese was formed initially with 20 churches altogether from Kottayam and nearby places. The first diocesan metropolitan was His Grace Kadavil Â Paulose Mar Athanasios. After his demise, H.G Paulose Mar Ivanios (First Catholicos), H.G. Geevarghese Mar Philoxenos (Second Catholicos), H.G. Vattasseril Geevarghese mar Dionysios, H.G.Kuriakose Mar Gregorios (Pampadi ThirumeniÂ  1929-1965) and Â H.G Paret Mathews Mar Ivanios (1965-1985) held the office Â in respective period of time. During the time of H.G Kuriakose Mar Gregorios, the Pampady Dayara became the office of the Diocese.
                    </p>
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      On 1982 April 21, the then Kottayam Diocese was divided into Kottayam, Kottayam Central, and Idukki. H.G Geevarghese Mar Ivanios took charge as the first Diocesan head of the newly re-organised Kottayam Diocese. After 28 years of fruitful administration of Kottayam Diocese, His Grace Geevarghese Mar Ivanios Metropolitan entered into Heavenly Abode on 12th April 2013.
                    </p>
                  <div className="mt-8 flex max-w-xl overflow-hidden rounded-lg border border-syro-table-border bg-syro-bg-gray shadow-syro-card">
                    <div className="w-[7px] flex-shrink-0 bg-syro-red" aria-hidden="true" />
                    <div className="flex-1 p-5 font-syro-primary text-syro-dark-gray leading-relaxed space-y-2 text-sm">
                      <p className="mb-1">
                        <span className="font-semibold">Office:</span>
                        <br />
                        KMG Centre, P.B. No. 686,
                        <br />
                        MD Seminary, Kottayam - 1
                      </p>
                      <p>
                        <span className="font-semibold">Ph:</span> 0481-2564329, 2304376
                      </p>
                      <p>
                        <span className="font-semibold">E-mail:</span>{' '}
                        <a href="mailto:kmgcentre@gmail.com" className="text-syro-red hover:underline font-medium">kmgcentre@gmail.com</a>
                      </p>
                      <p>
                        <a
                          href="https://maps.app.goo.gl/BpnbxNC5CLbRTZYV6"
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

export default dioceseofkottayamPage;
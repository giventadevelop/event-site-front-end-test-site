import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import QuickLinks from '@/app/mosc/components/QuickLinks';
import SyroPageBanner from '@/app/mosc/components/SyroPageBanner';
import { SYRO_CATHOLICATE_SIDEBAR_LINKS } from '@/app/mosc/catholicate/catholicosLinks';

export const metadata = {
  title: 'His Holiness Baselios Augen I, The Fourth Catholicos of the East in Malankara (1964–1975)',
  description: 'Biography of His Holiness Baselios Augen I, the fourth Catholicos of the East in Malankara.',
};

const BaseliosAugenIPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="His Holiness Baselios Augen I" breadcrumbFrom="catholicate" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8 mb-8">
                <p className="font-syro-display text-xl font-semibold text-syro-blue mb-2">
                  The Fourth Catholicos of the East in Malankara
                </p>
                <p className="font-syro-primary text-lg text-[#798daf] mb-8">1964–1975</p>

                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/catholicate/augen.jpg"
                    alt="His Holiness Baselios Augen I, The Fourth Catholicos of the East in Malankara"
                    width={175} height={175}
                    className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>

                <div className="space-y-6 font-syro-primary text-syro-dark-gray leading-relaxed">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 pl-4 border-l-4 border-syro-red">
                    Biography
                  </h2>
                  <p>
                    His Holiness was born on 26 June 1884 at Perumbavoor, Vengola, to Abraham Kathanar of Chettakulathukara family. He was ordained as deacon by Kadavil Paulose Mar Athanasios and in 1908 at Jerusalem he was elevated to the monastic order of Ramban. He was consecrated as Metropolitan Oughen Mar Timotheos on 15 May 1927 at Jerusalem. He was appointed as the fourth Metropolitan of Kandanad. He has left his imprint in several offices that he held during his life. He was principal of the Orthodox Theological Seminary, and the Metropolitan of Kandanad and Thumpamon dioceses. On 17 May 1962, when the Malankara Association met at Niranam, he was chosen as the Catholicos of the East. It was on 22 May 1964 at M.D. Seminary, Kottayam that he was installed formally as the fourth Catholicos. As he was very old, he relinquished his position as Malankara Metropolitan to his successor on 24 September 1975. Having achieved exceptional scholarship in Malayalam and Syriac languages, he translated into Malayalam the &apos;Pemkisa Namaskaram&apos;, &apos;Prumiyonukal&apos;, &apos;Valiya Nombilae Namaskaram&apos;, &apos;Pattamkoda Shushrusha Kramangal&apos; and &apos;Pallikoodasha Kramangal&apos;. He also composed the &apos;Hoodomakal&apos; for &apos;Holy Synods&apos; and the &apos;State after death&apos;. He passed away on 8 December 1975 at Devalokam Aramana and was laid to rest near the Aramana Chapel. His Anniversary: 8 December.
                  </p>
                </div>
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-6">
                <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-4 pl-4 border-l-4 border-syro-red">
                  Quick Facts
                </h3>
                <div className="space-y-3 font-syro-primary text-syro-dark-gray">
                  <div>
                    <span className="font-semibold text-syro-blue">Born:</span>
                    <p className="text-sm mt-0.5">26 June 1884, Perumbavoor, Vengola</p>
                  </div>
                  <div>
                    <span className="font-semibold text-syro-blue">Consecrated as Bishop:</span>
                    <p className="text-sm mt-0.5">15 May 1927 at Jerusalem (Oughen Mar Timotheos)</p>
                  </div>
                  <div>
                    <span className="font-semibold text-syro-blue">Reign:</span>
                    <p className="text-sm mt-0.5">1964–1975</p>
                  </div>
                  <div>
                    <span className="font-semibold text-syro-blue">Passed Away:</span>
                    <p className="text-sm mt-0.5">8 December 1975 at Devalokam Aramana</p>
                  </div>
                  <div>
                    <span className="font-semibold text-syro-blue">Resting Place:</span>
                    <p className="text-sm mt-0.5">Near Aramana Chapel, Devalokam</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-6">
                <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-4 pl-4 border-l-4 border-syro-red">
                  The Catholicate
                </h3>
                <Link
                  href="/mosc/catholicate"
                  className="syro-primary-button inline-flex items-center gap-2 w-full justify-center py-1.5 leading-tight hidden"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Back to The Catholicate</span>
                </Link>
                <div className="mt-3 space-y-1.5">
                  {SYRO_CATHOLICATE_SIDEBAR_LINKS.map((item) => {
                    const isActive = item.href === '/mosc/catholicate/his-holiness-baselios-oughen-i-the-fourth-catholicos-of-the-east-in-malankara';
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`block px-3 py-2 rounded-lg font-syro-primary text-sm leading-tight outline-none focus:outline-none transition-colors ${
                          isActive ? 'bg-syro-red text-white' : 'text-syro-dark-gray hover:text-syro-blue hover:bg-syro-bg-gray/50'
                        }`}
                      >
                        <span className={`font-syro-display font-medium ${isActive ? 'text-white' : ''}`}>{item.name}</span>
                        {item.period ? <p className={`font-syro-primary text-xs font-medium mt-0 mb-0 ${isActive ? '!text-white' : 'text-syro-blue'}`}>{item.period}</p> : null}
                        {item.description ? <p className={`font-syro-primary text-xs leading-tight mt-0 mb-0 ${isActive ? '!text-white' : 'text-[#798daf]'}`}>{item.description}</p> : null}
                      </Link>
                    );
                  })}
                </div>
              </div>
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

export default BaseliosAugenIPage;

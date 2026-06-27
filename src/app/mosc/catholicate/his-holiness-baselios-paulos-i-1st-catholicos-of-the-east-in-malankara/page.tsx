import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import QuickLinks from '@/app/mosc/components/QuickLinks';
import SyroPageBanner from '@/app/mosc/components/SyroPageBanner';
import { SYRO_CATHOLICATE_SIDEBAR_LINKS } from '@/app/mosc/catholicate/catholicosLinks';

export const metadata = {
  title: 'His Holiness Baselios Paulos I, The First Catholicos of the East in Malankara (1912–1913)',
  description: 'His Holiness Baselios Paulos I: born 1836 in Kolencherry, consecrated Catholicos 1912, laid to rest in Pampakuda Cheriya Palli. Death anniversary 3rd May.',
};

const BaseliosPaulosIPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="His Holiness Baselios Paulos I" breadcrumbFrom="catholicate" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8 mb-8">
                <p className="font-syro-display text-xl font-semibold text-syro-blue mb-2">
                  The First Catholicos of the East in Malankara
                </p>
                <p className="font-syro-primary text-lg text-[#798daf] mb-8">1912–1913</p>

                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/catholicate/Catholicos-1.jpg"
                    alt="His Holiness Baselios Paulos I, The First Catholicos of the East in Malankara"
                    width={175} height={175}
                    className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>

                <div className="space-y-6 font-syro-primary text-syro-dark-gray leading-relaxed">
                  <p>
                    His Holiness was born on 19 January 1836 to Murimattom Kurian and Mariamma in Kolencherry. He received deaconship from Cheppad Mar Dionysius in 1843 and in 1852 he was ordained as Priest by Metropolitan Yuyakim Mar Kurilos. He served for a long period as Vicar of Kolencherry Church. On 17th May 1877, His Holiness Patriarch Pathrose consecrated him as Paulose Mar Ivanios at Cherallayam Palli, Kunnam kulam and appointed him as Metropolitan of Kandanad diocese. On 15th September 1912, His Holiness Patriarch Abdhedh Messiah with the co-operation of Vattasseril Geevarghese Mar Dionysios Metropolitan and Geevarghese Mar Gregorios Metropolitan elevated him to the Apostolic throne of St. Thomas as Catholicos of Malankara church. He passed away on 2 May 1913. He was laid to rest in Pampakuda Cheriya Palli. His death Anniversary is on 3rd May.
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
                    <p className="text-sm mt-0.5">19 January 1836</p>
                  </div>
                  <div>
                    <span className="font-semibold text-syro-blue">Consecrated as Bishop:</span>
                    <p className="text-sm mt-0.5">17 May 1877 (Paulose Mar Ivanios)</p>
                  </div>
                  <div>
                    <span className="font-semibold text-syro-blue">Reign:</span>
                    <p className="text-sm mt-0.5">1912–1913</p>
                  </div>
                  <div>
                    <span className="font-semibold text-syro-blue">Passed Away:</span>
                    <p className="text-sm mt-0.5">2 May 1913</p>
                  </div>
                  <div>
                    <span className="font-semibold text-syro-blue">Resting Place:</span>
                    <p className="text-sm mt-0.5">Pampakuda Cheriya Palli</p>
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
                    const isActive = item.href === '/mosc/catholicate/his-holiness-baselios-paulos-i-1st-catholicos-of-the-east-in-malankara';
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

export default BaseliosPaulosIPage;

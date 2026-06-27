import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import QuickLinks from '@/app/mosc-redesign/(syro)/components/QuickLinks';
import SyroPageBanner from '@/app/mosc-redesign/(syro)/components/SyroPageBanner';
import { SYRO_CATHOLICATE_SIDEBAR_LINKS } from '@/app/mosc-redesign/(syro)/catholicate/catholicosLinks';

export const metadata = {
  title: 'His Holiness Baselios Geevarghese II, The Third Catholicos of the East in Malankara (1929–1964)',
  description: 'Biography of His Holiness Baselios Geevarghese II, the third Catholicos of the East in Malankara.',
};

const BaseliosGeevargheseIIPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="His Holiness Baselios Geevarghese II" breadcrumbFrom="catholicate" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8 mb-8">
                <p className="font-syro-display text-xl font-semibold text-syro-blue mb-2">
                  The Third Catholicos of the East in Malankara
                </p>
                <p className="font-syro-primary text-lg text-[#798daf] mb-8">1929–1964</p>

                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/catholicate/geevar.jpg"
                    alt="His Holiness Baselios Geevarghese II, The Third Catholicos of the East in Malankara"
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
                    His Holiness was born to Ulahannan and Naithi of Kallaserri family in Kurichi, Kottayam on 16 June 1874. On 24 April 1892, Kadavil Paulose Mar Athanasios ordained him as deacon and on 24 November and 27 November 1898 he was ordained as priest and Ramban (Monk) respectively by St. Gregorios. As per the order of St. Gregorios, he resided in Kadambanad church and took charge of the southern dioceses. He also served as Manager and Malpan of Old Seminary. He published books like &quot;Sahodaran- marude Charithram&quot;, &quot;Rehasya Prarthanakal&quot;, &quot;Parudaisa&quot;, and &quot;Mar Yuhanon Mamdana&quot;. On 8 September 1912, His Holiness Patriarch Abdhedh Meshiah consecrated him as Metropolitan Geevarghese Mar Gregorios at Parumala Seminary. He was appointed as the Metropolitan of Thumpamon, Kollam and Niranam dioceses. On 15 February 1929, with the Malankara Metropolitan Vattaserril Geevarghese Mar Dionysios as the chief priest, he was installed as the Catholicos of the East. When the Association met on 24 December 1934 at M. D. Seminary, Kottayam, he was chosen as Malankara Metropolitan. It was a period when issues became very complex. Through prayer and fasting he received strength from God to lead his people for long years, courageously, inspiring his people to work for their church and for the glory of God. Following the peace pact of 1958, he had the good fortune to guide the destiny of the unified Malankara Church. Apart from consecrating twelve Metropolitans, and ordaining more than thousand priests and deacons, he founded and consecrated many churches. On 22 April 1932 and on 20 April 1951 he conducted the &apos;Mooron Koodasha&apos; (Chrism Consecration) at the Old Seminary. On 2 November 1947 he declared Geevarghese Mar Gregorios and Yeldo Mar Baselios as Saints. From his time onwards the offices of Catholicos and Malankara Metropolitan came to repose in one and the same person. The deep spirituality and wisdom of this Catholicos earned him the title &quot;Valiya Bava,&quot; or &quot;The Great Catholicos.&quot; Shedding luster like a Beacon illuminating the history of the church, he led it from glory to glory. He entered the eternal realms on 3 January 1964 at Devalokam Aramana. He was laid to rest beside the Devalokam Aramana Chapel. His Anniversary is 3 January.
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
                    <p className="text-sm mt-0.5">16 June 1874, Kurichi, Kottayam</p>
                  </div>
                  <div>
                    <span className="font-semibold text-syro-blue">Consecrated as Bishop:</span>
                    <p className="text-sm mt-0.5">8 September 1912 (Geevarghese Mar Gregorios)</p>
                  </div>
                  <div>
                    <span className="font-semibold text-syro-blue">Reign:</span>
                    <p className="text-sm mt-0.5">1929–1964</p>
                  </div>
                  <div>
                    <span className="font-semibold text-syro-blue">Passed Away:</span>
                    <p className="text-sm mt-0.5">3 January 1964 at Devalokam Aramana</p>
                  </div>
                  <div>
                    <span className="font-semibold text-syro-blue">Resting Place:</span>
                    <p className="text-sm mt-0.5">Beside Devalokam Aramana Chapel</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-6">
                <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-4 pl-4 border-l-4 border-syro-red">
                  The Catholicate
                </h3>
                <Link
                  href="/mosc-redesign/catholicate"
                  className="syro-primary-button inline-flex items-center gap-2 w-full justify-center py-1.5 leading-tight hidden"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Back to The Catholicate</span>
                </Link>
                <div className="mt-3 space-y-1.5">
                  {SYRO_CATHOLICATE_SIDEBAR_LINKS.map((item) => {
                    const isActive = item.href === '/mosc-redesign/catholicate/his-holiness-baselios-geevarghese-ii-third-catholicos-of-the-east-in-malankara';
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

export default BaseliosGeevargheseIIPage;

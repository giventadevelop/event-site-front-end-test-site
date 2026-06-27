import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import QuickLinks from '@/app/mosc/components/QuickLinks';
import SyroPageBanner from '@/app/mosc/components/SyroPageBanner';
import { SYRO_CATHOLICATE_SIDEBAR_LINKS } from '@/app/mosc/catholicate/catholicosLinks';

export const metadata = {
  title: 'His Holiness Baselios Marthoma Mathews I, The Fifth Catholicos of the East in Malankara (1975–1991)',
  description: 'Biography of His Holiness Baselios Marthoma Mathews I, the fifth Catholicos of the East in Malankara.',
};

const BaseliosMarthomaMathewsIPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="His Holiness Baselios Marthoma Mathews I" breadcrumbFrom="catholicate" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8 mb-8">
                <p className="font-syro-display text-xl font-semibold text-syro-blue mb-2">
                  The Fifth Catholicos of the East in Malankara
                </p>
                <p className="font-syro-primary text-lg text-[#798daf] mb-8">1975–1991</p>

                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/catholicate/mathews-i.jpg"
                    alt="His Holiness Baselios Marthoma Mathews I, The Fifth Catholicos of the East in Malankara"
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
                    His Holiness was born on 27th March 1907 as the youngest son of Vattakunnel Kurien Kathanar and Olesha Pulickaparampil Mariamma in Kottayam. He took his B.A. and B.D. degrees. Even as a layman he had achieved unique distinction in studies and in Canonical Laws; he was selected as a member of the Managing Committee in 1944. He received on 18 August 1945 at the Old Seminary the order of &quot;Musmrono&quot; and on 19 August at Mar Elia Chapel he became a full deacon; on 27 October 1946 he was ordained as priest by His Holiness Baselios Geevarghese II, Catholicos of the East. Later, on 21 September 1951, he was elevated to the rank of Ramban (Monk). His Holiness Baselios Geevarghese II consecrated him as Episcopa under the name Mathews Mar Athanasios. He was further elevated to the office of Metropolitan on 12 July 1959. In 1960, he became Head of the Outside Kerala Diocese of the Malankara Church. He was unanimously elected as the Supreme Head of the Church and successor to the Catholicate of the East / Malankara Metropolitanate by the Malankara Association, which met on 31 December 1970 at M.D. Seminary, Kottayam. On 24 September 1975, he became Malankara Metropolitan. On 27 October 1975, at the Old Seminary, he was installed as Catholicos of the East with the title His Holiness Baselios Marthoma Mathews I. He executed many administrative innovations and helped to strengthen the sovereignty of the Malankara Orthodox Church and its right to have its own sovereign Head. He was able to project the name and fame of the Church on an international level. On 27 April 1991, due to failing health he relinquished his office. On 8 November 1996 he passed away, and was laid to rest in Devalokam Aramana. His death anniversary is 8 November.
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
                    <p className="text-sm mt-0.5">27 March 1907, Kottayam</p>
                  </div>
                  <div>
                    <span className="font-semibold text-syro-blue">Consecrated as Bishop:</span>
                    <p className="text-sm mt-0.5">Mathews Mar Athanasios (Episcopa)</p>
                  </div>
                  <div>
                    <span className="font-semibold text-syro-blue">Reign:</span>
                    <p className="text-sm mt-0.5">1975–1991</p>
                  </div>
                  <div>
                    <span className="font-semibold text-syro-blue">Passed Away:</span>
                    <p className="text-sm mt-0.5">8 November 1996</p>
                  </div>
                  <div>
                    <span className="font-semibold text-syro-blue">Resting Place:</span>
                    <p className="text-sm mt-0.5">Devalokam Aramana</p>
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
                    const isActive = item.href === '/mosc/catholicate/his-holiness-baselios-marthoma-mathews-i-fifth-catholicos-of-the-east-in-malankara';
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

export default BaseliosMarthomaMathewsIPage;

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import QuickLinks from '@/app/mosc/components/QuickLinks';
import SyroPageBanner from '@/app/mosc/components/SyroPageBanner';
import { SYRO_CATHOLICATE_SIDEBAR_LINKS } from '@/app/mosc/catholicate/catholicosLinks';

export const metadata = {
  title: 'H.H. Baselios Marthoma Paulose II, The Eighth Catholicos of the East in Malankara (2010–2021)',
  description: 'Biography of His Holiness Baselios Marthoma Paulose II, the eighth Catholicos of the East in Malankara.',
};

const BaseliosMarthomaPauloseIIPage = () => {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="H.H. Baselios Marthoma Paulose II" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8 mb-8">
                <p className="font-syro-display text-xl font-semibold text-syro-blue mb-2">
                  The Eighth Catholicos of the East in Malankara
                </p>
                <p className="font-syro-primary text-lg text-[#798daf] mb-8">2010–2021</p>

                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/catholicate/bava.jpg"
                    alt="H.H. Baselios Marthoma Paulose II, The Eighth Catholicos of the East in Malankara"
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
                    His Holiness Baselios Marthoma Paulose II was enthroned as the Catholicos of the East and Malankara Metropolitan (the Supreme Head of the Malankara Orthodox Syrian Church of India) on Monday, 1st November 2010. His Holiness is the 91st Primate on the Apostolic Throne of St. Thomas. Born on 30th August 1946 in a village called Mangad near Kunnamkulam, Thrissur District, Kerala as the son of the late Kollannur Iype and the late Pulikkottil Kunjeetty, the boy K.I. Paul had his early education in local schools. After graduating from St. Thomas College, Thrissur, Paul joined the Orthodox Theological Seminary, Kottayam from where he obtained G.S.T. and B.D. degrees of the Serampore University. After taking the holy orders, he joined C.M.S. College, Kottayam and took his M.A. in Sociology.
                  </p>
                  <p>
                    At the young age of 36, the Church Parliament (Malankara Syrian Christian Association) elected Fr. K.I. Paul as Bishop. On 15th May 1985, he was consecrated as Episcopa (Bishop) with the new name Paulose Mar Milithios. Subsequently, His Grace was elevated as the first Metropolitan of the newly formed Kunnamkulam diocese on 1st August 1985. The Malankara Syrian Christian Association held at Parumala on 12th October 2006 unanimously elected His Grace Paulose Mar Milithios Metropolitan as the Catholicos Designate and the successor to the Malankara Metropolitan. On 1st November 2010, following the abdication of his predecessor, His Holiness Baselios Marthoma Didymos I, His Grace Paulose Mar Milithios Metropolitan was enthroned as the Catholicos of the East and Malankara Metropolitan with the new name His Holiness Baselios Marthoma Paulose II. Incidentally, Kunnamkulam which is a stronghold of the Orthodox community in Kerala has given birth to three Malankara Metropolitans including the reigning Catholicos. His Holiness&apos; illustrious predecessors Pulikottil Joseph Mar Dionysius II and Pulikottil Joseph Mar Dionysius V were towering personalities who contributed much to making the Malankara Church what it is today.
                  </p>
                  <p>
                    It was His Holiness&apos; keen interest that the Church should have effective and meaningful Inter-Church relations. It is with this emphasis that His Holiness has already journeyed to all the Oriental Orthodox Churches. In this short span of time as Catholicos, he has already had meetings with all the present heads of the Oriental Orthodox Churches. The fraternal relations with the sister Churches too have been given prime importance. The meeting with the present Pope of the Catholic Church has enhanced the bilateral relations between the two Churches. His Holiness&apos; unassuming character and his philanthropic interests have given new dimensions to the life of the Church. He has authored a few devotional and contemplative books in Malayalam.
                  </p>
                  <p>
                    His Holiness had been called to the eternal abode on 12 July 2021. His mortal remains are interred in the Chapel at Catholicate Palace, Devalokam, Kottayam, India.
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
                    <p className="text-sm mt-0.5">30 August 1946, Mangad near Kunnamkulam, Thrissur</p>
                  </div>
                  <div>
                    <span className="font-semibold text-syro-blue">Consecrated as Bishop:</span>
                    <p className="text-sm mt-0.5">15 May 1985 (Paulose Mar Milithios)</p>
                  </div>
                  <div>
                    <span className="font-semibold text-syro-blue">Reign:</span>
                    <p className="text-sm mt-0.5">2010–2021</p>
                  </div>
                  <div>
                    <span className="font-semibold text-syro-blue">Passed Away:</span>
                    <p className="text-sm mt-0.5">12 July 2021</p>
                  </div>
                  <div>
                    <span className="font-semibold text-syro-blue">Resting Place:</span>
                    <p className="text-sm mt-0.5">Chapel at Catholicate Palace, Devalokam, Kottayam</p>
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
                    const isActive = item.href === '/mosc/catholicate/h-h-baselios-marthoma-paulose-ii';
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

export default BaseliosMarthomaPauloseIIPage;

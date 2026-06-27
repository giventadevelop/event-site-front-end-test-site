import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';
import LectionarySidebar from '../components/LectionarySidebar';
import { lentPeriods } from './greatLentData';

export const metadata: Metadata = {
  title: 'Great Lent | Lectionary | MOSC',
  description: 'Scripture readings for the Great Lent period, including daily readings from the first Monday through all weeks of the Great Lent season.',
};

export default function GreatLentPage() {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Great Lent" breadcrumbFrom="lectionary" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/lectionary/lent.jpg"
                    alt="Great Lent"
                    width={175} height={175}
                    className="rounded-lg object-contain" style={{ width: '175px', height: '175px' }}
                    sizes="(min-width: 1024px) 37.5vw, 50vw"
                  />
                </div>
                <div className="font-syro-primary text-syro-dark-gray leading-relaxed mb-12">
                  <p className="mb-4">
                    The Great Lent is a 50-day period of fasting, prayer, and spiritual renewal in preparation for the Resurrection of our Lord. It is a time of intense spiritual discipline and repentance.
                  </p>
                  <p>
                    Daily scripture readings guide the faithful through this sacred season, focusing on repentance, renewal, and preparation for the celebration of Easter.
                  </p>
                </div>

                <div className="space-y-12">
                  {lentPeriods.map((period, index) => (
                    <div key={index} className="bg-syro-bg-gray rounded-lg shadow-syro-card p-6">
                      <h2 className="font-syro-display font-semibold text-2xl lg:text-3xl text-syro-blue mb-3">
                        {period.title}
                      </h2>
                      {period.description && (
                        <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed mb-6 italic">
                          {period.description}
                        </p>
                      )}
                      <div className="space-y-6">
                        {period.sections.map((section, sIndex) => (
                          <div key={sIndex} className="border-l-4 border-syro-red pl-6">
                            <h3 className="font-syro-display font-medium text-xl text-syro-blue mb-3">
                              {section.time}
                            </h3>
                            <ul className="space-y-2">
                              {section.verses.map((verse, vIndex) => (
                                <li key={vIndex} className="font-syro-primary text-syro-dark-gray flex items-start">
                                  <span className="w-2 h-2 bg-syro-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                  <span>{verse}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
              <div className="mt-8 flex justify-center">
                <Link
                  href="/mosc/lectionary"
                  className="inline-flex items-center px-6 py-3 bg-syro-red text-white font-syro-primary font-medium rounded-lg hover:bg-syro-red/90 transition-all duration-300 shadow-syro-card"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Lectionary
                </Link>
              </div>
              <section className="mt-8">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                  <Link
                    href="/mosc/lectionary/koodosh-eetho-to-kothne"
                    className="inline-flex items-center px-6 py-3 bg-white text-syro-blue font-syro-primary font-medium rounded-lg hover:bg-syro-bg-gray transition-all duration-300 shadow-syro-card"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous: Koodosh Eetho to Kothne
                  </Link>
                  <Link
                    href="/mosc/lectionary/kyomtho-easter-to-koodosh-edtho"
                    className="inline-flex items-center px-6 py-3 bg-syro-red text-syro-red-foreground font-syro-primary font-medium rounded-lg hover:bg-syro-red/90 transition-all duration-300 shadow-syro-card"
                  >
                    Next: Kyomtho (Easter)
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </section>
            </div>
            <div className="space-y-6 lg:col-span-1">
              <LectionarySidebar currentSlug="great-lent" />
            </div>
          </div>
          <div className="mt-8 lg:hidden">
            <QuickLinks />
          </div>
        </div>
      </section>
    </div>
  );
}



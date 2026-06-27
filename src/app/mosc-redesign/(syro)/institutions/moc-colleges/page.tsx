import React from 'react';
import Image from 'next/image';
import { Metadata } from 'next';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';
import InstitutionsSidebar from '../components/InstitutionsSidebar';
import { formatPhoneNumbers } from '../lib/formatPhone';

export const metadata: Metadata = {
  title: 'MOC Colleges | Institutions | MOSC',
  description: 'Malankara Orthodox Church colleges providing higher education across various disciplines throughout India.',
};

export default function MOCCollegesPage() {
  const colleges = [
    { name: 'Catholicate College', location: 'Pathanamthitta', phone: '0468 2222223, 2325253' },
    { name: 'Baselius College', location: 'Kottayam – 686 001', phone: '0481 2563918, 2565958' },
    { name: 'St. Mary\'s College', location: 'S. Battery – 673 592', phone: '04936 220246' },
    { name: 'St. Gregorios College', location: 'Kottarakara', phone: '0474 2650133' },
    { name: 'St. Stephen\'s College', location: 'Maloor, Pathanapuram', phone: '0475 2352385' },
    { name: 'Baselios Mathews II B.Ed College', location: 'Adoor' },
    { name: 'Kuriakose Gregorios College', location: 'Pampady', phone: '0481 2505212, 2508212' },
    { name: 'Mar Dionysius College', location: 'Pazhanji', phone: '04885 276729, 277577' },
    { name: 'St. Cyril\'s College', location: 'Adoor', phone: '04734 210043' },
    { name: 'Mount Tabore Training College', location: 'Pathanapuram', phone: '0475 2352323' },
    { name: 'BMM II Training College', location: 'Kottarakkara', phone: '0474 2653544' },
    { name: 'St. Thomas College', location: 'Bhilai', phone: '0788 2275970, 2274223' },
    { name: 'M. G. M. Junior College', location: 'Bhilai', phone: '0788 288662-64' },
    { name: 'MOSC Medical College', location: 'Kolencherry', phone: '0484 2760251, 3055555, 3055666' },
    { name: 'Theophilos College of Nursing', location: 'Kangazha', phone: '0481 2497410' },
    { name: 'SG College of Nursing', location: 'Parumala', phone: '0479 2310393' },
    { name: 'SG College of Social Science', location: 'Parumala', phone: '0479 2312266, 2311929' },
  ];

  return (
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner title="MOC Colleges" breadcrumbFrom="institutions" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <div className="relative w-full h-80 rounded-lg overflow-hidden shadow-syro-card-hover">
                    <Image src="/images/institutions/moc.jpg" alt="MOC Colleges" fill className="object-cover" priority />
                  </div>
                </div>
                <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed">
                  Institutions of higher learning operated by the Malankara Orthodox Church, providing quality education across arts, science, nursing, and professional programs.
                </p>
              </div>

              <div className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {colleges.map((college, index) => (
              <div key={index} className="bg-syro-bg-gray/20 rounded-lg p-6 shadow-syro-card-sm border-l-4 border-syro-red hover:shadow-syro-card transition-all duration-300 min-w-0">
                <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-3">{college.name}</h3>
                <div className="space-y-2 font-syro-primary text-syro-dark-gray">
                  <p className="flex items-start">
                    <svg className="w-5 h-5 text-syro-red mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{college.location}</span>
                  </p>
                  {college.phone && (() => {
                    const numbers = formatPhoneNumbers(college.phone);
                    return (
                      <p className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-syro-red mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="min-w-0 flex flex-col">
                          {numbers.map((num, i) => (
                            <span key={i} className="block">
                              {i === 0 ? <>Ph: {num}</> : num}
                            </span>
                          ))}
                        </span>
                      </p>
                    );
                  })()}
                </div>
              </div>
            ))}
            {/* Corporate Office */}
            <div className="bg-syro-red/5 rounded-lg p-6 shadow-syro-card-sm border-l-4 border-syro-red hover:shadow-syro-card transition-all duration-300 min-w-0">
              <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-3">
                MOC Colleges Corporate Management Office
              </h3>
              <div className="space-y-2 font-syro-primary text-syro-dark-gray">
                <p className="flex items-start">
                  <svg className="w-5 h-5 text-syro-red mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Devalokam, Kottayam – 38</span>
                </p>
                <p className="flex items-start">
                  <svg className="w-5 h-5 text-syro-red mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>0481-2573533</span>
                </p>
              </div>
            </div>
          </div>
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>
            <div className="space-y-6 lg:col-span-1">
              <InstitutionsSidebar currentSlug="moc-colleges" />
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



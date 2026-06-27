import React from 'react';
import Image from 'next/image';
import { Metadata } from 'next';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';
import InstitutionsSidebar from '../components/InstitutionsSidebar';
import { formatPhoneNumbers } from '../lib/formatPhone';

export const metadata: Metadata = {
  title: 'Convents | Institutions | MOSC',
  description: 'Convents of the Malankara Orthodox Syrian Church dedicated to prayer, service, and spiritual formation.',
};

export default function ConventsPage() {
  const convents = [
    { name: 'Bethany Convent', location: 'Ranni – Perunad – 689 711', phone: '04735 240224 (Boarding 240583)' },
    { name: 'Mount Tabore Convent', location: 'Pathanapuram', phone: '0475 2353483, 255447' },
    { name: 'St. Mary Magdalene Convent', location: 'Adupputty, Kunnamkulam', phone: '04885 222960' },
    { name: 'Bethlehem Convent', location: 'Kizhakkambalam, Alwaye', phone: '0484 2680283' },
    { name: 'Nazareth Convent', location: 'Kadampanad South P.O., Adoor', phone: '04734 282146' },
    { name: 'Basalel Convent', location: 'Sooranad P.O., Kollam – 690 522', phone: '0476 2851427' },
    { name: 'St. Mary\'s Convent', location: 'Kozhimala, Vallamkulam', phone: '0469 2656104' },
    { name: 'St. Mary\'s Asha Bavan', location: 'Kozhimala, Vallamkulam', phone: '0469 2656561' },
    { name: 'St. Paul\'s Convent and Balikabhavan', location: 'Puthuppady, Kozhikode – 673 586', phone: '0495 2235017' },
    { name: 'Mount Carmel Convent', location: 'East Kallada, Kollam – 691 502', phone: '0474 2585362' },
    { name: 'Gethsemon Convent', location: 'Adichanalloor, Kollam – 691 573' },
    { name: 'Holy Cross Convent', location: 'Sreekariyam – Trivandrum' },
    { name: 'St. Mary\'s Convent', location: 'Thumpamon – 689 502', phone: '04734 26697' },
    { name: 'St. Gregorios Convent', location: 'Kalanthode, NITC P.O., Kozhikode', phone: '0495 2287746' },
  ];

  return (
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner title="Convents" breadcrumbFrom="institutions" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <div className="relative w-full h-auto rounded-lg overflow-hidden flex items-center justify-center bg-syro-bg-gray/20">
                    <Image
                      src="/images/institutions/conv.jpg"
                      alt="Convents"
                      width={800}
                      height={600}
                      className="w-full h-auto object-contain"
                      style={{ backgroundColor: 'transparent', borderRadius: '0.5rem' }}
                      priority
                    />
                  </div>
                </div>
                <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed">
                  Sacred communities of consecrated women dedicated to prayer, contemplation, and service to the Church and society.
                </p>
              </div>

              <div className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {convents.map((convent, index) => (
              <div key={index} className="bg-syro-bg-gray/20 rounded-lg p-6 shadow-syro-card-sm border-l-4 border-syro-red hover:shadow-syro-card transition-all duration-300">
                <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-3">{convent.name}</h3>
                <div className="space-y-2 font-syro-primary text-syro-dark-gray">
                  <p className="flex items-start">
                    <svg className="w-5 h-5 text-syro-red mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{convent.location}</span>
                  </p>
                  {convent.phone && (() => {
                    const numbers = formatPhoneNumbers(convent.phone);
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
          </div>
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>
            <div className="space-y-6 lg:col-span-1">
              <InstitutionsSidebar currentSlug="convents" />
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



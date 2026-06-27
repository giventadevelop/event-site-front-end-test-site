import React from 'react';
import Image from 'next/image';
import { Metadata } from 'next';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';
import InstitutionsSidebar from '../components/InstitutionsSidebar';
import { formatPhoneNumbers } from '../lib/formatPhone';

export const metadata: Metadata = {
  title: 'Monasteries | Institutions | MOSC',
  description: 'Monasteries and Asrams of the Malankara Orthodox Syrian Church dedicated to prayer, contemplation, and service.',
};

export default function MonasteriesPage() {
  // Content from https://mosc.in/institutions/monasteries/ (order and wording preserved)
  const monasteries = [
    { name: 'Mount Tabore Dayara', location: 'Pathanapuram – 689 695', phone: '0475 2352231 2352475' },
    { name: 'Bethlehem Asram', location: 'Chengamanad, Kottarakara', phone: '0474 2402543' },
    { name: 'St. George Dayara', location: 'Othera, Tiruvalla', phone: '0469 2656808' },
    { name: "St. Paul's Asram", location: "Puthuppady, Kozhikode – 673 586", phone: '0495 2235805' },
    { name: 'St. Basil Dayara', location: 'Pathanamthitta – 689 645', phone: '0468 2222243' },
    { name: 'Holy Trinity Asram', location: 'Angady, Ranni – 689 674', phone: '04735 200335' },
    { name: 'Mar Kuriakose Asram', location: 'Kumbazha North, Pathanamthitta', phone: '0468 2322295 2221295, 2321414' },
    { name: 'Mar Baselius Dayara', location: 'Njaliakuzhy, Vakathanam', phone: '0481 2462629, 2462099' },
    { name: 'Mount Carmel Asram', location: 'Mathilakom, East Kallada, Kollam – 691 502', phone: '0474 2585262 2585062' },
    { name: 'Mount Horeb Asram', location: 'Muthupilakad P.O., Sasthamkotta – 690 520', phone: '0476 2830778 2831712' },
    { name: 'MGD Asram and Balabhavan', location: 'Karunagiri, Karukachal', phone: '0481 2486384' },
    { name: 'Christa Sishya Asram', location: 'Thadagom P.O., Coimbatore (T.N.)', phone: '0422 2568228' },
    { name: 'Mar Gregorios Bethel Asram', location: 'Kuttikonam, Kunnicode', phone: '0475 2322450' },
    { name: 'St. George Mount Asram', location: 'Chayalode, Adoor – 691 556', phone: '04734 240949 240933, 244646' },
    { name: 'St. Thomas Asram', location: 'Nellipathy, Agali P.O., Palakkad', phone: '04924 254430' },
    { name: 'St. Thomas Karunya Vishranthi Bhavan', location: 'Trivandrum', phone: '0471 2445543, 2445547' },
    { name: 'St. Thomas Karunya Ashram', location: 'Trivandrum', phone: '0471 2596418' },
    { name: 'St. Thomas Karunya MAS, SAF, SHF', location: 'Trivandrum', phone: '0471 2445543, 2445547' },
    { name: 'Bethany Asram', location: 'Ranni – Perunad – 689 711', phone: '04735 240223' },
    { name: 'Mount Calvary Asram', location: 'Pattazhy, Kottarakara', phone: '' },
    { name: 'St. George Asram', location: 'Kulamudi, Mylom, Kottarakara', phone: '' },
    { name: 'Mount Tabore Asram', location: 'Mathuramala, Pattazhi', phone: '' },
    { name: 'Mar Augen Asram', location: 'Piramadom (S), Pampakkuda', phone: '' },
    { name: 'St. Gregorios Mount Asram', location: 'Kottarakara', phone: '' },
    { name: 'St. Thomas Asram', location: 'Sooranad P.O., Kollam – 690522', phone: '' },
    { name: 'St. Basil Dayara', location: 'Pathanamthitta – 689 645', phone: '0468 2222243' },
  ];

  return (
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner title="Monasteries" breadcrumbFrom="institutions" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <div className="relative w-full h-auto rounded-lg overflow-hidden flex items-center justify-center bg-syro-bg-gray/20">
                    <Image
                      src="/images/institutions/mon.jpg"
                      alt="Monasteries"
                      width={800}
                      height={600}
                      className="w-full h-auto object-contain"
                      style={{ backgroundColor: 'transparent', borderRadius: '0.5rem' }}
                      priority
                    />
                  </div>
                </div>
                <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed">
                  Sacred centers of monastic life, prayer, and contemplation within the Malankara Orthodox Syrian Church, where monks dedicate their lives to spiritual pursuits and service to the Church.
                </p>
              </div>

              <div className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {monasteries.map((monastery, index) => (
              <div key={index} className="bg-syro-bg-gray/20 rounded-lg p-6 shadow-syro-card-sm border-l-4 border-syro-red hover:shadow-syro-card transition-all duration-300">
                <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-3">
                  {monastery.name}
                </h3>
                <div className="space-y-2 font-syro-primary text-syro-dark-gray">
                  <p className="flex items-start">
                    <svg className="w-5 h-5 text-syro-red mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{monastery.location}</span>
                  </p>
                  {monastery.phone && (() => {
                    const numbers = formatPhoneNumbers(monastery.phone);
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
              <InstitutionsSidebar currentSlug="monasteries" />
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



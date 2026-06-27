import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import QuickLinks from '@/components/holy-synod/QuickLinks';

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
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <section className="bg-muted py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 font-body text-sm text-muted-foreground">
            <Link href="/mosc-old" className="hover:text-primary reverent-transition">
              MOSC
            </Link>
            <span>/</span>
            <Link href="/mosc-old/institutions" className="hover:text-primary reverent-transition">
              Institutions
            </Link>
            <span>/</span>
            <span className="text-foreground">Monasteries</span>
          </nav>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background to-muted py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="relative w-full h-auto rounded-lg overflow-hidden flex items-center justify-center bg-muted/20">
              <Image
                src="/images/institutions/mon.jpg"
                alt="Monasteries"
                width={800}
                height={600}
                className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-300"
                style={{ backgroundColor: 'transparent', borderRadius: '0.5rem' }}
                priority
              />
            </div>
            <div>
              <h1 className="font-heading font-semibold text-4xl lg:text-5xl text-foreground mb-4">
                Monasteries
              </h1>
              <p className="font-body text-lg text-muted-foreground leading-relaxed">
                Sacred centers of monastic life, prayer, and contemplation within the Malankara Orthodox Syrian Church, where monks dedicate their lives to spiritual pursuits and service to the Church.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Monasteries List Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {monasteries.map((monastery, index) => (
              <div key={index} className="bg-muted/20 rounded-lg p-6 sacred-shadow-sm border-l-4 border-primary hover:sacred-shadow reverent-transition">
                <h3 className="font-heading font-semibold text-xl text-foreground mb-3">
                  {monastery.name}
                </h3>
                <div className="space-y-2 font-body text-muted-foreground">
                  <p className="flex items-start">
                    <svg className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{monastery.location}</span>
                  </p>
                  {monastery.phone && (
                    <p className="flex items-start">
                      <svg className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>Ph: {monastery.phone}</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <QuickLinks />

      {/* Navigation */}
      <section className="py-12 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <Link
              href="/mosc-old/institutions"
              className="inline-flex items-center px-6 py-3 bg-primary text-white font-body font-medium rounded-lg hover:bg-primary/90 reverent-transition sacred-shadow"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to All Institutions
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}



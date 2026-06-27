import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import QuickLinks from '@/components/holy-synod/QuickLinks';

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
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <section className="bg-muted py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 font-body text-sm text-muted-foreground">
            <Link href="/mosc-old" className="hover:text-primary reverent-transition">MOSC</Link>
            <span>/</span>
            <Link href="/mosc-old/institutions" className="hover:text-primary reverent-transition">Institutions</Link>
            <span>/</span>
            <span className="text-foreground">MOC Colleges</span>
          </nav>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background to-muted py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="relative w-full h-80 lg:h-96 rounded-lg overflow-hidden sacred-shadow-lg">
              <Image src="/images/institutions/moc.jpg" alt="MOC Colleges" fill className="object-cover" priority />
            </div>
            <div>
              <h1 className="font-heading font-semibold text-4xl lg:text-5xl text-foreground mb-4">MOC Colleges</h1>
              <p className="font-body text-lg text-muted-foreground leading-relaxed">
                Institutions of higher learning operated by the Malankara Orthodox Church, providing quality education across arts, science, nursing, and professional programs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Colleges List Section - 2 cards per row at all times */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {colleges.map((college, index) => (
              <div key={index} className="bg-muted/20 rounded-lg p-6 sacred-shadow-sm border-l-4 border-primary hover:sacred-shadow reverent-transition min-w-0">
                <h3 className="font-heading font-semibold text-xl text-foreground mb-3">{college.name}</h3>
                <div className="space-y-2 font-body text-muted-foreground">
                  <p className="flex items-start">
                    <svg className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{college.location}</span>
                  </p>
                  {college.phone && (
                    <p className="flex items-start">
                      <svg className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{college.phone}</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
            {/* Corporate Office - same grid, keeps 2-per-row so last row has two cards */}
            <div className="bg-primary/5 rounded-lg p-6 sacred-shadow-sm border-l-4 border-primary hover:sacred-shadow reverent-transition min-w-0">
              <h3 className="font-heading font-semibold text-xl text-foreground mb-3">
                MOC Colleges Corporate Management Office
              </h3>
              <div className="space-y-2 font-body text-muted-foreground">
                <p className="flex items-start">
                  <svg className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Devalokam, Kottayam – 38</span>
                </p>
                <p className="flex items-start">
                  <svg className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>0481-2573533</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <QuickLinks />

      {/* Navigation */}
      <section className="py-12 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <Link href="/mosc-old/institutions" className="inline-flex items-center px-6 py-3 bg-primary text-white font-body font-medium rounded-lg hover:bg-primary/90 reverent-transition sacred-shadow">
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



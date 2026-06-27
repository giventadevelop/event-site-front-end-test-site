import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import QuickLinks from '@/components/holy-synod/QuickLinks';

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
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <section className="bg-muted py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 font-body text-sm text-muted-foreground">
            <Link href="/mosc-old" className="hover:text-primary reverent-transition">MOSC</Link>
            <span>/</span>
            <Link href="/mosc-old/institutions" className="hover:text-primary reverent-transition">Institutions</Link>
            <span>/</span>
            <span className="text-foreground">Convents</span>
          </nav>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background to-muted py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="relative w-full h-auto rounded-lg overflow-hidden flex items-center justify-center bg-muted/20">
              <Image
                src="/images/institutions/conv.jpg"
                alt="Convents"
                width={800}
                height={600}
                className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-300"
                style={{ backgroundColor: 'transparent', borderRadius: '0.5rem' }}
                priority
              />
            </div>
            <div>
              <h1 className="font-heading font-semibold text-4xl lg:text-5xl text-foreground mb-4">Convents</h1>
              <p className="font-body text-lg text-muted-foreground leading-relaxed">
                Sacred communities of consecrated women dedicated to prayer, contemplation, and service to the Church and society.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Convents List Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {convents.map((convent, index) => (
              <div key={index} className="bg-muted/20 rounded-lg p-6 sacred-shadow-sm border-l-4 border-primary hover:sacred-shadow reverent-transition">
                <h3 className="font-heading font-semibold text-xl text-foreground mb-3">{convent.name}</h3>
                <div className="space-y-2 font-body text-muted-foreground">
                  <p className="flex items-start">
                    <svg className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{convent.location}</span>
                  </p>
                  {convent.phone && (
                    <p className="flex items-start">
                      <svg className="w-5 h-5 text-primary mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span>{convent.phone}</span>
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



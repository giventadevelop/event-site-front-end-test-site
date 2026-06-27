'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';

export default function KalpanaPage() {
  const kalpanaEditions = [
    { year: '2026', title: 'Kalpana 2026', link: '#', available: true },
    { year: '2025', title: 'Kalpana 2025', link: '#', available: true },
    { year: '2024', title: 'Kalpana 2024', link: '#', available: true },
    { year: '2023', title: 'Kalpana 2023', link: '#', available: true },
    { year: '2022', title: 'Kalpana 2022', link: '#', available: true },
    { year: '2021', title: 'Kalpana- 2021', link: '#', available: true },
    { year: '2020', title: 'Kalpana 2020', link: '#', available: true },
    { year: '2019', title: 'Kalpana- 2019', link: '#', available: true },
    { year: '2018', title: 'Kalpana 2018', link: '#', available: true },
    { year: '2017', title: 'Kalpana 2017', link: '#', available: true },
    { year: '2016', title: 'Kalpana 2016', link: '#', available: true },
    { year: '2015', title: 'Kalpana 2015', link: '#', available: true },
  ];

  return (
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner title="Kalpana" breadcrumbFrom="downloads" />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-syro-bg-gray to-syro-bg-gray py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="relative w-full h-auto rounded-lg overflow-hidden flex items-center justify-center bg-syro-bg-gray/20">
              <Image
                src="/images/downloads/kalpana.png"
                alt="Kalpana"
                width={800}
                height={600}
                className="w-full h-auto object-contain"
                style={{
                  backgroundColor: 'transparent',
                  borderRadius: '0.5rem',
                }}
                priority
              />
            </div>
            <div>
              <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed mb-4">
                The official annual calendar and directory of the Malankara Orthodox Syrian Church.
              </p>
              <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed">
                The Kalpana contains important liturgical dates, feast days, fasts, parish directories, and essential church information for the year.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Kalpana Editions Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-syro-display font-semibold text-3xl text-syro-blue mb-4">
              Available Editions
            </h2>
            <p className="font-syro-primary text-lg text-syro-dark-gray">
              Select a year to view or download the Kalpana edition
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {kalpanaEditions.map((edition) => (
              <Link
                key={edition.year}
                href={edition.link}
                className="group bg-white rounded-lg shadow-syro-card hover:shadow-syro-card-hover transition-all duration-300 p-6 text-center"
                onClick={(e) => {
                  if (edition.link === '#') {
                    e.preventDefault();
                    alert(`Kalpana ${edition.year} PDF will be available for download soon.`);
                  }
                }}
              >
                <div className="relative w-28 h-28 mx-auto mb-4 rounded-lg overflow-hidden flex items-center justify-center bg-syro-red/10 group-hover:bg-syro-red/20 transition-all duration-300 p-0">
                  <Image
                    src="/images/downloads/kalapana_card_logo.png"
                    alt={`Kalpana ${edition.year}`}
                    fill
                    className="object-cover p-0"
                    sizes="112px"
                  />
                </div>
                <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-2 group-hover:text-syro-red transition-all duration-300">
                  {edition.title}
                </h3>
                {edition.available && (
                  <span className="syro-read-more-btn font-syro-primary inline-flex items-center gap-2">
                    View
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About Kalpana */}
      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-syro-card p-8">
            <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4">
              About Kalpana
            </h2>
            <div className="space-y-4 font-syro-primary text-lg text-syro-dark-gray leading-relaxed">
              <p>
                The Kalpana is an indispensable resource for every Orthodox faithful, providing a comprehensive guide to the liturgical year and church administration.
              </p>
              <p>
                Each edition includes:
              </p>
              <ul className="space-y-2 ml-6">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-syro-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Complete liturgical calendar with feast days and fasts</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-syro-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Directory of parishes, priests, and church officials</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-syro-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Important church announcements and guidelines</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-syro-red rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span>Contact information for dioceses and institutions</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <QuickLinks />
    </div>
  );
}

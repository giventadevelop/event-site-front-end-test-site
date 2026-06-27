'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import SyroPageBanner from '../../components/SyroPageBanner';

export default function PrayerBooksPage() {
  const prayerBooks = [
    {
      title: 'Holy Week Gospel Readings',
      subtitle: 'Passion Week – Evangelion',
      description: 'Gospel readings for Holy Week, the most sacred period in the Orthodox liturgical calendar.',
      link: '#', // PDF link placeholder
      available: true,
    },
  ];

  return (
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner title="Prayer Books" breadcrumbFrom="downloads" />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-syro-bg-gray to-syro-bg-gray py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-syro-red rounded-full flex items-center justify-center shadow-syro-card">
                <svg className="w-6 h-6 text-syro-red-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <p className="font-syro-primary text-lg lg:text-xl text-syro-dark-gray max-w-3xl mx-auto">
              Orthodox prayer books and liturgical texts for personal devotion and participation in the life of the Church.
            </p>
          </div>
        </div>
      </section>

      {/* Prayer Books List */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {prayerBooks.map((book, index) => (
              <div key={index} className="bg-white rounded-lg shadow-syro-card p-8 border-l-4 border-primary">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-2">
                      {book.title}
                    </h2>
                    {book.subtitle && (
                      <p className="font-syro-primary text-lg text-syro-red mb-3 italic">
                        {book.subtitle}
                      </p>
                    )}
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                      {book.description}
                    </p>
                    {book.available && (
                      <span className="inline-flex items-center px-3 py-1 bg-success/10 text-success rounded-full text-sm font-medium">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Available for Download
                      </span>
                    )}
                  </div>
                  <Link
                    href={book.link}
                    className="ml-6 flex-shrink-0 inline-flex items-center px-6 py-3 bg-syro-red text-syro-red-foreground font-syro-primary font-medium rounded-lg hover:bg-syro-red/90 transition-all duration-300 shadow-syro-card"
                    onClick={(e) => {
                      if (book.link === '#') {
                        e.preventDefault();
                        alert('PDF download will be available soon.');
                      }
                    }}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download PDF
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Info Box */}
          <div className="mt-12 bg-syro-bg-gray rounded-lg p-8">
            <h3 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4">
              Using Prayer Books
            </h3>
            <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed">
              These prayer books are provided to help the faithful participate more fully in the liturgical life of the Church. They contain prayers, hymns, and readings for various services and occasions. We encourage all members to use these resources for personal devotion and to deepen their understanding of Orthodox worship.
            </p>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-12 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <Link href="/mosc-redesign/downloads" className="inline-flex items-center px-6 py-3 bg-syro-red text-syro-red-foreground font-syro-primary font-medium rounded-lg hover:bg-syro-red/90 transition-all duration-300 shadow-syro-card">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to All Downloads
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}


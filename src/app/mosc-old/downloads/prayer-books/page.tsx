'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

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
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <section className="bg-muted py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 font-body text-sm text-muted-foreground">
            <Link href="/mosc-old" className="hover:text-primary reverent-transition">MOSC</Link>
            <span>/</span>
            <Link href="/mosc-old/downloads" className="hover:text-primary reverent-transition">Downloads</Link>
            <span>/</span>
            <span className="text-foreground">Prayer Books</span>
          </nav>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background to-muted py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center sacred-shadow">
                <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <h1 className="font-heading font-semibold text-4xl lg:text-5xl text-foreground mb-4">
              Prayer Books
            </h1>
            <p className="font-body text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
              Orthodox prayer books and liturgical texts for personal devotion and participation in the life of the Church.
            </p>
          </div>
        </div>
      </section>

      {/* Prayer Books List */}
      <section className="py-16 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {prayerBooks.map((book, index) => (
              <div key={index} className="bg-card rounded-lg sacred-shadow p-8 border-l-4 border-primary">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="font-heading font-semibold text-2xl text-foreground mb-2">
                      {book.title}
                    </h2>
                    {book.subtitle && (
                      <p className="font-body text-lg text-primary mb-3 italic">
                        {book.subtitle}
                      </p>
                    )}
                    <p className="font-body text-muted-foreground leading-relaxed mb-4">
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
                    className="ml-6 flex-shrink-0 inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-body font-medium rounded-lg hover:bg-primary/90 reverent-transition sacred-shadow"
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
          <div className="mt-12 bg-muted/30 rounded-lg p-8">
            <h3 className="font-heading font-semibold text-2xl text-foreground mb-4">
              Using Prayer Books
            </h3>
            <p className="font-body text-lg text-muted-foreground leading-relaxed">
              These prayer books are provided to help the faithful participate more fully in the liturgical life of the Church. They contain prayers, hymns, and readings for various services and occasions. We encourage all members to use these resources for personal devotion and to deepen their understanding of Orthodox worship.
            </p>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-12 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <Link href="/mosc-old/downloads" className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-body font-medium rounded-lg hover:bg-primary/90 reverent-transition sacred-shadow">
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


import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lectionary | Malankara Orthodox Syrian Church',
  description: 'The liturgical lectionary of the Malankara Orthodox Syrian Church, including scripture readings for the church year from Koodosh Eetho to Special Occasions.',
  keywords: ['Lectionary', 'Scripture Readings', 'Liturgical Calendar', 'Orthodox Liturgy', 'Bible Readings'],
};

export default function LectionaryPage() {
  const lectionaryPeriods = [
    {
      id: 'koodosh-eetho-to-kothne',
      title: 'Koodosh Eetho to Kothne',
      description: 'Koodhosh Eetho (Sanctification) Sunday - The Sunday that comes on or after October 30th is called Koodhosh Eetho (Sanctification of Church) Sunday. It is the beginning of the church calendar. Evening...',
      image: '/images/lectionary/lent2.jpg',
      link: '/mosc-old/lectionary/koodosh-eetho-to-kothne',
    },
    {
      id: 'great-lent',
      title: 'Great Lent',
      description: 'First Monday of Great Lent Morning Genesis 1: 1 - 12, Great Wisdom 7: 7 -24, Isaiah 29: 15-24, St. James 1: 2-12, Romans 1:18-25, St. Matthew 4: 1-11, Shub-khono I John 4: 11-20, I...',
      image: '/images/lectionary/lent.jpg',
      link: '/mosc-old/lectionary/great-lent',
    },
    {
      id: 'kyomtho-easter-to-koodosh-edtho',
      title: 'Kyomtho (Easter) to Koodosh Edtho',
      description: 'Easter Sunday Evening St. Mark 16: 1- 8, Midnight St. Luke 24: 1-12, Morning St. John 20: 1-18, Celebration of the Holy Cross Isaiah 60: 17-22, I Peter 5: 5-14, Romans 16: 1-16, St. John 14:...',
      image: '/images/lectionary/lent1.jpg',
      link: '/mosc-old/lectionary/kyomtho-easter-to-koodosh-edtho',
    },
    {
      id: 'special-occasions',
      title: 'Special Occasions',
      description: 'Memory of St. Mary for Special Feasts - Evening St. Luke 8: 16 - 21, Morning St. Mark 3: 31 -35, Before Holy Qurbana Judges 13: 2-1, Zechariah 2: 10 - 13, 4: 1-...',
      image: '/images/lectionary/sp.jpg',
      link: '/mosc-old/lectionary/special-occasions',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background to-muted py-16 lg:py-20">
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
              Lectionary
            </h1>
            <p className="font-body text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
              The liturgical lectionary of the Malankara Orthodox Syrian Church, guiding our community through the sacred scriptures throughout the church year.
            </p>
          </div>
        </div>
      </section>

      {/* Lectionary Periods Grid Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {lectionaryPeriods.map((period) => (
              <Link
                key={period.id}
                href={period.link}
                className="group bg-card rounded-lg sacred-shadow hover:sacred-shadow-lg reverent-transition overflow-hidden"
              >
                <div className="relative w-full h-64">
                  <Image
                    src={period.image}
                    alt={period.title}
                    fill
                    className="object-cover group-hover:scale-105 reverent-transition"
                  />
                </div>
                <div className="p-6">
                  <h2 className="font-heading font-semibold text-2xl text-foreground mb-3 group-hover:text-primary reverent-transition">
                    {period.title}
                  </h2>
                  <p className="font-body text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                    {period.description}
                  </p>
                  <span className="inline-flex items-center font-body text-primary font-medium group-hover:gap-2 reverent-transition">
                    View Readings
                    <svg 
                      className="w-5 h-5 ml-1 group-hover:ml-2 reverent-transition" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About the Lectionary Section */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading font-semibold text-3xl text-foreground mb-6">
              About the Lectionary
            </h2>
            <p className="font-body text-lg text-muted-foreground leading-relaxed mb-6">
              The lectionary is a prescribed set of scripture readings for use during Christian worship, arranged according to the liturgical calendar. Our lectionary guides the faithful through the Holy Bible in a systematic manner throughout the church year.
            </p>
            <p className="font-body text-lg text-muted-foreground leading-relaxed">
              Each period of the church year—from the Sanctification Sunday through Great Lent, from Easter to Koodosh Edtho, and including special feast days—has its own appointed readings that illuminate the theological themes of that season.
            </p>
          </div>
        </div>
      </section>

      {/* How to Use Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading font-semibold text-3xl text-foreground mb-4">
              Using the Lectionary
            </h2>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto">
              The lectionary readings are organized by liturgical seasons and special occasions
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-heading font-medium text-xl text-foreground mb-3">
                Follow the Calendar
              </h3>
              <p className="font-body text-muted-foreground">
                Select the appropriate liturgical period based on the current date in the church calendar
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-heading font-medium text-xl text-foreground mb-3">
                Read Daily
              </h3>
              <p className="font-body text-muted-foreground">
                Find the appointed scripture readings for each day of the week during the liturgical period
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-heading font-medium text-xl text-foreground mb-3">
                Worship Together
              </h3>
              <p className="font-body text-muted-foreground">
                Use these readings for personal devotion or follow along during church services
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}



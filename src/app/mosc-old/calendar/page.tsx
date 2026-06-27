import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Calendar | Malankara Orthodox Syrian Church',
  description: 'Access the liturgical calendar of the Malankara Orthodox Syrian Church with feast days, fasts, and important church dates.',
  keywords: ['MOSC Calendar', 'Liturgical Calendar', 'Orthodox Feast Days', 'Church Calendar', 'Fasting Days'],
};

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background to-muted py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center sacred-shadow">
                <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h1 className="font-heading font-semibold text-4xl lg:text-5xl text-foreground mb-4">
              Liturgical Calendar
            </h1>
            <p className="font-body text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Access the complete liturgical calendar of the Malankara Orthodox Syrian Church with feast days, fasting periods, and important church observances.
            </p>
            <a
              href="http://calendar.mosc.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-primary text-primary-foreground font-body font-semibold text-lg rounded-lg hover:bg-primary/90 reverent-transition sacred-shadow hover:sacred-shadow-lg"
            >
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Access Church Calendar
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* What's in the Calendar */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading font-semibold text-3xl text-foreground mb-4">
              What's in the Calendar
            </h2>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto">
              The liturgical calendar guides our worship throughout the year
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 reverent-transition">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="font-heading font-medium text-xl text-foreground mb-3">
                Feast Days
              </h3>
              <p className="font-body text-muted-foreground leading-relaxed">
                Major and minor feasts throughout the liturgical year
              </p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 reverent-transition">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              </div>
              <h3 className="font-heading font-medium text-xl text-foreground mb-3">
                Fasting Periods
              </h3>
              <p className="font-body text-muted-foreground leading-relaxed">
                Great Lent, Three Days Lent, and other fasting seasons
              </p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 reverent-transition">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-heading font-medium text-xl text-foreground mb-3">
                Daily Prayers
              </h3>
              <p className="font-body text-muted-foreground leading-relaxed">
                Morning and evening prayer times and special services
              </p>
            </div>
            <div className="text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 reverent-transition">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="font-heading font-medium text-xl text-foreground mb-3">
                Special Days
              </h3>
              <p className="font-body text-muted-foreground leading-relaxed">
                Commemorations, parish feasts, and special observances
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* External Calendar CTA */}
      <section className="py-16 bg-primary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-card rounded-lg sacred-shadow p-12">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="font-heading font-semibold text-3xl text-foreground mb-4">
              Official Church Calendar
            </h2>
            <p className="font-body text-lg text-muted-foreground leading-relaxed mb-8">
              The official calendar is maintained on a dedicated platform for easy viewing and regular updates with all liturgical dates, feast days, and special observances. Click below to access the interactive church calendar.
            </p>
            <a
              href="http://calendar.mosc.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-primary text-primary-foreground font-body font-semibold text-lg rounded-lg hover:bg-primary/90 reverent-transition sacred-shadow hover:sacred-shadow-lg"
            >
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Visit calendar.mosc.in
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
            <p className="font-body text-sm text-muted-foreground mt-4">
              (Opens in new window)
            </p>
          </div>
        </div>
      </section>

      {/* Liturgical Seasons */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading font-semibold text-3xl text-foreground mb-4">
              The Liturgical Year
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-muted/30 rounded-lg p-6 sacred-shadow-sm border-l-4 border-primary">
              <h3 className="font-heading font-semibold text-xl text-foreground mb-3">
                Koodosh Eetho (Sanctification)
              </h3>
              <p className="font-body text-muted-foreground leading-relaxed">
                Beginning of the church year, celebrated on or after October 30th
              </p>
            </div>
            <div className="bg-muted/30 rounded-lg p-6 sacred-shadow-sm border-l-4 border-primary">
              <h3 className="font-heading font-semibold text-xl text-foreground mb-3">
                Christmas Season
              </h3>
              <p className="font-body text-muted-foreground leading-relaxed">
                Yeldho (Incarnation) and related feasts celebrating Christ's birth
              </p>
            </div>
            <div className="bg-muted/30 rounded-lg p-6 sacred-shadow-sm border-l-4 border-primary">
              <h3 className="font-heading font-semibold text-xl text-foreground mb-3">
                Baptism of Our Lord (Danaha)
              </h3>
              <p className="font-body text-muted-foreground leading-relaxed">
                January 6th - Epiphany/Theophany, blessing of water
              </p>
            </div>
            <div className="bg-muted/30 rounded-lg p-6 sacred-shadow-sm border-l-4 border-primary">
              <h3 className="font-heading font-semibold text-xl text-foreground mb-3">
                Great Lent
              </h3>
              <p className="font-body text-muted-foreground leading-relaxed">
                50 days of fasting and spiritual preparation for Easter
              </p>
            </div>
            <div className="bg-muted/30 rounded-lg p-6 sacred-shadow-sm border-l-4 border-primary">
              <h3 className="font-heading font-semibold text-xl text-foreground mb-3">
                Kyomtho (Easter)
              </h3>
              <p className="font-body text-muted-foreground leading-relaxed">
                Resurrection Sunday and the 50-day Easter season
              </p>
            </div>
            <div className="bg-muted/30 rounded-lg p-6 sacred-shadow-sm border-l-4 border-primary">
              <h3 className="font-heading font-semibold text-xl text-foreground mb-3">
                Pentecost
              </h3>
              <p className="font-body text-muted-foreground leading-relaxed">
                Descent of the Holy Spirit, 50 days after Easter
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related Resources */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading font-semibold text-3xl text-foreground mb-4">
              Related Resources
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              href="/mosc-old/lectionary"
              className="bg-card rounded-lg p-6 sacred-shadow hover:sacred-shadow-lg reverent-transition text-center group"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 reverent-transition">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-heading font-medium text-lg text-foreground mb-2 group-hover:text-primary reverent-transition">
                Lectionary
              </h3>
              <p className="font-body text-sm text-muted-foreground">
                Scripture readings for each liturgical period
              </p>
            </Link>
            <Link
              href="/mosc-old/downloads/kalpana"
              className="bg-card rounded-lg p-6 sacred-shadow hover:sacred-shadow-lg reverent-transition text-center group"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 reverent-transition">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <h3 className="font-heading font-medium text-lg text-foreground mb-2 group-hover:text-primary reverent-transition">
                Kalpana
              </h3>
              <p className="font-body text-sm text-muted-foreground">
                Download the annual church calendar and directory
              </p>
            </Link>
            <Link
              href="/mosc-old/the-church/church-calendar"
              className="bg-card rounded-lg p-6 sacred-shadow hover:sacred-shadow-lg reverent-transition text-center group"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 reverent-transition">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-heading font-medium text-lg text-foreground mb-2 group-hover:text-primary reverent-transition">
                Church Calendar Info
              </h3>
              <p className="font-body text-sm text-muted-foreground">
                Learn about the liturgical calendar structure
              </p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}





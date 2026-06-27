import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata: Metadata = {
  title: 'Great Lent | Lectionary | MOSC',
  description: 'Scripture readings for the Great Lent period, including daily readings from the first Monday through all weeks of the Great Lent season.',
};

export default function GreatLentPage() {
  const lentWeeks = [
    {
      week: 'First Week of Great Lent',
      days: [
        {
          day: 'First Monday of Great Lent',
          readings: {
            Morning: ['Genesis 1:1-12', 'Great Wisdom 7:7-24', 'Isaiah 29:15-24', 'St. James 1:2-12', 'Romans 1:18-25', 'St. Matthew 4:1-11'],
            'Shub-khono': ['I John 4:11-20', 'I Corinthians 13:1-13', 'St. Matthew 18:18-35'],
          },
        },
        {
          day: 'First Tuesday of Great Lent',
          readings: {
            Evening: ['St. Luke 4:1-15'],
            Morning: ['Exodus 32:30-35', 'Hosea 14:1-9', 'Isaiah 30:1-4', 'St. James 1:12-27', 'Ephesians 4:32-5:21', 'St. Matthew 6:1-6'],
          },
        },
        {
          day: 'First Wednesday of Great Lent',
          readings: {
            Evening: ['St. Matthew 6:19-24', 'St. Luke 16:14-18'],
            Morning: ['Genesis 1:14-18', 'Isaiah 13:6-13', 'St. James 2:1-13', 'Romans 2:7-24', 'St. Matthew 6:25-34'],
          },
        },
        {
          day: 'First Thursday of Great Lent',
          readings: {
            Evening: ['St. Matthew 7:1-12'],
            Morning: ['Exodus 22:5-6', 'I Kings 18:16-24', 'II Kings 17:7-23', 'Isaiah 36:1-7, 37:1-7', 'St. James 2:14-26', 'Romans 2:28-3:8', 'St. Matthew 7:13-27'],
          },
        },
        {
          day: 'First Friday of Great Lent',
          readings: {
            Evening: ['St. Matthew 15:1-9'],
            Morning: ['Genesis 5:28-6:12', 'Proverbs 6:6-23', 'Isaiah 24:1-13', 'St. James 3:1-18', 'Romans 8:1-11', 'St. Matthew 5:1-12'],
          },
        },
        {
          day: 'First Saturday of Great Lent',
          readings: {
            Morning: ['St. Luke 11:5-13'],
            'Before Holy Qurbana': ['Exodus 19:1-6', 'Deuteronomy 28:1-14', 'Isaiah 40:18-31'],
            'Holy Qurbana': ['I Peter 1:13-25', 'Hebrews 12:14-29', 'St. Luke 21:1-9'],
          },
        },
      ],
    },
    {
      week: 'Second Week of Great Lent',
      days: [
        {
          day: 'Second Monday',
          readings: {
            Evening: ['St. Luke 6:36-45'],
            Morning: ['Genesis 9:1-17', 'Isaiah 28:14-29', 'St. James 4:1-17', 'Romans 12:1-21', 'St. Matthew 5:13-26'],
          },
        },
        {
          day: 'Second Tuesday',
          readings: {
            Evening: ['St. Luke 6:46-7:10'],
            Morning: ['Genesis 24:1-20', 'Proverbs 1:20-33', 'Isaiah 29:1-14', 'St. James 5:1-20', 'Ephesians 6:10-20', 'St. Matthew 5:27-37'],
          },
        },
        {
          day: 'Second Wednesday',
          readings: {
            Evening: ['St. Luke 7:11-17, 18-23'],
            Morning: ['Genesis 28:10-22', 'Isaiah 30:18-26', 'I Peter 1:1-12', 'Romans 13:1-14', 'St. Matthew 5:38-48'],
          },
        },
        {
          day: 'Second Thursday',
          readings: {
            Evening: ['St. Luke 7:36-50'],
            Morning: ['Genesis 32:1-32', 'Isaiah 32:1-8', 'I Peter 1:13-25', 'Romans 14:1-12', 'St. Matthew 6:7-15'],
          },
        },
        {
          day: 'Second Friday',
          readings: {
            Evening: ['St. Luke 8:1-15'],
            Morning: ['Genesis 37:1-11', 'Isaiah 33:13-24', 'I Peter 2:1-10', 'Romans 14:13-15:7', 'St. Matthew 6:16-18'],
          },
        },
        {
          day: 'Second Saturday',
          readings: {
            Morning: ['St. Luke 11:14-28'],
            'Before Holy Qurbana': ['Leviticus 26:1-13', 'Deuteronomy 30:1-10', 'Isaiah 44:1-8'],
            'Holy Qurbana': ['I John 4:7-21', 'Hebrews 13:1-16', 'St. Luke 21:10-19'],
          },
        },
      ],
    },
    {
      week: 'Third Week of Great Lent',
      days: [
        {
          day: 'Third Monday',
          readings: {
            Evening: ['St. Luke 9:10-17'],
            Morning: ['Exodus 1:1-22', 'Proverbs 2:1-11', 'Isaiah 35:1-10', 'I Peter 2:11-25', 'Ephesians 1:1-14', 'St. Matthew 16:13-20'],
          },
        },
        {
          day: 'Third Tuesday',
          readings: {
            Evening: ['St. Luke 9:18-27'],
            Morning: ['Exodus 2:11-25', 'Isaiah 37:1-13', 'I Peter 3:1-17', 'Ephesians 1:15-2:10', 'St. Matthew 16:21-28'],
          },
        },
        {
          day: 'Third Wednesday',
          readings: {
            Evening: ['St. Luke 9:28-36'],
            Morning: ['Exodus 3:1-15', 'Isaiah 38:1-8', 'I Peter 3:18-4:6', 'Ephesians 2:11-22', 'St. Matthew 17:1-13'],
          },
        },
        {
          day: 'Third Thursday',
          readings: {
            Evening: ['St. Luke 9:37-45'],
            Morning: ['Exodus 12:1-20', 'Isaiah 40:1-11', 'I Peter 4:7-19', 'Ephesians 3:1-13', 'St. Matthew 17:14-23'],
          },
        },
        {
          day: 'Third Friday',
          readings: {
            Evening: ['St. Luke 9:46-56'],
            Morning: ['Exodus 14:5-31', 'Isaiah 41:1-14', 'I Peter 5:1-14', 'Ephesians 3:14-4:16', 'St. Matthew 18:1-10'],
          },
        },
        {
          day: 'Third Saturday',
          readings: {
            Morning: ['St. Luke 11:29-36'],
            'Before Holy Qurbana': ['Exodus 20:1-21', 'Deuteronomy 5:1-22', 'Isaiah 42:1-9'],
            'Holy Qurbana': ['II Peter 1:1-15', 'Hebrews 9:1-14', 'St. Luke 21:20-28'],
          },
        },
      ],
    },
    {
      week: 'Fourth Week of Great Lent',
      days: [
        {
          day: 'Fourth Monday',
          readings: {
            Evening: ['St. Luke 10:25-37'],
            Morning: ['Exodus 16:1-18', 'Proverbs 3:1-18', 'Isaiah 43:1-13', 'II Peter 1:16-2:9', 'Ephesians 4:17-32', 'St. Matthew 18:21-35'],
          },
        },
        {
          day: 'Fourth Tuesday',
          readings: {
            Evening: ['St. Luke 10:38-11:4'],
            Morning: ['Exodus 17:1-16', 'Isaiah 43:14-44:5', 'II Peter 2:10-22', 'Ephesians 5:1-14', 'St. Matthew 19:1-12'],
          },
        },
        {
          day: 'Fourth Wednesday',
          readings: {
            Evening: ['St. Luke 12:13-34'],
            Morning: ['Exodus 19:1-19', 'Isaiah 44:6-20', 'II Peter 3:1-18', 'Ephesians 5:15-6:9', 'St. Matthew 19:13-26'],
          },
        },
        {
          day: 'Fourth Thursday',
          readings: {
            Evening: ['St. Luke 12:35-48'],
            Morning: ['Exodus 20:22-23:13', 'Isaiah 44:21-45:7', 'I John 1:1-10', 'Ephesians 6:10-24', 'St. Matthew 19:27-20:16'],
          },
        },
        {
          day: 'Fourth Friday',
          readings: {
            Evening: ['St. Luke 12:49-59'],
            Morning: ['Exodus 24:1-18', 'Isaiah 45:8-19', 'I John 2:1-17', 'Colossians 1:1-14', 'St. Matthew 20:17-28'],
          },
        },
        {
          day: 'Fourth Saturday',
          readings: {
            Morning: ['St. Luke 11:37-54'],
            'Before Holy Qurbana': ['Genesis 22:1-19', 'Deuteronomy 8:1-10', 'Isaiah 45:20-46:2'],
            'Holy Qurbana': ['II Timothy 2:1-13', 'Hebrews 11:1-16', 'St. Luke 21:29-38'],
          },
        },
      ],
    },
    {
      week: 'Fifth Week of Great Lent',
      days: [
        {
          day: 'Fifth Monday',
          readings: {
            Evening: ['St. Luke 13:10-21'],
            Morning: ['Exodus 32:1-14', 'Proverbs 4:1-27', 'Isaiah 46:3-13', 'I John 2:18-29', 'Colossians 1:15-29', 'St. Matthew 20:29-21:11'],
          },
        },
        {
          day: 'Fifth Tuesday',
          readings: {
            Evening: ['St. Luke 13:22-35'],
            Morning: ['Exodus 33:1-23', 'Isaiah 47:1-15', 'I John 3:1-12', 'Colossians 2:1-15', 'St. Matthew 21:12-22'],
          },
        },
        {
          day: 'Fifth Wednesday',
          readings: {
            Evening: ['St. Luke 14:1-14'],
            Morning: ['Exodus 34:1-17', 'Isaiah 48:1-11', 'I John 3:13-24', 'Colossians 2:16-3:4', 'St. Matthew 21:23-32'],
          },
        },
        {
          day: 'Fifth Thursday',
          readings: {
            Evening: ['St. Luke 14:15-35'],
            Morning: ['Leviticus 16:1-24', 'Isaiah 48:12-49:6', 'I John 4:1-21', 'Colossians 3:5-17', 'St. Matthew 21:33-46'],
          },
        },
        {
          day: 'Fifth Friday',
          readings: {
            Evening: ['St. Luke 15:1-10'],
            Morning: ['Leviticus 19:1-18', 'Isaiah 49:7-18', 'I John 5:1-12', 'Colossians 3:18-4:6', 'St. Matthew 22:1-14'],
          },
        },
        {
          day: 'Fifth Saturday',
          readings: {
            Morning: ['St. Luke 12:1-12'],
            'Before Holy Qurbana': ['Job 1:1-22', 'Job 2:1-10', 'Isaiah 49:19-50:4'],
            'Holy Qurbana': ['II Timothy 3:10-4:8', 'Hebrews 11:17-31', 'St. Matthew 5:1-16'],
          },
        },
      ],
    },
    {
      week: 'Sixth Week of Great Lent',
      days: [
        {
          day: 'Sixth Monday',
          readings: {
            Evening: ['St. Luke 15:11-32'],
            Morning: ['Numbers 11:16-35', 'Proverbs 5:1-23', 'Isaiah 50:5-11', 'I John 5:13-21', 'Colossians 4:7-18', 'St. Matthew 22:15-33'],
          },
        },
        {
          day: 'Sixth Tuesday',
          readings: {
            Evening: ['St. Luke 16:1-13'],
            Morning: ['Numbers 13:1-14:10', 'Isaiah 51:1-11', 'II John 1:1-13', 'I Timothy 1:1-17', 'St. Matthew 22:34-23:12'],
          },
        },
        {
          day: 'Sixth Wednesday',
          readings: {
            Evening: ['St. Luke 16:14-31'],
            Morning: ['Numbers 16:1-40', 'Isaiah 51:12-52:2', 'III John 1:1-14', 'I Timothy 1:18-2:15', 'St. Matthew 23:13-39'],
          },
        },
        {
          day: 'Sixth Thursday',
          readings: {
            Evening: ['St. Luke 17:1-10'],
            Morning: ['Numbers 20:1-13', 'Isaiah 52:3-12', 'Jude 1:1-25', 'I Timothy 3:1-16', 'St. Matthew 24:1-14'],
          },
        },
        {
          day: 'Sixth Friday',
          readings: {
            Evening: ['St. Luke 17:11-19'],
            Morning: ['Numbers 21:4-9', 'Isaiah 52:13-53:12', 'Revelation 1:1-20', 'I Timothy 4:1-16', 'St. Matthew 24:15-35'],
          },
        },
        {
          day: 'Sixth Saturday',
          readings: {
            Morning: ['St. Luke 17:20-37'],
            'Before Holy Qurbana': ['Job 38:1-41', 'Job 40:1-41:34', 'Isaiah 54:1-14'],
            'Holy Qurbana': ['II Timothy 4:9-22', 'Hebrews 11:32-12:2', 'St. Matthew 5:17-26'],
          },
        },
      ],
    },
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
            <Link href="/mosc-old/lectionary" className="hover:text-primary reverent-transition">
              Lectionary
            </Link>
            <span>/</span>
            <span className="text-foreground">Great Lent</span>
          </nav>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background to-muted py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="relative w-full h-80 lg:h-96 rounded-lg overflow-hidden sacred-shadow-lg">
              <Image
                src="/images/lectionary/lent.jpg"
                alt="Great Lent"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div>
              <h1 className="font-heading font-semibold text-4xl lg:text-5xl text-foreground mb-4">
                Great Lent
              </h1>
              <p className="font-body text-lg text-muted-foreground leading-relaxed mb-4">
                The Great Lent is a 50-day period of fasting, prayer, and spiritual renewal in preparation for the Resurrection of our Lord. It is a time of intense spiritual discipline and repentance.
              </p>
              <p className="font-body text-lg text-muted-foreground leading-relaxed">
                Daily scripture readings guide the faithful through this sacred season, focusing on repentance, renewal, and preparation for the celebration of Easter.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Readings Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-16">
            {lentWeeks.map((week, weekIndex) => (
              <div key={weekIndex}>
                <h2 className="font-heading font-semibold text-3xl text-foreground mb-8 pb-4 border-b-2 border-primary">
                  {week.week}
                </h2>
                <div className="space-y-8">
                  {week.days.map((day, dayIndex) => (
                    <div key={dayIndex} className="bg-muted/30 rounded-lg p-6 sacred-shadow-sm">
                      <h3 className="font-heading font-medium text-2xl text-foreground mb-4">
                        {day.day}
                      </h3>
                      <div className="space-y-4">
                        {Object.entries(day.readings).map(([time, verses], timeIndex) => (
                          <div key={timeIndex} className="border-l-4 border-primary pl-6">
                            <h4 className="font-heading font-medium text-lg text-primary mb-2">
                              {time}
                            </h4>
                            <ul className="space-y-1">
                              {verses.map((verse, verseIndex) => (
                                <li key={verseIndex} className="font-body text-muted-foreground flex items-start">
                                  <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                  <span>{verse}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
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
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link
              href="/mosc-old/lectionary/koodosh-eetho-to-kothne"
              className="inline-flex items-center px-6 py-3 bg-card text-foreground font-body font-medium rounded-lg hover:bg-muted reverent-transition sacred-shadow"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous: Koodosh Eetho to Kothne
            </Link>
            <Link
              href="/mosc-old/lectionary/kyomtho-easter-to-koodosh-edtho"
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-body font-medium rounded-lg hover:bg-primary/90 reverent-transition sacred-shadow"
            >
              Next: Kyomtho (Easter)
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}



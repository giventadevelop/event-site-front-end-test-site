import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata: Metadata = {
  title: 'Special Occasions | Lectionary | MOSC',
  description: 'Scripture readings for special occasions and feast days in the Malankara Orthodox Syrian Church, including feasts of saints, martyrs, and sacraments.',
};

export default function SpecialOccasionsPage() {
  const specialOccasions = [
    {
      title: 'Memory of St. Mary for Special Feasts',
      sections: [
        { time: 'Evening', verses: ['St. Luke 8:16-21'] },
        { time: 'Morning', verses: ['St. Mark 3:31-35'] },
        { time: 'Before Holy Qurbana', verses: ['Judges 13:2-14', 'Zechariah 2:10-13, 4:1-7, 8:3'] },
        { time: 'Holy Qurbana', verses: ['I John 3:2-17', 'Hebrews 2:14-18', 'St. Luke 1:26-38'] },
      ],
    },
    {
      title: 'Feast of an Apostle',
      sections: [
        { time: 'Evening', verses: ['St. Matthew 9:35-10:10'] },
        { time: 'Morning', verses: ['St. Matthew 19:27-30'] },
        { time: 'Before Holy Qurbana', verses: ['Genesis 12:1-9', 'Daniel 1:8-21', 'Isaiah 43:1-7'] },
        { time: 'Holy Qurbana', verses: ['Acts 1:12-14', 'I Corinthians 12:28-13:10', 'St. Luke 6:12-23'] },
      ],
    },
    {
      title: 'Feast of St. Thomas',
      sections: [
        { time: 'Evening', verses: ['St. John 11:5-16'] },
        { time: 'Morning', verses: ['St. John 14:1-7'] },
        { time: 'Before Holy Qurbana', verses: ['Genesis 9:1-12', 'Daniel 1:8-21', 'Isaiah 43:1-7'] },
        { time: 'Holy Qurbana', verses: ['Acts 1:12-14', 'I Corinthians 12:28-13:10', 'St. John 20:19-31'] },
      ],
    },
    {
      title: 'Feast of a Martyr',
      sections: [
        { time: 'Evening', verses: ['St. Matthew 10:16-33'] },
        { time: 'Morning', verses: ['St. Luke 12:1-12'] },
        { time: 'Before Holy Qurbana', verses: ['Genesis 4:3-12', 'Daniel 3:14-30'] },
        { time: 'Holy Qurbana', verses: ['Acts 23:11-25', 'Romans 8:31-39', 'St. Mark 8:34-38, 13:9-13'] },
      ],
    },
    {
      title: 'Feast of a Saint',
      sections: [
        { time: 'Evening', verses: ['St. John 15:12-21, 16:1-3'] },
        { time: 'Morning', verses: ['St. Mark 10:28-31'] },
        { time: 'Before Holy Qurbana', verses: ['Genesis 19:15-23', 'Job 1:12-22', 'Isaiah 38:1-8'] },
        { time: 'Holy Qurbana', verses: ['Acts 27:9-26', 'Hebrews 10:33-11:7', 'St. Matthew 10:34-42'] },
      ],
    },
    {
      title: 'Memory of a Saint Lady',
      sections: [
        { time: 'Evening', verses: ['St. Luke 10:38-42, 8:1-3'] },
        { time: 'Morning', verses: ['St. Luke 8:1-3'] },
        { time: 'Before Holy Qurbana', verses: ['Genesis 21:1-8, 24:15-27', 'Ecclesiastes 12:1-8', 'Isaiah 56:1-5'] },
        { time: 'Holy Qurbana', verses: ['Acts 9:36-43', 'Romans 16:1-16', 'St. Matthew 25:1-13'] },
      ],
    },
    {
      title: 'Memory of Martyrs, Malpans, and Holy Fathers',
      sections: [
        { time: 'Evening', verses: ['St. John 17:11-26'] },
        { time: 'Morning', verses: ['St. Matthew 25:31-46'] },
        { time: 'Before Holy Qurbana', verses: ['Numbers 27:1, 5-23', 'II Kings 2:1-15'] },
        { time: 'Holy Qurbana', verses: ['Acts 12:1-17', 'Romans 3:19-26', 'St. Luke 18:9-14'] },
      ],
    },
    {
      title: 'Mission Sunday (First Sunday of July)',
      sections: [
        { time: 'Before Holy Qurbana', verses: ['Jonah 3:1-10', 'Ezekiel 37:1-14'] },
        { time: 'Holy Qurbana', verses: ['Acts 1:2-8, 2:1-13', 'Romans 10:13-21', 'I Corinthians 9:15-17', 'St. Matthew 28:16-20'] },
      ],
    },
    {
      title: `During God's Wrath and Punishment`,
      sections: [
        { time: 'Evening', verses: ['St. Luke 13:6-17'] },
        { time: 'Morning', verses: ['St. Matthew 7:7-11'] },
        { time: 'Before Holy Qurbana', verses: ['Genesis 18:17, 20-33', 'Jonah 3:1-10'] },
        { time: 'Holy Qurbana', verses: ['St. James 5:7-20', 'Hebrews 12:3-11', 'St. Mark 11:23-12:13', 'St. Luke 11:2-13'] },
      ],
    },
  ];

  const sacraments = [
    {
      title: 'Holy Baptism',
      readings: ['Romans 5:20-6:14', 'Colossians 2:1-12', 'St. Luke 3:15-16', 'St. John 3:1-8'],
    },
    {
      title: 'Holy Mooron (Chrismation)',
      readings: [
        'Genesis 28:10-20',
        'Numbers 6:22-7:11',
        'I Samuel 16:1-13',
        'Psalms 45:1-17',
        'I Kings 1:32-40',
        'Song of Solomon 1:2-11, 3:6, 4:10-15',
        'II Kings 9:1-6',
        'Isaiah 61:1-6',
        'I John 2:21-3:1',
        'I Corinthians 2:12-17',
        'St. Matthew 26:6-13',
        'St. John 12:3-8',
      ],
    },
    {
      title: 'Holy Confession',
      readings: [
        'Exodus 20:2-17',
        'Psalms 6, 32, 38, 51, 102, 130, 143',
        'Deuteronomy 5:6-21',
        'Job 22:22-30',
        'St. James 5:12-18',
        'I Corinthians 6:9-20',
        'Colossians 3:12-17',
        'St. Luke 15:1-32',
        'St. John 20:21-23',
      ],
    },
    {
      title: 'Holy Qurbana (Eucharist)',
      readings: ['Psalms 8, 15, 16, 23, 29, 34, 40, 84, 103, 116, 119:23-40, 119:97-112, 121, 139, 147, 150'],
    },
  ];

  const ordinations = [
    {
      title: `M'samrono (Reader)`,
      readings: ['Psalms 50', 'St. Luke 10:17-24'],
    },
    {
      title: 'Qorooyo (Sub-Deacon)',
      readings: ['Proverbs 1:1-9', 'I John 2:12-29', 'St. Luke 10:16-25'],
    },
    {
      title: 'Youphidakino (Sub-Deacon)',
      readings: ['Isaiah 44:1-4, 61:1-4', 'I Timothy 3:8-13', 'St. Luke 10:1-16'],
    },
    {
      title: `M'Shamshono (The Full Deacon)`,
      readings: ['Acts 6:1-8', 'I Timothy 3:8-13, 1-7', 'St. John 12:24-26, 13:1-15'],
    },
    {
      title: 'Kasheesho (Priest)',
      readings: ['Exodus 28:1-4', 'Numbers 8:5-22', 'I Samuel 2:30-35', 'Psalms 110', 'Hebrews 5:1-10', 'St. John 20:19-23'],
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
            <span className="text-foreground">Special Occasions</span>
          </nav>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background to-muted py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="relative w-full h-80 lg:h-96 rounded-lg overflow-hidden sacred-shadow-lg">
              <Image
                src="/images/lectionary/sp.jpg"
                alt="Special Occasions"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div>
              <h1 className="font-heading font-semibold text-4xl lg:text-5xl text-foreground mb-4">
                Special Occasions
              </h1>
              <p className="font-body text-lg text-muted-foreground leading-relaxed mb-4">
                Scripture readings for special feast days, commemorations of saints and martyrs, and the celebration of the holy sacraments of the Church.
              </p>
              <p className="font-body text-lg text-muted-foreground leading-relaxed">
                These readings guide us through the sacred occasions that mark important moments in the life of the Church and the spiritual journey of the faithful.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feast Days Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading font-semibold text-3xl text-foreground mb-8 pb-4 border-b-2 border-primary">
            Feast Days and Commemorations
          </h2>
          <div className="space-y-12">
            {specialOccasions.map((occasion, index) => (
              <div key={index} className="bg-muted/30 rounded-lg p-6 sacred-shadow-sm">
                <h3 className="font-heading font-medium text-2xl text-foreground mb-6">
                  {occasion.title}
                </h3>
                <div className="space-y-4">
                  {occasion.sections.map((section, sIndex) => (
                    <div key={sIndex} className="border-l-4 border-primary pl-6">
                      <h4 className="font-heading font-medium text-lg text-primary mb-2">
                        {section.time}
                      </h4>
                      <ul className="space-y-1">
                        {section.verses.map((verse, vIndex) => (
                          <li key={vIndex} className="font-body text-muted-foreground flex items-start">
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
      </section>

      {/* Sacraments Section */}
      <section className="py-16 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading font-semibold text-3xl text-foreground mb-8 pb-4 border-b-2 border-primary">
            Holy Sacraments
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {sacraments.map((sacrament, index) => (
              <div key={index} className="bg-card rounded-lg p-6 sacred-shadow">
                <h3 className="font-heading font-medium text-xl text-foreground mb-4">
                  {sacrament.title}
                </h3>
                <div className="border-l-4 border-primary pl-6">
                  <h4 className="font-heading font-medium text-sm text-primary mb-2">
                    Readings
                  </h4>
                  <ul className="space-y-1">
                    {sacrament.readings.map((reading, rIndex) => (
                      <li key={rIndex} className="font-body text-sm text-muted-foreground flex items-start">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span>{reading}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ordinations Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading font-semibold text-3xl text-foreground mb-8 pb-4 border-b-2 border-primary">
            Holy Priesthood Ordinations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ordinations.map((ordination, index) => (
              <div key={index} className="bg-muted/30 rounded-lg p-6 sacred-shadow-sm">
                <h3 className="font-heading font-medium text-lg text-foreground mb-4">
                  {ordination.title}
                </h3>
                <div className="border-l-4 border-primary pl-6">
                  <h4 className="font-heading font-medium text-sm text-primary mb-2">
                    Readings
                  </h4>
                  <ul className="space-y-1">
                    {ordination.readings.map((reading, rIndex) => (
                      <li key={rIndex} className="font-body text-sm text-muted-foreground flex items-start">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                        <span>{reading}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Info Box */}
      <section className="py-12 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-lg sacred-shadow p-8">
            <h2 className="font-heading font-semibold text-2xl text-foreground mb-4">
              About Special Occasions
            </h2>
            <p className="font-body text-lg text-muted-foreground leading-relaxed mb-4">
              The Church celebrates numerous feast days throughout the year, honoring the memory of saints, martyrs, apostles, and the blessed Mother of God. Each of these occasions has its own appointed scripture readings that reflect the life and witness of those being commemorated.
            </p>
            <p className="font-body text-lg text-muted-foreground leading-relaxed">
              The readings for the sacraments and ordinations highlight the sacred nature of these holy mysteries through which God's grace is bestowed upon the faithful.
            </p>
          </div>
        </div>
      </section>

      <QuickLinks />

      {/* Navigation */}
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link
              href="/mosc-old/lectionary/kyomtho-easter-to-koodosh-edtho"
              className="inline-flex items-center px-6 py-3 bg-card text-foreground font-body font-medium rounded-lg hover:bg-muted reverent-transition sacred-shadow"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous: Kyomtho (Easter)
            </Link>
            <Link
              href="/mosc-old/lectionary"
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-body font-medium rounded-lg hover:bg-primary/90 reverent-transition sacred-shadow"
            >
              Back to Lectionary Overview
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}



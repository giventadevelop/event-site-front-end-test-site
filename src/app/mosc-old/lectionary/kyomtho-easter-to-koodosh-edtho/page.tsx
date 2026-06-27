import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata: Metadata = {
  title: 'Kyomtho (Easter) to Koodosh Edtho | Lectionary | MOSC',
  description: 'Scripture readings from Easter Sunday (Kyomtho) through the celebration of the Resurrection to Koodosh Edtho, including readings for the Easter season.',
};

export default function KyomthoEasterPage() {
  const easterPeriod = [
    {
      title: 'Easter Sunday',
      sections: [
        { time: 'Evening', verses: ['St. Mark 16:1-8'] },
        { time: 'Midnight', verses: ['St. Luke 24:1-12'] },
        { time: 'Morning', verses: ['St. John 20:1-18'] },
        { time: 'Celebration of the Holy Cross', verses: ['Isaiah 60:17-22', 'I Peter 5:5-14', 'Romans 16:1-16', 'St. John 14:27, 15:11-15, 17-19'] },
        { time: 'Before Holy Qurbana', verses: ['Leviticus 23:26-32', 'Isaiah 60:1-7, 11-16, 61:10-62:5', 'Joel 2:21-3'] },
        { time: 'Holy Qurbana', verses: ['Acts 2:22-36', 'I Corinthians 15:1-19', 'St. Matthew 28:1-20'] },
      ],
    },
    {
      title: 'Hevorae Monday (Monday after Easter)',
      sections: [
        { time: 'Evening', verses: ['St. Luke 24:13-35'] },
        { time: 'Morning', verses: ['St. Matthew 28:11-20'] },
        { time: 'Before Holy Qurbana', verses: ['Genesis 41:41-46', 'Jeremiah 1:4-12', 'Isaiah 40:9-15'] },
        { time: 'Holy Qurbana', verses: ['I Peter 5:1-8', 'Romans 6:12-23', 'St. John 2:18-25'] },
      ],
    },
    {
      title: 'Hevorae Tuesday',
      sections: [
        { time: 'Evening', verses: ['St. Mark 15:37-47, 16:1-8'] },
        { time: 'Morning', verses: ['St. Mark 16:9-18'] },
        { time: 'Before Holy Qurbana', verses: ['Exodus 14:26-31', 'Joshua 6:6-21', 'Great Wisdom 1:1-18'] },
        { time: 'Holy Qurbana', verses: ['Acts 13:26-39', 'Ephesians 6:10-20', 'St. Mark 8:11-21'] },
      ],
    },
    {
      title: 'Hevorae Wednesday',
      sections: [
        { time: 'Evening', verses: ['St. Luke 23:46-56, 24:1-12'] },
        { time: 'Morning', verses: ['St. Luke 24:13-35'] },
        { time: 'Before Holy Qurbana', verses: ['Exodus 40:1-16', 'Joshua 2:1-6', 'Isaiah 49:13-21'] },
        { time: 'Holy Qurbana', verses: ['Acts 4:8-21', 'Hebrews 3:1-13', 'St. Mark 8:27-33'] },
      ],
    },
    {
      title: 'Hevorae Thursday',
      sections: [
        { time: 'Evening', verses: ['St. John 19:30-20:2'] },
        { time: 'Morning', verses: ['St. John 20:3-18'] },
        { time: 'Before Holy Qurbana', verses: ['Exodus 34:4-12', 'Micah 4:1-7', 'Zechariah 8:4-9', 'Isaiah 37:8-17'] },
        { time: 'Holy Qurbana', verses: ['Acts 5:12-26', 'Hebrews 10:1-18', 'St. Luke 7:36-50'] },
      ],
    },
    {
      title: 'Hevorae Friday',
      sections: [
        { time: 'Evening', verses: ['St. Luke 7:36-50'] },
        { time: 'Morning', verses: ['St. John 20:19-31'] },
        { time: 'Before Holy Qurbana', verses: ['I Samuel 2:1-10', 'Ezekiel 37:1-14', 'Isaiah 26:1-19'] },
        { time: 'Holy Qurbana', verses: ['Acts 9:32-42', 'Romans 14:7-12', 'St. John 21:1-14'] },
      ],
    },
    {
      title: 'Hevorae Saturday',
      sections: [
        { time: 'Evening', verses: ['St. John 21:1-14'] },
        { time: 'Morning', verses: ['St. John 21:15-25'] },
        { time: 'Before Holy Qurbana', verses: ['Daniel 3:1-30', 'Hosea 13:14-14:9', 'Isaiah 25:1-12'] },
        { time: 'Holy Qurbana', verses: ['Acts 2:42-3:11', 'Colossians 3:1-11', 'St. Luke 24:36-48'] },
      ],
    },
    {
      title: 'First Sunday After Easter',
      description: 'New Sunday - The Sunday of the Renewal of Life',
      sections: [
        { time: 'Evening', verses: ['St. John 20:19-31'] },
        { time: 'Morning', verses: ['St. Mark 16:9-20'] },
        { time: 'Before Holy Qurbana', verses: ['Genesis 1:1-2:3', 'Ezekiel 36:16-38', 'Isaiah 43:1-15'] },
        { time: 'Holy Qurbana', verses: ['Acts 4:32-5:11', 'I John 5:1-13', 'St. John 20:19-31'] },
      ],
    },
    {
      title: 'Second Sunday After Easter',
      description: 'Sunday of the Good Shepherd',
      sections: [
        { time: 'Evening', verses: ['St. John 10:1-18'] },
        { time: 'Morning', verses: ['St. Luke 15:1-10'] },
        { time: 'Before Holy Qurbana', verses: ['Genesis 48:1-22', 'Ezekiel 34:1-31', 'Isaiah 40:1-11'] },
        { time: 'Holy Qurbana', verses: ['Acts 4:5-22', 'I Peter 2:21-25', 'St. John 10:1-18'] },
      ],
    },
    {
      title: 'Third Sunday After Easter',
      description: 'Sunday of the Paralytic',
      sections: [
        { time: 'Evening', verses: ['St. John 5:1-18'] },
        { time: 'Morning', verses: ['St. Luke 13:10-17'] },
        { time: 'Before Holy Qurbana', verses: ['Genesis 49:1-28', 'II Kings 20:1-11', 'Isaiah 38:1-22'] },
        { time: 'Holy Qurbana', verses: ['Acts 9:1-22', 'I Peter 3:8-22', 'St. John 5:1-18'] },
      ],
    },
    {
      title: 'Fourth Sunday After Easter',
      description: 'Sunday of the Samaritan Woman',
      sections: [
        { time: 'Evening', verses: ['St. John 4:1-42'] },
        { time: 'Morning', verses: ['St. Luke 7:36-50'] },
        { time: 'Before Holy Qurbana', verses: ['Genesis 24:1-67', 'Exodus 2:15-22', 'Isaiah 55:1-13'] },
        { time: 'Holy Qurbana', verses: ['Acts 8:26-40', 'I Peter 2:1-10', 'St. John 4:1-42'] },
      ],
    },
    {
      title: 'Fifth Sunday After Easter',
      description: 'Sunday of the Blind Man',
      sections: [
        { time: 'Evening', verses: ['St. John 9:1-41'] },
        { time: 'Morning', verses: ['St. Matthew 9:27-31'] },
        { time: 'Before Holy Qurbana', verses: ['I Samuel 16:1-13', 'Job 42:1-17', 'Isaiah 29:13-24'] },
        { time: 'Holy Qurbana', verses: ['Acts 16:16-34', 'Ephesians 5:8-21', 'St. John 9:1-41'] },
      ],
    },
    {
      title: 'Sixth Sunday After Easter',
      description: 'Sunday of the Man at the Pool',
      sections: [
        { time: 'Evening', verses: ['St. John 5:19-47'] },
        { time: 'Morning', verses: ['St. Matthew 12:9-14'] },
        { time: 'Before Holy Qurbana', verses: ['Exodus 15:22-16:10', 'Numbers 21:4-9', 'Isaiah 49:8-18'] },
        { time: 'Holy Qurbana', verses: ['Acts 14:8-18', 'Hebrews 10:19-25', 'St. Mark 2:1-12'] },
      ],
    },
    {
      title: 'Ascension of Our Lord',
      description: 'Forty days after Easter',
      sections: [
        { time: 'Evening', verses: ['St. Luke 24:44-53'] },
        { time: 'Morning', verses: ['St. Mark 16:14-20'] },
        { time: 'Before Holy Qurbana', verses: ['Genesis 5:18-24', 'II Kings 2:1-18', 'Isaiah 52:7-12'] },
        { time: 'Holy Qurbana', verses: ['Acts 1:1-14', 'Ephesians 4:1-16', 'St. Luke 24:36-53'] },
      ],
    },
    {
      title: 'Sunday After Ascension',
      description: 'Expectation of the Holy Spirit',
      sections: [
        { time: 'Evening', verses: ['St. John 14:15-31'] },
        { time: 'Morning', verses: ['St. John 15:26-16:4'] },
        { time: 'Before Holy Qurbana', verses: ['Genesis 11:1-9', 'Numbers 11:16-30', 'Joel 2:28-3:5'] },
        { time: 'Holy Qurbana', verses: ['Acts 1:15-26', 'I John 5:13-21', 'St. John 17:1-26'] },
      ],
    },
    {
      title: 'Pentecost (Descent of the Holy Spirit)',
      description: 'Fifty days after Easter',
      sections: [
        { time: 'Evening', verses: ['St. John 20:19-23'] },
        { time: 'Morning', verses: ['St. John 14:15-31'] },
        { time: 'Before Holy Qurbana', verses: ['Genesis 11:1-9', 'Exodus 19:1-19', 'Joel 2:28-3:5'] },
        { time: 'Holy Qurbana', verses: ['Acts 2:1-21', 'I Corinthians 12:1-13', 'St. John 14:15-31'] },
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
            <span className="text-foreground">Kyomtho (Easter) to Koodosh Edtho</span>
          </nav>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background to-muted py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="relative w-full h-80 lg:h-96 rounded-lg overflow-hidden sacred-shadow-lg">
              <Image
                src="/images/lectionary/lent1.jpg"
                alt="Kyomtho (Easter) to Koodosh Edtho"
                fill
                className="object-cover"
                priority
              />
            </div>
            <div>
              <h1 className="font-heading font-semibold text-4xl lg:text-5xl text-foreground mb-4">
                Kyomtho (Easter) to Koodosh Edtho
              </h1>
              <p className="font-body text-lg text-muted-foreground leading-relaxed mb-4">
                The Easter season (Kyomtho) celebrates the Resurrection of our Lord Jesus Christ and continues for fifty days until Pentecost, culminating in the feast of Koodosh Edtho.
              </p>
              <p className="font-body text-lg text-muted-foreground leading-relaxed">
                This joyous period includes the appearances of the Risen Lord, His Ascension into Heaven, and the descent of the Holy Spirit at Pentecost.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Readings Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {easterPeriod.map((period, index) => (
              <div key={index} className="bg-card rounded-lg sacred-shadow p-8">
                <h2 className="font-heading font-semibold text-2xl lg:text-3xl text-foreground mb-3">
                  {period.title}
                </h2>
                {period.description && (
                  <p className="font-body text-lg text-muted-foreground leading-relaxed mb-6 italic">
                    {period.description}
                  </p>
                )}
                <div className="space-y-6">
                  {period.sections.map((section, sIndex) => (
                    <div key={sIndex} className="border-l-4 border-primary pl-6">
                      <h3 className="font-heading font-medium text-xl text-foreground mb-3">
                        {section.time}
                      </h3>
                      <ul className="space-y-2">
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

      {/* Info Box */}
      <section className="py-12 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-lg sacred-shadow p-8">
            <h2 className="font-heading font-semibold text-2xl text-foreground mb-4">
              About the Easter Season
            </h2>
            <p className="font-body text-lg text-muted-foreground leading-relaxed mb-4">
              The fifty days from Easter Sunday to Pentecost are celebrated as a single festival, sometimes called &quot;the great Sunday.&quot; These are days of joy and exultation when the Church celebrates the Resurrection and Ascension of Christ and awaits the coming of the Holy Spirit.
            </p>
            <p className="font-body text-lg text-muted-foreground leading-relaxed">
              The Gospel readings during this period focus on the post-Resurrection appearances of Jesus, His teachings to the disciples, and preparation for the coming of the Paraclete, the Holy Spirit.
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
              href="/mosc-old/lectionary/great-lent"
              className="inline-flex items-center px-6 py-3 bg-card text-foreground font-body font-medium rounded-lg hover:bg-muted reverent-transition sacred-shadow"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous: Great Lent
            </Link>
            <Link
              href="/mosc-old/lectionary/special-occasions"
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-body font-medium rounded-lg hover:bg-primary/90 reverent-transition sacred-shadow"
            >
              Next: Special Occasions
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



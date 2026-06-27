import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata: Metadata = {
  title: 'Sruti School of Liturgical Music | Training | MOSC',
  description: 'Learn about Sruti School of Liturgical Music - training in Eastern Orthodox Church Music, Karnatic, Western, and Instrumental Music.',
};

export default function SrutiSchoolPage() {
  const objectives = [
    'To bring about a systematic and ordered enhancement of the Liturgical and devotional music of the Malankara Orthodox Syrian Church.',
    'To provide courses, seminars and classes in Liturgical, Classical, Western, Instrumental and Light Music to interested and talented students.',
    'To develop the expertise and leadership qualities of choir leaders and members so as to better equip them to organise choirs in their respective parishes and thereby to bring about a uniformity and standard in the hymnody of the Orthodox Church.',
    'To conduct training camps at Central Diocesan and District levels in Church Music, so as to assist the Orthodox Church to retrieve and preserve its ancient musical heritage.',
    'To facilitate the research and scientific study of ancient Indian, Non-Indian and Western Music and their respective historical developments, contributions and influences.',
    'To recover and popularise ancient Liturgical Music and its tunes.',
    'To produce quality audio and video cassette recordings in order to broaden the appeal of Liturgical and Christian Music.',
    'To guide talented musicians to compose tunes, songs and hymns based on indigenous foundations for utilisation in the worship and services of the Orthodox Church.',
    'To publish journals, periodicals and bulletins aimed at encouraging the scholarly and scientific study of music, thereby leading to its enrichment.',
    'To raise funds and sources to further the above objectives and to facilitate the setting up of a modern recording studio.',
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <section className="bg-muted py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center space-x-2 font-body text-sm text-muted-foreground">
            <Link href="/mosc-old" className="hover:text-primary reverent-transition">MOSC</Link>
            <span>/</span>
            <Link href="/mosc-old/training" className="hover:text-primary reverent-transition">Training</Link>
            <span>/</span>
            <span className="text-foreground">Sruti School of Liturgical Music</span>
          </nav>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background to-muted py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="relative w-full h-80 lg:h-96 rounded-lg overflow-hidden sacred-shadow-lg">
              <Image src="/images/training/sruti.jpg" alt="Sruti School of Liturgical Music" fill className="object-cover" priority />
            </div>
            <div>
              <h1 className="font-heading font-semibold text-4xl lg:text-5xl text-foreground mb-4">
                Sruti School of Liturgical Music
              </h1>
              <p className="font-body text-lg text-muted-foreground leading-relaxed">
                A premier institution for systematic training in Orthodox liturgical music, Karnatic music, Western music, and instrumental music.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <div className="space-y-6 font-body text-lg text-muted-foreground leading-relaxed">
              <p>
                The Sruti School of Liturgical Music is the realization of a long-cherished desire of the Orthodox Theological Seminary to effect a systematised and organised form to the music and hymnody of the Malankara Orthodox Syrian Church. A prime objective of the institution is to foster the integration of the existing music in the Church with the indigenous music, so as to bring about an authentic Indian worship service in the Church. Since its inception, these objectives have been enlarged in scope to embrace not only the teaching of Eastern Orthodox Church Music, but also Karnatic, Western and Instrumental Music.
              </p>
              <p>
                The School began functioning with an informal inauguration by H.H. Moran Mar Baselius Mar Thoma Mathews I, the former Catholicos, in September, 1988. The success of this initial project can be measured by the fact that fifty (50) students participated, completing the course involving the basics of music, such as its theory, musical notation liturgical and instrumental music. The programme proved to be immensely helpful in assisting the local parishes to organise their services through the assistance of these students.
              </p>
              <p>
                The formal inauguration of the School of Liturgical music was held on 9th January, 1989 at the Orthodox Theological Seminary. His Holiness Theoktist, the Patriarch of the Romanian Orthodox Church, was the Chief guest and inaugurated the School. The first batch of students was officially enrolled in the two year diploma course in April 1989.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Aims & Objectives */}
      <section className="py-16 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading font-semibold text-3xl text-foreground mb-8 pb-4 border-b-2 border-primary">
            Aims & Objectives
          </h2>
          <div className="space-y-4">
            {objectives.map((objective, index) => (
              <div key={index} className="flex items-start bg-card rounded-lg p-6 sacred-shadow-sm">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                  <span className="font-heading font-semibold text-primary-foreground">{index + 1}</span>
                </div>
                <p className="font-body text-muted-foreground leading-relaxed flex-1">
                  {objective}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Syriac Music Section */}
      <section className="py-16 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading font-semibold text-3xl text-foreground mb-6">
            Syriac Music
          </h2>
          <div className="space-y-6 font-body text-lg text-muted-foreground leading-relaxed">
            <p>
              Syriac belongs to the family of Semitic language and its development can be traced back to its source the Aramaic language around the second century A.D. At one time it was the vernacular of Syria and its adjacent regions. Today, however, its usage is restricted to the worship and liturgy of the Eastern Churches in these areas. Due to the many contacts between and the influence of these churches on the nascent Malankara church, Syriac became the dominant liturgical language of the Malankara Christians. This accounts for the popular designation "Syrian Christians".
            </p>
            <p>
              The fundamental principles of Syriac Music are based on the octo-echoes (eight modes or eight colours). The use of these modes are determined by the liturgical calendar, such as the feasts associated with the incarnation, the feasts in commemoration of St.Mary and the saints. For instance, Christmas and Easter use the first mode, on the feast of Epiphany we use the second, the feast day of saints use the eighth mode and the feast day of the departed Church leaders and fathers use the 7th (seventh) mode.
            </p>
            <p>
              In order to fully appreciate the church's liturgy, the study of Syriac Music is indispensable. Melodious and strongly influenced by the ascetical practice of the church, Syriac music has evolved into a sophisticated system capable of uplifting the worshippers to a blessed experience of God.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-12 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-lg sacred-shadow p-8 border-l-4 border-primary">
            <h3 className="font-heading font-semibold text-2xl text-foreground mb-6">
              Contact Information
            </h3>
            <div className="space-y-3 font-body text-muted-foreground">
              <p className="font-medium text-foreground text-lg">Sruti Liturgical School of Music</p>
              <p>Orthodox Seminary</p>
              <p>PB 98, Chungam</p>
              <p>Kottayam-686001</p>
              <p className="pt-3">
                <span className="font-medium text-foreground">Phone:</span> 0481 2585384
              </p>
              <p>
                <span className="font-medium text-foreground">Email:</span>{' '}
                <a href="mailto:srutimusics@gmail.com" className="text-primary hover:underline">
                  srutimusics@gmail.com
                </a>
              </p>
              <p>
                <span className="font-medium text-foreground">Website:</span>{' '}
                <a href="http://www.srutimusic.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  www.srutimusic.org
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <QuickLinks />

      {/* Navigation */}
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <Link href="/mosc-old/training" className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground font-body font-medium rounded-lg hover:bg-primary/90 reverent-transition sacred-shadow">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to All Training Programs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}





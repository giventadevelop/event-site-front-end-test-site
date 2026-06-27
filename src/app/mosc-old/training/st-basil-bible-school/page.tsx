import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata: Metadata = {
  title: 'St. Basil Bible School | Training | MOSC',
  description: 'St. Basil Bible School and Orientation Center - providing spiritual training and biblical education to lay members of the church.',
};

export default function StBasilBibleSchoolPage() {
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
            <span className="text-foreground">St. Basil Bible School</span>
          </nav>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background to-muted py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="relative w-full h-80 lg:h-96 rounded-lg overflow-hidden sacred-shadow-lg">
              <Image src="/images/training/bs.jpg" alt="St. Basil Bible School" fill className="object-cover" priority />
            </div>
            <div>
              <h1 className="font-heading font-semibold text-4xl lg:text-5xl text-foreground mb-4">
                St. Basil Bible School
              </h1>
              <p className="font-heading text-xl text-primary mb-4">
                and Orientation Center
              </p>
              <p className="font-body text-lg text-muted-foreground leading-relaxed">
                A spiritual training center providing biblical education and faith formation to lay members of the Orthodox Church.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading font-semibold text-3xl text-foreground mb-6">
            Our Vision
          </h2>
          <div className="space-y-6 font-body text-lg text-muted-foreground leading-relaxed">
            <p>
              The origin of the St. Basil Bible School is attributed to the vision and efforts of <strong>H. H. Baselios Marthoma Mathews II</strong>. It began with the official decision of the Holy Episcopal Synod on <strong>10th March 2000</strong>. The Bible School is instrumental in creating spiritual awakening among the members of the Church.
            </p>
            <p>
              St. Basil Bible School aims at the enlightenment of the faithful of the Holy Orthodox Church. The Bible School provides spiritual training to the lay people of the Church. It teaches the scripture and faith of the church as handed over to us by the Holy Fathers and Mothers of the Church. The Bible School helps in experiencing the liturgical mysteries of the church.
            </p>
            <div className="bg-gradient-to-br from-muted to-background rounded-lg p-8 sacred-shadow">
              <p className="text-center italic">
                St. Basil Bible School and Orientation Centre is situated at a beautiful lake-shore scenic village area of <strong>60 acres of land</strong> surrounded by the famous <strong>Sasthamcotta fresh water lake</strong> in the District of Kollam, Kerala State, South India.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading font-semibold text-3xl text-foreground mb-8 text-center">
            Our Mission
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card rounded-lg p-6 sacred-shadow-sm text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-heading font-medium text-lg text-foreground mb-2">
                Teach Scripture
              </h3>
              <p className="font-body text-sm text-muted-foreground">
                Comprehensive biblical education grounded in Orthodox tradition
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 sacred-shadow-sm text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="font-heading font-medium text-lg text-foreground mb-2">
                Spiritual Awakening
              </h3>
              <p className="font-body text-sm text-muted-foreground">
                Creating deeper spiritual awareness and growth
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 sacred-shadow-sm text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="font-heading font-medium text-lg text-foreground mb-2">
                Experience Liturgy
              </h3>
              <p className="font-body text-sm text-muted-foreground">
                Understanding and experiencing liturgical mysteries
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-12 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary/5 rounded-lg sacred-shadow p-8 border-l-4 border-primary">
            <h3 className="font-heading font-semibold text-2xl text-foreground mb-6">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-heading font-medium text-lg text-foreground mb-3">Address</h4>
                <div className="space-y-2 font-body text-muted-foreground">
                  <p>St.Basil Bible School and Orientation Centre</p>
                  <p>Muthupilakkadu P.O.</p>
                  <p>Dist.Kollam, Kerala</p>
                  <p>India-690520</p>
                  <p className="pt-3">
                    <span className="font-medium text-foreground">Phone:</span> 0476-2831712 (Bible School)
                  </p>
                </div>
              </div>
              <div>
                <h4 className="font-heading font-medium text-lg text-foreground mb-3">Contact Persons</h4>
                <div className="space-y-4 font-body text-muted-foreground">
                  <div className="bg-card rounded-lg p-4">
                    <p className="font-medium text-foreground">Fr. Samuel George</p>
                    <p className="text-sm">Dean of Academics, Bible School</p>
                    <p className="text-sm">Mt. Horeb Asram</p>
                    <p className="text-sm mt-2">Mobile: 9526763518</p>
                    <p className="text-sm">Office: 0476-2830778</p>
                  </div>
                  <div className="bg-card rounded-lg p-4">
                    <p className="font-medium text-foreground">Fr. Abraham Varghese</p>
                    <p className="text-sm">Dean of Students</p>
                    <p className="text-sm">Mount Horeb Ashramam</p>
                    <p className="text-sm mt-2">Mobile: 9847837017</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-primary/20">
              <p>
                <span className="font-medium text-foreground">Website:</span>{' '}
                <a href="http://www.orthodoxbibleschool.org/index.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  www.orthodoxbibleschool.org
                </a>
              </p>
              <p className="mt-2">
                <span className="font-medium text-foreground">Email:</span>{' '}
                <a href="mailto:orthodoxbibleschool@gmail.com" className="text-primary hover:underline">
                  orthodoxbibleschool@gmail.com
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





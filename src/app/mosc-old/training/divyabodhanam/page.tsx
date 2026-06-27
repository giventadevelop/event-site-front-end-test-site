import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';
import QuickLinks from '@/components/holy-synod/QuickLinks';

export const metadata: Metadata = {
  title: 'Divyabodhanam | Training | MOSC',
  description: 'Divyabodhanam - Theological Education Programme for the Laity of the Malankara Orthodox Syrian Church, inaugurated in 1984.',
};

export default function DivyabodhanamPage() {
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
            <span className="text-foreground">Divyabodhanam</span>
          </nav>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background to-muted py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="relative w-full h-80 lg:h-96 rounded-lg overflow-hidden sacred-shadow-lg">
              <Image src="/images/training/dvm.jpg" alt="Divyabodhanam" fill className="object-cover" priority />
            </div>
            <div>
              <h1 className="font-heading font-semibold text-4xl lg:text-5xl text-foreground mb-4">
                Divyabodhanam
              </h1>
              <p className="font-heading text-2xl text-primary mb-4 italic">
                Theological Education Programme for the Laity
              </p>
              <p className="font-body text-lg text-muted-foreground leading-relaxed">
                A comprehensive theological education program equipping lay members with deep knowledge of Orthodox faith and tradition.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* History & Vision */}
      <section className="py-16 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading font-semibold text-3xl text-foreground mb-6">
            A Visionary Initiative
          </h2>
          <div className="space-y-6 font-body text-lg text-muted-foreground leading-relaxed">
            <p>
              A novel step in the field of theological studies of Malankara Orthodox Syrian Church was officially inaugurated in <strong>1984 July 28</strong> as a laymen training course of the church. The seedling of the concept of this project was sown by the world renowned theologian, philosopher, thinker and spokesperson of eastern spirituality, <strong>Late Lamented Paulose Mar Gregorios Metropolitan</strong>. The steadfast growth of this project shows the foresightedness of the Metropolitan.
            </p>
            <div className="bg-primary/5 rounded-lg p-6 border-l-4 border-primary">
              <p className="font-medium text-foreground">
                H.H. Baselious Marthoma Didymus I Catholicos announced the study course as a spiritual movement through the Kalpana No: 138/2009.
              </p>
            </div>
            <p>
              The Divyabodhanam family considers this proclamation as a recognition for the outstanding service rendered to the church. The leadership and effective influence of the professors of the Seminary is the service that we value the most in the proficiency and prospering nature of the course.
            </p>
          </div>
        </div>
      </section>

      {/* Program Features */}
      <section className="py-16 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-heading font-semibold text-3xl text-foreground mb-8 text-center">
            What You Will Learn
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-card rounded-lg p-6 sacred-shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="font-heading font-semibold text-xl text-foreground mb-3">
                Orthodox Theology
              </h3>
              <p className="font-body text-muted-foreground">
                Systematic study of Orthodox Christian doctrine and tradition
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 sacred-shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-heading font-semibold text-xl text-foreground mb-3">
                Biblical Studies
              </h3>
              <p className="font-body text-muted-foreground">
                In-depth exploration of Holy Scripture and biblical interpretation
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 sacred-shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="font-heading font-semibold text-xl text-foreground mb-3">
                Church History
              </h3>
              <p className="font-body text-muted-foreground">
                Understanding the development of the Orthodox Church through the ages
              </p>
            </div>
            <div className="bg-card rounded-lg p-6 sacred-shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="font-heading font-semibold text-xl text-foreground mb-3">
                Liturgical Life
              </h3>
              <p className="font-body text-muted-foreground">
                Deep dive into Orthodox worship and sacramental life
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-12 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-muted/30 rounded-lg sacred-shadow p-8 border-l-4 border-primary">
            <h3 className="font-heading font-semibold text-2xl text-foreground mb-6">
              Contact Address
            </h3>
            <div className="space-y-3 font-body text-muted-foreground">
              <p className="font-medium text-foreground text-lg">The Registrar</p>
              <p>Divyabodhanam Central Office</p>
              <p>Orthodox Theological Seminary</p>
              <p>P.B. No. 98, Kottayam – 686001</p>
              <p className="pt-3">
                <span className="font-medium text-foreground">Phone:</span> 0481 2568083
              </p>
              <p>
                <span className="font-medium text-foreground">Email:</span>{' '}
                <a href="mailto:divyabodhanamots@gmail.com" className="text-primary hover:underline">
                  divyabodhanamots@gmail.com
                </a>
              </p>
              <p>
                <span className="font-medium text-foreground">Website:</span>{' '}
                <a href="http://www.divyabodhanam.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  www.divyabodhanam.org
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      <QuickLinks />

      {/* Navigation */}
      <section className="py-12 bg-muted">
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





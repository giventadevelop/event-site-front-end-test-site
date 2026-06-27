import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Engineering Colleges | Institutions | MOSC',
  description: 'Engineering colleges operated by the Malankara Orthodox Syrian Church, providing quality technical education.',
};

export default function EngineeringCollegesPage() {
  const colleges = [
    {
      name: 'Mar Baselios Christian College of Engineering & Technology',
      location: 'Kuttikkanam, Peermade, Kerala',
      description: "Mar Baselios Christian College of Engineering & Technology, Kuttikkanam, Peermade, Kerala is a self-financing institution for professional Education, affiliated to Mahatma Gandhi University, Kottayam, Kerala and approved by All India Council for Technical Education (AICTE), New Delhi. The College is owned and managed by the Malankara Orthodox Syrian Church, which plays a paternal role in the institution's establishment and operations.",
      mission: "The Mission of the management is to establish and manage a professional institution which promotes academic excellence among students for meeting the ever-growing demand of today's corporate world. The naturally air-conditioned ambience of MBC is the best bet in Kerala to translate one's transient ideas into real workouts and dreams into real achievements.",
      contact: {
        title: 'The Director',
        address: ['MBC College of Engineering & Technology', 'Catholicate Palace', 'Devalokam', 'Kottayam – 686 038'],
        phone: '0481 – 2574522, 2578500 (Extn. 46)',
        fax: '0481 – 2574522',
        emails: ['aramana@mbcpeermade.com', 'mbc@mbcpeermade.com'],
        website: 'www.mbcpeermade.com',
      },
    },
    {
      name: 'Baselios Mathews II College of Engineering',
      location: 'Lake View, Muthupilakadu, Sasthamcotta, Kollam',
      description: 'Baselios Mathews II College of Engineering was a long cherished dream of H. H. Baselios Mathews II. It began in 2002 with the intention of providing quality technical education to youth, especially of our church.',
      programs: [
        'Computer Science & Engineering',
        'Electronics & Communication Engineering',
        'Electrical & Electronics Engineering',
        'Electronics & Instrumentation Engineering',
      ],
      facilities: 'The college provides separate hostel facilities for boys & girls in the Trust premises.',
      spiritualNote: 'The premise is blessed by scenic beauty and the beautiful Mar Elia Chapel, where the remains of H. H. Baselios Marthoma Mathews II is entombed. The Ashramam members gather here for daily offices and Holy Qurbana. The intercession of Thirumeni along with the other saints is a stronghold for the monastic community and all those related to its activities.',
      contact: {
        address: ['Baselios Mathews II College of Engineering', 'Lake View, Muthupilakadu', 'Sasthamcotta', 'Kollam'],
        phone: '0476 2835579',
        emails: ['info@bmce.ac.in'],
        website: 'www.bmce.ac.in',
      },
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
            <Link href="/mosc-old/institutions" className="hover:text-primary reverent-transition">Institutions</Link>
            <span>/</span>
            <span className="text-foreground">Engineering Colleges</span>
          </nav>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background to-muted py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="relative w-full h-80 lg:h-96 rounded-lg overflow-hidden sacred-shadow-lg">
              <Image src="/images/institutions/mbc.jpg" alt="Engineering Colleges" fill className="object-cover" priority />
            </div>
            <div>
              <h1 className="font-heading font-semibold text-4xl lg:text-5xl text-foreground mb-4">Engineering Colleges</h1>
              <p className="font-body text-lg text-muted-foreground leading-relaxed">
                Institutions providing quality technical education, preparing the next generation of engineers with strong ethical foundations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Colleges Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {colleges.map((college, index) => (
              <div key={index} className="bg-card rounded-lg sacred-shadow p-8">
                <h2 className="font-heading font-semibold text-2xl lg:text-3xl text-primary mb-2">
                  {college.name}
                </h2>
                <p className="font-body text-lg text-muted-foreground mb-6 italic">
                  {college.location}
                </p>
                <p className="font-body text-lg text-foreground leading-relaxed mb-6">
                  {college.description}
                </p>
                {college.mission && (
                  <div className="bg-muted/30 rounded-lg p-6 mb-6">
                    <h3 className="font-heading font-medium text-xl text-foreground mb-3">Our Mission</h3>
                    <p className="font-body text-muted-foreground leading-relaxed">{college.mission}</p>
                  </div>
                )}
                {college.programs && (
                  <div className="mb-6">
                    <h3 className="font-heading font-medium text-xl text-foreground mb-3">Programs Offered</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {college.programs.map((program, i) => (
                        <li key={i} className="flex items-start font-body text-muted-foreground">
                          <span className="w-2 h-2 bg-primary rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          <span>{program}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {college.facilities && (
                  <div className="bg-primary/5 rounded-lg p-6 mb-6">
                    <h3 className="font-heading font-medium text-xl text-foreground mb-3">Facilities</h3>
                    <p className="font-body text-muted-foreground leading-relaxed">{college.facilities}</p>
                  </div>
                )}
                {college.spiritualNote && (
                  <div className="bg-gradient-to-br from-muted to-background rounded-lg p-6 mb-6">
                    <h3 className="font-heading font-medium text-xl text-foreground mb-3">Spiritual Heritage</h3>
                    <p className="font-body text-muted-foreground leading-relaxed">{college.spiritualNote}</p>
                  </div>
                )}
                <div className="bg-muted/30 rounded-lg p-6 border-l-4 border-primary">
                  <h3 className="font-heading font-medium text-xl text-foreground mb-4">Contact Information</h3>
                  <div className="space-y-2 font-body text-muted-foreground">
                    {college.contact.title && <p className="font-medium text-foreground">{college.contact.title}</p>}
                    {college.contact.address?.map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                    {college.contact.phone && <p><span className="font-medium text-foreground">Phone:</span> {college.contact.phone}</p>}
                    {college.contact.fax && <p><span className="font-medium text-foreground">Fax:</span> {college.contact.fax}</p>}
                    {college.contact.emails?.map((email, i) => (
                      <p key={i}>
                        <span className="font-medium text-foreground">Email:</span>{' '}
                        <a href={`mailto:${email}`} className="text-primary hover:underline">{email}</a>
                      </p>
                    ))}
                    {college.contact.website && (
                      <p>
                        <span className="font-medium text-foreground">Website:</span>{' '}
                        <a href={`http://${college.contact.website}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{college.contact.website}</a>
                      </p>
                    )}
                  </div>
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
          <div className="flex justify-center">
            <Link href="/mosc-old/institutions" className="inline-flex items-center px-6 py-3 bg-primary text-white font-body font-medium rounded-lg hover:bg-primary/90 reverent-transition sacred-shadow">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to All Institutions
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}



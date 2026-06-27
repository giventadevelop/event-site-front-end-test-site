'use client';

import React from 'react';
import Link from 'next/link';

export default function PDFsPage() {
  const documentCategories = [
    {
      title: 'Church Accounts & Guidelines',
      documents: [
        { name: 'Church Accounts Manual', description: 'Comprehensive manual for maintaining church accounts' },
        { name: 'Guidelines for Preparing Church Accounts', description: 'Step-by-step instructions for account preparation' },
      ],
    },
    {
      title: 'Malankara Association',
      documents: [
        { name: 'Malankara Association 2022-2027', description: 'Current term documents and information' },
        { name: 'Association Secretary Election', description: 'Election procedures and candidate lists' },
        { name: 'Malankara Association Agenda', description: 'Meeting agendas and nominated members list' },
      ],
    },
    {
      title: 'Educational Programs',
      documents: [
        { name: 'Merit Awards 2025', description: 'Information about merit award programs' },
        { name: 'Educational Special Scholarship (EDS)', description: 'Scholarship programs for students' },
        { name: 'Mega Quiz Qualified List', description: 'Results and qualified participants' },
      ],
    },
    {
      title: 'Church Administration',
      documents: [
        { name: 'Catholicate Day 2022', description: 'Catholicate Day celebration materials' },
        { name: 'Supreme Court Judgement July 3, 2017', description: 'Important legal documents' },
        { name: 'Tender Notices', description: 'Official tender announcements' },
        { name: 'Advertisements', description: 'Church announcements and public notices' },
      ],
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
            <span className="text-foreground">PDFs & Documents</span>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <h1 className="font-heading font-semibold text-4xl lg:text-5xl text-foreground mb-4">
              PDFs & Documents
            </h1>
            <p className="font-body text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
              Official church circulars, guidelines, announcements, and important administrative documents.
            </p>
          </div>
        </div>
      </section>

      {/* Documents Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {documentCategories.map((category, catIndex) => (
              <div key={catIndex}>
                <h2 className="font-heading font-semibold text-2xl text-foreground mb-6 pb-3 border-b-2 border-primary">
                  {category.title}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {category.documents.map((doc, docIndex) => (
                    <div key={docIndex} className="bg-muted/20 rounded-lg p-6 sacred-shadow-sm border-l-4 border-primary hover:sacred-shadow reverent-transition">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                            {doc.name}
                          </h3>
                          <p className="font-body text-sm text-muted-foreground mb-4">
                            {doc.description}
                          </p>
                        </div>
                        <button
                          onClick={() => alert('PDF download will be available soon.')}
                          className="ml-4 flex-shrink-0 p-2 bg-primary/10 hover:bg-primary/20 rounded-lg reverent-transition"
                          aria-label="Download document"
                        >
                          <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="py-12 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-lg sacred-shadow p-8 text-center">
            <h2 className="font-heading font-semibold text-2xl text-foreground mb-4">
              Need Assistance?
            </h2>
            <p className="font-body text-lg text-muted-foreground leading-relaxed">
              If you need help with any forms or have questions about submission procedures, please contact your diocesan office or the Catholicate administration at Devalokam.
            </p>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-12 bg-background">
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


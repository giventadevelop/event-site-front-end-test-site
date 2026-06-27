'use client';

import React from 'react';
import Link from 'next/link';

export default function ApplicationFormsPage() {
  const forms = [
    {
      category: 'Parish Administration',
      items: [
        { title: 'Account Statement Format', description: 'Standard format for parish account statements' },
        { title: 'Budget Format 2025-26', description: 'Official budget preparation format for parishes' },
        { title: 'Charge Handing Over/Taking Over Report', description: 'For new trustees and parish secretaries' },
        { title: 'Covering Note for Financial Statements', description: 'Required submission with financial statements' },
      ],
    },
    {
      category: 'Personal Services',
      items: [
        { title: 'Marriage Marga Nirdesha Form', description: 'Marriage counseling and assistance application' },
        { title: 'Medical Insurance Forms', description: 'Church medical insurance scheme applications' },
      ],
    },
    {
      category: 'Financial & Compliance',
      items: [
        { title: 'Church Financial Statements Format', description: 'For institutions - year ended 31 March 2025' },
        { title: 'FCRA Statements', description: 'Foreign contributions reporting forms' },
        { title: 'GST Related Forms', description: 'Goods and Services Tax documentation' },
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
            <span className="text-foreground">Application Forms</span>
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <h1 className="font-heading font-semibold text-4xl lg:text-5xl text-foreground mb-4">
              Application Forms
            </h1>
            <p className="font-body text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto">
              Official forms and documents for church administration, personal services, and compliance requirements.
            </p>
          </div>
        </div>
      </section>

      {/* Forms Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {forms.map((formCategory, index) => (
              <div key={index}>
                <h2 className="font-heading font-semibold text-2xl text-foreground mb-6 pb-3 border-b-2 border-primary">
                  {formCategory.category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {formCategory.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="bg-muted/20 rounded-lg p-6 sacred-shadow-sm border-l-4 border-primary hover:sacred-shadow reverent-transition">
                      <h3 className="font-heading font-semibold text-lg text-foreground mb-2">
                        {item.title}
                      </h3>
                      <p className="font-body text-muted-foreground mb-4">
                        {item.description}
                      </p>
                      <button
                        onClick={() => alert('Form PDF will be available for download soon.')}
                        className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground text-sm font-body font-medium rounded-lg hover:bg-primary/90 reverent-transition"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download Form
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instructions */}
      <section className="py-12 bg-muted">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-card rounded-lg sacred-shadow p-8">
            <h2 className="font-heading font-semibold text-2xl text-foreground mb-4">
              How to Use These Forms
            </h2>
            <div className="space-y-3 font-body text-muted-foreground leading-relaxed">
              <p>1. Download the required form in PDF format</p>
              <p>2. Fill out all required fields accurately</p>
              <p>3. Submit the completed form to the appropriate church office or diocese</p>
              <p>4. For assistance, contact your parish office or diocesan administration</p>
            </div>
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


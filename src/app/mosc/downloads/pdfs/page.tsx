'use client';

import React from 'react';
import Link from 'next/link';
import SyroPageBanner from '../../components/SyroPageBanner';

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
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner title="PDFs & Documents" breadcrumbFrom="downloads" />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-syro-bg-gray to-syro-bg-gray py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-syro-red rounded-full flex items-center justify-center shadow-syro-card">
                <svg className="w-6 h-6 text-syro-red-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <p className="font-syro-primary text-lg lg:text-xl text-syro-dark-gray max-w-3xl mx-auto">
              Official church circulars, guidelines, announcements, and important administrative documents.
            </p>
          </div>
        </div>
      </section>

      {/* Documents Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {documentCategories.map((category, catIndex) => (
              <div key={catIndex}>
                <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6 pb-3 border-b-2 border-primary">
                  {category.title}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {category.documents.map((doc, docIndex) => (
                    <div key={docIndex} className="bg-syro-bg-gray/20 rounded-lg p-6 shadow-syro-card-sm border-l-4 border-primary hover:shadow-syro-card transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-2">
                            {doc.name}
                          </h3>
                          <p className="font-syro-primary text-sm text-syro-dark-gray mb-4">
                            {doc.description}
                          </p>
                        </div>
                        <button
                          onClick={() => alert('PDF download will be available soon.')}
                          className="ml-4 flex-shrink-0 p-2 bg-syro-red/10 hover:bg-syro-red/20 rounded-lg transition-all duration-300"
                          aria-label="Download document"
                        >
                          <svg className="w-6 h-6 text-syro-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <section className="py-12 bg-syro-bg-gray">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-syro-card p-8 text-center">
            <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4">
              Need Assistance?
            </h2>
            <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed">
              If you need help with any forms or have questions about submission procedures, please contact your diocesan office or the Catholicate administration at Devalokam.
            </p>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-12 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <Link href="/mosc/downloads" className="inline-flex items-center px-6 py-3 bg-syro-red text-syro-red-foreground font-syro-primary font-medium rounded-lg hover:bg-syro-red/90 transition-all duration-300 shadow-syro-card">
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


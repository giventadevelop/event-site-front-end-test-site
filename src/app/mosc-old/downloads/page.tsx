'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '@/components/holy-synod/QuickLinks';

// All download items from https://mosc.in/downloads/ in display order; image = path under /images/
const downloadItems: { title: string; link: string; image?: string }[] = [
  { title: 'local body Election winners award ceremony – Photos', link: '#', image: '/images/downloads/local_body_election.png' },
  { title: 'Catholicate Day Book Cover, Brochure', link: '#', image: '/images/downloads/catholictae_day.png' },
  { title: 'Panjangom', link: '#', image: '/images/downloads/panchangom.png' },
  { title: 'Download Photos', link: '/mosc-old/downloads/photos', image: '/images/downloads/download-photos.png' },
  { title: 'Medical Insurance', link: '#', image: '/images/downloads/medical_insurance.png' },
  { title: 'Kalpana', link: '/mosc-old/downloads/kalpana', image: '/images/downloads/kalpana.png' },
  { title: 'Covering Note to be submitted along with financial statements', link: '#' },
  { title: 'Church Financial Statements format for the year ended 31March 2025 of MOSC', link: '#', image: '/images/downloads/church_finance.png' },
  { title: 'Merit Evening 2025 Photos', link: '#', image: '/images/downloads/merit_evening.png' },
  { title: 'MALANKARA SABHA MAGAZINE', link: '#', image: '/images/downloads/malankara_magazine.jpg' },
  { title: 'EDUCATIONAL SPECIAL SCHOLARSHIP', link: '#' },
  { title: 'Merit Awards 2025', link: '#' },
  { title: 'Marriage Marga Nirdesha Form', link: '#' },
  { title: 'Budget format 2025-26', link: '#' },
  { title: 'GST', link: '#' },
  { title: 'Tenders', link: '#', image: '/images/downloads/tender.png' },
  { title: 'Merit Evening 2024 PHOTOS', link: '#', image: '/images/downloads/merit_evening_2024.png' },
  { title: 'Mega Quiz qualified list', link: '#', image: '/images/downloads/mega_quiz.png' },
  { title: 'Charge handing over/taking over Report for new Trustees and Secretary of the Parish', link: '#' },
  { title: 'Account Statement Format', link: '#', image: '/images/downloads/account_statement.png' },
  { title: 'അഖിലമലങ്കര മാർത്തോമൻ . പൈതൃക കലാസാഹിത്യ വൈജ്ഞാനിക മത്സരങ്ങൾ', link: '#', image: '/images/downloads/akhila_malankara_marthoman.jpg' },
  { title: 'Malankara Association (2022 – 2027)', link: '#', image: '/images/downloads/malankara_association.png' },
  { title: 'Panjangom 2023', link: '#', image: '/images/downloads/panjagom_2023.jpg' },
  { title: 'Panjangom 2022', link: '#', image: '/images/downloads/panjagom_2022.jpg' },
  { title: 'ASSOCIATION SECRETARY ELECTION', link: '#', image: '/images/logos/Current_Edits/MOSC-Logo-only.png' },
  { title: 'Catholicate Day 2022', link: '#', image: '/images/downloads/catholictae_day.png' },
  { title: 'Malankara Association 2022', link: '#', image: '/images/downloads/malankara_association.png' },
  { title: 'Application Forms', link: '/mosc-old/downloads/application-forms', image: '/images/downloads/application_forms.jpg' },
  { title: 'Malankara Association 2021', link: '#', image: '/images/downloads/malankara_association.png' },
  { title: 'prayer', link: '#', image: '/images/downloads/prayer.jpg' },
  { title: 'Advertisement', link: '#' },
  { title: 'FCRA Statements', link: '#', image: '/images/downloads/FCRA_statements.jpg' },
  { title: 'Pratheeshetha Prameyam', link: '#' },
  { title: 'Church Accounts Manual', link: '#', image: '/images/downloads/church_account_manual.jpg' },
  { title: 'Pdfs', link: '/mosc-old/downloads/pdfs', image: '/images/downloads/pdfs.jpg' },
  { title: 'Supreme Court Judgement, July 3, 2017', link: '#', image: '/images/downloads/supreme_court_judgement.jpg' },
  { title: 'Priest Directory', link: '#', image: '/images/downloads/priest_directory.jpg' },
  { title: 'Malankara Association : Association Secretary Election Final list 2017', link: '#', image: '/images/downloads/malankara_association.png' },
  { title: 'Malankara Association 2017 – Agenda & Nominated Members List', link: '#', image: '/images/downloads/malankara_association.png' },
  { title: 'Malankara Association Candidates Final List 2017', link: '#', image: '/images/downloads/malankara_association.png' },
  { title: 'Malankara Association Final list 2017', link: '#', image: '/images/downloads/malankara_association.png' },
  { title: 'Ministry of Human Empowernment', link: '#', image: '/images/downloads/ministry_human_empowerment.jpg' },
  { title: 'Guidelines for Preparing Church Accounts', link: '#', image: '/images/downloads/Guidelines_preparing_church_account.jpg' },
  { title: 'Prayer Books', link: '/mosc-old/downloads/prayer-books', image: '/images/downloads/prayer_books.jpg' },
  { title: 'Foreign Contributions', link: '#' },
  { title: 'Online Resourses', link: '#', image: '/images/downloads/online_resources.jpg' },
  { title: 'Photos', link: '/mosc-old/downloads/photos', image: '/images/downloads/photos.jpg' },
];

export default function DownloadsPage() {
  return (
    <div className="bg-background">
      {/* Hero Section - same layout as the-church */}
      <section className="relative bg-gradient-to-br from-background to-muted min-h-[280px] flex items-center py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 sacred-shadow-lg border border-border/50">
              <svg
                className="w-10 h-10 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
                />
              </svg>
            </div>
            <h1 className="font-heading font-semibold text-4xl text-foreground mb-4">
              Downloads
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Access official church documents, prayer books, forms, and resources of the Malankara
              Orthodox Syrian Church.
            </p>
          </div>
        </div>
      </section>

      {/* Main content - card grid same pattern as the-church */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading font-semibold text-3xl text-foreground mb-4">
              Church Resources
            </h2>
            <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto">
              Select a resource below to view or download. Liturgical texts, forms, directories, and
              official documents are available for the faithful and administration.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {downloadItems.map((item, index) => {
              const isPlaceholder = item.link === '#';
              return (
                <div
                  key={index}
                  className="bg-background rounded-lg sacred-shadow p-4 hover:sacred-shadow-lg reverent-transition group flex flex-col h-full min-h-0"
                >
                  {/* Image container - fixed height, no shrink */}
                  <div className="relative w-full h-48 min-h-[192px] flex-shrink-0 mb-3 rounded-lg overflow-hidden bg-muted/30 flex items-center justify-center p-3">
                    {item.image ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-contain object-center group-hover:scale-105 reverent-transition"
                        />
                      </div>
                    ) : (
                      <svg
                        className="w-10 h-10 text-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    )}
                  </div>
                  {/* Content: title + spacer so Download is always at bottom */}
                  <div className="flex flex-col flex-1 min-h-0 text-left">
                    <h3 className="font-heading font-semibold text-base text-foreground mb-1.5 group-hover:text-primary reverent-transition line-clamp-2 flex-shrink-0">
                      {item.title}
                    </h3>
                    <div className="flex-1 min-h-[24px]" aria-hidden="true" />
                    <Link
                      href={item.link}
                      className="inline-flex items-center gap-1.5 font-body text-sm font-medium text-primary hover:gap-2 reverent-transition flex-shrink-0"
                      onClick={(e) => {
                        if (isPlaceholder) {
                          e.preventDefault();
                          alert(
                            'This resource will be available for download soon. Please check back later.'
                          );
                        }
                      }}
                    >
                      Download
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <QuickLinks />
    </div>
  );
}

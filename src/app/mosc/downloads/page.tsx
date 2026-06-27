'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';

const downloadItems: { title: string; link: string; image?: string }[] = [
  { title: 'local body Election winners award ceremony – Photos', link: '#', image: '/images/downloads/local_body_election.png' },
  { title: 'Catholicate Day Book Cover, Brochure', link: '#', image: '/images/downloads/catholictae_day.png' },
  { title: 'Panjangom', link: '#', image: '/images/downloads/panchangom.png' },
  { title: 'Download Photos', link: '/mosc/downloads/photos', image: '/images/downloads/download-photos.png' },
  { title: 'Medical Insurance', link: '#', image: '/images/downloads/medical_insurance.png' },
  { title: 'Kalpana', link: '/mosc/downloads/kalpana', image: '/images/downloads/kalpana.png' },
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
  { title: 'Application Forms', link: '/mosc/downloads/application-forms', image: '/images/downloads/application_forms.jpg' },
  { title: 'Malankara Association 2021', link: '#', image: '/images/downloads/malankara_association.png' },
  { title: 'prayer', link: '#', image: '/images/downloads/prayer.jpg' },
  { title: 'Advertisement', link: '#' },
  { title: 'FCRA Statements', link: '#', image: '/images/downloads/FCRA_statements.jpg' },
  { title: 'Pratheeshetha Prameyam', link: '#' },
  { title: 'Church Accounts Manual', link: '#', image: '/images/downloads/church_account_manual.jpg' },
  { title: 'Pdfs', link: '/mosc/downloads/pdfs', image: '/images/downloads/pdfs.jpg' },
  { title: 'Supreme Court Judgement, July 3, 2017', link: '#', image: '/images/downloads/supreme_court_judgement.jpg' },
  { title: 'Priest Directory', link: '#', image: '/images/downloads/priest_directory.jpg' },
  { title: 'Malankara Association : Association Secretary Election Final list 2017', link: '#', image: '/images/downloads/malankara_association.png' },
  { title: 'Malankara Association 2017 – Agenda & Nominated Members List', link: '#', image: '/images/downloads/malankara_association.png' },
  { title: 'Malankara Association Candidates Final List 2017', link: '#', image: '/images/downloads/malankara_association.png' },
  { title: 'Malankara Association Final list 2017', link: '#', image: '/images/downloads/malankara_association.png' },
  { title: 'Ministry of Human Empowernment', link: '#', image: '/images/downloads/ministry_human_empowerment.jpg' },
  { title: 'Guidelines for Preparing Church Accounts', link: '#', image: '/images/downloads/Guidelines_preparing_church_account.jpg' },
  { title: 'Prayer Books', link: '/mosc/downloads/prayer-books', image: '/images/downloads/prayer_books.jpg' },
  { title: 'Foreign Contributions', link: '#' },
  { title: 'Online Resourses', link: '#', image: '/images/downloads/online_resources.jpg' },
  { title: 'Photos', link: '/mosc/downloads/photos', image: '/images/downloads/photos.jpg' },
];

const BANNER_DESCRIPTION =
  'Church resources, forms, publications, and documents available for download.';

export default function DownloadsPage() {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Downloads"
        breadcrumbFrom="home"
        description={BANNER_DESCRIPTION}
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section title - left red bar (matches administration .admin-section-title) */}
          <h3 className="text-2xl font-light text-[#798daf] mb-10 pl-8 border-l-[7px] border-syro-red">
            Church Resources
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {downloadItems.map((item, index) => {
              const isPlaceholder = item.link === '#';
              return (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] hover:shadow-[rgba(0,0,0,0.35)_0px_5px_15px] transition-shadow duration-300 p-8 flex flex-col h-full"
                >
                  <div className="mb-5 flex justify-center pt-8">
                    {item.image ? (
                      <div className="relative w-full max-w-[280px] aspect-[280/168] rounded-lg overflow-hidden flex items-center justify-center">
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          className="object-contain rounded-lg"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
                        />
                      </div>
                    ) : (
                      <div className="w-full max-w-[280px] aspect-[280/168] rounded-lg flex items-center justify-center">
                        <svg className="w-10 h-10 text-syro-red" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <h3 className="font-syro-display text-xl font-semibold text-syro-blue mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  <div className="flex-1 min-h-[24px]" aria-hidden="true" />
                  <Link
                    href={item.link}
                    className="syro-primary-button inline-flex items-center gap-2 w-fit"
                    onClick={(e) => {
                      if (isPlaceholder) {
                        e.preventDefault();
                        alert('This resource will be available for download soon. Please check back later.');
                      }
                    }}
                  >
                    Download
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              );
            })}
          </div>

          <QuickLinks />
        </div>
      </section>
    </div>
  );
}

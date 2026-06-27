import React from 'react';
import Link from 'next/link';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';
import { MoscHubCardMedia } from '../components/MoscHubCardMedia';
import {
  buildCategoryCardDescription,
  filterInstitutionsByCategory,
  getInstitutionsData,
  pickCategoryCardImage,
} from './getInstitutionsData';
import { INSTITUTION_HUB_CATEGORIES } from './institutionHubCategories';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Institutions | Malankara Orthodox Syrian Church',
  description:
    'Educational, medical, and spiritual institutions of the Malankara Orthodox Syrian Church, serving communities across India and beyond.',
};

const BANNER_DESCRIPTION =
  'Educational, medical, and spiritual institutions of the Malankara Orthodox Syrian Church, serving communities across India and beyond.';

export default async function InstitutionsCmsPage() {
  const { entries } = await getInstitutionsData();

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Institutions"
        breadcrumbFrom="home"
        description={BANNER_DESCRIPTION}
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-light text-[#798daf] mb-10 pl-8 border-l-[7px] border-syro-red">
            Our Institutions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {INSTITUTION_HUB_CATEGORIES.map((category) => {
              const categoryEntries = filterInstitutionsByCategory(entries, category.slug);
              const description = buildCategoryCardDescription(categoryEntries, category);
              const imageSrc = pickCategoryCardImage(categoryEntries, category);
              const href = `/mosc-redesign/institutions-cms/${category.slug}`;

              return (
                <div
                  key={category.slug}
                  className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] hover:shadow-[rgba(0,0,0,0.35)_0px_5px_15px] transition-shadow duration-300 overflow-hidden flex flex-col h-full"
                >
                  <MoscHubCardMedia
                    src={imageSrc}
                    alt={category.title}
                    unoptimized={Boolean(imageSrc.startsWith('http'))}
                  />
                  <div className="p-8 pt-0 flex flex-col flex-1">
                    <h3 className="font-syro-display text-xl font-semibold text-syro-blue mb-4 leading-snug">
                      {category.title}
                    </h3>
                    <p className="font-syro-primary text-base text-syro-dark-gray flex-1 mb-5 leading-relaxed line-clamp-3">
                      {description}
                    </p>
                    <Link
                      href={href}
                      className="syro-primary-button inline-flex items-center gap-2 mt-auto w-fit"
                    >
                      <span>Read More</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="max-w-3xl mx-auto mt-16">
            <h2 className="font-syro-display text-[2.2rem] font-bold text-black mb-5">
              Our Mission of Service
            </h2>
            <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed mb-6">
              Following the example of Christ who came to serve, the Malankara Orthodox Syrian Church has established numerous institutions dedicated to education, healthcare, and social welfare.
            </p>
            <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed">
              From schools and colleges to hospitals and orphanages, from monasteries to medical missions, these institutions embody our commitment to serving humanity with love and compassion.
            </p>
          </div>

          <div className="max-w-7xl mx-auto mt-16">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-syro-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-syro-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="font-syro-display font-semibold text-3xl text-syro-blue mb-2">
                  100+
                </h3>
                <p className="font-syro-primary text-syro-dark-gray">
                  Educational Institutions
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-syro-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-syro-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="font-syro-display font-semibold text-3xl text-syro-blue mb-2">
                  25+
                </h3>
                <p className="font-syro-primary text-syro-dark-gray">
                  Healthcare Facilities
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-syro-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-syro-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-syro-display font-semibold text-3xl text-syro-blue mb-2">
                  15+
                </h3>
                <p className="font-syro-primary text-syro-dark-gray">
                  Monasteries & Convents
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-syro-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-syro-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <h3 className="font-syro-display font-semibold text-3xl text-syro-blue mb-2">
                  10+
                </h3>
                <p className="font-syro-primary text-syro-dark-gray">
                  Orphanages & Care Centers
                </p>
              </div>
            </div>
          </div>

          <QuickLinks />
        </div>
      </section>
    </div>
  );
}

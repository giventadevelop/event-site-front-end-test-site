import React from 'react';
import Link from 'next/link';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';
import { MoscHubCardMedia } from '../components/MoscHubCardMedia';
import { getPublicationEntriesData } from './getPublicationEntriesData';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Publications | Malankara Orthodox Syrian Church',
  description:
    'Official publications of the Malankara Orthodox Syrian Church, including the Malankara Sabha Magazine (Masika) and other church literature.',
};

const BANNER_DESCRIPTION =
  'Official publications of the Malankara Orthodox Syrian Church, including the Malankara Sabha Magazine (Masika) and other church literature.';

const PLACEHOLDER_IMAGE = '/images/publications/mal.jpg';

export default async function PublicationsCmsPage() {
  const { entries } = await getPublicationEntriesData();

  return (
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner
        title="Publications"
        breadcrumbFrom="home"
        description={BANNER_DESCRIPTION}
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-light text-[#798daf] mb-10 pl-8 border-l-[7px] border-syro-red">
            Church Publications
          </h3>

          {entries.length === 0 ? (
            <p className="font-syro-primary text-syro-dark-gray mb-12">
              No publications are available at this time. Please check back later.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {entries.map((entry) => {
                const href = `/mosc-redesign/publications-cms/${entry.slug}`;
                const imageSrc = entry.imageUrl ?? PLACEHOLDER_IMAGE;
                return (
                  <div
                    key={entry.documentId || entry.slug}
                    className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] hover:shadow-[rgba(0,0,0,0.35)_0px_5px_15px] transition-shadow duration-300 overflow-hidden flex flex-col h-full"
                  >
                    <MoscHubCardMedia
                      src={imageSrc}
                      alt={entry.imageAlt ?? entry.name}
                      unoptimized={Boolean(entry.imageUrl?.startsWith('http'))}
                    />
                    <div className="p-8 pt-0 flex flex-col flex-1">
                      <h3 className="font-syro-display text-xl font-semibold text-syro-blue mb-4 leading-snug">
                        {entry.name}
                      </h3>
                      {entry.excerpt ? (
                        <p className="font-syro-primary text-base text-syro-dark-gray flex-1 mb-5 leading-relaxed line-clamp-3">
                          {entry.excerpt}
                        </p>
                      ) : null}
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
          )}

          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-syro-display font-semibold text-3xl text-syro-blue mb-6">
              Our Publishing Mission
            </h2>
            <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed mb-6">
              The publications of the Malankara Orthodox Syrian Church serve to educate, inspire, and strengthen the faith of our community. Through our magazines, books, and other literature, we preserve our rich heritage while addressing contemporary spiritual needs.
            </p>
            <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed">
              Each publication reflects our commitment to sharing the timeless teachings of the Orthodox faith in a manner that is both accessible and meaningful to all generations.
            </p>
          </div>

          <QuickLinks />
        </div>
      </section>
    </div>
  );
}

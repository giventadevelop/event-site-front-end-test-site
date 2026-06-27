import React from 'react';
import Link from 'next/link';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';
import { MoscHubCardMedia } from '../components/MoscHubCardMedia';
import { getTheologicalSeminaryEntriesData } from './getTheologicalSeminaryEntriesData';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Theological Seminaries | MOSC',
  description:
    'Theological seminaries of the Malankara Orthodox Syrian Church providing theological education and training for clergy and laity.',
};

const BANNER_DESCRIPTION =
  "Our theological seminaries have been serving the Church for generations, preparing clergy and lay leaders with deep theological knowledge, spiritual formation, and pastoral skills to serve God's people with wisdom and compassion.";

const PLACEHOLDER_IMAGE = '/images/theological/sem-300x176.jpg';

export default async function TheologicalSeminariesCmsPage() {
  const { entries } = await getTheologicalSeminaryEntriesData();

  return (
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner
        title="Theological Seminaries"
        breadcrumbFrom="home"
        description={BANNER_DESCRIPTION}
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-light text-[#798daf] mb-10 pl-8 border-l-[7px] border-syro-red">
            Centers of Learning and Formation
          </h3>

          {entries.length === 0 ? (
            <p className="font-syro-primary text-syro-dark-gray mb-12">
              No theological seminary entries are available at this time. Please check back later.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-5xl mx-auto">
              {entries.map((entry) => {
                const href = `/mosc-redesign/theological-seminaries-cms/${entry.slug}`;
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
                      <h3 className="font-syro-display text-xl font-semibold text-syro-blue mb-2 leading-snug">
                        {entry.name}
                      </h3>
                      {entry.subtitle ? (
                        <p className="font-syro-primary text-sm text-syro-red mb-3">
                          {entry.subtitle}
                        </p>
                      ) : null}
                      {entry.excerpt ? (
                        <p className="font-syro-primary text-base text-syro-dark-gray leading-relaxed mb-4 flex-1">
                          {entry.excerpt}
                        </p>
                      ) : null}
                      {(entry.location || entry.established) && (
                        <div className="flex flex-wrap gap-4 pt-4 border-t border-syro-table-border mb-5">
                          {entry.location ? (
                            <div className="flex items-center space-x-2">
                              <span className="text-syro-red" role="img" aria-label="Location">
                                📍
                              </span>
                              <span className="font-syro-primary text-sm text-syro-dark-gray">
                                {entry.location}
                              </span>
                            </div>
                          ) : null}
                          {entry.established ? (
                            <div className="flex items-center space-x-2">
                              <span className="text-syro-red" role="img" aria-label="Established">
                                📅
                              </span>
                              <span className="font-syro-primary text-sm text-syro-dark-gray">
                                Est. {entry.established}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      )}
                      <Link
                        href={href}
                        className="syro-primary-button inline-flex items-center gap-2 mt-auto w-fit"
                      >
                        <span>Learn More</span>
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

          <QuickLinks />
        </div>
      </section>
    </div>
  );
}

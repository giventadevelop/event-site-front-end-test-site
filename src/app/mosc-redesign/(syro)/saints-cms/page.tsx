import React from 'react';
import Link from 'next/link';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';
import { MoscHubCardMedia } from '../components/MoscHubCardMedia';
import { getSaintEntriesData } from './getSaintEntriesData';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Saints',
  description: 'Learn about the saints and holy figures of the Malankara Orthodox Syrian Church.',
};

const BANNER_DESCRIPTION =
  'Learn about the saints and holy figures venerated in the Malankara Orthodox Syrian Church.';

const PLACEHOLDER_IMAGE = '/images/saints/st-mary-mother-of-god.jpg';

export default async function SaintsCmsPage() {
  const { entries } = await getSaintEntriesData();

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Saints" breadcrumbFrom="home" description={BANNER_DESCRIPTION} />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-light text-[#798daf] mb-10 pl-8 border-l-[7px] border-syro-red">
            Saints &amp; Holy Figures
          </h3>

          {entries.length === 0 ? (
            <p className="font-syro-primary text-syro-dark-gray mb-12">
              No saint entries are available at this time. Please check back later.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {entries.map((entry) => {
                const href = `/mosc-redesign/saints-cms/${entry.slug}`;
                const imageSrc = entry.imageUrl ?? PLACEHOLDER_IMAGE;
                return (
                  <div
                    key={entry.documentId || entry.slug}
                    className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] hover:shadow-[rgba(0,0,0,0.35)_0px_5px_15px] transition-shadow duration-300 overflow-hidden flex flex-col h-full"
                  >
                    <MoscHubCardMedia
                      src={imageSrc}
                      alt={entry.imageAlt ?? entry.name}
                      objectPosition="top"
                      frameClassName="bg-white"
                      unoptimized={Boolean(entry.imageUrl?.startsWith('http'))}
                    />
                    <div className="p-8 pt-0 flex flex-col flex-1">
                      <h3 className="font-syro-display text-xl font-semibold text-syro-blue mb-4 leading-snug">
                        {entry.name}
                      </h3>
                      {entry.excerpt ? (
                        <p className="font-syro-primary text-base text-syro-dark-gray flex-1 mb-5 leading-relaxed line-clamp-4">
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

          <QuickLinks />
        </div>
      </section>

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="font-syro-display font-semibold text-3xl text-syro-blue mb-6">
                Understanding Saints in Orthodoxy
              </h2>
              <div className="space-y-4 font-syro-primary text-syro-dark-gray leading-relaxed">
                <p>
                  In the Orthodox tradition, saints are not just historical figures but living
                  examples of holiness who continue to intercede for us before God. They serve
                  as models of Christian life and sources of spiritual inspiration.
                </p>
                <p>
                  The veneration of saints is an integral part of Orthodox spirituality,
                  helping us to connect with the great cloud of witnesses who have gone
                  before us in faith.
                </p>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-syro-card p-6">
              <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-4">
                How We Honor Saints
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-syro-red text-xl" role="img" aria-label="Prayer">
                    🙏
                  </span>
                  <div>
                    <h4 className="font-syro-display font-medium text-syro-blue">Prayer & Intercession</h4>
                    <p className="font-syro-primary text-syro-dark-gray text-sm">
                      Seeking their prayers and intercession
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-syro-red text-xl" role="img" aria-label="Feast Days">
                    📅
                  </span>
                  <div>
                    <h4 className="font-syro-display font-medium text-syro-blue">Feast Days</h4>
                    <p className="font-syro-primary text-syro-dark-gray text-sm">
                      Celebrating their memory on special days
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-syro-red text-xl" role="img" aria-label="Icons">
                    🖼️
                  </span>
                  <div>
                    <h4 className="font-syro-display font-medium text-syro-blue">Icons & Images</h4>
                    <p className="font-syro-primary text-syro-dark-gray text-sm">
                      Using their images for veneration and inspiration
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

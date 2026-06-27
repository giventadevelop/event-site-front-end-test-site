import React from 'react';
import Link from 'next/link';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';
import { MoscHubCardMedia, MoscHubCardMediaPlaceholder } from '../components/MoscHubCardMedia';
import { getEcumenicalArticlesData } from './getEcumenicalArticlesData';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Ecumenical',
  description:
    'Department of Ecumenical Relations of the Malankara Orthodox Syrian Church. Fraternal relations, Orthodox Churches, Catholic dialogue, and ecumenical ventures.',
};

const BANNER_DESCRIPTION =
  'The Department of Ecumenical Relations caters to the fraternal relations of the Church. The Church, being a founding member of the World Council of Churches, extends its warmth and cooperation to Christian communities worldwide.';

export default async function EcumenicalCmsPage() {
  const { articles } = await getEcumenicalArticlesData();

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Ecumenical"
        breadcrumbFrom="home"
        description={BANNER_DESCRIPTION}
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-light text-[#798daf] mb-10 pl-8 border-l-[7px] border-syro-red">
            Ecumenical Relations &amp; Dialogue
          </h3>

          {articles.length === 0 ? (
            <p className="font-syro-primary text-syro-dark-gray mb-12">
              No ecumenical articles are available at this time. Please check back later.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {articles.map((article) => {
                const href = `/mosc-redesign/ecumenical-cms/${article.slug}`;
                return (
                  <div
                    key={article.documentId || article.slug}
                    className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] hover:shadow-[rgba(0,0,0,0.35)_0px_5px_15px] transition-shadow duration-300 overflow-hidden flex flex-col h-full"
                  >
                    {article.imageUrl ? (
                      <MoscHubCardMedia
                        src={article.imageUrl}
                        alt={article.imageAlt ?? article.name}
                        unoptimized={Boolean(article.imageUrl.startsWith('http'))}
                      />
                    ) : (
                      <MoscHubCardMediaPlaceholder />
                    )}
                    <div className="p-8 pt-0 flex flex-col flex-1">
                      <h3 className="font-syro-display text-xl font-semibold text-syro-blue mb-4 leading-snug line-clamp-3">
                        {article.name}
                      </h3>
                      {article.excerpt ? (
                        <p className="font-syro-primary text-base text-syro-dark-gray flex-1 mb-5 leading-relaxed line-clamp-3">
                          {article.excerpt}
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
    </div>
  );
}

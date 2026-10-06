import React from 'react';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';
import LiveUrlSearch from '../components/LiveUrlSearch';
import { MOSC_LISTING_GRID_CLASS, MoscCmsHubCard } from '../components/MoscCmsHubCard';
import DirectoryPagination from '../directory/components/DirectoryPagination';
import { DIRECTORY_PAGE_SIZE } from '../directory/types/listPagination';
import { buildCmsListUrl } from '../lib/cmsListUrl';
import { getEcumenicalArticlesData } from './getEcumenicalArticlesData';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Ecumenical',
  description:
    'Department of Ecumenical Relations of the Malankara Orthodox Syrian Church. Fraternal relations, Orthodox Churches, Catholic dialogue, and ecumenical ventures.',
};

const BANNER_DESCRIPTION =
  'The Department of Ecumenical Relations caters to the fraternal relations of the Church. The Church, being a founding member of the World Council of Churches, extends its warmth and cooperation to Christian communities worldwide.';

const BASE_PATH = '/mosc-redesign/ecumenical-cms';

export default async function EcumenicalCmsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const nameSearch = typeof params.q === 'string' ? params.q : undefined;
  const searchTerm = nameSearch?.trim() ?? '';
  const hasSearch = searchTerm.length > 0;

  const { articles, pagination } = await getEcumenicalArticlesData({
    nameSearch: searchTerm || undefined,
    page,
    pageSize: DIRECTORY_PAGE_SIZE,
  });

  const subtitle = hasSearch
    ? `${pagination.total} article${pagination.total !== 1 ? 's' : ''} matching "${searchTerm}".`
    : `${pagination.total} article${pagination.total !== 1 ? 's' : ''}.`;

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Ecumenical"
        breadcrumbFrom="home"
        description={BANNER_DESCRIPTION}
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-light text-[#798daf] mb-4 pl-8 border-l-[7px] border-syro-red">
            Ecumenical Relations &amp; Dialogue
          </h3>
          <p className="font-syro-primary text-syro-dark-gray mb-6">{subtitle}</p>

          <div className="mb-8">
            <LiveUrlSearch
              id="ecumenical-cms-search"
              ariaLabel="Search ecumenical articles by name"
              placeholder="Search by name..."
              inputClassName="font-syro-primary w-full px-4 py-2 border border-syro-table-border rounded-lg bg-white text-syro-blue placeholder:text-syro-dark-gray focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2"
            />
          </div>

          {articles.length === 0 ? (
            <p className="font-syro-primary text-syro-dark-gray mb-12">
              {hasSearch
                ? 'No ecumenical articles match your search.'
                : 'No ecumenical articles are available at this time. Please check back later.'}
            </p>
          ) : (
            <>
              <div className={MOSC_LISTING_GRID_CLASS}>
                {articles.map((article) => (
                  <MoscCmsHubCard
                    key={article.documentId || article.slug}
                    href={`/mosc-redesign/ecumenical-cms/${article.slug}`}
                    title={article.name}
                    excerpt={article.excerpt}
                    imageUrl={article.imageUrl}
                    imageAlt={article.imageAlt ?? article.name}
                  />
                ))}
              </div>
              <DirectoryPagination
                page={pagination.page}
                pageCount={pagination.pageCount}
                total={pagination.total}
                pageSize={DIRECTORY_PAGE_SIZE}
                itemsOnPage={articles.length}
                buildPageHref={(p) => buildCmsListUrl(BASE_PATH, p, nameSearch)}
                itemLabel="articles"
                emptyLabel="No articles found"
              />
            </>
          )}

          <div className="mt-16">
            <QuickLinks />
          </div>
        </div>
      </section>
    </div>
  );
}

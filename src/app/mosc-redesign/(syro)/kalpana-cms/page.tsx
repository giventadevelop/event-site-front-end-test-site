import React from 'react';
import Image from 'next/image';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';
import LiveUrlSearch from '../components/LiveUrlSearch';
import DirectoryPagination from '../directory/components/DirectoryPagination';
import { DIRECTORY_PAGE_SIZE } from '../directory/types/listPagination';
import { buildCmsListUrl } from '../lib/cmsListUrl';
import KalpanaEditionCard from './KalpanaEditionCard';
import { DEFAULT_CARD_IMAGE, getKalpanaCmsData } from './getKalpanaData';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Kalpana | Malankara Orthodox Syrian Church',
  description:
    'The official annual calendar and directory of the Malankara Orthodox Syrian Church.',
};

const BASE_PATH = '/mosc-redesign/kalpana-cms';

export default async function KalpanaCmsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const nameSearch = typeof params.q === 'string' ? params.q : undefined;
  const searchTerm = nameSearch?.trim() ?? '';
  const hasSearch = searchTerm.length > 0;

  const { page: pageContent, editions, pagination } = await getKalpanaCmsData({
    nameSearch: searchTerm || undefined,
    page,
    pageSize: DIRECTORY_PAGE_SIZE,
  });

  const subtitle = hasSearch
    ? `${pagination.total} edition${pagination.total !== 1 ? 's' : ''} matching "${searchTerm}".`
    : `${pagination.total} edition${pagination.total !== 1 ? 's' : ''}.`;

  return (
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner title="Kalpana" breadcrumbFrom="downloads" />

      <section className="relative bg-gradient-to-br from-syro-bg-gray to-syro-bg-gray py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="relative w-full h-auto rounded-lg overflow-hidden flex items-center justify-center bg-syro-bg-gray/20">
              <Image
                src={pageContent.heroImageUrl}
                alt={pageContent.heroImageAlt ?? 'Kalpana'}
                width={800}
                height={600}
                className="w-full h-auto object-contain"
                style={{
                  backgroundColor: 'transparent',
                  borderRadius: '0.5rem',
                }}
                priority
                unoptimized={Boolean(pageContent.heroImageUrl.startsWith('http'))}
              />
            </div>
            <div>
              <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed mb-4">
                {pageContent.introParagraph1}
              </p>
              <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed">
                {pageContent.introParagraph2}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="font-syro-display font-semibold text-3xl text-syro-blue mb-4">
              Available Editions
            </h2>
            <p className="font-syro-primary text-lg text-syro-dark-gray mb-2">
              Select a year to view or download the Kalpana edition
            </p>
            <p className="font-syro-primary text-syro-dark-gray">{subtitle}</p>
          </div>

          <div className="mb-8">
            <LiveUrlSearch
              id="kalpana-cms-search"
              ariaLabel="Search Kalpana editions by title or year"
              placeholder="Search by title or year..."
              inputClassName="font-syro-primary w-full px-4 py-2 border border-syro-table-border rounded-lg bg-white text-syro-blue placeholder:text-syro-dark-gray focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2"
            />
          </div>

          {editions.length === 0 ? (
            <p className="font-syro-primary text-syro-dark-gray text-center mb-12">
              {hasSearch
                ? 'No Kalpana editions match your search.'
                : 'No Kalpana editions are available at this time. Please check back later.'}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-4">
                {editions.map((edition) => (
                  <KalpanaEditionCard
                    key={edition.documentId || edition.slug || edition.year}
                    edition={edition}
                    defaultCardImage={DEFAULT_CARD_IMAGE}
                  />
                ))}
              </div>
              <DirectoryPagination
                page={pagination.page}
                pageCount={pagination.pageCount}
                total={pagination.total}
                pageSize={DIRECTORY_PAGE_SIZE}
                itemsOnPage={editions.length}
                buildPageHref={(p) => buildCmsListUrl(BASE_PATH, p, nameSearch)}
                itemLabel="editions"
                emptyLabel="No editions found"
              />
            </>
          )}
        </div>
      </section>

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-syro-card p-8">
            <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4">
              {pageContent.aboutTitle}
            </h2>
            <div className="space-y-4 font-syro-primary text-lg text-syro-dark-gray leading-relaxed">
              <p>{pageContent.aboutDescription}</p>
              <p>Each edition includes:</p>
              <ul className="space-y-2 ml-6">
                {pageContent.aboutFeatures.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <span className="w-2 h-2 bg-syro-red rounded-full mt-2 mr-3 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <QuickLinks />
    </div>
  );
}

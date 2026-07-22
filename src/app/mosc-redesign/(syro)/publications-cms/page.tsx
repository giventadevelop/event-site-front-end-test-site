import React from 'react';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';
import LiveUrlSearch from '../components/LiveUrlSearch';
import { MoscCmsHubCard } from '../components/MoscCmsHubCard';
import DirectoryPagination from '../directory/components/DirectoryPagination';
import { DIRECTORY_PAGE_SIZE } from '../directory/types/listPagination';
import { buildCmsListUrl } from '../lib/cmsListUrl';
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
const BASE_PATH = '/mosc-redesign/publications-cms';

export default async function PublicationsCmsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const nameSearch = typeof params.q === 'string' ? params.q : undefined;
  const searchTerm = nameSearch?.trim() ?? '';
  const hasSearch = searchTerm.length > 0;

  const { entries, pagination } = await getPublicationEntriesData({
    nameSearch: searchTerm || undefined,
    page,
    pageSize: DIRECTORY_PAGE_SIZE,
  });

  const subtitle = hasSearch
    ? `${pagination.total} publication${pagination.total !== 1 ? 's' : ''} matching "${searchTerm}".`
    : `${pagination.total} publication${pagination.total !== 1 ? 's' : ''}.`;

  return (
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner title="Publications" breadcrumbFrom="home" description={BANNER_DESCRIPTION} />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-light text-[#798daf] mb-4 pl-8 border-l-[7px] border-syro-red">
            Church Publications
          </h3>
          <p className="font-syro-primary text-syro-dark-gray mb-6">{subtitle}</p>

          <div className="mb-8">
            <LiveUrlSearch
              id="cms-publications-name-search"
              ariaLabel="Search publications by name"
              placeholder="Search by name..."
              inputClassName="font-syro-primary w-full px-4 py-2 border border-syro-table-border rounded-lg bg-white text-syro-blue placeholder:text-syro-dark-gray focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2"
            />
          </div>

          {entries.length === 0 ? (
            <p className="font-syro-primary text-syro-dark-gray mb-12">
              {hasSearch
                ? 'No publications match your search.'
                : 'No publications are available at this time. Please check back later.'}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                {entries.map((entry) => (
                  <MoscCmsHubCard
                    key={entry.documentId || entry.slug}
                    href={`/mosc-redesign/publications-cms/${entry.slug}`}
                    title={entry.name}
                    excerpt={entry.excerpt}
                    imageUrl={entry.imageUrl ?? PLACEHOLDER_IMAGE}
                    imageAlt={entry.imageAlt}
                  />
                ))}
              </div>
              <DirectoryPagination
                page={pagination.page}
                pageCount={pagination.pageCount}
                total={pagination.total}
                pageSize={DIRECTORY_PAGE_SIZE}
                itemsOnPage={entries.length}
                buildPageHref={(p) => buildCmsListUrl(BASE_PATH, p, nameSearch)}
                itemLabel="publications"
                emptyLabel="No publications found"
              />
            </>
          )}

          <div className="max-w-3xl mx-auto text-center mb-12 mt-16">
            <h2 className="font-syro-display font-semibold text-3xl text-syro-blue mb-6">
              Our Publishing Mission
            </h2>
            <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed mb-6">
              The publications of the Malankara Orthodox Syrian Church serve to educate, inspire, and
              strengthen the faith of our community. Through our magazines, books, and other literature,
              we preserve our rich heritage while addressing contemporary spiritual needs.
            </p>
            <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed">
              Each publication reflects our commitment to sharing the timeless teachings of the Orthodox
              faith in a manner that is both accessible and meaningful to all generations.
            </p>
          </div>

          <QuickLinks />
        </div>
      </section>
    </div>
  );
}

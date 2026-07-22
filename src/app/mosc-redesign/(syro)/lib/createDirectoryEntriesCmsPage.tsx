import React from 'react';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';
import LiveUrlSearch from '../components/LiveUrlSearch';
import { MoscCmsHubCard, cardExcerpt } from '../components/MoscCmsHubCard';
import DirectoryPagination from '../directory/components/DirectoryPagination';
import { DIRECTORY_PAGE_SIZE } from '../directory/types/listPagination';
import { getDirectoryEntriesData } from '../directory/entries/getDirectoryEntriesData';
import { DIRECTORY_ENTRY_TYPE_LABELS, type DirectoryEntryType } from '../directory/entries/types';
import { buildCmsListUrl } from '../lib/cmsListUrl';

export const dynamic = 'force-dynamic';

type CmsEntriesConfig = {
  directoryType: DirectoryEntryType;
  basePath: string;
  sectionTitle: string;
  description: string;
  metadataTitle: string;
  itemLabel: string;
};

export function createDirectoryEntriesCmsPage(config: CmsEntriesConfig) {
  const { directoryType, basePath, sectionTitle, description, metadataTitle, itemLabel } = config;
  const title = DIRECTORY_ENTRY_TYPE_LABELS[directoryType];

  async function Page({
    searchParams,
  }: {
    searchParams: Promise<{ page?: string; q?: string }>;
  }) {
    const params = await searchParams;
    const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
    const nameSearch = typeof params.q === 'string' ? params.q : undefined;
    const searchTerm = nameSearch?.trim() ?? '';
    const hasSearch = searchTerm.length > 0;

    const { entries, pagination } = await getDirectoryEntriesData({
      directoryType,
      nameSearch: searchTerm || undefined,
      page,
      pageSize: DIRECTORY_PAGE_SIZE,
    });

    const subtitle = hasSearch
      ? `${pagination.total} entr${pagination.total !== 1 ? 'ies' : 'y'} matching "${searchTerm}".`
      : `${pagination.total} entr${pagination.total !== 1 ? 'ies' : 'y'}.`;

    return (
      <div className="bg-syro-bg-gray">
        <SyroPageBanner title={title} breadcrumbFrom="directory" description={description} />

        <section className="py-16 bg-syro-bg-gray">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h3 className="text-2xl font-light text-[#798daf] mb-4 pl-8 border-l-[7px] border-syro-red">
              {sectionTitle}
            </h3>
            <p className="font-syro-primary text-syro-dark-gray mb-6">{subtitle}</p>

            <div className="mb-8">
              <LiveUrlSearch
                id={`cms-${directoryType}-name-search`}
                ariaLabel={`Search ${title.toLowerCase()} by name`}
                placeholder="Search by name..."
                inputClassName="font-syro-primary w-full px-4 py-2 border border-syro-table-border rounded-lg bg-white text-syro-blue placeholder:text-syro-dark-gray focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2"
              />
            </div>

            {entries.length === 0 ? (
              <p className="font-syro-primary text-syro-dark-gray mb-12">
                {hasSearch
                  ? `No ${itemLabel} match your search.`
                  : `No ${itemLabel} are available at this time.`}
              </p>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                  {entries.map((entry) => (
                    <MoscCmsHubCard
                      key={entry.documentId}
                      href={`/mosc-redesign/directory/entry/${entry.documentId}`}
                      title={entry.name}
                      excerpt={cardExcerpt(entry.description)}
                      imageUrl={entry.imageUrl}
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
                  buildPageHref={(p) => buildCmsListUrl(basePath, p, nameSearch)}
                  itemLabel={itemLabel}
                  emptyLabel={`No ${itemLabel} found`}
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

  return {
    Page,
    metadata: {
      title: metadataTitle,
      description,
    },
  };
}

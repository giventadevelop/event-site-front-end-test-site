import React from 'react';
import Link from 'next/link';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';
import LiveUrlSearch from '../components/LiveUrlSearch';
import DirectoryPagination from '../directory/components/DirectoryPagination';
import { DIRECTORY_PAGE_SIZE } from '../directory/types/listPagination';
import { buildCmsListUrl } from '../lib/cmsListUrl';
import { getBishopsData } from '../directory/bishops/getBishopsData';
import { getHolySynodMembersData } from './getHolySynodMembersData';
import HolySynodCmsGrid from './components/HolySynodCmsGrid';
import RetiredBishopsGrid from './components/RetiredBishopsGrid';
import type { HolySynodMemberType } from './types';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Holy Synod',
  description:
    'Members of the Holy Synod of the Malankara Orthodox Syrian Church — bishops and the Catholicos as the highest governing body.',
};

const BANNER_DESCRIPTION =
  'The Holy Synod consists of all the bishops of the Malankara Orthodox Syrian Church, serving as the highest governing body under the leadership of the Catholicos.';

const BASE_PATH = '/mosc-redesign/holy-synod-cms';

type FilterValue = 'all' | HolySynodMemberType | 'retired';

const SECTION_TITLES: Record<Exclude<FilterValue, 'all'>, string> = {
  catholicos: 'The Catholicos',
  metropolitan: 'Metropolitans',
  retired: 'Retired Bishops',
};

function parseFilter(typeParam: string | undefined): FilterValue {
  if (typeParam === 'catholicos') return 'catholicos';
  if (typeParam === 'metropolitan' || typeParam === 'diocesan') return 'metropolitan';
  if (typeParam === 'retired') return 'retired';
  return 'all';
}

function buildHolySynodUrl(type: FilterValue, page: number, nameSearch?: string): string {
  return buildCmsListUrl(BASE_PATH, page, nameSearch, type !== 'all' ? { type } : undefined);
}

export default async function HolySynodCmsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; type?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const nameSearch = typeof params.q === 'string' ? params.q : undefined;
  const searchTerm = nameSearch?.trim() ?? '';
  const hasSearch = searchTerm.length > 0;
  const currentFilter = parseFilter(params.type);
  const isRetired = currentFilter === 'retired';

  const holySynodResult = !isRetired
    ? await getHolySynodMembersData({
        nameSearch: searchTerm || undefined,
        memberType:
          currentFilter === 'all' || currentFilter === 'retired' ? undefined : currentFilter,
        page,
        pageSize: DIRECTORY_PAGE_SIZE,
      })
    : null;

  const retiredResult = isRetired
    ? await getBishopsData({
        bishopType: 'retired',
        nameSearch: searchTerm || undefined,
        page,
        pageSize: DIRECTORY_PAGE_SIZE,
      })
    : null;

  const members = holySynodResult?.members ?? [];
  const retiredBishops = retiredResult?.bishops ?? [];
  const pagination = isRetired
    ? retiredResult!.pagination
    : holySynodResult!.pagination;
  const itemsOnPage = isRetired ? retiredBishops.length : members.length;
  const isEmpty = itemsOnPage === 0;

  const title =
    currentFilter === 'all' ? 'Members of the Holy Synod' : SECTION_TITLES[currentFilter];
  const subtitle = hasSearch
    ? `${pagination.total} ${isRetired ? 'bishop' : 'member'}${pagination.total !== 1 ? 's' : ''} matching "${searchTerm}".`
    : currentFilter === 'all'
      ? `All members. ${pagination.total} total. Catholicos listed first.`
      : `${pagination.total} ${isRetired ? 'bishop' : 'member'}${pagination.total !== 1 ? 's' : ''} in this category.`;

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Holy Synod"
        breadcrumbFrom="home"
        description={BANNER_DESCRIPTION}
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-light text-[#798daf] mb-4 pl-8 border-l-[7px] border-syro-red">
            {title}
          </h3>
          <p className="font-syro-primary text-syro-dark-gray mb-6">{subtitle}</p>

          <div className="mb-6">
            <LiveUrlSearch
              id="holy-synod-cms-search"
              ariaLabel="Search Holy Synod members by name"
              placeholder="Search members by name..."
              preserveParams={currentFilter !== 'all' ? ['type'] : []}
              inputClassName="font-syro-primary w-full px-4 py-2 border border-syro-table-border rounded-lg bg-white text-syro-blue placeholder:text-syro-dark-gray focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2"
              describedBy="holy-synod-search-desc"
            />
            <p id="holy-synod-search-desc" className="sr-only">
              Case-insensitive search by name. Combine with category filter if needed.
            </p>
          </div>

          <div className="mb-8">
            <p className="font-syro-primary text-sm font-medium text-syro-dark-gray mb-2">
              Filter by category
            </p>
            <nav className="flex flex-wrap gap-2" aria-label="Holy Synod category filter">
              {(['all', 'catholicos', 'metropolitan', 'retired'] as const).map((filter) => {
                const label = filter === 'all' ? 'All' : SECTION_TITLES[filter];
                const isActive = currentFilter === filter;
                return (
                  <Link
                    key={filter}
                    href={buildHolySynodUrl(filter, 1, nameSearch)}
                    className={`font-syro-primary font-medium px-4 py-2 rounded-lg reverent-transition ${
                      isActive
                        ? 'bg-syro-red text-white'
                        : 'bg-white/80 text-syro-blue hover:bg-white hover:text-syro-red border border-syro-table-border'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {isEmpty ? (
            <p className="font-syro-primary text-syro-dark-gray mb-12">
              {hasSearch
                ? isRetired
                  ? 'No retired bishops match your search.'
                  : 'No Holy Synod members match your search.'
                : isRetired
                  ? 'No retired bishops are available at this time. Please check back later.'
                  : 'No Holy Synod members are available for this selection. Please check back later.'}
            </p>
          ) : (
            <>
              {isRetired ? (
                <RetiredBishopsGrid bishops={retiredBishops} />
              ) : (
                <HolySynodCmsGrid members={members} />
              )}
              <DirectoryPagination
                page={pagination.page}
                pageCount={pagination.pageCount}
                total={pagination.total}
                pageSize={DIRECTORY_PAGE_SIZE}
                itemsOnPage={itemsOnPage}
                buildPageHref={(p) => buildHolySynodUrl(currentFilter, p, nameSearch)}
                itemLabel={isRetired ? 'bishops' : 'members'}
                emptyLabel={isRetired ? 'No retired bishops found' : 'No members found'}
              />
            </>
          )}

          <QuickLinks />
        </div>
      </section>
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { getParishesData } from './getParishesData';
import { getDioceseByDocumentId } from '../dioceses/getDiocesesData';
import type { Parish } from './types';
import SyroPageBanner from '../../components/SyroPageBanner';

export const metadata: Metadata = {
  title: 'Parishes | Directory | Malankara Orthodox Syrian Church',
  description: 'Directory of parishes of the Malankara Orthodox Syrian Church.',
  keywords: ['MOSC Directory', 'Parishes'],
};

const PAGE_SIZE = 20;
const BASE_PATH = '/mosc-redesign/directory/parishes';

type PageProps = { searchParams: Promise<{ page?: string; q?: string; diocese?: string }> };

function buildUrl(page: number, q?: string, dioceseDocumentId?: string): string {
  const params = new URLSearchParams();
  if (page > 1) params.set('page', String(page));
  if (q?.trim()) params.set('q', q.trim());
  if (dioceseDocumentId?.trim()) params.set('diocese', dioceseDocumentId.trim());
  const query = params.toString();
  return query ? `${BASE_PATH}?${query}` : BASE_PATH;
}

export default async function ParishesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const nameSearch = typeof params.q === 'string' ? params.q : undefined;
  const dioceseParam = typeof params.diocese === 'string' ? params.diocese.trim() : '';
  const dioceseForFilter = dioceseParam.length > 0 ? dioceseParam : undefined;
  const dioceseRecord = dioceseForFilter ? await getDioceseByDocumentId(dioceseForFilter) : null;
  const hasDioceseScope = Boolean(dioceseForFilter);
  const searchTerm = nameSearch?.trim() ?? '';
  const hasParishSearch = searchTerm.length > 0;
  const hasSearch = hasParishSearch;

  const { parishes, pagination } = await getParishesData({
    nameSearch: nameSearch?.trim() || undefined,
    dioceseDocumentId: dioceseForFilter,
    page,
    pageSize: PAGE_SIZE,
  });

  const subtitle = (() => {
    const n = pagination.total;
    const parishWord = n === 1 ? 'parish' : 'parishes';
    if (!hasSearch && !hasDioceseScope) {
      return `${n} paris${n !== 1 ? 'hes' : 'h'}. Data from the directory Parish API.`;
    }
    if (!hasSearch && hasDioceseScope && dioceseRecord) {
      return `${n} ${parishWord} under ${dioceseRecord.name}.`;
    }
    if (!hasSearch && hasDioceseScope && !dioceseRecord) {
      return `Diocese filter applied (record not found in directory). ${n} ${parishWord} in API results.`;
    }
    const bits: string[] = [];
    if (hasParishSearch) bits.push(`parish name contains "${searchTerm}"`);
    const filterNote = hasDioceseScope && dioceseRecord ? ` (under ${dioceseRecord.name})` : '';
    return `${n} ${parishWord} where ${bits.join(' and ')}${filterNote}.`;
  })();

  return (
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner
        title="Parishes"
        breadcrumbFrom="directory"
        hideBreadcrumbNav={hasDioceseScope}
      />
      <section className="relative bg-syro-bg-gray py-8 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-body text-syro-dark-gray mt-2">
            {subtitle}
          </p>
        </div>
      </section>

      <section className="py-12 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="mb-6 space-y-3"
            role="search"
            aria-label="Search parishes"
          >
            <form method="get" action={BASE_PATH} className="flex flex-col gap-3">
              {dioceseForFilter ? <input type="hidden" name="diocese" value={dioceseForFilter} /> : null}
              <div className="flex flex-wrap gap-2 items-end">
                <div className="flex-1 min-w-[200px]">
                  <label htmlFor="parishes-name-search" className="font-body text-sm text-syro-dark-gray block mb-1">
                    Parish name
                  </label>
                  <input
                    id="parishes-name-search"
                    type="search"
                    name="q"
                    defaultValue={nameSearch ?? ''}
                    placeholder="Search parishes by name..."
                    className="font-body w-full px-4 py-2 border border-syro-table-border rounded-lg bg-white text-syro-blue placeholder:text-syro-dark-gray focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2"
                  />
                </div>
                <button type="submit" className="syro-primary-button inline-flex items-center gap-2 px-4 py-2 shrink-0">
                  Search
                </button>
              </div>
              {(hasSearch || hasDioceseScope) && (
                <Link
                  href={
                    hasDioceseScope && dioceseForFilter
                      ? `${BASE_PATH}?diocese=${encodeURIComponent(dioceseForFilter)}`
                      : BASE_PATH
                  }
                  className="font-body text-sm text-syro-dark-gray hover:text-syro-red hover:underline inline-block"
                >
                  {hasDioceseScope ? 'Clear search' : 'Clear all filters'}
                </Link>
              )}
            </form>
          </div>

          {parishes.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center border-l-4 border-syro-red shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px]">
              <p className="font-body text-syro-dark-gray">
                {hasDioceseScope && dioceseRecord
                  ? `No parishes match your search in ${dioceseRecord.name}.`
                  : hasDioceseScope
                    ? 'No parishes found for this diocese filter.'
                    : 'No parishes listed yet. Data is loaded from the directory Parish API.'}
              </p>
              <Link href="/mosc-redesign/directory" className="inline-block no-underline font-light text-white bg-[#dc3545] py-2.5 px-5 border-r-[7px] border-r-[#be1929] mt-4 transition-[1s] hover:bg-[#be1929] hover:border-r-[6px] hover:border-r-[#dc3545] hover:text-white">
            ← Back to Directory
          </Link>
            </div>
          ) : (
            <>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {parishes.map((p) => (
                  <ParishCard key={p.documentId} parish={p} />
                ))}
              </ul>
              {pagination.pageCount > 1 && (
                <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                  <span className="font-body text-sm text-syro-dark-gray">Page {pagination.page} of {pagination.pageCount}</span>
                  <div className="flex gap-3">
                    {pagination.page > 1 && (
                      <Link
                        href={buildUrl(pagination.page - 1, nameSearch, dioceseForFilter)}
                        className="px-4 py-2 bg-syro-red/10 text-syro-blue font-body font-medium rounded-lg hover:bg-syro-red/20 reverent-transition"
                      >
                        Previous
                      </Link>
                    )}
                    {pagination.page < pagination.pageCount && (
                      <Link
                        href={buildUrl(pagination.page + 1, nameSearch, dioceseForFilter)}
                        className="px-4 py-2 bg-syro-red/10 text-syro-blue font-body font-medium rounded-lg hover:bg-syro-red/20 reverent-transition"
                      >
                        Next
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function ParishCard({ parish }: { parish: Parish }) {
  const locationParts = [parish.addressLine1, parish.city, parish.state].filter(Boolean);
  const locationLine = locationParts.length ? locationParts.join(', ') : parish.address ?? null;

  return (
    <li className="h-full bg-white rounded-lg overflow-hidden sacred-shadow-sm border-l-4 border-syro-red hover:sacred-shadow reverent-transition shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px]">
      <Link href={`/mosc-redesign/directory/parishes/${parish.documentId}`} className="block group h-full flex flex-col">
        <div className="flex flex-col sm:flex-row gap-4 p-6 flex-1">
          {parish.imageUrl && (
            <div className="relative w-full sm:w-32 h-40 sm:h-28 flex-shrink-0 rounded-lg overflow-hidden bg-syro-bg-gray">
              <Image
                src={parish.imageUrl}
                alt={parish.imageAlt ?? parish.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 128px"
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="font-heading font-semibold text-xl text-syro-blue group-hover:text-syro-red reverent-transition">{parish.name}</h2>
            {parish.dioceseName && <p className="font-body text-sm text-syro-dark-gray mt-1">{parish.dioceseName}</p>}
            {parish.vicarName && (
              <p className="font-body text-sm text-syro-dark-gray mt-1">
                Vicar: <span className="font-medium text-syro-blue">{parish.vicarName}</span>
              </p>
            )}
            {locationLine && (
              <p className="font-body text-sm text-syro-dark-gray mt-1">
                {locationLine}
              </p>
            )}
            <span className="syro-primary-button inline-flex items-center gap-2 mt-2 w-fit">
              View details
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
}

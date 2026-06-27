import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { getBishopsData } from './getBishopsData';
import type { Bishop, BishopType } from './types';

export const metadata: Metadata = {
  title: 'Bishops | Directory | Malankara Orthodox Syrian Church',
  description: 'Directory of bishops — The Catholicos, Diocesan Bishops, Retired Bishops.',
  keywords: ['MOSC Directory', 'Bishops', 'Holy Synod', 'Catholicos', 'Diocesan Bishops'],
};

const SECTION_TITLES: Record<BishopType, string> = {
  catholicos: 'The Catholicos',
  diocesan: 'Diocesan Bishops',
  retired: 'Retired Bishops',
};

const PAGE_SIZE = 20;

type FilterValue = 'all' | BishopType;

type PageProps = {
  searchParams: Promise<{ type?: string; page?: string; q?: string }>;
};

function buildBishopsUrl(
  type: FilterValue,
  page: number,
  nameSearch?: string
): string {
  const base = '/mosc-old/directory/bishops';
  const q = new URLSearchParams();
  if (type !== 'all') q.set('type', type);
  if (page > 1) q.set('page', String(page));
  if (nameSearch?.trim()) q.set('q', nameSearch.trim());
  const query = q.toString();
  return query ? `${base}?${query}` : base;
}

export default async function BishopsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const typeParam = params.type as string | undefined;
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const nameSearch = typeof params.q === 'string' ? params.q : undefined;

  const currentFilter: FilterValue =
    typeParam === 'catholicos' || typeParam === 'diocesan' || typeParam === 'retired'
      ? typeParam
      : 'all';

  const bishopTypeFilter: BishopType | undefined =
    currentFilter === 'all' ? undefined : currentFilter;

  const { bishops, pagination } = await getBishopsData({
    bishopType: bishopTypeFilter,
    nameSearch: nameSearch?.trim() || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const title =
    currentFilter === 'all'
      ? 'The Holy Synod of Bishops'
      : SECTION_TITLES[currentFilter];
  const searchTerm = nameSearch?.trim() ?? '';
  const hasSearch = searchTerm.length > 0;
  const subtitle = hasSearch
    ? `${pagination.total} bishop${pagination.total !== 1 ? 's' : ''} matching "${searchTerm}".`
    : currentFilter === 'all'
      ? `All bishops. ${pagination.total} total.`
      : `${pagination.total} bishop${pagination.total !== 1 ? 's' : ''} in this category.`;

  return (
    <div className="min-h-screen bg-background">
      <section className="relative bg-gradient-to-br from-background to-muted py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/mosc-old/directory"
            className="font-body text-primary hover:underline mb-4 inline-block"
          >
            ← Directory
          </Link>
          <h1 className="font-heading font-semibold text-3xl lg:text-4xl text-foreground">
            {title}
          </h1>
          <p className="font-body text-muted-foreground mt-2">
            {subtitle}
          </p>
        </div>
      </section>

      <section className="py-8 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search by name */}
          <div className="mb-6">
            <form
              method="get"
              action="/mosc-old/directory/bishops"
              className="flex flex-wrap gap-2 items-center"
              role="search"
              aria-label="Search bishops by name"
            >
              {currentFilter !== 'all' && (
                <input type="hidden" name="type" value={currentFilter} />
              )}
              <label htmlFor="bishops-name-search" className="sr-only">
                Search by name
              </label>
              <input
                id="bishops-name-search"
                type="search"
                name="q"
                defaultValue={nameSearch ?? ''}
                placeholder="Search by name..."
                className="font-body flex-1 min-w-[200px] px-4 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                aria-describedby="bishops-search-desc"
              />
              <button
                type="submit"
                className="font-body font-medium px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 reverent-transition"
              >
                Search
              </button>
              {hasSearch && (
                <Link
                  href={buildBishopsUrl(currentFilter, 1)}
                  className="font-body text-sm text-muted-foreground hover:text-primary hover:underline"
                >
                  Clear search
                </Link>
              )}
              <p id="bishops-search-desc" className="sr-only">
                Case-insensitive search by bishop name. Combine with category filter if needed.
              </p>
            </form>
          </div>

          {/* Category filter: All, Catholicos, Diocesan Bishops, Retired Bishops */}
          <div className="mb-8">
            <p className="font-body text-sm font-medium text-muted-foreground mb-2">
              Filter by category
            </p>
            <nav className="flex flex-wrap gap-2" aria-label="Bishop category filter">
              {(['all', 'catholicos', 'diocesan', 'retired'] as const).map((filter) => {
                const label =
                  filter === 'all' ? 'All' : SECTION_TITLES[filter];
                const isActive = currentFilter === filter;
                const href = buildBishopsUrl(filter, 1, nameSearch);
                return (
                  <Link
                    key={filter}
                    href={href}
                    className={`font-body font-medium px-4 py-2 rounded-lg reverent-transition ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/60 text-foreground hover:bg-muted hover:text-primary'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {bishops.length === 0 ? (
            <div className="bg-muted/20 rounded-lg p-8 text-center">
              <p className="font-body text-muted-foreground">
                No bishops listed for this selection yet. Data is loaded from the directory API.
              </p>
              <Link
                href="/mosc-old/directory"
                className="font-body text-primary font-medium mt-4 inline-block hover:underline"
              >
                Back to Directory
              </Link>
            </div>
          ) : (
            <>
              <ul className="space-y-6">
                {bishops.map((bishop) => (
                  <BishopCard key={bishop.documentId} bishop={bishop} />
                ))}
              </ul>
              {pagination.pageCount > 1 && (
                <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                  <span className="font-body text-sm text-muted-foreground">
                    Page {pagination.page} of {pagination.pageCount}
                  </span>
                  <div className="flex gap-3">
                    {pagination.page > 1 && (
                      <Link
                        href={buildBishopsUrl(currentFilter, pagination.page - 1, nameSearch)}
                        className="px-4 py-2 bg-primary/10 text-primary font-body font-medium rounded-lg hover:bg-primary/20 reverent-transition"
                      >
                        Previous
                      </Link>
                    )}
                    {pagination.page < pagination.pageCount && (
                      <Link
                        href={buildBishopsUrl(currentFilter, pagination.page + 1, nameSearch)}
                        className="px-4 py-2 bg-primary/10 text-primary font-body font-medium rounded-lg hover:bg-primary/20 reverent-transition"
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

function BishopCard({ bishop }: { bishop: Bishop }) {
  return (
    <li className="bg-card rounded-lg p-4 sacred-shadow-sm hover:sacred-shadow reverent-transition">
      <Link href={`/mosc-old/directory/bishops/${bishop.documentId}`} className="flex gap-4 group">
        {bishop.imageUrl && (
          <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted/40">
            <Image
              src={bishop.imageUrl}
              alt={bishop.imageAlt ?? bishop.name}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="font-heading font-medium text-lg text-foreground group-hover:text-primary reverent-transition">
            {bishop.name}
          </h3>
          {bishop.dioceseName && (
            <p className="font-body text-sm text-muted-foreground mt-0.5">
              {bishop.dioceseName}
            </p>
          )}
          <span className="inline-flex items-center font-body text-primary text-sm font-medium mt-2 group-hover:gap-2 reverent-transition">
            View details
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </div>
      </Link>
    </li>
  );
}

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getDirectoryEntriesData } from './getDirectoryEntriesData';
import type { DirectoryEntry, DirectoryEntryType } from './types';
import { DIRECTORY_ENTRY_TYPE_LABELS } from './types';
import SyroPageBanner from '../../components/SyroPageBanner';

const PAGE_SIZE = 20;

type Props = {
  directoryType: DirectoryEntryType;
  searchParams: Promise<{ page?: string; q?: string }>;
};

function buildUrl(directoryType: DirectoryEntryType, page: number, q?: string): string {
  const base = `/mosc-redesign/directory/${directoryType}`;
  const params = new URLSearchParams();
  if (page > 1) params.set('page', String(page));
  if (q?.trim()) params.set('q', q.trim());
  const query = params.toString();
  return query ? `${base}?${query}` : base;
}

export default async function EntriesListPage({ directoryType, searchParams }: Props) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const nameSearch = typeof params.q === 'string' ? params.q : undefined;
  const searchTerm = nameSearch?.trim() ?? '';
  const hasSearch = searchTerm.length > 0;

  const { entries, pagination } = await getDirectoryEntriesData({
    directoryType,
    nameSearch: nameSearch?.trim() || undefined,
    page,
    pageSize: PAGE_SIZE,
  });
  const title = DIRECTORY_ENTRY_TYPE_LABELS[directoryType];
  const basePath = `/mosc-redesign/directory/${directoryType}`;
  const subtitle = hasSearch
    ? `${pagination.total} entr${pagination.total !== 1 ? 'ies' : 'y'} matching "${searchTerm}".`
    : `${pagination.total} entr${pagination.total !== 1 ? 'ies' : 'y'}. Data from the directory API.`;

  return (
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner title={title} breadcrumbFrom="directory" />
      <section className="relative bg-syro-bg-gray py-8 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="font-body text-syro-dark-gray mt-2">
            {subtitle}
          </p>
        </div>
      </section>

      <section className="py-12 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6" role="search" aria-label={`Search ${title.toLowerCase()} by name`}>
            <form method="get" action={basePath} className="flex flex-wrap gap-2 items-center">
              <label htmlFor="entries-name-search" className="sr-only">Search by name</label>
              <input
                id="entries-name-search"
                type="search"
                name="q"
                defaultValue={nameSearch ?? ''}
                placeholder="Search by name..."
                className="font-body flex-1 min-w-[200px] px-4 py-2 border border-syro-table-border rounded-lg bg-white text-syro-blue placeholder:text-syro-dark-gray focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2"
              />
              <button type="submit" className="syro-primary-button inline-flex items-center gap-2 px-4 py-2">
                Search
              </button>
              {hasSearch && (
                <Link href={basePath} className="font-body text-sm text-syro-dark-gray hover:text-syro-red hover:underline">
                  Clear search
                </Link>
              )}
            </form>
          </div>

          {entries.length === 0 ? (
            <div className="bg-white rounded-lg p-8 text-center border-l-4 border-syro-red shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px]">
              <p className="font-body text-syro-dark-gray">
                No entries in this section yet. Data is loaded from the directory API.
              </p>
              <Link href="/mosc-redesign/directory" className="inline-block no-underline font-light text-white bg-[#dc3545] py-2.5 px-5 border-r-[7px] border-r-[#be1929] mt-4 transition-[1s] hover:bg-[#be1929] hover:border-r-[6px] hover:border-r-[#dc3545] hover:text-white">
                ← Back to Directory
              </Link>
            </div>
          ) : (
            <>
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {entries.map((entry) => (
                  <EntryCard key={entry.documentId} entry={entry} />
                ))}
              </ul>
              {pagination.pageCount > 1 && (
                <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                  <span className="font-body text-sm text-syro-dark-gray">
                    Page {pagination.page} of {pagination.pageCount}
                  </span>
                  <div className="flex gap-3">
                    {pagination.page > 1 && (
                      <Link
                        href={buildUrl(directoryType, pagination.page - 1, nameSearch)}
                        className="px-4 py-2 bg-syro-red/10 text-syro-blue font-body font-medium rounded-lg hover:bg-syro-red/20 reverent-transition"
                      >
                        Previous
                      </Link>
                    )}
                    {pagination.page < pagination.pageCount && (
                      <Link
                        href={buildUrl(directoryType, pagination.page + 1, nameSearch)}
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

function EntryCard({ entry }: { entry: DirectoryEntry }) {
  return (
    <li className="h-full bg-white rounded-lg overflow-hidden sacred-shadow-sm border-l-4 border-syro-red hover:sacred-shadow reverent-transition shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px]">
      <Link href={`/mosc-redesign/directory/entry/${entry.documentId}`} className="flex gap-4 p-6 group h-full">
        {entry.imageUrl && (
          <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-syro-bg-gray">
            <Image
              src={entry.imageUrl}
              alt={entry.imageAlt ?? entry.name}
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="font-heading font-semibold text-xl text-syro-blue group-hover:text-syro-red reverent-transition">
            {entry.name}
          </h2>
          {entry.description && (
            <p className="font-body text-sm text-syro-dark-gray mt-1 line-clamp-2">
              {entry.description}
            </p>
          )}
          <span className="syro-primary-button inline-flex items-center gap-2 mt-2 w-fit">
            View details
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
        </div>
      </Link>
    </li>
  );
}

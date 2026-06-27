import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getDirectoryEntriesData } from './getDirectoryEntriesData';
import type { DirectoryEntry, DirectoryEntryType } from './types';
import { DIRECTORY_ENTRY_TYPE_LABELS } from './types';

const PAGE_SIZE = 20;

type Props = {
  directoryType: DirectoryEntryType;
  searchParams: Promise<{ page?: string; q?: string }>;
};

function buildUrl(directoryType: DirectoryEntryType, page: number, q?: string): string {
  const base = `/mosc-old/directory/${directoryType}`;
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
  const basePath = `/mosc-old/directory/${directoryType}`;
  const subtitle = hasSearch
    ? `${pagination.total} entr${pagination.total !== 1 ? 'ies' : 'y'} matching "${searchTerm}".`
    : `${pagination.total} entr${pagination.total !== 1 ? 'ies' : 'y'}. Data from the directory API.`;

  return (
    <div className="min-h-screen bg-background">
      <section className="relative bg-gradient-to-br from-background to-muted py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/mosc-old/directory" className="font-body text-primary hover:underline mb-4 inline-block">
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

      <section className="py-12 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6" role="search" aria-label={`Search ${title.toLowerCase()} by name`}>
            <form method="get" action={basePath} className="flex flex-wrap gap-2 items-center">
              <label htmlFor="entries-name-search" className="sr-only">Search by name</label>
              <input
                id="entries-name-search"
                type="search"
                name="q"
                defaultValue={nameSearch ?? ''}
                placeholder="Search by name..."
                className="font-body flex-1 min-w-[200px] px-4 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
              <button type="submit" className="font-body font-medium px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 reverent-transition">
                Search
              </button>
              {hasSearch && (
                <Link href={basePath} className="font-body text-sm text-muted-foreground hover:text-primary hover:underline">
                  Clear search
                </Link>
              )}
            </form>
          </div>

          {entries.length === 0 ? (
            <div className="bg-muted/20 rounded-lg p-8 text-center">
              <p className="font-body text-muted-foreground">
                No entries in this section yet. Data is loaded from the directory API.
              </p>
              <Link href="/mosc-old/directory" className="font-body text-primary font-medium mt-4 inline-block hover:underline">
                Back to Directory
              </Link>
            </div>
          ) : (
            <>
              <ul className="space-y-6">
                {entries.map((entry) => (
                  <EntryCard key={entry.documentId} entry={entry} />
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
                        href={buildUrl(directoryType, pagination.page - 1, nameSearch)}
                        className="px-4 py-2 bg-primary/10 text-primary font-body font-medium rounded-lg hover:bg-primary/20 reverent-transition"
                      >
                        Previous
                      </Link>
                    )}
                    {pagination.page < pagination.pageCount && (
                      <Link
                        href={buildUrl(directoryType, pagination.page + 1, nameSearch)}
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

function EntryCard({ entry }: { entry: DirectoryEntry }) {
  return (
    <li className="bg-muted/20 rounded-lg overflow-hidden sacred-shadow-sm border-l-4 border-primary hover:sacred-shadow reverent-transition">
      <Link href={`/mosc-old/directory/entry/${entry.documentId}`} className="flex gap-4 p-6 group">
        {entry.imageUrl && (
          <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted/40">
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
          <h2 className="font-heading font-semibold text-xl text-foreground group-hover:text-primary reverent-transition">
            {entry.name}
          </h2>
          {entry.description && (
            <p className="font-body text-sm text-muted-foreground mt-1 line-clamp-2">
              {entry.description}
            </p>
          )}
          <span className="inline-flex items-center font-body text-primary text-sm font-medium mt-2">
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

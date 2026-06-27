'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { formatPhoneNumbers } from '../../institutions/lib/formatPhone';
import type { InstitutionEntry } from '../types';

const PAGE_SIZE = 10;

function entrySearchText(entry: InstitutionEntry): string {
  return [
    entry.name,
    entry.description,
    entry.address,
    entry.email,
    entry.phones,
    entry.website,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function filterEntries(entries: InstitutionEntry[], query: string): InstitutionEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return entries;
  return entries.filter((entry) => entrySearchText(entry).includes(q));
}

function formatWebsiteHref(website: string): string {
  const trimmed = website.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/\//, '')}`;
}

function InstitutionEntryCard({
  entry,
  index,
  compact,
}: {
  entry: InstitutionEntry;
  index: number;
  compact?: boolean;
}) {
  const location =
    entry.address?.split('\n').map((line) => line.trim()).filter(Boolean)[0] ?? null;
  const phoneNumbers = entry.phones ? formatPhoneNumbers(entry.phones) : [];
  const emails = entry.email
    ? entry.email.split(/[,;\n]+/).map((item) => item.trim()).filter(Boolean)
    : [];
  const website = entry.website?.trim() ?? null;
  const displayIndex = String(index + 1).padStart(2, '0');

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-xl border border-burgundy/15 bg-white shadow-[rgba(50,50,93,0.18)_0px_8px_20px_-4px,rgba(0,0,0,0.2)_0px_4px_10px_-4px] transition-all duration-300 hover:border-burgundy/30 hover:shadow-[rgba(50,50,93,0.22)_0px_12px_28px_-4px,rgba(0,0,0,0.22)_0px_6px_14px_-4px]${compact ? '' : ' h-full'}`}
    >
      <header className="institution-entry-card__header flex items-start gap-4 border-b border-burgundy/10 bg-gradient-to-r from-burgundy-dark to-burgundy px-5 py-4">
          <span
            className="institution-entry-card__index flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-parchment-light/20 font-syro-display text-sm font-bold"
            aria-hidden
          >
            {displayIndex}
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="institution-entry-card__title font-syro-display text-base font-semibold leading-snug lg:text-lg">
              {entry.name}
            </h3>
            {location ? (
              <p className="institution-entry-card__location mt-1 font-syro-primary text-sm">{location}</p>
            ) : null}
          </div>
        </header>

        {entry.description ? (
          <div className="flex-1 px-5 py-4">
            <p className="font-syro-primary text-sm leading-relaxed text-syro-dark-gray lg:text-base">
              {entry.description}
            </p>
          </div>
        ) : null}

        {(phoneNumbers.length > 0 || emails.length > 0 || website) && (
          <footer className="mt-auto border-t border-burgundy/10 bg-parchment/40 px-5 py-4">
            <p className="mb-3 font-syro-display text-xs font-semibold uppercase tracking-widest text-syro-blue">
              Contact
            </p>
            <div className="flex flex-col gap-2">
              {phoneNumbers.map((num, phoneIndex) => (
                <span
                  key={`${entry.slug}-phone-${phoneIndex}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-burgundy/15 bg-white px-3 py-2 font-syro-primary text-sm text-syro-dark-gray"
                >
                  <svg className="h-4 w-4 shrink-0 text-syro-red" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{phoneIndex === 0 ? `Ph: ${num}` : num}</span>
                </span>
              ))}
              {emails.map((email) => (
                <a
                  key={`${entry.slug}-${email}`}
                  href={`mailto:${email}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-burgundy/15 bg-white px-3 py-2 font-syro-primary text-sm text-syro-red transition-colors hover:border-burgundy/30 hover:bg-burgundy/5"
                >
                  <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="break-all">{email}</span>
                </a>
              ))}
              {website ? (
                <a
                  href={formatWebsiteHref(website)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-burgundy/15 bg-white px-3 py-2 font-syro-primary text-sm text-syro-red transition-colors hover:border-burgundy/30 hover:bg-burgundy/5"
                >
                  <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  <span className="break-all">{website.replace(/^https?:\/\//i, '')}</span>
                </a>
              ) : null}
            </div>
          </footer>
        )}
    </article>
  );
}

interface InstitutionCategoryListProps {
  entries: InstitutionEntry[];
  categoryTitle?: string;
  /** One card per row (no 2-column grid). Use for categories with few entries. */
  singleColumn?: boolean;
}

export default function InstitutionCategoryList({
  entries,
  categoryTitle = 'institutions',
  singleColumn = false,
}: InstitutionCategoryListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const skipInitialScrollRef = useRef(true);

  const filteredEntries = useMemo(
    () => filterEntries(entries, searchQuery),
    [entries, searchQuery],
  );

  const totalCount = filteredEntries.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages - 1);

  const pageEntries = useMemo(() => {
    const start = safePage * PAGE_SIZE;
    return filteredEntries.slice(start, start + PAGE_SIZE);
  }, [filteredEntries, safePage]);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery]);

  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (skipInitialScrollRef.current) {
      skipInitialScrollRef.current = false;
      return;
    }
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [safePage]);

  const displayPage = safePage + 1;
  const startItem = totalCount > 0 ? safePage * PAGE_SIZE + 1 : 0;
  const endItem =
    totalCount > 0
      ? safePage * PAGE_SIZE + Math.min(PAGE_SIZE, totalCount - safePage * PAGE_SIZE)
      : 0;
  const isPrevDisabled = safePage === 0;
  const isNextDisabled = safePage >= totalPages - 1;

  const isSearching = searchQuery.trim().length > 0;
  const itemLabel = categoryTitle.toLowerCase();

  if (entries.length === 0) {
    return (
      <p className="font-syro-primary text-syro-dark-gray">
        No institutions are available in this category at this time. Please check back later.
      </p>
    );
  }

  return (
    <div ref={listRef}>
      <div
        className="mb-6 rounded-xl border border-burgundy/20 bg-white p-4 shadow-sm"
        role="search"
        aria-label={`Search ${itemLabel}`}
      >
        <label htmlFor="institution-category-search" className="mb-2 block font-syro-display text-sm font-semibold text-syro-blue">
          Search {categoryTitle}
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-burgundy/60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              id="institution-category-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${itemLabel} by name, location, or contact…`}
              className="font-syro-primary w-full rounded-lg border border-burgundy/25 bg-parchment/30 py-2.5 pl-10 pr-4 text-syro-dark-gray placeholder:text-warmBrown/60 focus:border-burgundy focus:outline-none focus:ring-2 focus:ring-burgundy/30"
            />
          </div>
          {isSearching ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="font-syro-primary text-sm font-medium text-syro-red transition-colors hover:text-burgundy hover:underline"
            >
              Clear search
            </button>
          ) : null}
        </div>
        {isSearching ? (
          <p className="mt-2 font-syro-primary text-sm text-syro-dark-gray">
            {totalCount} {totalCount === 1 ? 'result' : 'results'} for &ldquo;{searchQuery.trim()}&rdquo;
          </p>
        ) : null}
      </div>

      {totalCount === 0 ? (
        <div className="rounded-xl border border-burgundy/20 bg-white px-6 py-10 text-center shadow-sm">
          <p className="font-syro-primary text-syro-dark-gray">
            No {itemLabel} match &ldquo;{searchQuery.trim()}&rdquo;. Try a different search term.
          </p>
        </div>
      ) : (
        <ul
          className={
            singleColumn
              ? 'm-0 grid list-none grid-cols-1 gap-5 p-0'
              : 'm-0 grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-2 md:gap-8'
          }
        >
          {pageEntries.map((entry, index) => (
            <li key={entry.documentId || entry.slug} className={singleColumn ? undefined : 'h-full'}>
              <InstitutionEntryCard
                entry={entry}
                index={safePage * PAGE_SIZE + index}
                compact={singleColumn}
              />
            </li>
          ))}
        </ul>
      )}

      {totalCount > 0 && totalPages > 1 ? (
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={isPrevDisabled}
              className="flex items-center gap-2 rounded-lg border-2 border-blue-400 bg-blue-100 px-5 py-2.5 font-semibold text-blue-700 shadow-sm transition-all duration-300 hover:scale-105 hover:border-blue-500 hover:bg-blue-200 hover:shadow-md disabled:cursor-not-allowed disabled:border-blue-300 disabled:bg-blue-100 disabled:text-blue-500 disabled:hover:scale-100"
              title="Previous Page"
              aria-label="Previous Page"
              type="button"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Previous</span>
            </button>

            <div className="rounded-lg border-2 border-blue-300 bg-blue-50 px-4 py-2 shadow-sm">
              <span className="text-sm font-bold text-blue-700">
                Page <span className="text-blue-600">{displayPage}</span> of{' '}
                <span className="text-blue-600">{totalPages}</span>
              </span>
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={isNextDisabled}
              className="flex items-center gap-2 rounded-lg border-2 border-blue-400 bg-blue-100 px-5 py-2.5 font-semibold text-blue-700 shadow-sm transition-all duration-300 hover:scale-105 hover:border-blue-500 hover:bg-blue-200 hover:shadow-md disabled:cursor-not-allowed disabled:border-blue-300 disabled:bg-blue-100 disabled:text-blue-500 disabled:hover:scale-100"
              title="Next Page"
              aria-label="Next Page"
              type="button"
            >
              <span>Next</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="mt-3 text-center">
            <div className="inline-flex items-center rounded-lg border-2 border-blue-300 bg-blue-50 px-4 py-2 shadow-sm">
              <span className="text-sm text-gray-700">
                Showing <span className="font-bold text-blue-600">{startItem}</span> to{' '}
                <span className="font-bold text-blue-600">{endItem}</span> of{' '}
                <span className="font-bold text-blue-600">{totalCount}</span> {itemLabel}
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

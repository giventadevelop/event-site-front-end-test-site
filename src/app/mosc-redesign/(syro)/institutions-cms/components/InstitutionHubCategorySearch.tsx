'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import SearchInputWithClear from '../../components/SearchInputWithClear';
import { MoscHubCardMedia } from '../../components/MoscHubCardMedia';

export type InstitutionHubCategoryCard = {
  slug: string;
  title: string;
  description: string;
  imageSrc: string;
  href: string;
};

function filterCardsByTitle(
  cards: InstitutionHubCategoryCard[],
  query: string
): InstitutionHubCategoryCard[] {
  const q = query.trim().toLowerCase();
  if (!q) return cards;
  return cards.filter((card) => card.title.toLowerCase().includes(q));
}

export default function InstitutionHubCategorySearch({
  cards,
  children,
}: {
  cards: InstitutionHubCategoryCard[];
  /** Shown below the grid when not searching (e.g. mission/stats). */
  children?: React.ReactNode;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const filteredCards = useMemo(
    () => filterCardsByTitle(cards, searchQuery),
    [cards, searchQuery]
  );
  const isSearching = searchQuery.trim().length > 0;

  return (
    <>
      <div className="mb-10" role="search" aria-label="Search institution categories by title">
        <div className="flex flex-wrap gap-2 items-center">
          <label htmlFor="cms-institutions-category-search" className="sr-only">
            Search categories by title
          </label>
          <SearchInputWithClear
            id="cms-institutions-category-search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
            placeholder="Search categories by title..."
            wrapperClassName="flex-1 min-w-[200px]"
            className="font-syro-primary w-full px-4 py-2 border border-syro-table-border rounded-lg bg-white text-syro-blue placeholder:text-syro-dark-gray focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2"
          />
          {isSearching ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="font-syro-primary text-sm text-syro-dark-gray hover:text-syro-red hover:underline"
            >
              Clear search
            </button>
          ) : null}
        </div>
        {isSearching ? (
          <p className="mt-3 font-syro-primary text-sm text-syro-dark-gray">
            {filteredCards.length}{' '}
            {filteredCards.length === 1 ? 'result' : 'results'} for &ldquo;{searchQuery.trim()}
            &rdquo;
          </p>
        ) : null}
      </div>

      {filteredCards.length === 0 ? (
        <p className="font-syro-primary text-syro-dark-gray mb-12">
          No categories match your search.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredCards.map((category) => (
            <div
              key={category.slug}
              className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] hover:shadow-[rgba(0,0,0,0.35)_0px_5px_15px] transition-shadow duration-300 overflow-hidden flex flex-col h-full"
            >
              <MoscHubCardMedia
                src={category.imageSrc}
                alt={category.title}
                unoptimized={Boolean(category.imageSrc.startsWith('http'))}
              />
              <div className="p-8 pt-0 flex flex-col flex-1">
                <h3 className="font-syro-display text-xl font-semibold text-syro-blue mb-4 leading-snug">
                  {category.title}
                </h3>
                <p className="font-syro-primary text-base text-syro-dark-gray flex-1 mb-5 leading-relaxed line-clamp-3">
                  {category.description}
                </p>
                <Link
                  href={category.href}
                  className="syro-primary-button inline-flex items-center gap-2 mt-auto w-fit"
                >
                  <span>Read More</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isSearching ? children : null}
    </>
  );
}

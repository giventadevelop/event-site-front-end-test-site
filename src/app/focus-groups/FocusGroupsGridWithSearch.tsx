'use client';

import { useState, useEffect } from 'react';

interface FocusGroupWithEvents {
  id: number;
  name?: string;
  slug?: string;
  description?: string;
  coverImageUrl?: string;
  events?: any[];
}

interface FocusGroupsGridWithSearchProps {
  groups: FocusGroupWithEvents[];
  total: number;
}

export default function FocusGroupsGridWithSearch({ groups, total }: FocusGroupsGridWithSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 8;

  const filteredGroups = searchTerm.trim()
    ? groups.filter((g) => {
        const q = searchTerm.trim().toLowerCase();
        const name = (g.name || '').toLowerCase();
        const slug = (g.slug || '').toLowerCase();
        const description = (g.description || '').toLowerCase();
        return name.includes(q) || slug.includes(q) || description.includes(q);
      })
    : groups;

  const filteredCount = filteredGroups.length;
  const totalPages = Math.max(1, Math.ceil(filteredCount / pageSize));
  const startItem = filteredCount > 0 ? page * pageSize + 1 : 0;
  const endItem = filteredCount > 0 ? Math.min((page + 1) * pageSize, filteredCount) : 0;
  const paginatedGroups = filteredGroups.slice(page * pageSize, (page + 1) * pageSize);

  useEffect(() => {
    setPage(0);
  }, [searchTerm]);

  const isPrevDisabled = page <= 0;
  const isNextDisabled = page + 1 >= totalPages;
  const displayPage = totalPages === 0 ? 0 : page + 1;

  return (
    <div className="space-y-6">
      {/* Search bar - same style as admin focus-groups / executive-committee */}
      <div className="px-6 py-4 border border-gray-200 rounded-lg bg-gray-50">
        <label htmlFor="focus-groups-public-search" className="sr-only">
          Search focus groups
        </label>
        <div className="relative max-w-xl">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            id="focus-groups-public-search"
            type="search"
            placeholder="Enter the name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Search focus groups by name"
          />
        </div>
        {searchTerm.trim() && (
          <p className="mt-2 text-sm text-gray-600">
            Showing {filteredCount} of {groups.length} group{groups.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Focus Groups Grid - colored cards with cycling accent */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {paginatedGroups.map((g, index) => {
          const colorScheme = [
            { card: 'bg-blue-50/80 border-l-4 border-blue-500', title: 'group-hover:text-blue-700', accent: 'text-blue-600', border: 'border-blue-200', eventHover: 'hover:bg-blue-100' },
            { card: 'bg-teal-50/80 border-l-4 border-teal-500', title: 'group-hover:text-teal-700', accent: 'text-teal-600', border: 'border-teal-200', eventHover: 'hover:bg-teal-100' },
            { card: 'bg-amber-50/80 border-l-4 border-amber-500', title: 'group-hover:text-amber-700', accent: 'text-amber-600', border: 'border-amber-200', eventHover: 'hover:bg-amber-100' },
            { card: 'bg-indigo-50/80 border-l-4 border-indigo-500', title: 'group-hover:text-indigo-700', accent: 'text-indigo-600', border: 'border-indigo-200', eventHover: 'hover:bg-indigo-100' },
          ][index % 4];
          return (
            <div
              key={g.id}
              className={`group block rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-300 ${colorScheme.card}`}
            >
              <a href={`/focus-groups/${encodeURIComponent(g.slug || '')}`} className="block text-center">
                <div
                  className="h-60 rounded-lg mb-4 overflow-hidden flex items-center justify-center bg-white/60"
                  style={{
                    ...(g.coverImageUrl
                      ? {
                          backgroundImage: `url(${g.coverImageUrl})`,
                          backgroundSize: 'contain',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                        }
                      : { backgroundColor: 'rgba(243, 244, 246, 0.8)' }),
                  }}
                />
                <h3 className={`text-xl font-semibold text-gray-900 mb-2 transition-colors duration-300 ${colorScheme.title}`}>
                  {g.name}
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed line-clamp-3 mb-4">
                  {g.description || 'No description provided.'}
                </p>
              </a>

              {g.events && g.events.length > 0 && (
                <div className={`mt-4 pt-4 border-t ${colorScheme.border} text-center`}>
                  <h4 className={`text-sm font-semibold mb-2 ${colorScheme.accent}`}>Upcoming Events</h4>
                  <div className="space-y-2">
                    {g.events.slice(0, 3).map((event: any) => (
                      <a
                        key={event.id}
                        href={`/event/${event.id}`}
                        className={`block p-2 rounded-lg transition-colors duration-300 ${colorScheme.eventHover}`}
                      >
                        <div className="text-xs text-gray-600">
                          {event.startDate} • {event.startTime}
                        </div>
                        <div className="text-sm font-medium text-gray-900 mt-1 line-clamp-1">{event.title}</div>
                      </a>
                    ))}
                    {g.events.length > 3 && (
                      <a
                        href={`/focus-groups/${encodeURIComponent(g.slug || '')}`}
                        className={`block text-xs mt-2 font-medium transition-colors duration-300 ${colorScheme.accent} hover:opacity-80`}
                      >
                        View all {g.events.length} events →
                      </a>
                    )}
                  </div>
                </div>
              )}
              {g.events && g.events.length === 0 && (
                <div className={`mt-4 pt-4 border-t ${colorScheme.border} text-center`}>
                  <p className="text-xs text-gray-500">No upcoming events</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredCount === 0 && (
        <div className="col-span-full text-center py-12 text-gray-500">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          <p className="text-sm font-medium text-gray-700">
            {searchTerm.trim() ? 'No focus groups match your search.' : 'No focus groups found'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {searchTerm.trim() ? '[Try a different search]' : '[No focus groups match your criteria]'}
          </p>
        </div>
      )}

      {/* Pagination - only when there are results */}
      {filteredCount > 0 && (
        <div className="mt-8">
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={isPrevDisabled}
              className={`px-5 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg shadow-sm border-2 border-blue-400 hover:border-blue-500 disabled:bg-blue-100 disabled:border-blue-300 disabled:text-blue-500 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md ${
                isPrevDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none hover:scale-100' : ''
              }`}
              title="Previous Page"
              aria-label="Previous Page"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Previous</span>
            </button>

            <div className="px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
              <span className="text-sm font-bold text-blue-700">
                Page <span className="text-blue-600">{displayPage}</span> of{' '}
                <span className="text-blue-600">{totalPages}</span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={isNextDisabled}
              className={`px-5 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg shadow-sm border-2 border-blue-400 hover:border-blue-500 disabled:bg-blue-100 disabled:border-blue-300 disabled:text-blue-500 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md ${
                isNextDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none hover:scale-100' : ''
              }`}
              title="Next Page"
              aria-label="Next Page"
            >
              <span>Next</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="text-center mt-3">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
              <span className="text-sm text-gray-700">
                Showing <span className="font-bold text-blue-600">{startItem}</span> to{' '}
                <span className="font-bold text-blue-600">{endItem}</span> of{' '}
                <span className="font-bold text-blue-600">{filteredCount}</span> focus groups
                {searchTerm.trim() ? ` (filtered from ${groups.length})` : ''}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

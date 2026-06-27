'use client';

import { useState, useEffect } from 'react';

interface FocusGroupRow {
  id: number;
  name?: string;
  slug?: string;
  isActive?: boolean;
}

interface FocusGroupsListWithSearchProps {
  groups: FocusGroupRow[];
  total: number;
}

export default function FocusGroupsListWithSearch({ groups, total }: FocusGroupsListWithSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const filteredGroups = searchTerm.trim()
    ? groups.filter((g) => {
        const q = searchTerm.trim().toLowerCase();
        const name = (g.name || '').toLowerCase();
        const slug = (g.slug || '').toLowerCase();
        return name.includes(q) || slug.includes(q);
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
  const displayPage = page + 1;

  return (
    <div className="space-y-0">
      {/* Search bar - same style as executive-committee */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 rounded-t-lg">
        <label htmlFor="focus-groups-search" className="sr-only">
          Search focus groups
        </label>
        <input
          id="focus-groups-search"
          type="search"
          placeholder="Search by name or slug..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-xl px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          aria-label="Search focus groups by name or slug"
        />
        {searchTerm.trim() && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredCount} of {groups.length} group{groups.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-b-lg overflow-hidden">
        <div className="user-table-scroll-container">
          <table
            className="min-w-full divide-y divide-gray-300 dark:divide-gray-600 border border-gray-300 dark:border-gray-600"
            style={{ minWidth: '800px', width: '100%' }}
          >
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-r border-gray-300 dark:border-gray-600">
                  Name
                </th>
                <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-r border-gray-300 dark:border-gray-600">
                  Slug
                </th>
                <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-r border-gray-300 dark:border-gray-600">
                  Active
                </th>
                <th className="px-2 sm:px-4 lg:px-6 py-2 sm:py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-300 dark:border-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-300 dark:divide-gray-600">
              {paginatedGroups.map((g, index) => (
                <tr
                  key={g.id}
                  className={`${
                    index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-blue-50 dark:bg-gray-700'
                  } hover:bg-yellow-100 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-300 dark:border-gray-600`}
                >
                  <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600">
                    {g.name}
                  </td>
                  <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-600">
                    {g.slug}
                  </td>
                  <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm border-r border-gray-200 dark:border-gray-600">
                    {g.isActive ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        YES
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                        NO
                      </span>
                    )}
                  </td>
                  <td className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-1 sm:gap-2">
                      <a
                        className="flex-shrink-0 w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                        href={`/admin/focus-groups/${g.id}/edit`}
                        title="Edit Focus Group"
                        aria-label="Edit Focus Group"
                      >
                        <svg
                          className="w-6 h-6 sm:w-10 sm:h-10 text-blue-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </a>
                      <a
                        className="flex-shrink-0 w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                        href={`/admin/focus-groups/${g.id}/events`}
                        title="Manage Events"
                        aria-label="Manage Events"
                      >
                        <svg
                          className="w-6 h-6 sm:w-10 sm:h-10 text-green-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </a>
                      <a
                        className="flex-shrink-0 w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-purple-100 hover:bg-purple-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                        href={`/admin/focus-groups/${g.id}/members`}
                        title="Manage Members"
                        aria-label="Manage Members"
                      >
                        <svg
                          className="w-6 h-6 sm:w-10 sm:h-10 text-purple-500"
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
                      </a>
                      <a
                        className="flex-shrink-0 w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-yellow-100 hover:bg-yellow-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                        href={`/admin/focus-groups/${g.id}/media`}
                        title="View Media"
                        aria-label="View Media"
                      >
                        <svg
                          className="w-6 h-6 sm:w-10 sm:h-10 text-yellow-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedGroups.length === 0 && (
                <tr>
                  <td
                    className="px-2 sm:px-4 lg:px-6 py-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center"
                    colSpan={4}
                  >
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-300 dark:border-orange-600 rounded-lg shadow-sm">
                      <svg
                        className="w-5 h-5 text-orange-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                        {searchTerm.trim() ? 'No focus groups match your search.' : 'No focus groups found'}
                      </span>
                      {searchTerm.trim() && (
                        <span className="text-sm text-orange-600 dark:text-orange-400">
                          [Try a different search]
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination: always render so admin tests and users see consistent controls (disabled when empty) */}
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
    </div>
  );
}

'use client';

import { useState } from 'react';

interface GallerySearchProps {
  onSearch: (filters: {
    searchTerm: string;
    startDate?: string;
    endDate?: string;
  }) => void;
  loading?: boolean;
}

export function GallerySearch({ onSearch, loading = false }: GallerySearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDateFilters, setShowDateFilters] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      searchTerm,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  const handleClear = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setShowDateFilters(false);
    // Explicitly call onSearch with empty filters to reset gallery
    // Use empty string for searchTerm to ensure state change is detected
    onSearch({
      searchTerm: '',
      startDate: undefined,
      endDate: undefined,
    });
  };

  const hasFilters = searchTerm || startDate || endDate;

  return (
    <div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Main search input */}
          <div className="relative max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {/* Search Icon - Inline SVG per icons_buttons_styles.mdc */}
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search events by title..."
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
              {hasFilters && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {/* Clear Button - Medium Action Icon Pattern per icons_buttons_styles.mdc */}
                  <button
                    type="button"
                    onClick={handleClear}
                    data-testid="clear-search-button"
                    className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                    title="Clear search"
                    aria-label="Clear search"
                    disabled={loading}
                  >
                    {/* X/Close Icon - Inline SVG per icons_buttons_styles.mdc */}
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Date filter toggle and Search button */}
          <div className="flex items-center space-x-2">
            {/* Date Filters Button - Medium Action Icon Pattern per icons_buttons_styles.mdc */}
            <button
              type="button"
              onClick={() => setShowDateFilters(!showDateFilters)}
              className="flex-shrink-0 h-12 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 px-4"
              title="Toggle Date Filters"
              aria-label="Toggle Date Filters"
              disabled={loading}
            >
              <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-gray-200 flex items-center justify-center">
                {/* Calendar Icon - Inline SVG per icons_buttons_styles.mdc */}
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="font-semibold text-gray-700 text-sm">Date Filters</span>
              {/* Filter Icon - Inline SVG per icons_buttons_styles.mdc */}
              <svg className={`w-4 h-4 text-gray-600 transition-transform ${showDateFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>

            {/* Search Button - Medium Action Icon Pattern per icons_buttons_styles.mdc */}
            <button
              type="submit"
              disabled={loading}
              className="flex-shrink-0 h-12 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Search Events"
              aria-label="Search Events"
            >
              <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-blue-200 flex items-center justify-center">
                {/* Search Icon - Inline SVG per icons_buttons_styles.mdc */}
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <span className="font-semibold text-blue-700 text-sm">Search</span>
            </button>
          </div>

        {/* Date range filters */}
        {showDateFilters && (
          <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-600">
              Filter events by their start date. Leave blank to include all dates.
            </p>
          </div>
        )}

        {loading && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Searching...</span>
          </div>
        )}
      </form>

        <p className="mt-2 text-sm text-gray-600">
          Search by event title and optionally filter by date range to find specific events and their media
        </p>
    </div>
  );
}

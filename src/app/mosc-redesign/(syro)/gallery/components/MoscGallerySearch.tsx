'use client';

import { useEffect, useState } from 'react';
import type {
  GalleryAlbumFilterOptions,
  GalleryEventFilterOptions,
} from '@/app/gallery/ApiServerActions';

export type MoscGalleryAlbumSearchFilters = {
  searchTerm: string;
  categoryId?: number;
  categoryName?: string;
  albumYear?: number;
  eventLocation?: string;
};

export type MoscGalleryEventSearchFilters = {
  searchTerm: string;
  year?: number;
  location?: string;
  eventTypeId?: number;
};

type TabType = 'albums' | 'events';

type MoscGallerySearchProps = {
  activeTab: TabType;
  loading?: boolean;
  albumOptions: GalleryAlbumFilterOptions;
  eventOptions: GalleryEventFilterOptions;
  staticCategoryNames?: string[];
  staticYears?: number[];
  staticLocations?: string[];
  preferStaticAlbumOptions?: boolean;
  initialAlbumFilters: MoscGalleryAlbumSearchFilters;
  initialEventFilters: MoscGalleryEventSearchFilters;
  onAlbumSearch: (filters: MoscGalleryAlbumSearchFilters) => void;
  onEventSearch: (filters: MoscGalleryEventSearchFilters) => void;
};

const selectClassName =
  'font-body w-full border border-syro-table-border rounded-lg bg-white text-syro-blue px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2 disabled:opacity-50';

export function MoscGallerySearch({
  activeTab,
  loading = false,
  albumOptions,
  eventOptions,
  staticCategoryNames = [],
  staticYears = [],
  staticLocations = [],
  preferStaticAlbumOptions = false,
  initialAlbumFilters,
  initialEventFilters,
  onAlbumSearch,
  onEventSearch,
}: MoscGallerySearchProps) {
  const [albumFilters, setAlbumFilters] = useState(initialAlbumFilters);
  const [eventFilters, setEventFilters] = useState(initialEventFilters);

  useEffect(() => {
    setAlbumFilters(initialAlbumFilters);
  }, [initialAlbumFilters]);

  useEffect(() => {
    setEventFilters(initialEventFilters);
  }, [initialEventFilters]);

  const albumCategories =
    !preferStaticAlbumOptions && albumOptions.categories.length > 0
      ? albumOptions.categories.map((c) => ({ id: c.id, label: c.displayName }))
      : staticCategoryNames.map((name) => ({ id: null as number | null, label: name }));

  const albumYears =
    !preferStaticAlbumOptions && albumOptions.years.length > 0
      ? albumOptions.years
      : [...staticYears].sort((a, b) => b - a);

  const albumLocations =
    !preferStaticAlbumOptions && albumOptions.locations.length > 0
      ? albumOptions.locations
      : staticLocations;

  const albumCategoryValue =
    albumFilters.categoryId != null
      ? String(albumFilters.categoryId)
      : albumFilters.categoryName ?? '';

  const handleAlbumSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAlbumSearch(albumFilters);
  };

  const handleEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEventSearch(eventFilters);
  };

  const clearAlbumFilters = () => {
    const cleared: MoscGalleryAlbumSearchFilters = { searchTerm: '' };
    setAlbumFilters(cleared);
    onAlbumSearch(cleared);
  };

  const clearEventFilters = () => {
    const cleared: MoscGalleryEventSearchFilters = { searchTerm: '' };
    setEventFilters(cleared);
    onEventSearch(cleared);
  };

  const hasAlbumFilters =
    !!albumFilters.searchTerm ||
    albumFilters.categoryId != null ||
    !!albumFilters.categoryName ||
    albumFilters.albumYear != null ||
    !!albumFilters.eventLocation;

  const hasEventFilters =
    !!eventFilters.searchTerm ||
    eventFilters.year != null ||
    !!eventFilters.location ||
    eventFilters.eventTypeId != null;

  if (activeTab === 'albums') {
    return (
      <div className="mb-8 rounded-lg border border-syro-table-border/60 bg-syro-bg-gray/40 p-5 sm:p-6">
        <h4 className="font-syro-display text-lg font-semibold text-syro-blue mb-1">
          Search Albums
        </h4>
        <p className="font-body text-sm text-syro-dark-gray mb-4">
          Filter by title, category, year, or location.
        </p>

        <form onSubmit={handleAlbumSubmit} className="space-y-4" role="search" aria-label="Search albums">
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-syro-dark-gray">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35m1.85-5.4a7.25 7.25 0 11-14.5 0 7.25 7.25 0 0114.5 0z"
                />
              </svg>
            </span>
            <input
              type="search"
              value={albumFilters.searchTerm}
              onChange={(e) => setAlbumFilters((prev) => ({ ...prev, searchTerm: e.target.value }))}
              placeholder="Search albums by title..."
              disabled={loading}
              className="font-body w-full pl-10 pr-4 py-2.5 border border-syro-table-border rounded-lg bg-white text-syro-blue placeholder:text-syro-dark-gray focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="album-category" className="font-body text-sm font-medium text-syro-dark-gray block mb-1">
                Category
              </label>
              <select
                id="album-category"
                value={albumCategoryValue}
                onChange={(e) => {
                  const value = e.target.value;
                  if (!value) {
                    setAlbumFilters((prev) => ({
                      ...prev,
                      categoryId: undefined,
                      categoryName: undefined,
                    }));
                    return;
                  }
                  const asId = parseInt(value, 10);
                  if (Number.isFinite(asId) && String(asId) === value) {
                    setAlbumFilters((prev) => ({
                      ...prev,
                      categoryId: asId,
                      categoryName: undefined,
                    }));
                  } else {
                    setAlbumFilters((prev) => ({
                      ...prev,
                      categoryId: undefined,
                      categoryName: value,
                    }));
                  }
                }}
                disabled={loading}
                className={selectClassName}
              >
                <option value="">All categories</option>
                {albumCategories.map((cat) => (
                  <option
                    key={cat.id ?? cat.label}
                    value={cat.id != null ? String(cat.id) : cat.label}
                  >
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="album-year" className="font-body text-sm font-medium text-syro-dark-gray block mb-1">
                Year
              </label>
              <select
                id="album-year"
                value={albumFilters.albumYear ?? ''}
                onChange={(e) => {
                  const raw = e.target.value;
                  setAlbumFilters((prev) => ({
                    ...prev,
                    albumYear: raw ? parseInt(raw, 10) : undefined,
                  }));
                }}
                disabled={loading}
                className={selectClassName}
              >
                <option value="">All years</option>
                {albumYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="album-location" className="font-body text-sm font-medium text-syro-dark-gray block mb-1">
                Location
              </label>
              <select
                id="album-location"
                value={albumFilters.eventLocation ?? ''}
                onChange={(e) =>
                  setAlbumFilters((prev) => ({
                    ...prev,
                    eventLocation: e.target.value || undefined,
                  }))
                }
                disabled={loading}
                className={selectClassName}
              >
                <option value="">All locations</option>
                {albumLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={loading}
              className="syro-primary-button inline-flex items-center gap-2 px-5 py-2.5 disabled:opacity-50"
            >
              Search
            </button>
            {hasAlbumFilters && (
              <button
                type="button"
                onClick={clearAlbumFilters}
                disabled={loading}
                className="font-body font-medium px-5 py-2.5 rounded-lg border border-syro-blue/25 bg-syro-blue/[0.08] text-syro-blue hover:bg-syro-red/15 hover:text-syro-red hover:border-syro-red/40 reverent-transition disabled:opacity-50"
              >
                Clear filters
              </button>
            )}
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="mb-8 rounded-lg border border-syro-table-border/60 bg-syro-bg-gray/40 p-5 sm:p-6">
      <h4 className="font-syro-display text-lg font-semibold text-syro-blue mb-1">
        Search Event Galleries
      </h4>
      <p className="font-body text-sm text-syro-dark-gray mb-4">
        Filter by title, year, location, or event type.
      </p>

      <form onSubmit={handleEventSubmit} className="space-y-4" role="search" aria-label="Search event galleries">
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-syro-dark-gray">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35m1.85-5.4a7.25 7.25 0 11-14.5 0 7.25 7.25 0 0114.5 0z"
              />
            </svg>
          </span>
          <input
            type="search"
            value={eventFilters.searchTerm}
            onChange={(e) => setEventFilters((prev) => ({ ...prev, searchTerm: e.target.value }))}
            placeholder="Search events by title..."
            disabled={loading}
            className="font-body w-full pl-10 pr-4 py-2.5 border border-syro-table-border rounded-lg bg-white text-syro-blue placeholder:text-syro-dark-gray focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label htmlFor="event-year" className="font-body text-sm font-medium text-syro-dark-gray block mb-1">
              Year
            </label>
            <select
              id="event-year"
              value={eventFilters.year ?? ''}
              onChange={(e) => {
                const raw = e.target.value;
                setEventFilters((prev) => ({
                  ...prev,
                  year: raw ? parseInt(raw, 10) : undefined,
                }));
              }}
              disabled={loading}
              className={selectClassName}
            >
              <option value="">All years</option>
              {eventOptions.years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="event-location" className="font-body text-sm font-medium text-syro-dark-gray block mb-1">
              Location
            </label>
            <select
              id="event-location"
              value={eventFilters.location ?? ''}
              onChange={(e) =>
                setEventFilters((prev) => ({
                  ...prev,
                  location: e.target.value || undefined,
                }))
              }
              disabled={loading}
              className={selectClassName}
            >
              <option value="">All locations</option>
              {eventOptions.locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="event-type" className="font-body text-sm font-medium text-syro-dark-gray block mb-1">
              Event type
            </label>
            <select
              id="event-type"
              value={eventFilters.eventTypeId ?? ''}
              onChange={(e) => {
                const raw = e.target.value;
                setEventFilters((prev) => ({
                  ...prev,
                  eventTypeId: raw ? parseInt(raw, 10) : undefined,
                }));
              }}
              disabled={loading}
              className={selectClassName}
            >
              <option value="">All event types</option>
              {eventOptions.eventTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={loading}
            className="syro-primary-button inline-flex items-center gap-2 px-5 py-2.5 disabled:opacity-50"
          >
            Search
          </button>
          {hasEventFilters && (
            <button
              type="button"
              onClick={clearEventFilters}
              disabled={loading}
              className="font-body font-medium px-5 py-2.5 rounded-lg border border-syro-blue/25 bg-syro-blue/[0.08] text-syro-blue hover:bg-syro-red/15 hover:text-syro-red hover:border-syro-red/40 reverent-transition disabled:opacity-50"
            >
              Clear filters
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

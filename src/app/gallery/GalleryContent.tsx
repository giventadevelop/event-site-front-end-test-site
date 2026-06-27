'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { GalleryEventCard } from './components/GalleryEventCard';
import { GalleryAlbumCard } from './components/GalleryAlbumCard';
import { GalleryTabs } from './components/GalleryTabs';
import { GallerySearch } from './components/GallerySearch';
import { GalleryPagination } from './components/GalleryPagination';
import { fetchEventsForGallery, fetchAlbumsForGallery } from './ApiServerActions';
import type { GalleryPageData, GalleryAlbumWithMedia } from './ApiServerActions';
import pageStyles from './GalleryPage.module.css';

function GalleryControlsPanel({ children }: { children: ReactNode }) {
  return (
    <div className="homepage-glass-card services-glass-card-face rounded-2xl p-6 sm:p-8 mb-8 space-y-6">
      {children}
    </div>
  );
}

function GalleryGridShell({ children }: { children: ReactNode }) {
  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{children}</div>
    </div>
  );
}

function GallerySkeletonCard() {
  return (
    <div
      className="homepage-glass-card services-glass-card-face rounded-2xl overflow-hidden animate-pulse"
      style={{ padding: 0 }}
    >
      <div className="h-48 bg-white/10" />
      <div className="p-6 space-y-3">
        <div className="h-4 bg-white/20 rounded w-3/4" />
        <div className="h-3 bg-white/10 rounded w-1/2" />
      </div>
    </div>
  );
}

const ITEMS_PER_PAGE = 12;

type TabType = 'albums' | 'events';

export function GalleryContent() {
  const [activeTab, setActiveTab] = useState<TabType>('albums');
  const [galleryData, setGalleryData] = useState<GalleryPageData | null>(null);
  const [albumsData, setAlbumsData] = useState<{
    albumsWithMedia: GalleryAlbumWithMedia[];
    totalAlbums: number;
    currentPage: number;
    totalPages: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [albumsCount, setAlbumsCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [searchFilters, setSearchFilters] = useState({
    searchTerm: '',
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
  });

  // Initial load: Fetch counts to determine default tab and load initial data
  useEffect(() => {
    const determineDefaultTabAndLoad = async () => {
      setLoading(true);
      try {
        // Fetch first page of albums to check if any exist
        const albumsResult = await fetchAlbumsForGallery(0, 1, '', undefined, undefined);
        const albumsTotal = albumsResult.totalAlbums;

        // Fetch first page of events to check if any exist
        const eventsResult = await fetchEventsForGallery(0, 1, '', undefined, undefined);
        const eventsTotal = eventsResult.totalEvents;

        setAlbumsCount(albumsTotal);
        setEventsCount(eventsTotal);

        // Set default tab: albums if they exist, otherwise events
        let defaultTab: TabType = 'albums';
        if (albumsTotal > 0) {
          defaultTab = 'albums';
        } else if (eventsTotal > 0) {
          defaultTab = 'events';
        }

        setActiveTab(defaultTab);
        setInitialLoad(false);

        // Load data for the default tab
        if (defaultTab === 'albums') {
          const albumsData = await fetchAlbumsForGallery(
            0,
            ITEMS_PER_PAGE,
            searchFilters.searchTerm,
            searchFilters.startDate,
            searchFilters.endDate
          );
          setAlbumsData(albumsData);
          setAlbumsCount(albumsData.totalAlbums);
        } else {
          const eventsData = await fetchEventsForGallery(
            0,
            ITEMS_PER_PAGE,
            searchFilters.searchTerm,
            searchFilters.startDate,
            searchFilters.endDate
          );
          setGalleryData(eventsData);
          setEventsCount(eventsData.totalEvents);
        }
      } catch (error) {
        console.error('Failed to determine default tab and load data:', error);
        setInitialLoad(false);
      } finally {
        setLoading(false);
      }
    };

    determineDefaultTabAndLoad();
  }, []); // Only run once on mount

  // Load albums data when tab changes or filters change
  useEffect(() => {
    if (activeTab === 'albums' && !initialLoad) {
      const loadAlbumsData = async () => {
        setLoading(true);
        try {
          const data = await fetchAlbumsForGallery(
            currentPage,
            ITEMS_PER_PAGE,
            searchFilters.searchTerm,
            searchFilters.startDate,
            searchFilters.endDate
          );
          setAlbumsData(data);
          setAlbumsCount(data.totalAlbums);
        } catch (error) {
          console.error('Failed to fetch albums data:', error);
          setAlbumsData(null);
        } finally {
          setLoading(false);
        }
      };
      loadAlbumsData();
    }
  }, [activeTab, currentPage, searchFilters.searchTerm, searchFilters.startDate, searchFilters.endDate, initialLoad]);

  // Load events data when tab changes or filters change
  useEffect(() => {
    if (activeTab === 'events' && !initialLoad) {
      const loadEventsData = async () => {
        setLoading(true);
        try {
          const data = await fetchEventsForGallery(
            currentPage,
            ITEMS_PER_PAGE,
            searchFilters.searchTerm,
            searchFilters.startDate,
            searchFilters.endDate
          );
          setGalleryData(data);
          setEventsCount(data.totalEvents);
        } catch (error) {
          console.error('Failed to fetch events data:', error);
          setGalleryData(null);
        } finally {
          setLoading(false);
        }
      };
      loadEventsData();
    }
  }, [activeTab, currentPage, searchFilters.searchTerm, searchFilters.startDate, searchFilters.endDate, initialLoad]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (filters: {
    searchTerm: string;
    startDate?: string;
    endDate?: string;
  }) => {
    // Always update filters and reset to first page, even if filters appear unchanged
    // This ensures clearing search properly reloads all items
    setSearchFilters({
      searchTerm: filters.searchTerm || '',
      startDate: filters.startDate,
      endDate: filters.endDate,
    });
    setCurrentPage(0); // Reset to first page on new search
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setCurrentPage(0); // Reset to first page when switching tabs
  };

  // Loading state
  if (loading && initialLoad) {
    return (
      <div className="space-y-6">
        <GalleryControlsPanel>
          <GalleryTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            albumsCount={albumsCount}
            eventsCount={eventsCount}
            loading={true}
          />
          <GallerySearch onSearch={handleSearch} loading={loading} />
        </GalleryControlsPanel>

        <GalleryGridShell>
          {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
            <GallerySkeletonCard key={i} />
          ))}
        </GalleryGridShell>

        <GalleryPagination
          currentPage={currentPage}
          totalPages={1}
          totalCount={0}
          pageSize={ITEMS_PER_PAGE}
          onPageChange={handlePageChange}
          loading={loading}
        />
      </div>
    );
  }

  // Albums tab content
  if (activeTab === 'albums') {
    const hasFilters = searchFilters.searchTerm || searchFilters.startDate || searchFilters.endDate;
    const hasAlbums = albumsData && albumsData.albumsWithMedia && albumsData.albumsWithMedia.length > 0;

    if (!hasAlbums && !loading) {
      return (
        <div className="space-y-6">
          <GalleryControlsPanel>
            <GalleryTabs
              activeTab={activeTab}
              onTabChange={handleTabChange}
              albumsCount={albumsCount}
              eventsCount={eventsCount}
              loading={loading}
            />
            <GallerySearch onSearch={handleSearch} loading={loading} />
          </GalleryControlsPanel>
          <div className="text-center py-12">
            <div className="text-6xl mb-4 opacity-70">📸</div>
            <h3 className={`text-xl font-semibold mb-2 ${pageStyles.emptyStateTitle}`}>
              {hasFilters ? 'No albums found' : 'No albums available'}
            </h3>
            <p className={pageStyles.emptyStateText}>
              {hasFilters
                ? 'No albums match your search criteria. Try adjusting your filters.'
                : 'Check back later for album photos and videos'
              }
            </p>
            {hasFilters && (
              <button
                onClick={() => handleSearch({ searchTerm: '', startDate: undefined, endDate: undefined })}
                className={`mt-4 font-medium ${pageStyles.emptyStateLink}`}
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Always show pagination controls, even when no results */}
          <GalleryPagination
            currentPage={currentPage}
            totalPages={albumsData?.totalPages || 1}
            totalCount={albumsData?.totalAlbums || 0}
            pageSize={ITEMS_PER_PAGE}
            onPageChange={handlePageChange}
            loading={loading}
          />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <GalleryControlsPanel>
          <GalleryTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            albumsCount={albumsCount}
            eventsCount={eventsCount}
            loading={loading}
          />
          <GallerySearch onSearch={handleSearch} loading={loading} />
        </GalleryControlsPanel>

        <GalleryGridShell>
          {loading
            ? Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => <GallerySkeletonCard key={i} />)
            : albumsData?.albumsWithMedia?.map((albumWithMedia) => (
                <GalleryAlbumCard
                  key={albumWithMedia.album.id}
                  albumWithMedia={albumWithMedia}
                />
              ))}
        </GalleryGridShell>

        <GalleryPagination
          currentPage={currentPage}
          totalPages={albumsData?.totalPages || 1}
          totalCount={albumsData?.totalAlbums || 0}
          pageSize={ITEMS_PER_PAGE}
          onPageChange={handlePageChange}
          loading={loading}
          itemType="albums"
        />
      </div>
    );
  }

  // Events tab content
  const hasFilters = searchFilters.searchTerm || searchFilters.startDate || searchFilters.endDate;
  const hasEvents = galleryData && galleryData.eventsWithMedia && galleryData.eventsWithMedia.length > 0;

  if (!hasEvents && !loading) {
    return (
      <div className="space-y-6">
        <GalleryControlsPanel>
          <GalleryTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            albumsCount={albumsCount}
            eventsCount={eventsCount}
            loading={loading}
          />
          <GallerySearch onSearch={handleSearch} loading={loading} />
        </GalleryControlsPanel>
        <div className="text-center py-12">
          <div className="text-6xl mb-4 opacity-70">📸</div>
          <h3 className={`text-xl font-semibold mb-2 ${pageStyles.emptyStateTitle}`}>
            {hasFilters ? 'No events found' : 'No events available'}
          </h3>
          <p className={pageStyles.emptyStateText}>
            {hasFilters
              ? 'No events match your search criteria. Try adjusting your filters.'
              : 'Check back later for event photos and videos'
            }
          </p>
          {hasFilters && (
            <button
              onClick={() => handleSearch({ searchTerm: '', startDate: undefined, endDate: undefined })}
              className={`mt-4 font-medium ${pageStyles.emptyStateLink}`}
            >
              Clear all filters
            </button>
          )}
        </div>

        {/* Always show pagination controls, even when no results */}
        <GalleryPagination
          currentPage={currentPage}
          totalPages={galleryData?.totalPages || 1}
          totalCount={galleryData?.totalEvents || 0}
          pageSize={ITEMS_PER_PAGE}
          onPageChange={handlePageChange}
          loading={loading}
        />
      </div>
    );
  }

  const { eventsWithMedia, totalEvents, totalPages } = galleryData || { eventsWithMedia: [], totalEvents: 0, totalPages: 0 };

  return (
    <div className="space-y-6">
      <GalleryControlsPanel>
        <GalleryTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          albumsCount={albumsCount}
          eventsCount={eventsCount}
          loading={loading}
        />
        <GallerySearch onSearch={handleSearch} loading={loading} />
      </GalleryControlsPanel>

      <GalleryGridShell>
        {loading
          ? Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => <GallerySkeletonCard key={i} />)
          : eventsWithMedia?.map((eventWithMedia) => (
              <GalleryEventCard
                key={eventWithMedia.event.id}
                eventWithMedia={eventWithMedia}
              />
            ))}
      </GalleryGridShell>

      <GalleryPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalEvents}
        pageSize={ITEMS_PER_PAGE}
        onPageChange={handlePageChange}
        loading={loading}
      />
    </div>
  );
}

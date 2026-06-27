'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import type { EventSponsorsDTO } from "@/types";
import { proxyApiPath } from '@/lib/proxyApiPath';
import { SponsorCard } from '@/components/sponsors/SponsorCard';
import HomeParticleBackground from '@/components/HomeParticleBackground';
import pageStyles from './SponsorsPage.module.css';

export default function SponsorsPage() {
  const [sponsors, setSponsors] = useState<EventSponsorsDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSponsors, setFilteredSponsors] = useState<EventSponsorsDTO[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 10; // Standard page size

  useEffect(() => {
    fetchSponsors();
  }, [currentPage, searchTerm]); // Refetch when page or search changes

  useEffect(() => {
    document.body.classList.add('home-page-background');
    document.body.classList.add('sponsors-page-background');
    return () => {
      document.body.classList.remove('home-page-background');
      document.body.classList.remove('sponsors-page-background');
    };
  }, []);

  async function fetchSponsors() {
    setLoading(true);
    setFetchError(false);
    try {
      // Fetch sponsors with pagination and search
      const params = new URLSearchParams({
        sort: 'priorityRanking,asc',
        page: (currentPage - 1).toString(), // Convert to 0-based for backend
        size: pageSize.toString(),
        'isActive.equals': 'true'
      });

      // Add search filter if provided
      if (searchTerm.trim()) {
        params.append('name.contains', searchTerm.trim());
      }

      const response = await fetch(proxyApiPath(`/api/proxy/event-sponsors?${params.toString()}`), {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });

      if (response.ok) {
        const data = await response.json();
        const sponsorsList = Array.isArray(data) ? data : [];

        // Get total count from x-total-count header as per UI style guide
        const totalCountHeader = response.headers.get('x-total-count');
        const count = totalCountHeader ? parseInt(totalCountHeader, 10) : sponsorsList.length;
        const pages = Math.ceil(count / pageSize);

        console.log('✅ Fetched sponsors:', {
          page: currentPage,
          count: sponsorsList.length,
          totalCount: count,
          totalPages: pages
        });

        setSponsors(sponsorsList);
        setFilteredSponsors(sponsorsList);
        setTotalCount(count);
        setTotalPages(pages);
      } else {
        console.warn('Failed to fetch sponsors:', response.status);
        setFetchError(true);
      }
    } catch (error) {
      console.error('Error fetching sponsors:', error);
      setFetchError(true);
    } finally {
      setLoading(false);
    }
  }

  // Pagination handlers
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleSearch = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Calculate pagination info
  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;
  const startItem = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const endItem = (currentPage - 1) * pageSize + filteredSponsors.length;

  return (
    <>
      <HomeParticleBackground />
      <div className={`${pageStyles.sponsorsPage} home-page-layout relative z-[1] min-h-screen`} style={{ paddingTop: '100px' }}>
      {/* Header Section - MOSC Styling */}
      <section className={`${pageStyles.topSection} py-16`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`${pageStyles.topbar} flex items-center mb-8 gap-4 px-16`}>
            <Link
              href="/"
              className={`${pageStyles.backButton} flex-shrink-0 h-14 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-3 sm:px-6`}
            >
              <div className={`${pageStyles.backButtonIcon} flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center`}>
                <svg className={`${pageStyles.backButtonIconSvg} w-6 h-6`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </div>
              <span className={`${pageStyles.backButtonText} font-semibold hidden sm:inline`}>Back to Home</span>
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className={`${pageStyles.pageTitle} text-2xl sm:text-3xl font-bold mb-2`}>Our Sponsors</h1>
              <p className={`${pageStyles.pageDescription} text-sm sm:text-base`}>
                Meet the organizations that support our community initiatives
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section - MOSC Styling */}
      <section className={`${pageStyles.mainSection} py-16`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar - MOSC Styling */}
          <div className="mb-12">
            <div className="relative max-w-md mx-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search sponsors..."
                className={`${pageStyles.searchInput} block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 reverent-transition`}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="relative">
                <div className={`${pageStyles.loader} w-16 h-16 border-4 rounded-full animate-spin`}></div>
              </div>
            </div>
          ) : fetchError ? (
            <div className="text-center py-12">
              <div className={`${pageStyles.statusCard} rounded-lg p-8 max-w-md mx-auto`}>
                <div className={`${pageStyles.statusCardIcon} flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full`}>
                  <svg className="w-8 h-8 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className={`${pageStyles.statusCardTitle} font-heading font-semibold text-xl mb-2`}>Unable to Load Sponsors</h3>
                <p className={pageStyles.statusCardText}>Please try refreshing the page or contact us if the problem persists.</p>
              </div>
            </div>
          ) : filteredSponsors.length === 0 ? (
            <div className="text-center py-12">
              <div className={`${pageStyles.statusCard} rounded-lg p-8 max-w-md mx-auto`}>
                <div className={`${pageStyles.statusCardIcon} flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full`}>
                  <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className={`${pageStyles.statusCardTitle} font-heading font-semibold text-xl mb-2`}>
                  {searchTerm ? 'No Sponsors Found' : 'No Sponsors Available'}
                </h3>
                <p className={pageStyles.statusCardText}>
                  {searchTerm
                    ? `No sponsors match "${searchTerm}". Try a different search term.`
                    : 'We\'re currently seeking sponsors for our events. Contact us to learn about sponsorship opportunities!'
                  }
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Results Count - MOSC Styling */}
              <div className="text-center mb-12">
                <p className={pageStyles.resultsCount}>
                  {searchTerm
                    ? `Found ${totalCount} sponsor${totalCount !== 1 ? 's' : ''} matching "${searchTerm}"`
                    : `Showing ${totalCount} sponsor${totalCount !== 1 ? 's' : ''}`
                  }
                </p>
              </div>

              {/* Sponsors List - 2 cards per row on medium+ screens */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                {filteredSponsors.map((sponsor, index) => (
                  <SponsorCard
                    key={sponsor.id ?? `${sponsor.name}-${index}`}
                    sponsor={sponsor}
                    backgroundClass={pageStyles.sponsorCardBg}
                  />
                ))}
              </div>

              {/* Pagination Controls - Standard Admin Style */}
              <div className="mt-8">
                <div className="flex justify-between items-center">
                  <button
                    onClick={handlePrevPage}
                    disabled={!hasPrevPage}
                    className={`${pageStyles.paginationButton} px-5 py-2.5 font-semibold rounded-lg border-2 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 hover:scale-105`}
                    title="Previous Page"
                    aria-label="Previous Page"
                    type="button"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Previous</span>
                  </button>

                  {/* Page Info */}
                  <div className={`${pageStyles.pageInfo} px-4 py-2 border-2 rounded-lg`}>
                    <span className={`${pageStyles.pageInfoText} text-sm font-bold`}>
                      Page <span className={pageStyles.pageInfoValue}>{currentPage}</span> of <span className={pageStyles.pageInfoValue}>{Math.max(totalPages, 1)}</span>
                    </span>
                  </div>

                  <button
                    onClick={handleNextPage}
                    disabled={!hasNextPage}
                    className={`${pageStyles.paginationButton} px-5 py-2.5 font-semibold rounded-lg border-2 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 hover:scale-105`}
                    title="Next Page"
                    aria-label="Next Page"
                    type="button"
                  >
                    <span>Next</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Item Count Text */}
                <div className="text-center mt-3">
                  {totalCount > 0 ? (
                    <div className={`${pageStyles.itemCountBox} inline-flex items-center px-4 py-2 border-2 rounded-lg`}>
                      <span className={`${pageStyles.itemCountText} text-sm`}>
                        Showing <span className={`${pageStyles.itemCountValue} font-bold`}>{filteredSponsors.length > 0 ? startItem : 0}</span> to <span className={`${pageStyles.itemCountValue} font-bold`}>{filteredSponsors.length > 0 ? endItem : 0}</span> of <span className={`${pageStyles.itemCountValue} font-bold`}>{totalCount}</span> sponsors
                      </span>
                    </div>
                  ) : (
                    <div className={`${pageStyles.noResultsBox} inline-flex items-center gap-2 px-4 py-2 border-2 rounded-lg`}>
                      <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium text-orange-700">No sponsors found</span>
                      <span className="text-sm text-orange-600">[No sponsors match your criteria]</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
      </div>
    </>
  );
}

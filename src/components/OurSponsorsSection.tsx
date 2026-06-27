'use client';

import React, { useEffect, useState, useLayoutEffect } from 'react';
import { HomeSectionRail } from '@/components/HomeSectionRail';
import { HomeSectionTitle } from '@/components/HomeSectionTitle';
import Link from 'next/link';
import type { EventSponsorsDTO } from "@/types";
import { getTenantId } from '@/lib/env';
import { useDeferredFetch } from '@/hooks/usePageReady';
import { SponsorCard } from '@/components/sponsors/SponsorCard';
import { getHomepageCacheKey } from '@/lib/homepageCacheKeys';

const OurSponsorsSection: React.FC = () => {
  const [sponsors, setSponsors] = useState<EventSponsorsDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  // Defer sponsors API call until page ready + 1500ms (bottom of page, lowest priority)
  const shouldFetch = useDeferredFetch(1500);

  // Cache key for sessionStorage (env-prefixed so local/dev/prod are separate)
  const CACHE_KEY = getHomepageCacheKey('homepage_sponsors_cache');
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Run cache read before paint so cached data shows immediately (no delay on refresh)
  useLayoutEffect(() => {
    try {
      const cachedData = sessionStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setSponsors(data ?? []);
          setLoading(false);
        }
      }
    } catch (_) { /* ignore */ }
  }, [CACHE_KEY, CACHE_DURATION]);

  const getHomepageGlassCardClass = () =>
    'homepage-glass-card services-glass-card-face';

  // Resolve banner URL from event_medias (SPONSOR_BANNER, lowest priority first). Runs on every load so new/updated media shows.
  async function resolveBannersForSponsors(
    limitedSponsors: EventSponsorsDTO[]
  ): Promise<EventSponsorsDTO[]> {
    return Promise.all(
      limitedSponsors.map(async (s: EventSponsorsDTO) => {
        if (!s.id) return { ...s };
        try {
          const bannerParams = new URLSearchParams({
            'sponsorId.equals': String(s.id),
            'eventMediaType.equals': 'SPONSOR_BANNER',
            sort: 'priorityRanking,asc',
            size: '1',
          });
          // Same-origin relative URL — avoids CORS when tab is 127.0.0.1 vs localhost or non-3000 port
          const bannerRes = await fetch(`/api/proxy/event-medias?${bannerParams.toString()}`, { cache: 'no-store' });
          if (!bannerRes.ok) return { ...s };
          const bannerData = await bannerRes.json();
          let bannerMedia: { fileUrl?: string }[] = [];
          if (bannerData && typeof bannerData === 'object' && '_embedded' in bannerData && 'eventMedias' in bannerData._embedded) {
            bannerMedia = Array.isArray(bannerData._embedded.eventMedias) ? bannerData._embedded.eventMedias : [];
          } else {
            bannerMedia = Array.isArray(bannerData) ? bannerData : [bannerData];
          }
          const firstBanner = bannerMedia.find((m: { fileUrl?: string }) => m.fileUrl);
          const resolvedBannerUrl = firstBanner?.fileUrl || s.bannerImageUrl;
          return { ...s, bannerImageUrl: resolvedBannerUrl };
        } catch {
          return { ...s };
        }
      })
    );
  }

  useEffect(() => {
    async function fetchSponsors() {
      // Defer network request until page is ready + delay
      if (!shouldFetch) return;

      setFetchError(false);
      let rawSponsors: EventSponsorsDTO[] = [];

      try {
        // Try cache first for raw sponsor list only (so we can always re-resolve banners and show new/updated images)
        try {
          const cachedData = sessionStorage.getItem(CACHE_KEY);
          if (cachedData) {
            const { data, timestamp } = JSON.parse(cachedData);
            if (Date.now() - timestamp < CACHE_DURATION && Array.isArray(data)) {
              rawSponsors = data;
              console.log('✅ Using cached sponsors list, resolving banners from event_medias');
            }
          }
        } catch (error) {
          console.warn('Failed to read sponsors cache:', error);
        }

        if (rawSponsors.length === 0) {
          setLoading(true);
          const tenantId = getTenantId();
          const params = new URLSearchParams({
            'tenantId.equals': tenantId,
            sort: 'priorityRanking,asc',
            page: '0',
            size: '15',
            'isActive.equals': 'true'
          });
          const response = await fetch(`/api/proxy/event-sponsors?${params.toString()}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
          });
          if (!response.ok) {
            console.warn('Failed to fetch sponsors:', response.status);
            setFetchError(true);
            return;
          }
          const data = await response.json();
          const sponsorsList = Array.isArray(data) ? data : [];
          rawSponsors = sponsorsList.slice(0, 15);
          console.log('✅ Fetched sponsors for homepage:', rawSponsors.length);
          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify({ data: rawSponsors, timestamp: Date.now() }));
          } catch (error) {
            console.warn('Failed to cache sponsors data:', error);
          }
        }

        // Always resolve banners from event_medias so new/updated images (e.g. priority 1) show without waiting for cache expiry
        const sponsorsWithBanners = await resolveBannersForSponsors(rawSponsors);
        setSponsors(sponsorsWithBanners);
      } catch (error) {
        console.error('Error fetching sponsors:', error);
        setFetchError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchSponsors();
  }, [shouldFetch]);

  // Don't render anything while loading - section will appear only when fully loaded
  if (loading) {
    return null;
  }

  if (fetchError) {
    return (
      <section className="py-24 bg-green-50">
        <HomeSectionRail eyebrow="Sponsors" containerClassName="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <HomeSectionTitle className="text-3xl md:text-4xl font-bold mb-4">
              Our Sponsors
            </HomeSectionTitle>
          </div>
          <div className="text-center text-gray-500 py-8">
            <div className="homepage-glass-card services-glass-card-face bg-white rounded-lg p-8 max-w-md mx-auto">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Sponsors Information Temporarily Unavailable</h3>
              <p className="text-gray-500">We're currently updating our sponsors information. Please check back later.</p>
            </div>
          </div>
        </HomeSectionRail>
      </section>
    );
  }

  if (sponsors.length === 0) {
    return (
      <section className="py-24 bg-green-50">
        <HomeSectionRail eyebrow="Sponsors" containerClassName="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <HomeSectionTitle className="text-3xl md:text-4xl font-bold mb-4">
              Our Sponsors
            </HomeSectionTitle>
          </div>
          <div className="text-center text-gray-500 py-8">
            <div className="homepage-glass-card services-glass-card-face bg-white rounded-lg p-8 max-w-md mx-auto">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Sponsors Available</h3>
              <p className="text-gray-500">We're currently seeking sponsors for our events. Contact us to learn about sponsorship opportunities!</p>
            </div>
          </div>
        </HomeSectionRail>
      </section>
    );
  }

  return (
    <section className="py-24 bg-green-50">
      <HomeSectionRail eyebrow="Sponsors" containerClassName="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <HomeSectionTitle className="text-3xl md:text-4xl font-bold mb-4">
            Our Sponsors
          </HomeSectionTitle>
          <p className="home-section-body-text text-lg text-gray-600 max-w-2xl mx-auto">
            Grateful for the support of our amazing sponsors who make our events and community initiatives possible
          </p>
        </div>

        {/* Sponsors grid — two per row on large screens; cards stretch to equal height */}
        <div className="mb-8 grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2">
          {sponsors.map((sponsor, index) => (
            <SponsorCard
              key={sponsor.id ?? index}
              sponsor={sponsor}
              backgroundClass={getHomepageGlassCardClass()}
              bodyLayout="split"
              className="h-full min-w-0"
              onCardClick={() => sponsor.websiteUrl && window.open(sponsor.websiteUrl, '_blank')}
            />
          ))}
        </div>

        {/* View All Sponsors Button */}
        <div className="text-center">
          <Link
            href="/sponsors"
            className="hero-browse-link hero-browse-link-neon"
            title="See All Sponsors"
            aria-label="See All Sponsors"
          >
            <span>See All Sponsors</span>
            <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </HomeSectionRail>
    </section>
  );
};

export default OurSponsorsSection;

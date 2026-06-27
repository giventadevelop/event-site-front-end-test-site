'use client';



import { useCallback, useEffect, useMemo, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import { MoscGalleryTabs } from './MoscGalleryTabs';

import { MoscGalleryAlbumCardWrapper } from './MoscGalleryAlbumCardWrapper';

import { MoscGalleryEventCard } from './MoscGalleryEventCard';

import { MoscGalleryPagination } from './MoscGalleryPagination';

import {

  MoscGallerySearch,

  type MoscGalleryAlbumSearchFilters,

  type MoscGalleryEventSearchFilters,

} from './MoscGallerySearch';

import { MoscGalleryAlbumCard } from '@/components/gallery/MoscGalleryAlbumCard';

import {

  fetchAlbumsForGallery,

  fetchEventsForGallery,

  fetchGalleryAlbumFilterOptions,

  fetchGalleryEventFilterOptions,

  type GalleryAlbumFilterOptions,

  type GalleryEventFilterOptions,

  type GalleryEventWithMedia,
} from '@/app/gallery/ApiServerActions';
import type { GalleryAlbumWithMedia } from '@/types';

import {

  MOSC_STATIC_GALLERY_ALBUMS,

  type MoscStaticGalleryAlbum,

} from '@/lib/gallery/moscStaticAlbums';



const PAGE_SIZE = 18;



type TabType = 'albums' | 'events';



type MoscGalleryContentProps = {

  initialPage: number;

  initialTab: TabType;

};



const STATIC_ALBUMS_DESC = [...MOSC_STATIC_GALLERY_ALBUMS].sort((a, b) => b.albumYear - a.albumYear);



const EMPTY_ALBUM_OPTIONS: GalleryAlbumFilterOptions = {

  categories: [],

  years: [],

  locations: [],

};



const EMPTY_EVENT_OPTIONS: GalleryEventFilterOptions = {

  years: [],

  locations: [],

  eventTypes: [],

};



const EMPTY_ALBUM_FILTERS: MoscGalleryAlbumSearchFilters = { searchTerm: '' };

const EMPTY_EVENT_FILTERS: MoscGalleryEventSearchFilters = { searchTerm: '' };



function locationFromStaticDate(date: string): string | null {

  const parts = date.split(',');

  if (parts.length >= 2) {

    const last = parts[parts.length - 1].trim();

    return last || null;

  }

  return null;

}



function filterStaticAlbums(

  albums: MoscStaticGalleryAlbum[],

  filters: MoscGalleryAlbumSearchFilters,

): MoscStaticGalleryAlbum[] {

  return albums.filter((album) => {

    if (

      filters.searchTerm &&

      !album.title.toLowerCase().includes(filters.searchTerm.trim().toLowerCase())

    ) {

      return false;

    }

    if (filters.categoryName && album.category !== filters.categoryName) {

      return false;

    }

    if (filters.albumYear != null && album.albumYear !== filters.albumYear) {

      return false;

    }

    if (filters.eventLocation) {

      const loc = filters.eventLocation.toLowerCase();

      const staticLoc = locationFromStaticDate(album.date)?.toLowerCase() ?? '';

      const inDate = album.date.toLowerCase().includes(loc);

      if (!inDate && !staticLoc.includes(loc)) {

        return false;

      }

    }

    return true;

  });

}



function parseAlbumFiltersFromParams(
  searchParams: { get: (key: string) => string | null } | null,
): MoscGalleryAlbumSearchFilters {

  const searchTerm = searchParams?.get('q') ?? '';
  const categoryRaw = searchParams?.get('category');
  const yearRaw = searchParams?.get('year');
  const location = searchParams?.get('location') ?? undefined;



  let categoryId: number | undefined;

  let categoryName: string | undefined;



  if (categoryRaw) {

    const asId = parseInt(categoryRaw, 10);

    if (Number.isFinite(asId) && String(asId) === categoryRaw) {

      categoryId = asId;

    } else {

      categoryName = categoryRaw;

    }

  }



  const albumYear = yearRaw ? parseInt(yearRaw, 10) : undefined;



  return {

    searchTerm,

    categoryId,

    categoryName,

    albumYear: yearRaw && Number.isFinite(albumYear) ? albumYear : undefined,

    eventLocation: location,

  };

}



function parseEventFiltersFromParams(
  searchParams: { get: (key: string) => string | null } | null,
): MoscGalleryEventSearchFilters {

  const searchTerm = searchParams?.get('q') ?? '';

  const yearRaw = searchParams?.get('year');

  const location = searchParams?.get('location') ?? undefined;

  const eventTypeRaw = searchParams?.get('eventType');

  const year = yearRaw ? parseInt(yearRaw, 10) : undefined;

  const eventTypeId = eventTypeRaw ? parseInt(eventTypeRaw, 10) : undefined;



  return {

    searchTerm,

    year: yearRaw && Number.isFinite(year) ? year : undefined,

    location,

    eventTypeId: eventTypeRaw && Number.isFinite(eventTypeId) ? eventTypeId : undefined,

  };

}



function MoscGallerySkeleton() {

  return (

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

      {Array.from({ length: 6 }).map((_, i) => (

        <div

          key={i}

          className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse"

        >

          <div className="aspect-[4/3] bg-gray-100" />

          <div className="p-5 space-y-3">

            <div className="h-3 bg-gray-100 rounded w-1/3" />

            <div className="h-4 bg-gray-100 rounded w-4/5" />

            <div className="h-3 bg-gray-100 rounded w-1/2" />

          </div>

        </div>

      ))}

    </div>

  );

}



export function MoscGalleryContent({ initialPage, initialTab }: MoscGalleryContentProps) {

  const router = useRouter();

  const searchParams = useSearchParams();



  const [activeTab, setActiveTab] = useState<TabType>(initialTab);

  const [currentPage, setCurrentPage] = useState(initialPage);

  const [loading, setLoading] = useState(true);

  const [initialLoad, setInitialLoad] = useState(true);

  const [albumsCount, setAlbumsCount] = useState(0);

  const [eventsCount, setEventsCount] = useState(0);

  const [useApiAlbums, setUseApiAlbums] = useState(false);

  const [albumOptions, setAlbumOptions] = useState<GalleryAlbumFilterOptions>(EMPTY_ALBUM_OPTIONS);

  const [eventOptions, setEventOptions] = useState<GalleryEventFilterOptions>(EMPTY_EVENT_OPTIONS);

  const [albumFilters, setAlbumFilters] = useState<MoscGalleryAlbumSearchFilters>(() =>

    parseAlbumFiltersFromParams(searchParams),

  );

  const [eventFilters, setEventFilters] = useState<MoscGalleryEventSearchFilters>(() =>

    parseEventFiltersFromParams(searchParams),

  );

  const [albumsData, setAlbumsData] = useState<{

    albumsWithMedia: GalleryAlbumWithMedia[];

    totalAlbums: number;

    totalPages: number;

  } | null>(null);

  const [eventsData, setEventsData] = useState<{

    eventsWithMedia: GalleryEventWithMedia[];

    totalEvents: number;

    totalPages: number;

  } | null>(null);



  const staticFilterOptions = useMemo(() => {

    const categories = [...new Set(STATIC_ALBUMS_DESC.map((a) => a.category))].sort((a, b) =>

      a.localeCompare(b),

    );

    const years = [...new Set(STATIC_ALBUMS_DESC.map((a) => a.albumYear))].sort((a, b) => b - a);

    const locations = [

      ...new Set(

        STATIC_ALBUMS_DESC.map((a) => locationFromStaticDate(a.date)).filter(

          (loc): loc is string => !!loc,

        ),

      ),

    ].sort((a, b) => a.localeCompare(b));



    return { categories, years, locations };

  }, []);



  const effectiveAlbumFilters = useMemo((): MoscGalleryAlbumSearchFilters => {

    if (useApiAlbums) return albumFilters;

    if (albumFilters.categoryId != null && !albumFilters.categoryName) {

      const name = albumOptions.categories.find((c) => c.id === albumFilters.categoryId)?.displayName;

      if (name) return { ...albumFilters, categoryName: name, categoryId: undefined };

    }

    return albumFilters;

  }, [albumFilters, useApiAlbums, albumOptions.categories]);



  const filteredStaticAlbums = useMemo(

    () => filterStaticAlbums(STATIC_ALBUMS_DESC, effectiveAlbumFilters),

    [effectiveAlbumFilters],

  );



  const updateUrl = useCallback(

    (

      tab: TabType,

      page: number,

      nextAlbumFilters?: MoscGalleryAlbumSearchFilters,

      nextEventFilters?: MoscGalleryEventSearchFilters,

    ) => {

      const params = new URLSearchParams();



      if (tab === 'events') {

        params.set('tab', 'events');

      }



      if (page > 0) {

        params.set('page', String(page + 1));

      }



      const album = nextAlbumFilters ?? albumFilters;

      const events = nextEventFilters ?? eventFilters;



      if (tab === 'albums') {

        if (album.searchTerm.trim()) params.set('q', album.searchTerm.trim());

        if (album.categoryId != null) {

          params.set('category', String(album.categoryId));

        } else if (album.categoryName) {

          params.set('category', album.categoryName);

        }

        if (album.albumYear != null) params.set('year', String(album.albumYear));

        if (album.eventLocation) params.set('location', album.eventLocation);

      } else {

        if (events.searchTerm.trim()) params.set('q', events.searchTerm.trim());

        if (events.year != null) params.set('year', String(events.year));

        if (events.location) params.set('location', events.location);

        if (events.eventTypeId != null) params.set('eventType', String(events.eventTypeId));

      }



      const qs = params.toString();

      router.replace(qs ? `/mosc-redesign/gallery?${qs}` : '/mosc-redesign/gallery', {

        scroll: false,

      });

    },

    [router, albumFilters, eventFilters],

  );



  useEffect(() => {

    const tabParam = searchParams?.get('tab');

    const pageParam = parseInt(searchParams?.get('page') ?? '1', 10);

    const tab: TabType = tabParam === 'events' ? 'events' : 'albums';

    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam - 1 : 0;



    setActiveTab(tab);

    setCurrentPage(page);

    if (tab === 'albums') {

      setAlbumFilters(parseAlbumFiltersFromParams(searchParams));

    } else {

      setEventFilters(parseEventFiltersFromParams(searchParams));

    }

  }, [searchParams]);



  useEffect(() => {

    let cancelled = false;



    async function loadFilterOptions() {

      try {

        const [albumOpts, eventOpts] = await Promise.all([

          fetchGalleryAlbumFilterOptions(),

          fetchGalleryEventFilterOptions(),

        ]);

        if (!cancelled) {

          setAlbumOptions(albumOpts);

          setEventOptions(eventOpts);

        }

      } catch (error) {

        console.error('[MoscGalleryContent] filter options failed:', error);

      }

    }



    loadFilterOptions();

    return () => {

      cancelled = true;

    };

  }, []);



  useEffect(() => {

    let cancelled = false;



    async function loadTabData() {

      setLoading(true);

      try {

        if (activeTab === 'albums') {

          const probe = await fetchAlbumsForGallery(0, 1);

          if (cancelled) return;



          const hasApiAlbums = probe.totalAlbums > 0;

          setUseApiAlbums(hasApiAlbums);



          if (hasApiAlbums) {

            const categoryId =

              albumFilters.categoryId ??

              (albumFilters.categoryName

                ? albumOptions.categories.find(

                    (c) => c.displayName === albumFilters.categoryName,

                  )?.id

                : undefined);



            const data = await fetchAlbumsForGallery(

              currentPage,

              PAGE_SIZE,

              albumFilters.searchTerm,

              undefined,

              undefined,

              {

                categoryId,

                albumYear: albumFilters.albumYear,

                eventLocation: albumFilters.eventLocation,

              },

            );

            if (!cancelled) {

              setAlbumsData(data);

              setAlbumsCount(data.totalAlbums);

            }

          } else if (!cancelled) {

            const staticTotal = filteredStaticAlbums.length;

            setAlbumsData({

              albumsWithMedia: [],

              totalAlbums: staticTotal,

              totalPages: Math.ceil(staticTotal / PAGE_SIZE) || 1,

            });

            setAlbumsCount(staticTotal);

          }

        } else {

          const data = await fetchEventsForGallery(

            currentPage,

            PAGE_SIZE,

            eventFilters.searchTerm,

            undefined,

            undefined,

            {

              year: eventFilters.year,

              location: eventFilters.location,

              eventTypeId: eventFilters.eventTypeId,

            },

          );

          if (!cancelled) {

            setEventsData(data);

            setEventsCount(data.totalEvents);

          }

        }

      } catch (error) {

        console.error('[MoscGalleryContent] load failed:', error);

      } finally {

        if (!cancelled) setLoading(false);

      }

    }



    loadTabData();

    return () => {

      cancelled = true;

    };

  }, [activeTab, currentPage, albumFilters, eventFilters, albumOptions.categories]);



  useEffect(() => {

    let cancelled = false;



    async function loadCounts() {

      try {

        const [albumsProbe, eventsProbe] = await Promise.all([

          fetchAlbumsForGallery(0, 1),

          fetchEventsForGallery(0, 1),

        ]);

        if (cancelled) return;



        const hasApiAlbums = albumsProbe.totalAlbums > 0;

        setAlbumsCount(hasApiAlbums ? albumsProbe.totalAlbums : STATIC_ALBUMS_DESC.length);

        setEventsCount(eventsProbe.totalEvents);



        if (!initialLoad) return;

        setInitialLoad(false);



        const albumsAvailable = hasApiAlbums || STATIC_ALBUMS_DESC.length > 0;

        if (activeTab === 'albums' && !albumsAvailable && eventsProbe.totalEvents > 0) {

          setActiveTab('events');

          setCurrentPage(0);

          setEventFilters(EMPTY_EVENT_FILTERS);

          updateUrl('events', 0, undefined, EMPTY_EVENT_FILTERS);

        } else if (activeTab === 'events' && eventsProbe.totalEvents === 0 && albumsAvailable) {

          setActiveTab('albums');

          setCurrentPage(0);

          setAlbumFilters(EMPTY_ALBUM_FILTERS);

          updateUrl('albums', 0, EMPTY_ALBUM_FILTERS);

        }

      } catch (error) {

        console.error('[MoscGalleryContent] count probe failed:', error);

      }

    }



    loadCounts();

    return () => {

      cancelled = true;

    };

  }, [activeTab, initialLoad, updateUrl]);



  const handleTabChange = (tab: TabType) => {

    setActiveTab(tab);

    setCurrentPage(0);

    if (tab === 'albums') {

      setAlbumFilters(EMPTY_ALBUM_FILTERS);

      updateUrl('albums', 0, EMPTY_ALBUM_FILTERS);

    } else {

      setEventFilters(EMPTY_EVENT_FILTERS);

      updateUrl('events', 0, undefined, EMPTY_EVENT_FILTERS);

    }

  };



  const handleAlbumSearch = (filters: MoscGalleryAlbumSearchFilters) => {

    setAlbumFilters(filters);

    setCurrentPage(0);

    updateUrl('albums', 0, filters);

  };



  const handleEventSearch = (filters: MoscGalleryEventSearchFilters) => {

    setEventFilters(filters);

    setCurrentPage(0);

    updateUrl('events', 0, undefined, filters);

  };



  const staticSlice = useMemo(

    () =>

      filteredStaticAlbums.slice(

        currentPage * PAGE_SIZE,

        (currentPage + 1) * PAGE_SIZE,

      ),

    [currentPage, filteredStaticAlbums],

  );



  const albumsTotalPages = useApiAlbums

    ? albumsData?.totalPages ?? 1

    : Math.ceil(filteredStaticAlbums.length / PAGE_SIZE) || 1;

  const albumsTotalCount = useApiAlbums

    ? albumsData?.totalAlbums ?? 0

    : filteredStaticAlbums.length;



  const eventsTotalPages = eventsData?.totalPages ?? 1;

  const eventsTotalCount = eventsData?.totalEvents ?? 0;



  const paginationProps =

    activeTab === 'albums'

      ? {

          currentPage,

          totalPages: albumsTotalPages,

          totalCount: albumsTotalCount,

          pageSize: PAGE_SIZE,

          tab: 'albums' as const,

          itemLabel: 'albums' as const,

        }

      : {

          currentPage,

          totalPages: eventsTotalPages,

          totalCount: eventsTotalCount,

          pageSize: PAGE_SIZE,

          tab: 'events' as const,

          itemLabel: 'events' as const,

        };



  const sectionTitle =

    activeTab === 'albums' ? 'Browse Albums' : 'Browse Event Galleries';



  return (

    <div className="bg-white rounded-xl border border-syro-table-border shadow-sm p-6 sm:p-8">

      <MoscGalleryTabs

        activeTab={activeTab}

        onTabChange={handleTabChange}

        albumsCount={albumsCount}

        eventsCount={eventsCount}

        loading={loading && initialLoad}

      />



      <MoscGallerySearch

        activeTab={activeTab}

        loading={loading}

        albumOptions={albumOptions}

        eventOptions={eventOptions}

        staticCategoryNames={staticFilterOptions.categories}

        staticYears={staticFilterOptions.years}

        staticLocations={staticFilterOptions.locations}

        preferStaticAlbumOptions={!useApiAlbums}

        initialAlbumFilters={albumFilters}

        initialEventFilters={eventFilters}

        onAlbumSearch={handleAlbumSearch}

        onEventSearch={handleEventSearch}

      />



      <div className="pt-2">

        <h3 className="text-2xl font-light text-[#798daf] mb-8 pl-8 border-l-[7px] border-syro-red">

          {sectionTitle}

        </h3>



        {loading ? (

          <MoscGallerySkeleton />

        ) : activeTab === 'albums' ? (

          <>

            {useApiAlbums && albumsData && albumsData.albumsWithMedia.length > 0 ? (

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

                {albumsData.albumsWithMedia.map((item, index) => (

                  <MoscGalleryAlbumCardWrapper

                    key={item.album.id ?? index}

                    albumWithMedia={item}

                    gradientIndex={index}

                  />

                ))}

              </div>

            ) : !useApiAlbums && staticSlice.length > 0 ? (

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

                {staticSlice.map((album, index) => (

                  <MoscGalleryAlbumCard

                    key={album.id}

                    title={album.title}

                    coverImageUrl={album.imageUrl}

                    totalMediaCount={album.photoCount}

                    categoryDisplayName={album.category}

                    albumYear={album.albumYear}

                    eventDateDisplay={album.date}

                    href={`/mosc-redesign/gallery/${album.id}`}

                    variant="mosc-redesign"

                    gradientIndex={index}

                  />

                ))}

              </div>

            ) : (

              <div className="inline-flex items-center gap-2 px-4 py-3 bg-orange-50 border-2 border-orange-200 rounded-lg mb-8">

                <span className="text-sm font-medium text-orange-700">No albums match your search</span>

              </div>

            )}



            {paginationProps.totalPages > 1 && (

              <MoscGalleryPagination

                {...paginationProps}

                onPageChange={(page) => {

                  setCurrentPage(page);

                  updateUrl('albums', page);

                }}

              />

            )}

          </>

        ) : (

          <>

            {eventsData && eventsData.eventsWithMedia.length > 0 ? (

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

                {eventsData.eventsWithMedia.map((item, index) => (

                  <MoscGalleryEventCard

                    key={item.event.id ?? index}

                    eventWithMedia={item}

                    gradientIndex={index}

                  />

                ))}

              </div>

            ) : (

              <div className="inline-flex items-center gap-2 px-4 py-3 bg-orange-50 border-2 border-orange-200 rounded-lg mb-8">

                <span className="text-sm font-medium text-orange-700">No event galleries match your search</span>

              </div>

            )}



            {paginationProps.totalPages > 1 && (

              <MoscGalleryPagination

                {...paginationProps}

                onPageChange={(page) => {

                  setCurrentPage(page);

                  updateUrl('events', page);

                }}

              />

            )}

          </>

        )}

      </div>

    </div>

  );

}


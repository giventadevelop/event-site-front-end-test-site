import { fetchAlbumsServer, fetchGalleryCategoriesForAdminServer } from './ApiServerActions';
import AdminAlbumListClient from './AdminAlbumListClient';
import AdminNavigation from '@/components/AdminNavigation';
import Link from 'next/link';

export default async function AdminAlbumsPage({
  searchParams,
}: {
  searchParams?:
    | Promise<{ [key: string]: string | string[] | undefined }>
    | { [key: string]: string | string[] | undefined };
}) {
  const resolvedSearchParams =
    searchParams && typeof (searchParams as Promise<unknown>).then === 'function'
      ? await searchParams
      : searchParams;
  // Initial SSR load; client re-fetches with full filters (search field, visibility, sort).
  const page = typeof resolvedSearchParams?.page === 'string' ? parseInt(resolvedSearchParams.page, 10) : 0;
  const searchTerm = typeof resolvedSearchParams?.search === 'string' ? resolvedSearchParams.search : '';

  const { albums, totalCount } = await fetchAlbumsServer(page, 12, searchTerm || undefined);
  const categories = await fetchGalleryCategoriesForAdminServer();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16" style={{ paddingTop: '180px', paddingBottom: '48px' }}>
        {/* Header with back button */}
        <div className="max-w-5xl mx-auto flex items-center gap-2 sm:gap-3 md:gap-4 mb-8 px-2.5 sm:px-3 md:px-4 lg:px-6 xl:px-8">
          <Link
            href="/admin"
            className="flex-shrink-0 h-14 rounded-xl bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
            title="Back to Admin"
            aria-label="Back to Admin"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
            <span className="font-semibold text-indigo-700">Back to Admin</span>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-gray-900">Gallery Albums</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage gallery albums and their associated media files
            </p>
          </div>
        </div>

        <div className="mb-8">
          <AdminNavigation currentPage="gallery-albums" />
        </div>
        <AdminAlbumListClient
          initialAlbums={albums}
          initialTotalCount={totalCount}
          initialPage={page}
          initialSearchTerm={searchTerm}
          categories={categories}
        />
      </div>
    </div>
  );
}


import { fetchAlbumsServer, fetchGalleryCategoriesForAdminServer } from './ApiServerActions';
import AdminAlbumListClient from './AdminAlbumListClient';
import AdminNavigation from '@/components/AdminNavigation';

export default async function AdminAlbumsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const page = typeof searchParams?.page === 'string' ? parseInt(searchParams.page, 10) : 0;
  const searchTerm = typeof searchParams?.search === 'string' ? searchParams.search : '';

  const { albums, totalCount } = await fetchAlbumsServer(page, 12, searchTerm);
  const categories = await fetchGalleryCategoriesForAdminServer();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16" style={{ paddingTop: '180px', paddingBottom: '48px' }}>
        <AdminNavigation currentPage="gallery-albums" />
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


import { fetchAlbumServer, fetchGalleryCategoriesForAdminServer } from '../../ApiServerActions';
import AdminAlbumEditClient from './AdminAlbumEditClient';
import AdminNavigation from '@/components/AdminNavigation';
import { notFound } from 'next/navigation';

export default async function AdminAlbumEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = typeof params.then === 'function' ? await params : params;
  const albumId = parseInt(resolvedParams.id, 10);

  if (isNaN(albumId)) {
    notFound();
  }

  const album = await fetchAlbumServer(albumId);

  if (!album) {
    notFound();
  }

  const categories = await fetchGalleryCategoriesForAdminServer();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16" style={{ paddingTop: '180px', paddingBottom: '48px' }}>
        <AdminNavigation currentPage="gallery-albums" />
        <AdminAlbumEditClient initialAlbum={album} categories={categories} />
      </div>
    </div>
  );
}


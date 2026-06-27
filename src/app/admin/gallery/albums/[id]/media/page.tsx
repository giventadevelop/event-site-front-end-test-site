import { fetchAlbumServer, fetchAlbumMediaServer } from '../../ApiServerActions';
import { fetchUserProfileServer } from '@/app/admin/events/[id]/media/ApiServerActions';
import { safeAuth } from '@/lib/safe-auth';
import AdminNavigation from '@/components/AdminNavigation';
import AlbumMediaClientPage from './AlbumMediaClientPage';
import { notFound } from 'next/navigation';

export default async function AlbumMediaPage({
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

  const { media, totalCount } = await fetchAlbumMediaServer(albumId, 0, 100);

  const { userId } = await safeAuth();
  let userProfileId = null;
  if (userId) {
    try {
      const profile = await fetchUserProfileServer(userId);
      userProfileId = profile?.id ?? null;
    } catch {
      userProfileId = null;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 xl:px-16" style={{ paddingTop: '180px', paddingBottom: '48px' }}>
        <AdminNavigation currentPage="gallery-albums" />
        <AlbumMediaClientPage
          albumId={albumId}
          album={album}
          initialMediaList={media}
          userProfileId={userProfileId}
        />
      </div>
    </div>
  );
}


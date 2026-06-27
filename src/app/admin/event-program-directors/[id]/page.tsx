import { notFound, redirect } from 'next/navigation';
import { safeAuth } from '@/lib/safe-auth';
import { fetchEventProgramDirectorServer, fetchDirectorMediaServer } from '../ApiServerActions';
import DirectorEditClient from './DirectorEditClient';

interface DirectorEditPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}

export default async function DirectorEditPage({ params, searchParams }: DirectorEditPageProps) {
  const { userId } = await safeAuth();
  if (!userId) {
    redirect('/sign-in');
  }

  const { id } = await params;
  const sp = await searchParams;

  const directorId = parseInt(id, 10);
  if (isNaN(directorId)) {
    notFound();
  }

  // Fetch director data
  let director;
  try {
    director = await fetchEventProgramDirectorServer(directorId);
  } catch (error) {
    console.error('Failed to fetch director:', error);
    notFound();
  }

  // Fetch media files (server-side, but we'll paginate on client)
  const mediaList = await fetchDirectorMediaServer(directorId).catch(() => []);

  // Pagination parameters
  const page = Math.max(0, parseInt(sp.page || '0', 10));
  const pageSize = parseInt(sp.pageSize || '10', 10);

  // Calculate pagination
  const totalCount = mediaList.length;
  const startIndex = page * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedMedia = mediaList.slice(startIndex, endIndex);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <DirectorEditClient
      director={director}
      initialMediaList={paginatedMedia}
      totalMediaCount={totalCount}
      currentPage={page}
      pageSize={pageSize}
      totalPages={totalPages}
    />
  );
}


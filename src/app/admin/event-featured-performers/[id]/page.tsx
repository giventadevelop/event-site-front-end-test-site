import { notFound, redirect } from 'next/navigation';
import { safeAuth } from '@/lib/safe-auth';
import { fetchEventFeaturedPerformerServer, fetchPerformerMediaServer } from '../ApiServerActions';
import PerformerEditClient from './PerformerEditClient';

interface PerformerEditPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}

export default async function PerformerEditPage({ params, searchParams }: PerformerEditPageProps) {
  const { userId } = await safeAuth();
  if (!userId) {
    redirect('/sign-in');
  }

  const { id } = await params;
  const sp = await searchParams;

  const performerId = parseInt(id, 10);
  if (isNaN(performerId)) {
    notFound();
  }

  // Fetch performer data
  let performer;
  try {
    performer = await fetchEventFeaturedPerformerServer(performerId);
  } catch (error) {
    console.error('Failed to fetch performer:', error);
    notFound();
  }

  // Fetch media files (server-side, but we'll paginate on client)
  const mediaList = await fetchPerformerMediaServer(performerId).catch(() => []);

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
    <PerformerEditClient
      performer={performer}
      initialMediaList={paginatedMedia}
      totalMediaCount={totalCount}
      currentPage={page}
      pageSize={pageSize}
      totalPages={totalPages}
    />
  );
}


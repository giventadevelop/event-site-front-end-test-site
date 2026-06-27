import { notFound, redirect } from 'next/navigation';
import { safeAuth } from '@/lib/safe-auth';
import { fetchEventSponsorServer, fetchSponsorMediaServer } from '../ApiServerActions';
import SponsorEditClient from './SponsorEditClient';

interface SponsorEditPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}

export default async function SponsorEditPage({ params, searchParams }: SponsorEditPageProps) {
  const { userId } = await safeAuth();
  if (!userId) {
    redirect('/sign-in');
  }

  const { id } = await params;
  const sp = await searchParams;

  const sponsorId = parseInt(id, 10);
  if (isNaN(sponsorId)) {
    notFound();
  }

  // Fetch sponsor data
  let sponsor;
  try {
    sponsor = await fetchEventSponsorServer(sponsorId);
  } catch (error) {
    console.error('Failed to fetch sponsor:', error);
    notFound();
  }

  // Fetch media files (server-side, but we'll paginate on client)
  const mediaList = await fetchSponsorMediaServer(sponsorId).catch(() => []);

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
    <SponsorEditClient
      sponsor={sponsor}
      initialMediaList={paginatedMedia}
      totalMediaCount={totalCount}
      currentPage={page}
      pageSize={pageSize}
      totalPages={totalPages}
    />
  );
}


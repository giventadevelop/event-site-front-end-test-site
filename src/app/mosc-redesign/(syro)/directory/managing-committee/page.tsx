import { redirect } from 'next/navigation';
import { redirectQsFromSearchParams } from '../../lib/cmsListUrl';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<{ page?: string; q?: string }>;
};

/** Canonical list hub is /mosc-redesign/managing-committee-cms. */
export default async function ManagingCommitteeDirectoryRedirect({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = redirectQsFromSearchParams(params);
  redirect(
    query ? `/mosc-redesign/managing-committee-cms?${query}` : '/mosc-redesign/managing-committee-cms'
  );
}

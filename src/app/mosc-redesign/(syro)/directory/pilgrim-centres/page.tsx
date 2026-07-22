import { redirect } from 'next/navigation';
import { redirectQsFromSearchParams } from '../../lib/cmsListUrl';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<{ page?: string; q?: string }>;
};

/** Canonical list hub is /mosc-redesign/pilgrim-centres-cms. */
export default async function PilgrimCentresDirectoryRedirect({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = redirectQsFromSearchParams(params);
  redirect(
    query ? `/mosc-redesign/pilgrim-centres-cms?${query}` : '/mosc-redesign/pilgrim-centres-cms'
  );
}

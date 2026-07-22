import { redirect } from 'next/navigation';
import { redirectQsFromSearchParams } from '../../lib/cmsListUrl';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<{ page?: string; q?: string; diocese?: string }>;
};

/** Canonical list hub is /mosc-redesign/parishes-cms. */
export default async function ParishesDirectoryRedirect({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = redirectQsFromSearchParams(params);
  redirect(query ? `/mosc-redesign/parishes-cms?${query}` : '/mosc-redesign/parishes-cms');
}

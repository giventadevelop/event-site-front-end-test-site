import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<{ page?: string; q?: string }>;
};

/** Directory institutions list redirects to Institutions CMS (canonical searchable hub). */
export default async function InstitutionsDirectoryRedirect({ searchParams }: PageProps) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params.q?.trim()) qs.set('q', params.q.trim());
  if (params.page && params.page !== '1') qs.set('page', params.page);
  const query = qs.toString();
  redirect(query ? `/mosc-redesign/institutions-cms?${query}` : '/mosc-redesign/institutions-cms');
}

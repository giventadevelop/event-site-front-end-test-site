import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<{ page?: string; q?: string }>;
};

/** Directory seminaries list redirects to Theological Seminaries CMS. */
export default async function SeminariesDirectoryRedirect({ searchParams }: PageProps) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params.q?.trim()) qs.set('q', params.q.trim());
  if (params.page && params.page !== '1') qs.set('page', params.page);
  const query = qs.toString();
  redirect(
    query
      ? `/mosc-redesign/theological-seminaries-cms?${query}`
      : '/mosc-redesign/theological-seminaries-cms'
  );
}

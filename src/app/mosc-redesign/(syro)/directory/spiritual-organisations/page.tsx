import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<{ page?: string; q?: string }>;
};

/** Directory spiritual-organisations list redirects to Spiritual Organizations CMS. */
export default async function SpiritualOrganisationsDirectoryRedirect({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params.q?.trim()) qs.set('q', params.q.trim());
  if (params.page && params.page !== '1') qs.set('page', params.page);
  const query = qs.toString();
  redirect(
    query
      ? `/mosc-redesign/spiritual-organizations-cms?${query}`
      : '/mosc-redesign/spiritual-organizations-cms'
  );
}

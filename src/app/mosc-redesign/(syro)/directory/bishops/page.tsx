import { redirect } from 'next/navigation';

/**
 * Directory Bishops list is merged into Holy Synod CMS.
 * Preserves search/category/page query params where possible.
 * - type=diocesan → type=metropolitan
 * - type=retired → type=retired (directory bishops API on Holy Synod tab)
 */
export default async function BishopsRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const qs = new URLSearchParams();

  const type = params.type;
  if (type === 'catholicos') {
    qs.set('type', 'catholicos');
  } else if (type === 'diocesan' || type === 'metropolitan') {
    qs.set('type', 'metropolitan');
  } else if (type === 'retired') {
    qs.set('type', 'retired');
  }

  if (params.q?.trim()) qs.set('q', params.q.trim());
  if (params.page && params.page !== '1') qs.set('page', params.page);

  const query = qs.toString();
  redirect(query ? `/mosc-redesign/holy-synod-cms?${query}` : '/mosc-redesign/holy-synod-cms');
}

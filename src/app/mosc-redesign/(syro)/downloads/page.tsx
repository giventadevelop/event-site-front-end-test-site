import DownloadsPageClient from './DownloadsPageClient';
import {
  fetchPublicOfficialDocumentsTreeServer,
} from './ApiServerActions';

export const dynamic = 'force-dynamic';

export default async function DownloadsPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}) {
  const rawSearchParams =
    props.searchParams && typeof (props.searchParams as Promise<Record<string, string | string[] | undefined>>).then === 'function'
      ? await (props.searchParams as Promise<Record<string, string | string[] | undefined>>)
      : (props.searchParams as Record<string, string | string[] | undefined> | undefined);
  const pageValue = Array.isArray(rawSearchParams?.page) ? rawSearchParams?.page[0] : rawSearchParams?.page;
  const categoryIdValue = Array.isArray(rawSearchParams?.categoryId)
    ? rawSearchParams?.categoryId[0]
    : rawSearchParams?.categoryId;
  const yearValue = Array.isArray(rawSearchParams?.year) ? rawSearchParams?.year[0] : rawSearchParams?.year;
  const searchValue = Array.isArray(rawSearchParams?.q) ? rawSearchParams?.q[0] : rawSearchParams?.q;
  const page = Math.max(0, Number(pageValue || 1) - 1);
  const categoryId = Number(categoryIdValue || 0);
  const year = Number(yearValue || 0);
  const search = typeof searchValue === 'string' ? searchValue.trim() : '';

  let officialTreePage = {
    content: [] as any[],
    totalElements: 0,
    totalPages: 0,
    page: 0,
    size: 24,
    categoryOptions: [] as any[],
    yearOptions: [] as number[],
    allYearOptions: [] as number[],
  };

  try {
    officialTreePage = await fetchPublicOfficialDocumentsTreeServer({
      page,
      size: 24,
      categoryId: Number.isFinite(categoryId) && categoryId > 0 ? categoryId : undefined,
      year: Number.isFinite(year) && year > 0 ? year : undefined,
      search: search || undefined,
    });
  } catch {
    // keep defaults
  }

  return (
    <DownloadsPageClient
      officialTreePage={officialTreePage}
      currentFilters={{
        page: officialTreePage.page + 1,
        categoryId: Number.isFinite(categoryId) && categoryId > 0 ? categoryId : null,
        year: Number.isFinite(year) && year > 0 ? year : null,
        search,
      }}
    />
  );
}

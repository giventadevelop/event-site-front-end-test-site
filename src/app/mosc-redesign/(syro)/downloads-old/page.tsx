import DownloadsOldPageClient, { type DownloadCard } from './DownloadsOldPageClient';
import { downloadsOldStaticItems } from './downloadsOldStaticItems';
import {
  fetchPublicOfficialDocumentsForDownloadsServer,
  fetchPublicOfficialDocumentsTreeServer,
} from './ApiServerActions';
import type { EventMediaDTO } from '@/types';

function mapOfficialDocsToCards(docs: EventMediaDTO[]): DownloadCard[] {
  return docs.map((d) => {
    const link = (d.preSignedUrl || d.fileUrl || '').trim();
    const hasLink = link.length > 0;
    return {
      title: d.title,
      link: hasLink ? link : '#',
      isPlaceholder: !hasLink,
    };
  });
}

export default async function DownloadsOldPage(props: {
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
  const page = Math.max(0, Number(pageValue || 1) - 1);
  const categoryId = Number(categoryIdValue || 0);
  const year = Number(yearValue || 0);

  const staticCards: DownloadCard[] = downloadsOldStaticItems.map((item) => ({
    title: item.title,
    link: item.link,
    image: item.image,
    isPlaceholder: item.link === '#',
  }));

  const dataDriven =
    globalThis.process?.env?.NEXT_PUBLIC_MOSC_DOWNLOADS_DATA_DRIVEN === 'true' ||
    globalThis.process?.env?.AMPLIFY_NEXT_PUBLIC_MOSC_DOWNLOADS_DATA_DRIVEN === 'true';

  let officialLibraryCards: DownloadCard[] = [];
  let officialTreePage = {
    content: [],
    totalElements: 0,
    totalPages: 0,
    page: 0,
    size: 24,
    categoryOptions: [],
  };
  if (dataDriven) {
    try {
      const docs = await fetchPublicOfficialDocumentsForDownloadsServer();
      officialLibraryCards = mapOfficialDocsToCards(docs);
      officialTreePage = await fetchPublicOfficialDocumentsTreeServer({
        page,
        size: 24,
        categoryId: Number.isFinite(categoryId) && categoryId > 0 ? categoryId : undefined,
        year: Number.isFinite(year) && year > 0 ? year : undefined,
      });
    } catch {
      officialLibraryCards = [];
    }
  }

  return (
    <DownloadsOldPageClient
      staticCards={staticCards}
      officialLibraryCards={officialLibraryCards}
      officialTreePage={officialTreePage}
      currentFilters={{
        page: officialTreePage.page + 1,
        categoryId: Number.isFinite(categoryId) && categoryId > 0 ? categoryId : null,
        year: Number.isFinite(year) && year > 0 ? year : null,
      }}
    />
  );
}

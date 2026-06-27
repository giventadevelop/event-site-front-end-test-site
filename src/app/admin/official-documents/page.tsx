import OfficialDocumentsClient from './OfficialDocumentsClient';
import {
  fetchOfficialDocumentCategoriesServer,
  fetchOfficialDocumentYearBundlesServer,
  fetchTenantOfficialDocumentsPagedServer,
} from './ApiServerActions';

export const dynamic = 'force-dynamic';

const LIST_PAGE_SIZE = 20;

export default async function OfficialDocumentsPage() {
  const [categoryResult, docsPage, initialBundles] = await Promise.all([
    fetchOfficialDocumentCategoriesServer(),
    fetchTenantOfficialDocumentsPagedServer({ page: 0, size: LIST_PAGE_SIZE }),
    fetchOfficialDocumentYearBundlesServer(),
  ]);

  return (
    <OfficialDocumentsClient
      initialCategories={categoryResult.categories}
      categorySource={categoryResult.source}
      categoryMessage={categoryResult.message}
      initialDocuments={docsPage.content}
      initialTotalElements={docsPage.totalElements}
      initialTotalPages={docsPage.totalPages}
      initialPage={docsPage.page}
      listPageSize={docsPage.size}
      initialBundles={initialBundles}
    />
  );
}

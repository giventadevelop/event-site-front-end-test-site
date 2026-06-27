import { getTenantId } from '@/lib/env';
import {
  fetchOfficialDocumentCategoriesPagedServer,
  fetchOfficialDocumentCategoriesServer,
} from '../official-documents/ApiServerActions';
import OfficialDocumentCategoriesClient from './OfficialDocumentCategoriesClient';

export const dynamic = 'force-dynamic';

const LIST_PAGE_SIZE = 20;

export default async function OfficialDocumentCategoriesPage() {
  const paged = await fetchOfficialDocumentCategoriesPagedServer({
    page: 0,
    size: LIST_PAGE_SIZE,
    activeOnly: false,
  });
  const fb = await fetchOfficialDocumentCategoriesServer();

  let tenantLabel = '';
  try {
    tenantLabel = getTenantId();
  } catch {
    tenantLabel = '(NEXT_PUBLIC_TENANT_ID not set)';
  }

  if (paged.ok) {
    return (
      <OfficialDocumentCategoriesClient
        mode="api"
        initialData={paged.data}
        listPageSize={LIST_PAGE_SIZE}
        tenantLabel={tenantLabel}
      />
    );
  }

  const apiError =
    paged.reason === 'error' && paged.message
      ? `Paged categories API error: ${paged.message}`
      : paged.reason === 'not_found'
        ? 'GET /api/official-document-categories is not available (404). CRUD is disabled; showing read-only data below when fallback is enabled.'
        : undefined;

  return (
    <OfficialDocumentCategoriesClient
      mode="fallback"
      categories={fb.categories}
      message={fb.message}
      source={fb.source}
      apiError={apiError}
      tenantLabel={tenantLabel}
    />
  );
}

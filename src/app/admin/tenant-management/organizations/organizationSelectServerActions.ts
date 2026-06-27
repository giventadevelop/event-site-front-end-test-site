'use server';

import { fetchTenantOrganizations } from '@/app/admin/tenant-management/organizations/ApiServerActions';
import type { TenantOrganizationDTO } from '@/app/admin/tenant-management/types';

const TENANT_ORG_SELECT_LIMIT = 20;

/** Latest organizations for settings create / typeahead (newest first). */
export async function fetchRecentTenantOrganizationsForSelectServer(): Promise<TenantOrganizationDTO[]> {
  try {
    const result = await fetchTenantOrganizations(
      { page: 0, pageSize: TENANT_ORG_SELECT_LIMIT },
      { sortBy: 'createdAt', sortOrder: 'desc' },
    );
    return result.data;
  } catch (error) {
    console.error('[fetchRecentTenantOrganizationsForSelectServer] Failed:', error);
    return [];
  }
}

/** Typeahead search — organization name contains query, max 20, newest first. */
export async function searchTenantOrganizationsForSelectServer(
  query: string,
): Promise<TenantOrganizationDTO[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return fetchRecentTenantOrganizationsForSelectServer();
  }

  try {
    const result = await fetchTenantOrganizations(
      { page: 0, pageSize: TENANT_ORG_SELECT_LIMIT },
      { search: trimmed, sortBy: 'createdAt', sortOrder: 'desc' },
    );
    return result.data;
  } catch (error) {
    console.error('[searchTenantOrganizationsForSelectServer] Failed:', error);
    return [];
  }
}

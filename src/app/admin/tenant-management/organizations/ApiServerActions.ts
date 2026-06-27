import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { withTenantId } from '@/lib/withTenantId';
import { getApiBaseUrl } from '@/lib/env';
import type {
  TenantOrganizationDTO,
  TenantOrganizationFormDTO,
  TenantOrganizationFilters,
  PaginationParams,
  PaginatedResponse
} from '@/app/admin/tenant-management/types';

// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}

/**
 * Fetch paginated list of tenant organizations
 */
export async function fetchTenantOrganizations(
  pagination: PaginationParams,
  filters: TenantOrganizationFilters = {}
): Promise<PaginatedResponse<TenantOrganizationDTO>> {
  try {
    const params = new URLSearchParams();

    // Add pagination parameters
    params.append('page', pagination.page.toString());
    params.append('size', pagination.pageSize.toString());

    // Add filters
    if (filters.search) {
      params.append('organizationName.contains', filters.search);
    }
    if (filters.subscriptionStatus) {
      params.append('subscriptionStatus.equals', filters.subscriptionStatus);
    }
    if (filters.isActive !== undefined) {
      params.append('isActive.equals', filters.isActive.toString());
    }

    // Add sorting
    if (filters.sortBy) {
      const sortDirection = filters.sortOrder || 'asc';
      params.append('sort', `${filters.sortBy},${sortDirection}`);
    }

    const response = await fetchWithJwtRetry(
      `${getApiBase()}/api/tenant-organizations?${params.toString()}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch tenant organizations: ${response.statusText}`);
    }

    const data = await response.json();
    const totalCount = parseInt(response.headers.get('x-total-count') || '0');

    return {
      data: Array.isArray(data) ? data : [],
      totalCount,
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalPages: Math.ceil(totalCount / pagination.pageSize)
    };
  } catch (error) {
    console.error('Error fetching tenant organizations:', error);
    throw new Error('Failed to fetch tenant organizations');
  }
}

/**
 * Fetch a single tenant organization by ID
 */
export async function fetchTenantOrganization(id: number): Promise<TenantOrganizationDTO | null> {
  try {
    const response = await fetchWithJwtRetry(
      `${getApiBase()}/api/tenant-organizations/${id}`,
      { cache: 'no-store' }
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch tenant organization: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching tenant organization:', error);
    throw new Error('Failed to fetch tenant organization');
  }
}

/**
 * Create a new tenant organization
 */
export async function createTenantOrganization(data: TenantOrganizationFormDTO): Promise<TenantOrganizationDTO> {
  try {
    const payload = withTenantId({
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const response = await fetchWithJwtRetry(`${getApiBase()}/api/tenant-organizations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create tenant organization: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating tenant organization:', error);
    throw new Error('Failed to create tenant organization');
  }
}

/**
 * Update an existing tenant organization
 */
export async function updateTenantOrganization(
  id: number,
  data: Partial<TenantOrganizationFormDTO>
): Promise<TenantOrganizationDTO> {
  try {
    // First fetch the existing tenant organization to get the original createdAt
    const existingOrganization = await fetchTenantOrganization(id);

    const payload = withTenantId({
      ...data,
      id,
      createdAt: existingOrganization.createdAt, // Preserve original createdAt
      updatedAt: new Date().toISOString(),
    });

    const response = await fetchWithJwtRetry(`${getApiBase()}/api/tenant-organizations/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update tenant organization: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating tenant organization:', error);
    throw new Error('Failed to update tenant organization');
  }
}

/**
 * Partially update an existing tenant organization
 */
export async function patchTenantOrganization(
  id: number,
  data: Partial<TenantOrganizationFormDTO>
): Promise<TenantOrganizationDTO> {
  try {
    const payload = withTenantId({
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    });

    const response = await fetchWithJwtRetry(`${getApiBase()}/api/tenant-organizations/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/merge-patch+json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update tenant organization: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error patching tenant organization:', error);
    throw new Error('Failed to update tenant organization');
  }
}

/**
 * Delete a tenant organization
 */
export async function deleteTenantOrganization(id: number): Promise<void> {
  try {
    const response = await fetchWithJwtRetry(`${getApiBase()}/api/tenant-organizations/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete tenant organization: ${errorText}`);
    }
  } catch (error) {
    console.error('Error deleting tenant organization:', error);
    throw new Error('Failed to delete tenant organization');
  }
}

/**
 * Toggle the active status of a tenant organization
 */
export async function toggleTenantOrganizationStatus(id: number, isActive: boolean): Promise<TenantOrganizationDTO> {
  try {
    const payload = withTenantId({
      id,
      isActive,
      updatedAt: new Date().toISOString(),
    });

    const response = await fetchWithJwtRetry(`${getApiBase()}/api/tenant-organizations/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/merge-patch+json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to toggle tenant organization status: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error toggling tenant organization status:', error);
    throw new Error('Failed to toggle tenant organization status');
  }
}

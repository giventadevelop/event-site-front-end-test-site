import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { withTenantId } from '@/lib/withTenantId';
import { getAppUrl, getApiBaseUrl } from '@/lib/env';
import { stripDeprecatedSettingsIdentityFields } from '@/lib/resolveTenantOrganizationIdentity';
import type {
  TenantSettingsDTO,
  TenantSettingsFormDTO,
  TenantSettingsFilters,
  PaginationParams,
  PaginatedResponse
} from '@/app/admin/tenant-management/types';

// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}

/**
 * Fetch paginated list of tenant settings
 */
export async function fetchTenantSettings(
  pagination: PaginationParams,
  filters: TenantSettingsFilters = {}
): Promise<PaginatedResponse<TenantSettingsDTO>> {
  try {
    const params = new URLSearchParams();

    // Add pagination parameters
    params.append('page', pagination.page.toString());
    params.append('size', pagination.pageSize.toString());

    // Add filters
    if (filters.search) {
      params.append('tenantId.contains', filters.search);
    }
    if (filters.tenantId) {
      params.append('tenantId.equals', filters.tenantId);
    }

    // Add sorting
    if (filters.sortBy) {
      const sortDirection = filters.sortOrder || 'asc';
      params.append('sort', `${filters.sortBy},${sortDirection}`);
    }

    const response = await fetchWithJwtRetry(
      `${getApiBase()}/api/tenant-settings?${params.toString()}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch tenant settings: ${response.statusText}`);
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
    console.error('Error fetching tenant settings:', error);
    throw new Error('Failed to fetch tenant settings');
  }
}

/**
 * Fetch a single tenant setting by ID
 */
export async function fetchTenantSetting(id: number): Promise<TenantSettingsDTO | null> {
  try {
    const response = await fetchWithJwtRetry(
      `${getApiBase()}/api/tenant-settings/${id}`,
      { cache: 'no-store' }
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch tenant setting: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching tenant setting:', error);
    throw new Error('Failed to fetch tenant setting');
  }
}

/**
 * Fetch tenant settings by tenant ID
 */
export async function fetchTenantSettingsByTenantId(tenantId: string): Promise<TenantSettingsDTO | null> {
  try {
    const params = new URLSearchParams();
    params.append('tenantId.equals', tenantId);

    const response = await fetchWithJwtRetry(
      `${getApiBase()}/api/tenant-settings?${params.toString()}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch tenant settings by tenant ID: ${response.statusText}`);
    }

    const data = await response.json();
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error('Error fetching tenant settings by tenant ID:', error);
    throw new Error('Failed to fetch tenant settings by tenant ID');
  }
}

function parseTenantSettingsApiError(errorText: string, action: 'create' | 'update'): string {
  const lower = errorText.toLowerCase();
  if (lower.includes('duplicate key') || lower.includes('already exists')) {
    return 'Settings for this tenant already exist. Edit the existing settings instead of creating new ones.';
  }
  if (lower.includes('column') && lower.includes('does not exist')) {
    return 'The backend database is missing required columns. Apply the tenant profile migration and restart the API server.';
  }
  try {
    const parsed = JSON.parse(errorText) as {
      detail?: string;
      title?: string;
      message?: string;
      error?: string;
    };
    if (parsed.detail) return parsed.detail;
    if (parsed.message) return parsed.message;
    if (parsed.title) return parsed.title;
    if (parsed.error) return parsed.error;
  } catch {
    // not JSON
  }
  const trimmed = errorText.trim();
  if (trimmed.length > 0 && trimmed.length <= 500) {
    return trimmed;
  }
  return action === 'create' ? 'Failed to create tenant settings.' : 'Failed to update tenant settings.';
}

/**
 * Create a new tenant setting
 */
export async function createTenantSetting(data: TenantSettingsFormDTO): Promise<TenantSettingsDTO> {
  try {
    const payload = withTenantId({
      ...stripDeprecatedSettingsIdentityFields(data),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const response = await fetchWithJwtRetry(`${getApiBase()}/api/tenant-settings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[createTenantSetting] Backend error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText.slice(0, 2000),
      });
      throw new Error(parseTenantSettingsApiError(errorText, 'create'));
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating tenant setting:', error);
    if (error instanceof Error && error.message !== 'Failed to create tenant settings.') {
      throw error;
    }
    throw new Error('Failed to create tenant settings. Please try again.');
  }
}

/**
 * Update an existing tenant setting
 */
export async function updateTenantSetting(
  id: number,
  data: Partial<TenantSettingsFormDTO>
): Promise<TenantSettingsDTO> {
  try {
    // First fetch the existing tenant setting to preserve fields not in form
    const existingSetting = await fetchTenantSetting(id);

    if (!existingSetting) {
      throw new Error('Tenant setting not found');
    }

    // If tenantOrganization is missing or incomplete, try to fetch it by tenantId
    let tenantOrganization = existingSetting.tenantOrganization;

    if (!tenantOrganization || !tenantOrganization.id) {
      console.log('[updateTenantSetting] Missing tenantOrganization, fetching by tenantId:', existingSetting.tenantId);

      try {
        // Import the function to fetch tenant organizations
        const { fetchTenantOrganizations } = await import('@/app/admin/tenant-management/organizations/ApiServerActions');

        const orgResult = await fetchTenantOrganizations(
          { page: 0, pageSize: 1 },
          { tenantId: existingSetting.tenantId }
        );

        if (orgResult.data && orgResult.data.length > 0) {
          tenantOrganization = orgResult.data[0];
          console.log('[updateTenantSetting] Found tenantOrganization:', {
            id: tenantOrganization.id,
            organizationName: tenantOrganization.organizationName,
            tenantId: tenantOrganization.tenantId
          });
        } else {
          console.warn('[updateTenantSetting] No tenant organization found for tenantId:', existingSetting.tenantId);
        }
      } catch (orgError) {
        console.error('[updateTenantSetting] Error fetching tenant organization:', orgError);
      }
    }

    const payload = withTenantId({
      ...stripDeprecatedSettingsIdentityFields(data),
      id,
      createdAt: existingSetting.createdAt, // Preserve original createdAt
      updatedAt: new Date().toISOString(),
      // Include the tenantOrganization relationship (either existing or newly fetched)
      tenantOrganization: tenantOrganization || null,
    });

    console.log('[updateTenantSetting] Final payload with tenantOrganization:', {
      tenantId: payload.tenantId,
      organizationId: tenantOrganization?.id,
      organizationName: tenantOrganization?.organizationName,
      hasOrganization: !!tenantOrganization
    });

    const response = await fetchWithJwtRetry(`${getApiBase()}/api/tenant-settings/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update tenant setting: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating tenant setting:', error);
    throw new Error('Failed to update tenant setting');
  }
}

/**
 * Partially update an existing tenant setting
 */
export async function patchTenantSetting(
  id: number,
  data: Partial<TenantSettingsFormDTO>
): Promise<TenantSettingsDTO> {
  try {
    // For PATCH operations, we should also preserve tenantOrganization if not explicitly provided
    const existingSetting = await fetchTenantSetting(id);

    if (!existingSetting) {
      throw new Error('Tenant setting not found');
    }

    // If tenantOrganization is missing or incomplete, try to fetch it by tenantId
    let tenantOrganization = existingSetting.tenantOrganization;

    if (!tenantOrganization || !tenantOrganization.id) {
      console.log('[patchTenantSetting] Missing tenantOrganization, fetching by tenantId:', existingSetting.tenantId);

      try {
        // Import the function to fetch tenant organizations
        const { fetchTenantOrganizations } = await import('@/app/admin/tenant-management/organizations/ApiServerActions');

        const orgResult = await fetchTenantOrganizations(
          { page: 0, pageSize: 1 },
          { tenantId: existingSetting.tenantId }
        );

        if (orgResult.data && orgResult.data.length > 0) {
          tenantOrganization = orgResult.data[0];
          console.log('[patchTenantSetting] Found tenantOrganization:', {
            id: tenantOrganization.id,
            organizationName: tenantOrganization.organizationName,
            tenantId: tenantOrganization.tenantId
          });
        } else {
          console.warn('[patchTenantSetting] No tenant organization found for tenantId:', existingSetting.tenantId);
        }
      } catch (orgError) {
        console.error('[patchTenantSetting] Error fetching tenant organization:', orgError);
      }
    }

    const payload = withTenantId({
      ...stripDeprecatedSettingsIdentityFields(data),
      id,
      updatedAt: new Date().toISOString(),
      // Include the tenantOrganization relationship (either existing or newly fetched)
      tenantOrganization: tenantOrganization || null,
    });

    console.log('[patchTenantSetting] Final payload with tenantOrganization:', {
      tenantId: payload.tenantId,
      organizationId: tenantOrganization?.id,
      organizationName: tenantOrganization?.organizationName,
      hasOrganization: !!tenantOrganization
    });

    const response = await fetchWithJwtRetry(`${getApiBase()}/api/tenant-settings/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/merge-patch+json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update tenant setting: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error patching tenant setting:', error);
    throw new Error('Failed to update tenant setting');
  }
}

/**
 * Delete a tenant setting
 */
export async function deleteTenantSetting(id: number): Promise<void> {
  try {
    const response = await fetchWithJwtRetry(`${getApiBase()}/api/tenant-settings/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete tenant setting: ${errorText}`);
    }
  } catch (error) {
    console.error('Error deleting tenant setting:', error);
    throw new Error('Failed to delete tenant setting');
  }
}

/**
 * Upload email footer HTML file (client-side function)
 * Note: This must be called from client components, not server actions
 */
export async function uploadEmailFooterHtmlClient(
  file: File
): Promise<{ url: string }> {
  const baseUrl = getAppUrl();
  const formData = new FormData();

  formData.append('file', file);

  const url = `${baseUrl}/api/proxy/tenant-settings/upload/email-footer-html`;

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[Client] Error uploading email footer HTML: ${response.status} ${response.statusText}`, errorBody);
    throw new Error(`Failed to upload email footer HTML. Status: ${response.status}`);
  }

  const result = await response.json();
  return {
    url: result.emailFooterHtmlUrl || result.url || '',
  };
}

/**
 * Upload tenant logo image (client-side function)
 * Note: This must be called from client components, not server actions
 */
export async function uploadTenantLogoClient(
  file: File
): Promise<{ url: string }> {
  const baseUrl = getAppUrl();
  const formData = new FormData();

  formData.append('file', file);

  const url = `${baseUrl}/api/proxy/tenant-settings/upload/tenant-logo`;

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[Client] Error uploading tenant logo: ${response.status} ${response.statusText}`, errorBody);
    throw new Error(`Failed to upload tenant logo. Status: ${response.status}`);
  }

  const result = await response.json();
  return {
    url: result.logoImageUrl || result.url || '',
  };
}

/**
 * Upload email header image (client-side function)
 * Note: This must be called from client components, not server actions
 */
export async function uploadEmailHeaderImageClient(
  file: File
): Promise<{ url: string }> {
  const baseUrl = getAppUrl();
  const formData = new FormData();

  formData.append('file', file);

  const url = `${baseUrl}/api/proxy/tenant-settings/upload/email-header-image`;

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[Client] Error uploading email header image: ${response.status} ${response.statusText}`, errorBody);
    throw new Error(`Failed to upload email header image. Status: ${response.status}`);
  }

  const result = await response.json();
  return {
    url: result.emailHeaderImageUrl || result.url || '',
  };
}

function tenantUploadQuery(tenantIdForUpload?: string): string {
  if (!tenantIdForUpload?.trim()) return '';
  return `?tenantId=${encodeURIComponent(tenantIdForUpload.trim())}`;
}

/**
 * Upload default homepage hero image (client-side function).
 * Optional tenantIdForUpload scopes S3 path for super-admin editing another tenant.
 */
export async function uploadDefaultHeroImageClient(
  file: File,
  tenantIdForUpload?: string
): Promise<{ url: string }> {
  const baseUrl = getAppUrl();
  const formData = new FormData();
  formData.append('file', file);

  const url = `${baseUrl}/api/proxy/tenant-settings/upload/default-hero-image${tenantUploadQuery(tenantIdForUpload)}`;

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(
      `[Client] Error uploading default hero image: ${response.status} ${response.statusText}`,
      errorBody
    );
    throw new Error(`Failed to upload hero image. Status: ${response.status}`);
  }

  const result = await response.json();
  return {
    url:
      result.defaultHeroImageUrl ||
      result.url ||
      result.imageUrl ||
      '',
  };
}
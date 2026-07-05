'use server';

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { withTenantId } from '@/lib/withTenantId';
import { getApiBaseUrl } from '@/lib/env';
import {
  getAppScopedTenantId,
  isSatelliteTenantSettingsScope,
} from '@/lib/tenantSettingsScope';
import { stripDeprecatedSettingsIdentityFields } from '@/lib/resolveTenantOrganizationIdentity';
import { normalizeDefaultHeroImageUrlsJsonForApi } from '@/lib/hero/defaultHeroImages';
import {
  parseJhipsterProblemErrorBody,
  UserFacingSaveError,
} from '@/lib/api/userFacingSaveError';
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
    const scopedTenantId = isSatelliteTenantSettingsScope()
      ? getAppScopedTenantId()
      : filters.tenantId;
    if (scopedTenantId) {
      params.append('tenantId.equals', scopedTenantId);
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
    if (isSatelliteTenantSettingsScope()) {
      const forConfiguredTenant = await fetchTenantSettingsByTenantId(getAppScopedTenantId());
      if (!forConfiguredTenant?.id) {
        return null;
      }
      if (forConfiguredTenant.id !== id) {
        console.warn(
          '[fetchTenantSetting] Satellite scope: ignoring settings id=%s; using id=%s for tenant %s',
          id,
          forConfiguredTenant.id,
          getAppScopedTenantId()
        );
      }
      return forConfiguredTenant;
    }

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

    const setting: TenantSettingsDTO = await response.json();
    return setting;
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

function buildTenantSettingsWritePayload(
  existingSetting: TenantSettingsDTO,
  data: Partial<TenantSettingsFormDTO>,
  id: number
): TenantSettingsDTO {
  const { tenantOrganization: _org, ...existingRest } = existingSetting;
  const stripped = stripDeprecatedSettingsIdentityFields(
    data as Record<string, unknown>
  ) as Partial<TenantSettingsFormDTO>;

  const merged = stripDeprecatedSettingsIdentityFields({
    ...existingRest,
    ...stripped,
    id,
    createdAt: existingSetting.createdAt,
    updatedAt: new Date().toISOString(),
  }) as TenantSettingsDTO;

  if (
    'defaultHeroImageUrlsJson' in stripped ||
    merged.defaultHeroImageUrlsJson !== undefined
  ) {
    merged.defaultHeroImageUrlsJson = normalizeDefaultHeroImageUrlsJsonForApi(
      merged.defaultHeroImageUrlsJson
    );
  }

  return merged as TenantSettingsDTO;
}

function finalizeTenantSettingsWritePayload(
  payload: TenantSettingsDTO,
  existingSetting: TenantSettingsDTO
): TenantSettingsDTO {
  if (isSatelliteTenantSettingsScope()) {
    return withTenantId(payload) as TenantSettingsDTO;
  }
  return {
    ...payload,
    tenantId: existingSetting.tenantId,
  };
}

async function resolveTenantSettingsForMutation(
  id: number
): Promise<{ targetId: number; existingSetting: TenantSettingsDTO }> {
  if (isSatelliteTenantSettingsScope()) {
    const configuredTenantId = getAppScopedTenantId();
    const existingSetting = await fetchTenantSettingsByTenantId(configuredTenantId);
    if (!existingSetting?.id) {
      throw new Error(
        `No tenant settings found for this app (tenant: ${configuredTenantId}). Create settings for your tenant first.`
      );
    }
    if (existingSetting.tenantId !== configuredTenantId) {
      throw new Error('Tenant settings do not match this app configuration.');
    }
    if (existingSetting.id !== id) {
      console.warn(
        '[resolveTenantSettingsForMutation] Satellite: saving id=%s instead of requested id=%s',
        existingSetting.id,
        id
      );
    }
    return { targetId: existingSetting.id, existingSetting };
  }

  const existingSetting = await fetchTenantSetting(id);
  if (!existingSetting) {
    throw new Error('Tenant setting not found');
  }
  return { targetId: id, existingSetting };
}

function throwTenantSettingsApiError(errorText: string, action: 'create' | 'update'): never {
  const { summary, details } = parseJhipsterProblemErrorBody(errorText, action);
  throw new UserFacingSaveError(summary, details);
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
      throwTenantSettingsApiError(errorText, 'create');
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
    const { targetId, existingSetting } = await resolveTenantSettingsForMutation(id);
    const merged = buildTenantSettingsWritePayload(existingSetting, data, targetId);
    const payload = finalizeTenantSettingsWritePayload(merged, existingSetting);

    const response = await fetchWithJwtRetry(`${getApiBase()}/api/tenant-settings/${targetId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[updateTenantSetting] Backend error:', {
        status: response.status,
        body: errorText.slice(0, 2000),
      });
      throwTenantSettingsApiError(errorText, 'update');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating tenant setting:', error);
    if (error instanceof Error) throw error;
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
    const { targetId, existingSetting } = await resolveTenantSettingsForMutation(id);

    const stripped = stripDeprecatedSettingsIdentityFields(
      data as Record<string, unknown>
    ) as Partial<TenantSettingsFormDTO>;

    const patchPayload: Partial<TenantSettingsFormDTO> & { id: number; updatedAt: string } = {
      ...stripped,
      id: targetId,
      updatedAt: new Date().toISOString(),
    };

    if ('defaultHeroImageUrlsJson' in stripped) {
      patchPayload.defaultHeroImageUrlsJson = normalizeDefaultHeroImageUrlsJsonForApi(
        stripped.defaultHeroImageUrlsJson
      );
    }

    const payload = finalizeTenantSettingsWritePayload(
      patchPayload as TenantSettingsDTO,
      existingSetting
    );

    const response = await fetchWithJwtRetry(`${getApiBase()}/api/tenant-settings/${targetId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/merge-patch+json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[patchTenantSetting] Backend error:', {
        status: response.status,
        body: errorText.slice(0, 2000),
      });
      throwTenantSettingsApiError(errorText, 'update');
    }

    return await response.json();
  } catch (error) {
    console.error('Error patching tenant setting:', error);
    if (error instanceof Error) throw error;
    throw new Error('Failed to update tenant setting');
  }
}

/**
 * Delete a tenant setting
 */
export async function deleteTenantSetting(id: number): Promise<void> {
  try {
    const { targetId } = await resolveTenantSettingsForMutation(id);

    const response = await fetchWithJwtRetry(`${getApiBase()}/api/tenant-settings/${targetId}`, {
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
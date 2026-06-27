/**
 * Multi-Tenant Support Utilities
 *
 * Handles tenant-specific functionality and configuration
 */

import { getTenantId } from './env';

export interface TenantConfig {
  tenantId: string;
  name: string;
  domain?: string;
  features?: {
    whatsapp?: boolean;
    polls?: boolean;
    events?: boolean;
    customForms?: boolean;
  };
  branding?: {
    primaryColor?: string;
    logoUrl?: string;
    faviconUrl?: string;
  };
}

/**
 * Get current tenant ID
 */
export function getCurrentTenantId(): string {
  return getTenantId();
}

/**
 * Add tenant ID to request payload
 */
export function addTenantToPayload<T extends Record<string, any>>(payload: T): T & { tenantId: string } {
  return {
    ...payload,
    tenantId: getCurrentTenantId(),
  };
}

/**
 * Add tenant ID to query parameters
 */
export function addTenantToQuery(params: URLSearchParams): URLSearchParams {
  const tenantId = getCurrentTenantId();
  params.set('tenantId.equals', tenantId);
  return params;
}

/**
 * Create tenant-scoped URL
 */
export function createTenantUrl(baseUrl: string, queryParams?: Record<string, any>): string {
  const url = new URL(baseUrl);
  const tenantId = getCurrentTenantId();

  // Add tenant ID
  url.searchParams.set('tenantId.equals', tenantId);

  // Add additional query params
  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }

  return url.toString();
}

/**
 * Validate tenant access
 */
export function validateTenantAccess(resourceTenantId: string): boolean {
  const currentTenantId = getCurrentTenantId();
  return resourceTenantId === currentTenantId;
}

/**
 * Filter items by tenant
 */
export function filterByTenant<T extends { tenantId?: string }>(items: T[]): T[] {
  const currentTenantId = getCurrentTenantId();
  return items.filter(item => item.tenantId === currentTenantId);
}

/**
 * Check if multi-tenant mode is enabled
 */
export function isMultiTenantEnabled(): boolean {
  // Multi-tenant is always enabled in this application
  return true;
}

/**
 * Get tenant-specific configuration
 * This would typically fetch from backend, but for now returns defaults
 */
export async function getTenantConfig(): Promise<TenantConfig> {
  const tenantId = getCurrentTenantId();

  // In a real implementation, this would fetch from backend
  // For now, return a default configuration
  return {
    tenantId,
    name: tenantId,
    features: {
      whatsapp: true,
      polls: true,
      events: true,
      customForms: true,
    },
  };
}

/**
 * Check if tenant has access to a specific feature
 */
export async function hasTenantFeature(feature: keyof NonNullable<TenantConfig['features']>): Promise<boolean> {
  const config = await getTenantConfig();
  return config.features?.[feature] ?? false;
}

/**
 * Create tenant-aware error message
 */
export function createTenantError(message: string, tenantId?: string): Error {
  const currentTenant = tenantId || getCurrentTenantId();
  return new Error(`[Tenant: ${currentTenant}] ${message}`);
}



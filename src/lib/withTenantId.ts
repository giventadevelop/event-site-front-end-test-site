import { getTenantId } from '@/lib/env';

/**
 * Returns a new DTO object with tenantId injected.
 * Does not mutate the original object.
 *
 * @param dto - The DTO object to augment
 * @returns The DTO with tenantId set
 */
export function withTenantId<T extends object>(dto: T): T & { tenantId: string } {
  const tenantId = getTenantId();
  console.log('[MOBILE-WORKFLOW] [withTenantId] Injecting tenantId:', {
    tenantId,
    hasValue: !!tenantId,
    length: tenantId?.length,
    timestamp: new Date().toISOString()
  });
  return {
    ...dto,
    tenantId: tenantId,
  };
}
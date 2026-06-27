'use client';

import { useEffect } from 'react';
import { getClientTenantId } from '@/lib/env';

/**
 * Injects the current tenant ID into the document for fast lookup (e.g. cache keys, analytics).
 * Sets data-tenant-id on documentElement and window.__TENANT_ID__ so first paint and scripts can read it.
 * See documentation/cloud_front feasibility plan: "Tenant ID on homepage / immediate read from env".
 */
export default function TenantIdInjector() {
  useEffect(() => {
    const tenantId = getClientTenantId();
    if (tenantId && typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.setAttribute('data-tenant-id', tenantId);
    }
    if (tenantId && typeof window !== 'undefined') {
      (window as unknown as { __TENANT_ID__?: string }).__TENANT_ID__ = tenantId;
    }
  }, []);
  return null;
}

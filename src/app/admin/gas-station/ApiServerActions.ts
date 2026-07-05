'use server';

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getTenantId, getApiBaseUrl } from '@/lib/env';
import { withTenantId } from '@/lib/withTenantId';
import { parseProfileSiteListResponse } from '@/lib/parseProfileSiteResponses';
import type {
  GasStationLocationDTO,
  GasStationIntegrationDTO,
  GasStationDailyMetricsDTO,
  GasStationRecommendationDTO,
  GasStationRecommendationStatus,
} from '@/types/gasStation';
import type { TenantOrganizationDTO } from '@/types';

function getApiBase() {
  return getApiBaseUrl();
}

async function fetchGasList<T>(path: string, extraParams?: Record<string, string>): Promise<T[]> {
  try {
    const params = new URLSearchParams({
      'tenantId.equals': getTenantId(),
      size: '500',
    });
    for (const [key, value] of Object.entries(extraParams ?? {})) {
      params.append(key, value);
    }
    const res = await fetchWithJwtRetry(`${getApiBase()}${path}?${params}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return parseProfileSiteListResponse<T>(data);
  } catch (error) {
    console.error(`[fetchGasList] ${path}`, error);
    return [];
  }
}

async function createGasResource<T extends object>(path: string, data: Partial<T>): Promise<T | null> {
  try {
    const body = withTenantId({
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    const res = await fetchWithJwtRetry(`${getApiBase()}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  } catch (error) {
    console.error(`[createGasResource] ${path}`, error);
    return null;
  }
}

async function patchGasResource<T extends object>(
  path: string,
  id: number,
  data: Partial<T>
): Promise<T | null> {
  try {
    const payload = withTenantId({ ...data, id, updatedAt: new Date().toISOString() });
    const res = await fetchWithJwtRetry(`${getApiBase()}${path}/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/merge-patch+json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    return await res.json();
  } catch (error) {
    console.error(`[patchGasResource] ${path}`, error);
    return null;
  }
}

async function deleteGasResource(path: string, id: number): Promise<boolean> {
  try {
    const res = await fetchWithJwtRetry(`${getApiBase()}${path}/${id}`, { method: 'DELETE' });
    return res.ok;
  } catch (error) {
    console.error(`[deleteGasResource] ${path}`, error);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Stations
// ---------------------------------------------------------------------------

export async function fetchGasStationLocationsServer(): Promise<GasStationLocationDTO[]> {
  return fetchGasList<GasStationLocationDTO>('/api/gas-station-locations', {
    sort: 'stationCode,asc',
  });
}

export async function createGasStationLocationServer(
  data: Omit<GasStationLocationDTO, 'id' | 'tenantId'>
): Promise<GasStationLocationDTO | null> {
  return createGasResource<GasStationLocationDTO>('/api/gas-station-locations', data);
}

export async function updateGasStationLocationServer(
  id: number,
  data: Partial<GasStationLocationDTO>
): Promise<GasStationLocationDTO | null> {
  return patchGasResource<GasStationLocationDTO>('/api/gas-station-locations', id, data);
}

export async function deleteGasStationLocationServer(id: number): Promise<boolean> {
  return deleteGasResource('/api/gas-station-locations', id);
}

// ---------------------------------------------------------------------------
// Integrations
// ---------------------------------------------------------------------------

export async function fetchGasStationIntegrationsServer(
  stationId?: number
): Promise<GasStationIntegrationDTO[]> {
  const extra: Record<string, string> = { sort: 'systemType,asc' };
  if (stationId != null) extra['stationId.equals'] = String(stationId);
  return fetchGasList<GasStationIntegrationDTO>('/api/gas-station-integrations', extra);
}

export async function createGasStationIntegrationServer(
  data: Omit<GasStationIntegrationDTO, 'id' | 'tenantId'>
): Promise<GasStationIntegrationDTO | null> {
  return createGasResource<GasStationIntegrationDTO>('/api/gas-station-integrations', data);
}

export async function updateGasStationIntegrationServer(
  id: number,
  data: Partial<GasStationIntegrationDTO>
): Promise<GasStationIntegrationDTO | null> {
  return patchGasResource<GasStationIntegrationDTO>('/api/gas-station-integrations', id, data);
}

export async function deleteGasStationIntegrationServer(id: number): Promise<boolean> {
  return deleteGasResource('/api/gas-station-integrations', id);
}

// ---------------------------------------------------------------------------
// Daily metrics
// ---------------------------------------------------------------------------

/** Fetch metrics for a single date (all stations). */
export async function fetchGasStationDailyMetricsServer(
  metricDate: string
): Promise<GasStationDailyMetricsDTO[]> {
  return fetchGasList<GasStationDailyMetricsDTO>('/api/gas-station-daily-metrics', {
    'metricDate.equals': metricDate,
  });
}

/** Fetch metrics for an inclusive date range (all stations) for the compare/trends views. */
export async function fetchGasStationMetricsRangeServer(
  fromDate: string,
  toDate: string
): Promise<GasStationDailyMetricsDTO[]> {
  return fetchGasList<GasStationDailyMetricsDTO>('/api/gas-station-daily-metrics', {
    'metricDate.greaterThanOrEqual': fromDate,
    'metricDate.lessThanOrEqual': toDate,
    size: '2000',
  });
}

// ---------------------------------------------------------------------------
// Recommendations (the morning action list)
// ---------------------------------------------------------------------------

/** Fetch all recommendations for a date — station-specific and chain-level (stationId null). */
export async function fetchGasStationRecommendationsServer(
  recommendationDate: string
): Promise<GasStationRecommendationDTO[]> {
  return fetchGasList<GasStationRecommendationDTO>('/api/gas-station-recommendations', {
    'recommendationDate.equals': recommendationDate,
    sort: 'priority,asc',
  });
}

export async function updateGasStationRecommendationServer(
  id: number,
  patch: { status?: GasStationRecommendationStatus; ownerFeedback?: string }
): Promise<GasStationRecommendationDTO | null> {
  return patchGasResource<GasStationRecommendationDTO>('/api/gas-station-recommendations', id, patch);
}

// ---------------------------------------------------------------------------
// Billing (subscription per tenant; quantity = billable locations)
// ---------------------------------------------------------------------------

export async function fetchTenantOrganizationForBillingServer(): Promise<TenantOrganizationDTO | null> {
  try {
    const params = new URLSearchParams({ 'tenantId.equals': getTenantId(), size: '1' });
    const res = await fetchWithJwtRetry(`${getApiBase()}/api/tenant-organizations?${params}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const list = parseProfileSiteListResponse<TenantOrganizationDTO>(await res.json());
    return list[0] ?? null;
  } catch (error) {
    console.error('[fetchTenantOrganizationForBillingServer]', error);
    return null;
  }
}

/** Toggle whether a location counts toward the subscription quantity. */
export async function updateStationSubscriptionFlagServer(
  id: number,
  includedInSubscription: boolean
): Promise<GasStationLocationDTO | null> {
  return patchGasResource<GasStationLocationDTO>('/api/gas-station-locations', id, {
    includedInSubscription,
  });
}

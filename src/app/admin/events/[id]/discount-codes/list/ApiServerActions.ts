"use server";
import { getTenantId, getAppUrl, getApiBaseUrl } from "@/lib/env";
import { fetchWithJwtRetry } from "@/lib/proxyHandler";
import { withTenantId } from "@/lib/withTenantId";
import { DiscountCodeDTO } from "@/types";

// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}

export async function fetchDiscountCodesForEvent(eventId: string): Promise<DiscountCodeDTO[]> {
  const tenantId = getTenantId();
  const url = `${getApiBase()}/api/discount-codes?eventId.equals=${eventId}&tenantId.equals=${tenantId}`;

  const response = await fetchWithJwtRetry(url, {
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      const errorBody = await response.text();
    console.error(`[ Server ] Error fetching discount codes for event ${eventId}: ${response.status} ${response.statusText}`, errorBody);
      throw new Error(`Failed to fetch discount codes. Status: ${response.status}`);
    }

    return await response.json();
}

export async function createDiscountCodeServer(
  code: Omit<DiscountCodeDTO, "id" | "tenantId" | "createdAt" | "updatedAt">,
  eventId: string
): Promise<DiscountCodeDTO> {
  const baseUrl = getAppUrl();
  const url = `${baseUrl}/api/proxy/discount-codes`;

  const payload = withTenantId({
    ...code,
    id: null,
    eventId: parseInt(eventId, 10),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  console.log('[DEBUG] Payload before POST:', payload);
  if (!payload.tenantId) throw new Error('tenantId missing from payload');

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[ Server ] Error creating discount code: ${response.status} ${response.statusText}`, errorBody);
    throw new Error(`Failed to create discount code. Status: ${response.status}`);
  }

  return await response.json();
}

export async function deleteDiscountCodeServer(discountCodeId: number): Promise<{ success: boolean }> {
  const url = `${getApiBase()}/api/discount-codes/${discountCodeId}`;

  const response = await fetchWithJwtRetry(url, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[ Server ] Error deleting discount code ${discountCodeId}: ${response.status} ${response.statusText}`, errorBody);
    throw new Error(`Failed to delete discount code. Status: ${response.status}`);
  }

  return { success: true };
}

export async function fetchDiscountCodeByIdServer(
  id: number
): Promise<DiscountCodeDTO | null> {
  const baseUrl = getAppUrl();
  const url = `${baseUrl}/api/proxy/discount-codes/${id}`;

  const response = await fetchWithJwtRetry(url, {
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    if (response.status !== 404) {
      console.error(
        `[ Server ] Failed to fetch discount code ${id} via proxy:`,
        response.status,
        await response.text()
      );
  }
    return null;
  }
  return response.json();
}

export async function patchDiscountCodeServer(
  id: number,
  code: Partial<Omit<DiscountCodeDTO, "tenantId" | "eventId" | "createdAt" | "updatedAt">> & { eventId: number }
): Promise<DiscountCodeDTO> {
  const baseUrl = getAppUrl();
  const url = `${baseUrl}/api/proxy/discount-codes/${id}`;
  const now = new Date().toISOString();
  const payload: Partial<DiscountCodeDTO> = {
    ...code,
    id,
    eventId: code.eventId,
    updatedAt: now,
    tenantId: getTenantId(),
    // createdAt should be preserved from the original, not overwritten
  };
  console.log('[DEBUG] Payload before PATCH:', payload);
  if (!payload.tenantId) throw new Error('tenantId missing from payload');

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/merge-patch+json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[ Server ] Error updating discount code: ${response.status} ${response.statusText}`, errorBody);
    throw new Error(`Failed to update discount code. Status: ${response.status}`);
  }

  return await response.json();
}
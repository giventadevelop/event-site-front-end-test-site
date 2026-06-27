"use server";

import { revalidatePath } from 'next/cache';
import { getTenantId, getAppUrl, getApiBaseUrl } from '@/lib/env';
import { withTenantId } from '@/lib/withTenantId';
import type { EventTicketTypeDTO, EventTicketTypeFormDTO, EventDetailsDTO } from '@/types';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';

// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}
const APP_URL = getAppUrl();


export async function fetchTicketTypesServer(eventId: number) {
  const tenantId = getTenantId();
  const res = await fetch(
    `${getApiBase()}/api/proxy/event-ticket-types?eventId.equals=${eventId}&tenantId.equals=${tenantId}&sort=createdAt,desc`,
    { cache: 'no-store' }
  );
  if (!res.ok) {
    throw new Error('Failed to fetch ticket types');
  }
  return res.json();
}

export async function createTicketTypeServer(eventId: string, formData: EventTicketTypeFormDTO) {
  try {
    const payload = withTenantId({
      ...formData,
      event: { id: parseInt(eventId) },
      price: Number(formData.price),
      availableQuantity: Number(formData.availableQuantity),
      serviceFee: formData.isServiceFeeIncluded && formData.serviceFee ? Number(formData.serviceFee) : 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-ticket-types`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      return { success: false, error: `Failed to create ticket type: ${errorData}` };
    }

    const data: EventTicketTypeDTO = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function updateTicketTypeServer(ticketTypeId: number, eventId: string, formData: Partial<EventTicketTypeFormDTO>) {
  try {
    // First fetch the existing ticket type to get the createdAt timestamp
    const existingTicketType = await fetchTicketTypeByIdServer(ticketTypeId);
    if (!existingTicketType) {
      return { success: false, error: 'Ticket type not found' };
    }

    const payload = withTenantId({
      id: ticketTypeId,
      ...formData,
      event: { id: parseInt(eventId) },
      price: Number(formData.price),
      availableQuantity: Number(formData.availableQuantity),
      serviceFee: formData.isServiceFeeIncluded && formData.serviceFee ? Number(formData.serviceFee) : 0,
      createdAt: existingTicketType.createdAt, // Preserve existing createdAt
      updatedAt: new Date().toISOString(),
    });

    const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-ticket-types/${ticketTypeId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      return { success: false, error: `Failed to update ticket type: ${errorData}` };
    }
    const data: EventTicketTypeDTO = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function deleteTicketTypeServer(ticketTypeId: number, eventId: string) {
  try {
    const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-ticket-types/${ticketTypeId}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorData = await response.text();
      return { success: false, error: `Failed to delete ticket type: ${errorData}` };
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function fetchTicketTypeByIdServer(
  ticketTypeId: number
): Promise<EventTicketTypeDTO | null> {
  const baseUrl = getAppUrl();
  const response = await fetch(
    `${baseUrl}/api/proxy/event-ticket-types/${ticketTypeId}`,
    {
      cache: 'no-store', // Always fetch fresh data
    }
  );

  if (!response.ok) {
    if (response.status !== 404) {
      console.error(
        `Failed to fetch ticket type ${ticketTypeId}:`,
        response.status,
        await response.text()
      );
    }
    return null;
  }
  return response.json();
}

export async function updateTicketTypeInventoryServer(
  ticketTypeId: number,
  quantitySold: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const ticketType = await fetchTicketTypeByIdServer(ticketTypeId);
    if (!ticketType) {
      return { success: false, error: `Ticket type with ID ${ticketTypeId} not found.` };
    }

    const updatedTicketType: EventTicketTypeDTO = {
      ...ticketType,
      availableQuantity: (ticketType.availableQuantity ?? 0) - quantitySold,
      soldQuantity: (ticketType.soldQuantity ?? 0) + quantitySold,
      updatedAt: new Date().toISOString(),
    };

    const baseUrl = getAppUrl();
    const response = await fetch(`${baseUrl}/api/proxy/event-ticket-types/${ticketTypeId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(withTenantId(updatedTicketType)),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Failed to update ticket type inventory:', response.status, errorText);
        return { success: false, error: `Failed to update inventory: ${errorText}` };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in updateTicketTypeInventoryServer:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: errorMessage };
  }
}

export async function fetchEventDetailsForTicketListPage(eventId: number): Promise<EventDetailsDTO | null> {
    const url = `${APP_URL}/api/proxy/event-details/${eventId}`;
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) return null;
    return response.json();
}

export async function fetchTicketTypesForTicketListPage(eventId: number): Promise<EventTicketTypeDTO[]> {
    const url = `${APP_URL}/api/proxy/event-ticket-types?eventId.equals=${eventId}`;
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) return [];
    return response.json();
}
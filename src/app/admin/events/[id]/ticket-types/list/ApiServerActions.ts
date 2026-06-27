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
      minQuantityPerOrder: formData.minQuantityPerOrder ? Number(formData.minQuantityPerOrder) : 1,
      maxQuantityPerOrder: formData.maxQuantityPerOrder ? Number(formData.maxQuantityPerOrder) : 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-ticket-types`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorData: any = {};
      try {
        const text = await response.text();
        try {
          errorData = text ? JSON.parse(text) : {};
        } catch (parseError) {
          // If JSON parsing fails, use the raw text as message
          errorData = { message: text || 'Unknown error occurred' };
        }
      } catch (e) {
        // If reading response fails, use generic error
        errorData = { message: 'Unknown error occurred' };
      }

      console.error('[createTicketTypeServer] Backend error:', {
        status: response.status,
        errorData,
      });

      // Extract user-friendly error message from backend response
      let userMessage = 'Failed to create ticket type. Please try again.';

      if (response.status === 400) {
        // Validation errors
        if (errorData.message) {
          if (errorData.message.includes('validation') || errorData.message.includes('Validation')) {
            userMessage = 'Please check all required fields and try again.';
          } else {
            userMessage = errorData.message;
          }
        } else if (errorData.fieldErrors && Array.isArray(errorData.fieldErrors)) {
          const fieldErrors = errorData.fieldErrors.map((err: any) => {
            if (err.field === 'name' && err.message === 'must not be null') {
              return 'Name is required.';
            } else if (err.field === 'code' && err.message === 'must not be null') {
              return 'Code is required.';
            } else if (err.field === 'price' && err.message === 'must not be null') {
              return 'Price is required.';
            }
            return err.defaultMessage || err.message || 'Please check this field.';
          });
          userMessage = fieldErrors.join(' ');
        } else {
          userMessage = 'Please check all required fields and try again.';
        }
      } else if (response.status === 500) {
        // Server errors - check for specific error types
        const errorText = JSON.stringify(errorData);
        if (errorText.includes('duplicate key') || errorText.includes('already exists') || errorText.includes('unique constraint')) {
          userMessage = 'A database error occurred. This may be due to a sequence issue. Please refresh the page and try again. If the problem persists, contact support.';
        } else if (errorText.includes('Network error') || errorText.includes('Unable to reach') || errorText.includes('ECONNREFUSED')) {
          userMessage = 'Unable to connect to the server. Please check your internet connection and ensure the backend server is running.';
        } else {
          userMessage = 'A server error occurred. Please try again in a few moments. If the problem persists, please contact support.';
        }
      } else if (response.status === 401 || response.status === 403) {
        userMessage = 'Authentication error. Please refresh the page and log in again.';
      } else if (response.status >= 500) {
        userMessage = 'The server is temporarily unavailable. Please try again later.';
      } else if (errorData.message) {
        userMessage = errorData.message;
      }

      return { success: false, error: userMessage };
    }

    const data: EventTicketTypeDTO = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function updateTicketTypeServer(ticketTypeId: number, eventId: string, formData: Partial<EventTicketTypeFormDTO>) {
  try {
    console.log('[updateTicketTypeServer] Starting update for ticket type:', ticketTypeId);
    console.log('[updateTicketTypeServer] Form data received:', formData);

    // First fetch the existing ticket type to get the createdAt timestamp
    const existingTicketType = await fetchTicketTypeByIdServer(ticketTypeId);
    if (!existingTicketType) {
      console.error('[updateTicketTypeServer] Ticket type not found:', ticketTypeId);
      return { success: false, error: 'Ticket type not found' };
    }

    console.log('[updateTicketTypeServer] Existing ticket type:', existingTicketType);

    // Ensure minQuantityPerOrder and maxQuantityPerOrder are properly handled
    // Use formData value if provided (even if 0), otherwise use existing, otherwise default
    // Check for both undefined and null, and handle 0 as a valid value
    const minQuantityPerOrder = (formData.minQuantityPerOrder !== undefined && formData.minQuantityPerOrder !== null)
      ? Number(formData.minQuantityPerOrder)
      : ((existingTicketType.minQuantityPerOrder !== undefined && existingTicketType.minQuantityPerOrder !== null)
          ? existingTicketType.minQuantityPerOrder
          : 1);

    const maxQuantityPerOrder = (formData.maxQuantityPerOrder !== undefined && formData.maxQuantityPerOrder !== null)
      ? Number(formData.maxQuantityPerOrder)
      : ((existingTicketType.maxQuantityPerOrder !== undefined && existingTicketType.maxQuantityPerOrder !== null)
          ? existingTicketType.maxQuantityPerOrder
          : 10);

    // Build payload explicitly to ensure all fields are included
    const payload = withTenantId({
      id: ticketTypeId,
      name: formData.name || existingTicketType.name,
      code: formData.code || existingTicketType.code,
      description: formData.description ?? existingTicketType.description ?? '',
      price: Number(formData.price ?? existingTicketType.price),
      availableQuantity: Number(formData.availableQuantity ?? existingTicketType.availableQuantity ?? 0),
      isServiceFeeIncluded: formData.isServiceFeeIncluded ?? existingTicketType.isServiceFeeIncluded ?? false,
      serviceFee: formData.isServiceFeeIncluded && formData.serviceFee ? Number(formData.serviceFee) : (existingTicketType.serviceFee ?? 0),
      isActive: formData.isActive ?? existingTicketType.isActive ?? true,
      minQuantityPerOrder, // Already calculated above
      maxQuantityPerOrder, // Already calculated above
      event: { id: parseInt(eventId) },
      createdAt: existingTicketType.createdAt, // Preserve existing createdAt
      updatedAt: new Date().toISOString(),
    });

    console.log('[updateTicketTypeServer] Payload being sent:', JSON.stringify(payload, null, 2));
    console.log('[updateTicketTypeServer] Calling backend PUT:', `${getApiBase()}/api/event-ticket-types/${ticketTypeId}`);

    // Server actions should call backend directly using fetchWithJwtRetry (not through proxy)
    // This ensures proper JWT authentication and retry logic
    const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-ticket-types/${ticketTypeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    console.log('[updateTicketTypeServer] Response status:', response.status);
    console.log('[updateTicketTypeServer] Response ok:', response.ok);

    if (!response.ok) {
      let errorData: any = {};
      try {
        const text = await response.text();
        try {
          errorData = text ? JSON.parse(text) : {};
        } catch (parseError) {
          // If JSON parsing fails, use the raw text as message
          errorData = { message: text || 'Unknown error occurred' };
        }
      } catch (e) {
        // If reading response fails, use generic error
        errorData = { message: 'Unknown error occurred' };
      }

      console.error('[updateTicketTypeServer] Backend error:', {
        status: response.status,
        errorData,
      });

      // Extract user-friendly error message from backend response
      let userMessage = 'Failed to update ticket type. Please try again.';

      if (response.status === 400) {
        // Validation errors
        if (errorData.message) {
          if (errorData.message.includes('validation') || errorData.message.includes('Validation')) {
            userMessage = 'Please check all required fields and try again.';
          } else {
            userMessage = errorData.message;
          }
        } else if (errorData.fieldErrors && Array.isArray(errorData.fieldErrors)) {
          const fieldErrors = errorData.fieldErrors.map((err: any) => {
            if (err.field === 'name' && err.message === 'must not be null') {
              return 'Name is required.';
            } else if (err.field === 'code' && err.message === 'must not be null') {
              return 'Code is required.';
            } else if (err.field === 'price' && err.message === 'must not be null') {
              return 'Price is required.';
            }
            return err.defaultMessage || err.message || 'Please check this field.';
          });
          userMessage = fieldErrors.join(' ');
        } else {
          userMessage = 'Please check all required fields and try again.';
        }
      } else if (response.status === 500) {
        // Server errors - check for specific error types
        const errorText = JSON.stringify(errorData);
        if (errorText.includes('duplicate key') || errorText.includes('already exists') || errorText.includes('unique constraint')) {
          userMessage = 'A database error occurred. This may be due to a sequence issue. Please refresh the page and try again. If the problem persists, contact support.';
        } else if (errorText.includes('Network error') || errorText.includes('Unable to reach') || errorText.includes('ECONNREFUSED')) {
          userMessage = 'Unable to connect to the server. Please check your internet connection and ensure the backend server is running.';
        } else {
          userMessage = 'A server error occurred. Please try again in a few moments. If the problem persists, please contact support.';
        }
      } else if (response.status === 401 || response.status === 403) {
        userMessage = 'Authentication error. Please refresh the page and log in again.';
      } else if (response.status === 404) {
        userMessage = 'Ticket type not found. It may have been deleted. Please refresh the page.';
      } else if (response.status >= 500) {
        userMessage = 'The server is temporarily unavailable. Please try again later.';
      } else if (errorData.message) {
        userMessage = errorData.message;
      }

      return { success: false, error: userMessage };
    }

    const data: EventTicketTypeDTO = await response.json();
    console.log('[updateTicketTypeServer] Update successful, returned data:', data);
    return { success: true, data };
  } catch (error) {
    console.error('[updateTicketTypeServer] Exception during update:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

export async function deleteTicketTypeServer(ticketTypeId: number, eventId: string) {
  try {
    const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-ticket-types/${ticketTypeId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      let errorData: any = {};
      try {
        const text = await response.text();
        try {
          errorData = text ? JSON.parse(text) : {};
        } catch (parseError) {
          // If JSON parsing fails, use the raw text as message
          errorData = { message: text || 'Unknown error occurred' };
        }
      } catch (e) {
        // If reading response fails, use generic error
        errorData = { message: 'Unknown error occurred' };
      }

      console.error('[deleteTicketTypeServer] Backend error:', {
        status: response.status,
        errorData,
      });

      // Extract user-friendly error message from backend response
      let userMessage = 'Failed to delete ticket type. Please try again.';

      if (response.status === 404) {
        userMessage = 'Ticket type not found. It may have already been deleted. Please refresh the page.';
      } else if (response.status === 400) {
        userMessage = errorData.message || 'Cannot delete this ticket type. It may be in use.';
      } else if (response.status === 500) {
        const errorText = JSON.stringify(errorData);
        if (errorText.includes('Network error') || errorText.includes('Unable to reach') || errorText.includes('ECONNREFUSED')) {
          userMessage = 'Unable to connect to the server. Please check your internet connection and ensure the backend server is running.';
        } else {
          userMessage = 'A server error occurred. Please try again in a few moments. If the problem persists, please contact support.';
        }
      } else if (response.status === 401 || response.status === 403) {
        userMessage = 'Authentication error. Please refresh the page and log in again.';
      } else if (response.status >= 500) {
        userMessage = 'The server is temporarily unavailable. Please try again later.';
      } else if (errorData.message) {
        userMessage = errorData.message;
      }

      return { success: false, error: userMessage };
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
    try {
        const url = `${APP_URL}/api/proxy/event-details/${eventId}`;
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) {
            // If it's a 500 error, it might be a backend connection issue
            if (response.status === 500) {
                try {
                    // Proxy handler returns JSON errors, so parse as JSON
                    const errorJson = await response.json();
                    const errorMessage = errorJson.error || errorJson.details || errorJson.message || '';
                    // Check if it's a network/backend connection error
                    if (errorMessage.includes('Network error') || errorMessage.includes('Unable to reach') || errorMessage.includes('authentication server') || errorMessage.includes('ECONNREFUSED')) {
                        throw new Error('Network error: Unable to reach backend server. Please ensure the backend is running.');
                    }
                } catch (jsonError: any) {
                    // If JSON parsing fails or it's a network error, re-throw network errors
                    if (jsonError?.message?.includes('Network error')) {
                        throw jsonError;
                    }
                }
            }
            return null;
        }
        return response.json();
    } catch (error: any) {
        // Re-throw network errors so they can be handled by the page
        if (error?.message?.includes('Network error') || error?.message?.includes('Unable to reach') || error?.message?.includes('fetch failed') || error?.message?.includes('ECONNREFUSED')) {
            throw error;
        }
        // For other errors, return null (graceful degradation)
        return null;
    }
}

export async function fetchTicketTypesForTicketListPage(eventId: number): Promise<EventTicketTypeDTO[]> {
    try {
        const url = `${APP_URL}/api/proxy/event-ticket-types?eventId.equals=${eventId}`;
        const response = await fetch(url, { cache: 'no-store' });
        if (!response.ok) {
            // If it's a 500 error, it might be a backend connection issue
            if (response.status === 500) {
                try {
                    // Proxy handler returns JSON errors, so parse as JSON
                    const errorJson = await response.json();
                    const errorMessage = errorJson.error || errorJson.details || errorJson.message || '';
                    // Check if it's a network/backend connection error
                    if (errorMessage.includes('Network error') || errorMessage.includes('Unable to reach') || errorMessage.includes('authentication server') || errorMessage.includes('ECONNREFUSED')) {
                        throw new Error('Network error: Unable to reach backend server. Please ensure the backend is running.');
                    }
                } catch (jsonError: any) {
                    // If JSON parsing fails or it's a network error, re-throw network errors
                    if (jsonError?.message?.includes('Network error')) {
                        throw jsonError;
                    }
                }
            }
            return [];
        }
        return response.json();
    } catch (error: any) {
        // Re-throw network errors so they can be handled by the page
        if (error?.message?.includes('Network error') || error?.message?.includes('Unable to reach') || error?.message?.includes('fetch failed') || error?.message?.includes('ECONNREFUSED')) {
            throw error;
        }
        // For other errors, return empty array (graceful degradation)
        return [];
    }
}
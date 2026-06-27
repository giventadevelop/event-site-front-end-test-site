import { getAppUrl } from '@/lib/env';
import { withTenantId } from '@/lib/withTenantId';
import type { EventPollDTO, EventPollOptionDTO, EventPollResponseDTO } from '@/types';

const baseUrl = getAppUrl();

// Event Polls API calls
export async function fetchEventPollsServer(filters?: Record<string, any>) {
  try {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    const qs = params.toString();
    const proxyUrl = `${baseUrl}/api/proxy/event-polls${qs ? `?${qs}` : ''}`;
    
    const res = await fetch(proxyUrl, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch polls: ${res.status}`);
    }
    
    const data = await res.json();
    const totalCount = res.headers.get('x-total-count');
    
    return {
      data: Array.isArray(data) ? data : [],
      totalCount: totalCount ? parseInt(totalCount, 10) : (Array.isArray(data) ? data.length : 0)
    };
  } catch (error) {
    console.error('Error fetching event polls:', error);
    return { data: [], totalCount: 0 };
  }
}

export async function fetchEventPollServer(pollId: number) {
  try {
    const proxyUrl = `${baseUrl}/api/proxy/event-polls/${pollId}`;
    
    const res = await fetch(proxyUrl, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch poll: ${res.status}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching event poll:', error);
    return null;
  }
}

export async function createEventPollServer(pollData: Omit<EventPollDTO, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const proxyUrl = `${baseUrl}/api/proxy/event-polls`;
    
    const payload = withTenantId({
      ...pollData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    const res = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Failed to create poll: ${res.status} - ${errorText}`);
      throw new Error(`Failed to create poll: ${res.status} - ${errorText}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error creating event poll:', error);
    throw error;
  }
}

export async function updateEventPollServer(pollId: number, pollData: Partial<EventPollDTO>) {
  try {
    // First fetch the existing poll to preserve required fields
    const existingPoll = await fetchEventPollServer(pollId);
    if (!existingPoll) {
      throw new Error(`Poll with ID ${pollId} not found`);
    }

    const proxyUrl = `${baseUrl}/api/proxy/event-polls/${pollId}`;
    
    const res = await fetch(proxyUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/merge-patch+json' },
      body: JSON.stringify({
        ...pollData,
        id: pollId,
        tenantId: existingPoll.tenantId, // Preserve existing tenantId
        createdAt: existingPoll.createdAt, // Preserve original createdAt
        updatedAt: new Date().toISOString(),
      }),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Failed to update poll: ${res.status} - ${errorText}`);
      throw new Error(`Failed to update poll: ${res.status} - ${errorText}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error updating event poll:', error);
    throw error;
  }
}

export async function deleteEventPollServer(pollId: number) {
  try {
    const proxyUrl = `${baseUrl}/api/proxy/event-polls/${pollId}`;
    
    const res = await fetch(proxyUrl, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!res.ok) {
      throw new Error(`Failed to delete poll: ${res.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting event poll:', error);
    throw error;
  }
}

// Event Poll Options API calls
export async function fetchEventPollOptionServer(optionId: number) {
  try {
    const proxyUrl = `${baseUrl}/api/proxy/event-poll-options/${optionId}`;
    
    const res = await fetch(proxyUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });
    
    if (!res.ok) {
      return null;
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching event poll option:', error);
    return null;
  }
}

export async function fetchEventPollOptionsServer(filters?: Record<string, any>): Promise<EventPollOptionDTO[]> {
  try {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    const qs = params.toString();
    const proxyUrl = `${baseUrl}/api/proxy/event-poll-options${qs ? `?${qs}` : ''}`;
    
    const res = await fetch(proxyUrl, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch poll options: ${res.status}`);
    }
    
    const data = await res.json();
    // Handle paginated response (Spring Data REST returns { content: [...], totalElements: number })
    if (data && typeof data === 'object' && 'content' in data && Array.isArray(data.content)) {
      return data.content;
    }
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching event poll options:', error);
    return [];
  }
}

export async function createEventPollOptionServer(optionData: Omit<EventPollOptionDTO, 'id' | 'createdAt' | 'updatedAt'> & { pollId?: number }) {
  try {
    const proxyUrl = `${baseUrl}/api/proxy/event-poll-options`;
    const { pollId, ...rest } = optionData as { pollId?: number; [key: string]: unknown };
    const payload = withTenantId({
      ...rest,
      poll: pollId != null ? { id: pollId } : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    const res = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Failed to create poll option: ${res.status} - ${errorText}`);
      throw new Error(`Failed to create poll option: ${res.status} - ${errorText}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error creating event poll option:', error);
    throw error;
  }
}

export async function updateEventPollOptionServer(optionId: number, optionData: Partial<EventPollOptionDTO> & { pollId?: number }) {
  try {
    // First fetch the existing poll option to preserve required fields
    const existingOption = await fetchEventPollOptionServer(optionId);
    if (!existingOption) {
      throw new Error(`Poll option with ID ${optionId} not found`);
    }

    const proxyUrl = `${baseUrl}/api/proxy/event-poll-options/${optionId}`;
    const { pollId, ...rest } = optionData as { pollId?: number; [key: string]: unknown };
    const patchBody = {
      ...rest,
      id: optionId,
      tenantId: existingOption.tenantId,
      createdAt: existingOption.createdAt,
      updatedAt: new Date().toISOString(),
    };
    if (pollId != null) {
      (patchBody as Record<string, unknown>).poll = { id: pollId };
    }

    const res = await fetch(proxyUrl, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/merge-patch+json' },
      body: JSON.stringify(patchBody),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Failed to update poll option: ${res.status} - ${errorText}`);
      throw new Error(`Failed to update poll option: ${res.status} - ${errorText}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error updating event poll option:', error);
    throw error;
  }
}

export async function deleteEventPollOptionServer(optionId: number) {
  try {
    const proxyUrl = `${baseUrl}/api/proxy/event-poll-options/${optionId}`;
    
    const res = await fetch(proxyUrl, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!res.ok) {
      throw new Error(`Failed to delete poll option: ${res.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting event poll option:', error);
    throw error;
  }
}

// Event Poll Responses API calls
export async function fetchEventPollResponsesServer(filters?: Record<string, any>) {
  try {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    
    const qs = params.toString();
    const proxyUrl = `${baseUrl}/api/proxy/event-poll-responses${qs ? `?${qs}` : ''}`;
    
    const res = await fetch(proxyUrl, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch poll responses: ${res.status}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error('Error fetching event poll responses:', error);
    return [];
  }
}

export async function createEventPollResponseServer(responseData: Omit<EventPollResponseDTO, 'id' | 'createdAt' | 'updatedAt'>) {
  try {
    const proxyUrl = `${baseUrl}/api/proxy/event-poll-responses`;
    
    // Convert ID fields to relationship objects as expected by backend
    // Backend API schema now includes responseValue and isAnonymous fields
    const payload = withTenantId({
      comment: responseData.comment,
      responseValue: responseData.responseValue,
      isAnonymous: responseData.isAnonymous,
      poll: responseData.pollId ? { id: responseData.pollId } : undefined,
      pollOption: responseData.pollOptionId ? { id: responseData.pollOptionId } : undefined,
      user: responseData.userId ? { id: responseData.userId } : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    console.log('[CREATE POLL RESPONSE] Request data:', responseData);
    console.log('[CREATE POLL RESPONSE] Final payload:', payload);
    
    const res = await fetch(proxyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Failed to create poll response: ${res.status} - ${errorText}`);
      throw new Error(`Failed to create poll response: ${res.status} - ${errorText}`);
    }
    
    const result = await res.json();
    console.log('[CREATE POLL RESPONSE] Success:', result);
    return result;
  } catch (error) {
    console.error('Error creating event poll response:', error);
    throw error;
  }
}

export async function deleteEventPollResponseServer(responseId: number) {
  try {
    const proxyUrl = `${baseUrl}/api/proxy/event-poll-responses/${responseId}`;
    
    const res = await fetch(proxyUrl, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!res.ok) {
      throw new Error(`Failed to delete poll response: ${res.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting event poll response:', error);
    throw error;
  }
}


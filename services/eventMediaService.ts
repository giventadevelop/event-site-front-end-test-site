import type { EventMediaDTO } from '@/types';

export const eventMediaService = {
  async fetchById(id: number): Promise<EventMediaDTO> {
    const response = await fetch(`/api/proxy/event-medias/${id}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
        'X-Tenant-ID': getCurrentTenantId(),
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    return await response.json();
  },

  async partialUpdate(id: number, fullDto: EventMediaDTO): Promise<EventMediaDTO> {
    console.log('PATCH EventMediaDTO being sent:', fullDto);
    const response = await fetch(`/api/proxy/event-medias/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/merge-patch+json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
        'X-Tenant-ID': getCurrentTenantId(),
      },
      body: JSON.stringify(fullDto),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    return await response.json();
  }
};

function getAuthToken(): string {
  return localStorage.getItem('auth_token') || '';
}
function getCurrentTenantId(): string {
  return localStorage.getItem('tenant_id') || '';
}
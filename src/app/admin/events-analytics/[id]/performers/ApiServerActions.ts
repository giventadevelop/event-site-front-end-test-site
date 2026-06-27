import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getAppUrl, getApiBaseUrl } from '@/lib/env';
import { withTenantId } from '@/lib/withTenantId';
import type { EventFeaturedPerformersDTO } from '@/types';

// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}
const baseUrl = getAppUrl();

export async function fetchEventFeaturedPerformersServer(eventId: number) {
  const params = new URLSearchParams();
  params.append('eventId.equals', eventId.toString());

  const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-featured-performers?${params.toString()}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch event featured performers: ${response.statusText}`);
  }

  return await response.json();
}

export async function fetchEventFeaturedPerformerServer(id: number) {
  const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-featured-performers/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch event featured performer: ${response.statusText}`);
  }

  return await response.json();
}

export async function createEventFeaturedPerformerServer(performer: Omit<EventFeaturedPerformersDTO, 'id' | 'createdAt' | 'updatedAt'>) {
  // Ensure performanceDurationMinutes is at least 1 (backend validation requirement)
  const currentTime = new Date().toISOString();
  
  // Helper function to convert empty strings to null for URL fields
  const cleanUrlField = (value: string | undefined | null): string | null => {
    return (value && value.trim() !== '') ? value : null;
  };
  
  const payload = withTenantId({
    ...performer,
    createdAt: currentTime,
    updatedAt: currentTime,
    performanceDurationMinutes: Math.max(1, performer.performanceDurationMinutes || 1),
    // Convert empty URL fields to null to satisfy database constraints
    facebookUrl: cleanUrlField(performer.facebookUrl),
    twitterUrl: cleanUrlField(performer.twitterUrl),
    instagramUrl: cleanUrlField(performer.instagramUrl),
    youtubeUrl: cleanUrlField(performer.youtubeUrl),
    linkedinUrl: cleanUrlField(performer.linkedinUrl),
    tiktokUrl: cleanUrlField(performer.tiktokUrl),
    websiteUrl: cleanUrlField(performer.websiteUrl),
    portraitImageUrl: cleanUrlField(performer.portraitImageUrl),
    performanceImageUrl: cleanUrlField(performer.performanceImageUrl),
    galleryImageUrls: cleanUrlField(performer.galleryImageUrls),
  });
  
  const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-featured-performers`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create event featured performer: ${errorText}`);
  }
  
  return await response.json();
}

export async function updateEventFeaturedPerformerServer(id: number, performer: Partial<EventFeaturedPerformersDTO>) {
  // Helper function to convert empty strings to null for URL fields
  const cleanUrlField = (value: string | undefined | null): string | null => {
    return (value && value.trim() !== '') ? value : null;
  };
  
  const payload = withTenantId({ 
    ...performer, 
    id,
    // Convert empty URL fields to null to satisfy database constraints
    facebookUrl: performer.facebookUrl ? cleanUrlField(performer.facebookUrl) : undefined,
    twitterUrl: performer.twitterUrl ? cleanUrlField(performer.twitterUrl) : undefined,
    instagramUrl: performer.instagramUrl ? cleanUrlField(performer.instagramUrl) : undefined,
    youtubeUrl: performer.youtubeUrl ? cleanUrlField(performer.youtubeUrl) : undefined,
    linkedinUrl: performer.linkedinUrl ? cleanUrlField(performer.linkedinUrl) : undefined,
    tiktokUrl: performer.tiktokUrl ? cleanUrlField(performer.tiktokUrl) : undefined,
    websiteUrl: performer.websiteUrl ? cleanUrlField(performer.websiteUrl) : undefined,
    portraitImageUrl: performer.portraitImageUrl ? cleanUrlField(performer.portraitImageUrl) : undefined,
    performanceImageUrl: performer.performanceImageUrl ? cleanUrlField(performer.performanceImageUrl) : undefined,
    galleryImageUrls: performer.galleryImageUrls ? cleanUrlField(performer.galleryImageUrls) : undefined,
  });
  
  const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-featured-performers/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify(payload),
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update event featured performer: ${errorText}`);
  }
  
  return await response.json();
}

export async function deleteEventFeaturedPerformerServer(id: number) {
  const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-featured-performers/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete event featured performer: ${errorText}`);
  }

  return true;
}

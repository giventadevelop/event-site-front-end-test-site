import { getAppUrl, getApiBaseUrl } from '@/lib/env';
import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { withTenantId } from '@/lib/withTenantId';
import type { EventSponsorsDTO, EventSponsorsJoinDTO } from '@/types';

// Event Sponsors (available sponsors) - with pagination and filtering
export async function fetchEventSponsorsServer(page = 0, size = 10, searchTerm = '') {
  try {
    console.log('🔍 Fetching available sponsors...', { page, size, searchTerm });

    const baseUrl = getAppUrl();

    // Build query parameters
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort: 'name,asc'
    });

    if (searchTerm.trim()) {
      params.append('name.contains', searchTerm.trim());
    }

    const response = await fetch(`${baseUrl}/api/proxy/event-sponsors?${params.toString()}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      console.warn('❌ Failed to fetch event sponsors:', response.status, response.statusText);
      throw new Error(`Failed to fetch event sponsors: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Fetched available sponsors:', data);

    // According to Swagger, /api/event-sponsors returns a simple array, not paginated object
    if (Array.isArray(data)) {
      // Apply client-side pagination since backend returns all records
      const startIndex = page * size;
      const endIndex = startIndex + size;
      const paginatedData = data.slice(startIndex, endIndex);

      return {
        content: paginatedData,
        totalElements: data.length,
        totalPages: Math.ceil(data.length / size),
        currentPage: page,
        pageSize: size
      };
    }

    // Fallback for other response formats (shouldn't happen according to Swagger)
    return {
      content: data.content || data.data || data.results || [],
      totalElements: data.totalElements || data.total || 0,
      totalPages: data.totalPages || Math.ceil((data.totalElements || data.total || 0) / size)
    };
  } catch (error) {
    console.warn('❌ Error fetching event sponsors:', error);
    return { content: [], totalElements: 0, totalPages: 0 };
  }
}

export async function fetchEventSponsorServer(id: number) {
  const baseUrl = getAppUrl();
  const response = await fetch(`${baseUrl}/api/proxy/event-sponsors/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch event sponsor: ${response.statusText}`);
  }

  return await response.json();
}

export async function createEventSponsorServer(sponsor: Omit<EventSponsorsDTO, 'id' | 'createdAt' | 'updatedAt'>) {
  console.log('🔍 createEventSponsorServer input:', sponsor);

  // Validate required fields before processing
  if (!sponsor.name || !sponsor.name.trim()) {
    throw new Error('Sponsor name is required and cannot be empty');
  }

  if (!sponsor.type || !sponsor.type.trim()) {
    throw new Error('Sponsor type is required and cannot be empty');
  }

  // Helper function to convert empty strings to null for URL fields
  const cleanUrlField = (value: string | undefined | null): string | null => {
    return (value && value.trim() !== '') ? value : null;
  };

  const currentTime = new Date().toISOString();

  // Build the base payload with all required fields explicitly set
  const basePayload = {
    name: sponsor.name.trim(),
    type: sponsor.type.trim(),
    isActive: sponsor.isActive !== undefined ? sponsor.isActive : true,
    priorityRanking: sponsor.priorityRanking !== undefined ? sponsor.priorityRanking : 1, // Default to 1 if not provided
    createdAt: currentTime,
    updatedAt: currentTime,
    // Optional fields (convert undefined to null for backend compatibility)
    companyName: sponsor.companyName?.trim() || null,
    tagline: sponsor.tagline?.trim() || null,
    description: sponsor.description?.trim() || null,
    contactEmail: sponsor.contactEmail?.trim() || null,
    contactPhone: sponsor.contactPhone?.trim() || null,
    // Convert empty URL fields to null to satisfy database constraints
    websiteUrl: cleanUrlField(sponsor.websiteUrl),
    logoUrl: cleanUrlField(sponsor.logoUrl),
    heroImageUrl: cleanUrlField(sponsor.heroImageUrl),
    bannerImageUrl: cleanUrlField(sponsor.bannerImageUrl),
    facebookUrl: cleanUrlField(sponsor.facebookUrl),
    instagramUrl: cleanUrlField(sponsor.instagramUrl),
    twitterUrl: cleanUrlField(sponsor.twitterUrl),
    linkedinUrl: cleanUrlField(sponsor.linkedinUrl),
    youtubeUrl: cleanUrlField(sponsor.youtubeUrl),
    tiktokUrl: cleanUrlField(sponsor.tiktokUrl),
  };

  // Don't apply withTenantId here since the proxy will handle it
  const payload = basePayload;

  console.log('🔍 Final payload being sent to proxy:', JSON.stringify(payload, null, 2));

  const baseUrl = getAppUrl();
  const response = await fetch(`${baseUrl}/api/proxy/event-sponsors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create event sponsor: ${errorText}`);
  }

  return await response.json();
}

export async function updateEventSponsorServer(id: number, sponsor: Partial<EventSponsorsDTO>) {
  // Helper function to convert empty strings to null for URL fields
  const cleanUrlField = (value: string | undefined | null): string | null => {
    return (value && value.trim() !== '') ? value : null;
  };

  const currentTime = new Date().toISOString();
// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}

  // Direct backend call pattern for PATCH/PUT operations
  const payload = withTenantId({
    ...sponsor,
    id, // CRITICAL: Always include the id field for PATCH/PUT operations
    updatedAt: currentTime,
    // Convert empty URL fields to null to satisfy database constraints
    websiteUrl: sponsor.websiteUrl ? cleanUrlField(sponsor.websiteUrl) : undefined,
    logoUrl: sponsor.logoUrl ? cleanUrlField(sponsor.logoUrl) : undefined,
    heroImageUrl: sponsor.heroImageUrl ? cleanUrlField(sponsor.heroImageUrl) : undefined,
    bannerImageUrl: sponsor.bannerImageUrl ? cleanUrlField(sponsor.bannerImageUrl) : undefined,
    facebookUrl: sponsor.facebookUrl ? cleanUrlField(sponsor.facebookUrl) : undefined,
    instagramUrl: sponsor.instagramUrl ? cleanUrlField(sponsor.instagramUrl) : undefined,
    twitterUrl: sponsor.twitterUrl ? cleanUrlField(sponsor.twitterUrl) : undefined,
    linkedinUrl: sponsor.linkedinUrl ? cleanUrlField(sponsor.linkedinUrl) : undefined,
    youtubeUrl: sponsor.youtubeUrl ? cleanUrlField(sponsor.youtubeUrl) : undefined,
    tiktokUrl: sponsor.tiktokUrl ? cleanUrlField(sponsor.tiktokUrl) : undefined,
  });

  console.log('🔍 PATCH payload being sent:', JSON.stringify(payload, null, 2));

  const response = await fetchWithJwtRetry(`${getApiBase()}/api/event-sponsors/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update event sponsor: ${errorText}`);
  }

  return await response.json();
}

export async function deleteEventSponsorServer(id: number) {
  const baseUrl = getAppUrl();
  const response = await fetch(`${baseUrl}/api/proxy/event-sponsors/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete event sponsor: ${errorText}`);
  }

  return true;
}

// Event Sponsors Join (sponsor assignments to events)
export async function fetchEventSponsorsJoinServer(eventId: number) {
  console.log('🔍 Fetching event sponsors for event ID:', eventId);
  const baseUrl = getAppUrl();
  console.log('🔍 Full URL:', `${baseUrl}/api/proxy/event-sponsors-join/event/${eventId}`);

  // Use the specific endpoint for getting sponsors by event ID
  const response = await fetch(`${baseUrl}/api/proxy/event-sponsors-join/event/${eventId}`, {
    cache: 'no-store',
  });

  console.log('🔍 Response status:', response.status);
  console.log('🔍 Response ok:', response.ok);

  if (!response.ok) {
    console.error('❌ Failed to fetch event sponsors join with specific endpoint:', response.status, response.statusText);
    const errorText = await response.text();
    console.error('❌ Error response body:', errorText);

    // Try fallback with generic endpoint and query parameters
    console.log('🔄 Trying fallback with generic endpoint...');
    const params = new URLSearchParams();
    params.append('eventId.equals', eventId.toString());

    const fallbackResponse = await fetch(`${baseUrl}/api/proxy/event-sponsors-join?${params.toString()}`, {
      cache: 'no-store',
    });

    if (!fallbackResponse.ok) {
      console.error('❌ Fallback also failed:', fallbackResponse.status, fallbackResponse.statusText);
      throw new Error(`Failed to fetch event sponsors join: ${response.statusText}`);
    }

    const fallbackData = await fallbackResponse.json();
    console.log('✅ Fallback data received:', fallbackData);

    // Handle fallback data structure
    if (!Array.isArray(fallbackData)) {
      if (fallbackData && Array.isArray(fallbackData.content)) {
        return fallbackData.content;
      } else if (fallbackData && Array.isArray(fallbackData.data)) {
        return fallbackData.data;
      } else if (fallbackData && Array.isArray(fallbackData.results)) {
        return fallbackData.results;
      }
    }

    return fallbackData;
  }

  const data = await response.json();
  console.log('✅ Fetched event sponsors:', data);
  console.log('✅ Data is array:', Array.isArray(data));
  console.log('✅ Data length:', Array.isArray(data) ? data.length : 'Not an array');
  console.log('🔍 Full response data structure:', JSON.stringify(data, null, 2));

  // If data is not an array, try to extract the array from it
  let sponsorsArray = data;
  if (!Array.isArray(data)) {
    console.log('⚠️ Data is not an array, checking for embedded array...');
    if (data && Array.isArray(data.content)) {
      console.log('✅ Found content array with length:', data.content.length);
      sponsorsArray = data.content;
    } else if (data && Array.isArray(data.data)) {
      console.log('✅ Found data array with length:', data.data.length);
      sponsorsArray = data.data;
    } else if (data && Array.isArray(data.results)) {
      console.log('✅ Found results array with length:', data.results.length);
      sponsorsArray = data.results;
    }
  }

  // Populate sponsor details for each join record
  console.log('🔄 Populating sponsor details...');
  const populatedSponsors = await Promise.all(
    sponsorsArray.map(async (joinRecord: any) => {
      if (joinRecord.sponsor && joinRecord.sponsor.id && !joinRecord.sponsor.name) {
        console.log('🔍 Fetching sponsor details for ID:', joinRecord.sponsor.id);
        try {
          const sponsorResponse = await fetch(`${baseUrl}/api/proxy/event-sponsors/${joinRecord.sponsor.id}`, {
            cache: 'no-store',
          });

          if (sponsorResponse.ok) {
            const sponsorDetails = await sponsorResponse.json();
            console.log('✅ Fetched sponsor details:', sponsorDetails);
            return {
              ...joinRecord,
              sponsor: sponsorDetails
            };
          } else {
            console.warn('⚠️ Failed to fetch sponsor details for ID:', joinRecord.sponsor.id);
          }
        } catch (error) {
          console.warn('⚠️ Error fetching sponsor details:', error);
        }
      }
      return joinRecord;
    })
  );

  console.log('✅ Populated sponsors:', populatedSponsors);
  return populatedSponsors;
}

export async function fetchEventSponsorJoinServer(id: number) {
  const baseUrl = getAppUrl();
  const response = await fetch(`${baseUrl}/api/proxy/event-sponsors-join/${id}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch event sponsor join: ${response.statusText}`);
  }

  return await response.json();
}

export async function createEventSponsorJoinServer(sponsorJoin: Omit<EventSponsorsJoinDTO, 'id' | 'createdAt' | 'updatedAt'>) {
  const baseUrl = getAppUrl();
  const currentTime = new Date().toISOString();
  // Don't apply withTenantId here since the proxy will handle it
  const payload = {
    ...sponsorJoin,
    createdAt: currentTime,
    updatedAt: currentTime,
  };

  const response = await fetch(`${baseUrl}/api/proxy/event-sponsors-join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create event sponsor join: ${errorText}`);
  }

  return await response.json();
}

export async function updateEventSponsorJoinServer(id: number, sponsorJoin: Partial<EventSponsorsJoinDTO>) {
  const baseUrl = getAppUrl();
  // Don't apply withTenantId here since the proxy will handle it
  const payload = { ...sponsorJoin, id };

  const response = await fetch(`${baseUrl}/api/proxy/event-sponsors-join/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/merge-patch+json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update event sponsor join: ${errorText}`);
  }

  return await response.json();
}

export async function deleteEventSponsorJoinServer(id: number) {
  const baseUrl = getAppUrl();
  const response = await fetch(`${baseUrl}/api/proxy/event-sponsors-join/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to delete event sponsor join: ${errorText}`);
  }

  return true;
}


// Get available sponsors (not assigned to current event) with pagination and search
export async function fetchAvailableSponsorsServer(eventId: number, page = 0, size = 20, searchTerm = '') {
  try {
    console.log('🔍 Fetching available sponsors for event ID:', eventId, { page, size, searchTerm });

    // Step 1: Get all sponsors assigned to the current event
    const assignedSponsors = await fetchEventSponsorsJoinServer(eventId);
    const assignedSponsorIds = new Set(assignedSponsors.map((join: any) => join.sponsor?.id).filter(Boolean));
    console.log('🔍 Sponsor IDs assigned to current event:', Array.from(assignedSponsorIds));

    // Step 2: Get all sponsors from the master sponsors table
    console.log('🔄 Fetching all sponsors from master table...');

    // Try to fetch from the API first
    let allSponsors = [];
    try {
      const allSponsorsResponse = await fetchEventSponsorsServer(0, 20, ''); // Fetch sponsors with pagination
      allSponsors = allSponsorsResponse.content || [];
      console.log('✅ Fetched', allSponsors.length, 'total sponsors from master table via API');
    } catch (error) {
      console.warn('⚠️ API fetch failed, using mock data:', error instanceof Error ? error.message : String(error));
      // Fallback to mock data if API fails
      allSponsors = [
        { id: 1, name: 'Kerala Tourism Development Corporation', type: 'Title Sponsor', companyName: 'KTDC' },
        { id: 2, name: 'Tata Consultancy Services', type: 'Platinum Sponsor', companyName: 'TCS' },
        { id: 3, name: 'Federal Bank', type: 'Gold Sponsor', companyName: 'Federal Bank' },
        { id: 4, name: 'Wipro Technologies', type: 'Silver Sponsor', companyName: 'Wipro' },
        { id: 5, name: 'Infosys Limited', type: 'Bronze Sponsor', companyName: 'Infosys' },
        { id: 6, name: 'HCL Technologies', type: 'Bronze Sponsor', companyName: 'HCL' },
        { id: 7, name: 'Tech Mahindra', type: 'Bronze Sponsor', companyName: 'Tech Mahindra' },
        { id: 8, name: 'Cognizant', type: 'Bronze Sponsor', companyName: 'Cognizant' },
        { id: 9, name: 'Accenture', type: 'Bronze Sponsor', companyName: 'Accenture' },
        { id: 4801, name: 'Gain Joseph', type: 'Gold', companyName: null },
        { id: 4802, name: 'GAIN JOSEPH', type: 'Silver', companyName: 'Giventa Inc.' }
      ];
      console.log('✅ Using mock data with', allSponsors.length, 'sponsors');
    }

    // Step 3: Filter out sponsors that are assigned to the current event
    const availableSponsors = allSponsors.filter((sponsor: any) =>
      !assignedSponsorIds.has(sponsor.id)
    );

    console.log('🔍 Available sponsors (not assigned to current event):', availableSponsors.length);

    // Step 4: Apply search filter if provided
    const filteredSponsors = searchTerm
      ? availableSponsors.filter((sponsor: any) =>
          sponsor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sponsor.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sponsor.type?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : availableSponsors;

    console.log('✅ Available sponsors after search filtering:', filteredSponsors.length);
    console.log('🔍 Available sponsor IDs:', filteredSponsors.map((sponsor: any) => sponsor.id));

    // Step 5: Apply pagination to the filtered results
    const startIndex = page * size;
    const endIndex = startIndex + size;
    const paginatedSponsors = filteredSponsors.slice(startIndex, endIndex);

    return {
      content: paginatedSponsors,
      totalElements: filteredSponsors.length,
      totalPages: Math.ceil(filteredSponsors.length / size),
      assignedCount: assignedSponsorIds.size,
      totalSponsors: allSponsors.length
    };
  } catch (error) {
    console.warn('❌ Error fetching available sponsors:', error);
    return { content: [], totalElements: 0, totalPages: 0, assignedCount: 0, totalSponsors: 0 };
  }
}

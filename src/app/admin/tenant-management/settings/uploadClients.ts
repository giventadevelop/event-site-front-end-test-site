import { getAppUrl } from '@/lib/env';

/**
 * Client-side upload helpers for tenant settings assets.
 * Must only be imported from client components (uses browser FormData/fetch).
 */

export async function uploadEmailFooterHtmlClient(
  file: File
): Promise<{ url: string }> {
  const baseUrl = getAppUrl();
  const formData = new FormData();

  formData.append('file', file);

  const url = `${baseUrl}/api/proxy/tenant-settings/upload/email-footer-html`;

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(
      `[Client] Error uploading email footer HTML: ${response.status} ${response.statusText}`,
      errorBody
    );
    throw new Error(`Failed to upload email footer HTML. Status: ${response.status}`);
  }

  const result = await response.json();
  return {
    url: result.emailFooterHtmlUrl || result.url || '',
  };
}

export async function uploadTenantLogoClient(
  file: File
): Promise<{ url: string }> {
  const baseUrl = getAppUrl();
  const formData = new FormData();

  formData.append('file', file);

  const url = `${baseUrl}/api/proxy/tenant-settings/upload/tenant-logo`;

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(
      `[Client] Error uploading tenant logo: ${response.status} ${response.statusText}`,
      errorBody
    );
    throw new Error(`Failed to upload tenant logo. Status: ${response.status}`);
  }

  const result = await response.json();
  return {
    url: result.logoImageUrl || result.url || '',
  };
}

export async function uploadEmailHeaderImageClient(
  file: File
): Promise<{ url: string }> {
  const baseUrl = getAppUrl();
  const formData = new FormData();

  formData.append('file', file);

  const url = `${baseUrl}/api/proxy/tenant-settings/upload/email-header-image`;

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(
      `[Client] Error uploading email header image: ${response.status} ${response.statusText}`,
      errorBody
    );
    throw new Error(`Failed to upload email header image. Status: ${response.status}`);
  }

  const result = await response.json();
  return {
    url: result.emailHeaderImageUrl || result.url || '',
  };
}

function tenantUploadQuery(tenantIdForUpload?: string): string {
  if (!tenantIdForUpload?.trim()) return '';
  return `?tenantId=${encodeURIComponent(tenantIdForUpload.trim())}`;
}

/**
 * Upload default homepage hero image.
 * Optional tenantIdForUpload scopes S3 path for super-admin editing another tenant.
 */
export async function uploadDefaultHeroImageClient(
  file: File,
  tenantIdForUpload?: string
): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const url = `/api/proxy/tenant-settings/upload/default-hero-image${tenantUploadQuery(tenantIdForUpload)}`;

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(
      `[Client] Error uploading default hero image: ${response.status} ${response.statusText}`,
      errorBody
    );
    throw new Error(`Failed to upload hero image. Status: ${response.status}`);
  }

  const result = await response.json();
  return {
    url:
      result.defaultHeroImageUrl ||
      result.url ||
      result.imageUrl ||
      '',
  };
}

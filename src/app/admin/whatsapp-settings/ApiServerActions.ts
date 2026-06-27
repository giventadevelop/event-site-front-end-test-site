"use server";

import { fetchWithJwtRetry } from '@/lib/proxyHandler';
import { getAppUrl, getApiBaseUrl } from '@/lib/env';
import { withTenantId } from '@/lib/withTenantId';
import { TenantSettingsDTO, TwilioCredentials, ConnectionTestResult, MessageTemplate } from '@/types';

// Lazy getter — evaluated at call time, not module load time (critical for Lambda cold starts)
function getApiBase() {
  return getApiBaseUrl();
}

/**
 * Update WhatsApp settings in tenant configuration
 */
export async function updateWhatsAppSettingsServer(settings: Partial<TenantSettingsDTO>): Promise<TenantSettingsDTO | null> {
  try {
    const baseUrl = getAppUrl();
    const payload = withTenantId({
      ...settings,
      updatedAt: new Date().toISOString(),
    });

    const response = await fetchWithJwtRetry(`${baseUrl}/api/proxy/tenant-settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/merge-patch+json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to update WhatsApp settings:', errorText);
      throw new Error(`Failed to update WhatsApp settings: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating WhatsApp settings:', error);
    throw error;
  }
}

/**
 * Test WhatsApp connection using Twilio credentials
 */
export async function testWhatsAppConnectionServer(credentials: TwilioCredentials): Promise<ConnectionTestResult> {
  try {
    const baseUrl = getAppUrl();
    const payload = withTenantId({
      ...credentials,
      testAt: new Date().toISOString(),
    });

    const response = await fetchWithJwtRetry(`${baseUrl}/api/proxy/whatsapp/test-connection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('WhatsApp connection test failed:', errorText);
      return {
        success: false,
        message: `Connection test failed: ${response.status}`,
        timestamp: new Date().toISOString(),
        details: {
          accountStatus: 'unknown',
          whatsappStatus: 'unknown',
          webhookStatus: 'unknown',
        },
      };
    }

    return await response.json();
  } catch (error) {
    console.error('Error testing WhatsApp connection:', error);
    return {
      success: false,
      message: `Connection test error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date().toISOString(),
      details: {
        accountStatus: 'error',
        whatsappStatus: 'error',
        webhookStatus: 'error',
      },
    };
  }
}

/**
 * Retrieve WhatsApp message templates from Twilio
 */
export async function getWhatsAppTemplatesServer(): Promise<MessageTemplate[]> {
  try {
    const baseUrl = getAppUrl();
    const response = await fetchWithJwtRetry(`${baseUrl}/api/proxy/whatsapp/templates`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to fetch WhatsApp templates:', response.status);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching WhatsApp templates:', error);
    return [];
  }
}

/**
 * Save Twilio credentials to tenant settings
 */
export async function saveTwilioCredentialsServer(credentials: TwilioCredentials): Promise<TenantSettingsDTO | null> {
  try {
    const baseUrl = getAppUrl();
    const payload = withTenantId({
      whatsappSettings: {
        twilioCredentials: credentials,
        isEnabled: true,
        updatedAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    });

    const response = await fetchWithJwtRetry(`${baseUrl}/api/proxy/tenant-settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/merge-patch+json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to save Twilio credentials:', errorText);
      throw new Error(`Failed to save Twilio credentials: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving Twilio credentials:', error);
    throw error;
  }
}

/**
 * Update webhook configuration for WhatsApp
 */
export async function updateWhatsAppWebhookServer(webhookUrl: string, webhookToken?: string): Promise<TenantSettingsDTO | null> {
  try {
    const baseUrl = getAppUrl();
    const payload = withTenantId({
      whatsappSettings: {
        webhookUrl,
        webhookToken,
        updatedAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    });

    const response = await fetchWithJwtRetry(`${baseUrl}/api/proxy/tenant-settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/merge-patch+json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to update WhatsApp webhook:', errorText);
      throw new Error(`Failed to update WhatsApp webhook: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating WhatsApp webhook:', error);
    throw error;
  }
}

/**
 * Fetch current tenant settings including WhatsApp configuration
 */
export async function fetchTenantSettingsServer(): Promise<TenantSettingsDTO | null> {
  try {
    const baseUrl = getAppUrl();
    const response = await fetchWithJwtRetry(`${baseUrl}/api/proxy/tenant-settings`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to fetch tenant settings:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching tenant settings:', error);
    return null;
  }
}

/**
 * Enable or disable WhatsApp integration
 */
export async function toggleWhatsAppIntegrationServer(isEnabled: boolean): Promise<TenantSettingsDTO | null> {
  try {
    const baseUrl = getAppUrl();
    const payload = withTenantId({
      whatsappSettings: {
        isEnabled,
        updatedAt: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    });

    const response = await fetchWithJwtRetry(`${baseUrl}/api/proxy/tenant-settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/merge-patch+json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to toggle WhatsApp integration:', errorText);
      throw new Error(`Failed to toggle WhatsApp integration: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error toggling WhatsApp integration:', error);
    throw error;
  }
}

















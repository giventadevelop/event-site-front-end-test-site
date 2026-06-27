/**
 * API Client with Interceptors
 *
 * This client handles all API requests to the backend with:
 * - Automatic token injection
 * - Token refresh on 401 errors
 * - Tenant ID header injection
 * - Consistent error handling
 */

import { tokenService } from '../auth';
import { getTenantId, getApiBaseUrl } from '@/lib/env';

interface RequestConfig extends RequestInit {
  skipAuth?: boolean;
  skipTenant?: boolean;
}

export class ApiClient {
  private static instance: ApiClient;
  private baseURL: string;
  private isRefreshing: boolean = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  private constructor() {
    this.baseURL = getApiBaseUrl();
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient();
    }
    return ApiClient.instance;
  }

  /**
   * Subscribe to token refresh completion
   */
  private subscribeTokenRefresh(callback: (token: string) => void): void {
    this.refreshSubscribers.push(callback);
  }

  /**
   * Notify all subscribers when token refresh completes
   */
  private onTokenRefreshed(token: string): void {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  /**
   * Add authentication and tenant headers to request
   */
  private addHeaders(config: RequestConfig): Headers {
    const headers = new Headers(config.headers);

    // Add Content-Type if not set
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    // Add Authorization header
    if (!config.skipAuth) {
      const token = tokenService.getAccessToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    // Add Tenant ID header
    if (!config.skipTenant) {
      try {
        const tenantId = getTenantId();
        headers.set('X-Tenant-ID', tenantId);
      } catch (error) {
        console.warn('Tenant ID not configured:', error);
      }
    }

    return headers;
  }

  /**
   * Refresh authentication token
   */
  private async refreshToken(): Promise<string | null> {
    const refreshToken = tokenService.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    try {
      // Call our Next.js API route on same origin (not backend)
      const response = await fetch(`/api/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();

      // Store new tokens
      tokenService.setTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || refreshToken,
        expiresAt: Date.now() + (data.expiresIn || 3600) * 1000,
      });

      return data.accessToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      // Clear tokens on refresh failure
      tokenService.clearTokens();
      return null;
    }
  }

  /**
   * Handle 401 Unauthorized responses with token refresh
   */
  private async handle401(config: RequestConfig): Promise<Response> {
    if (this.isRefreshing) {
      // Wait for ongoing refresh to complete
      return new Promise((resolve) => {
        this.subscribeTokenRefresh(async (token) => {
          // Retry request with new token
          const newHeaders = this.addHeaders(config);
          newHeaders.set('Authorization', `Bearer ${token}`);

          const response = await fetch(config.url as string, {
            ...config,
            headers: newHeaders,
          });
          resolve(response);
        });
      });
    }

    this.isRefreshing = true;

    try {
      const newToken = await this.refreshToken();

      if (!newToken) {
        // Refresh failed, redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/sign-in';
        }
        throw new Error('Authentication failed');
      }

      this.onTokenRefreshed(newToken);
      this.isRefreshing = false;

      // Retry original request with new token
      const newHeaders = this.addHeaders(config);
      newHeaders.set('Authorization', `Bearer ${newToken}`);

      return await fetch(config.url as string, {
        ...config,
        headers: newHeaders,
      });
    } catch (error) {
      this.isRefreshing = false;
      throw error;
    }
  }

  /**
   * Make an API request with interceptors
   */
  async request<T = any>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<T> {
    const isInternalApi = endpoint.startsWith('/api/');
    const url = isInternalApi ? endpoint : `${this.baseURL}${endpoint}`;

    // Add headers via interceptor
    const headers = this.addHeaders(config);

    let response: Response;

    try {
      response = await fetch(url, {
        ...config,
        headers,
        url, // Store URL for potential retry
      } as any);

      // Handle 401 Unauthorized
      if (response.status === 401 && !config.skipAuth) {
        response = await this.handle401({ ...config, url } as any);
      }

      // Handle non-OK responses
      if (!response.ok) {
        // Read body once to avoid "body stream already read"
        const raw = await response.text();
        let errorData: any = null;

        try {
          errorData = raw ? JSON.parse(raw) : null;
        } catch {
          errorData = { message: raw };
        }

        // Log in development only
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[API Client] ${config.method || 'GET'} ${url} failed:`, {
            status: response.status,
            statusText: response.statusText,
            data: errorData
          });
        }

        // Create error without stack trace (prevents Next.js error overlay)
        const error: any = new Error('Authentication failed');
        error.status = response.status;
        error.statusText = response.statusText;
        error.data = errorData;
        error.name = 'ApiError'; // Custom error name

        // Don't include technical details in error message
        // The error message utility will handle user-friendly messaging
        throw error;
      }

      // Parse JSON response
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }

      return await response.text() as any;
    } catch (error: any) {
      // Only log non-API errors (network errors, etc.) in development
      if (process.env.NODE_ENV === 'development' && error.name !== 'ApiError') {
        console.error('API request failed:', error);
      }
      throw error;
    }
  }

  /**
   * Convenience methods
   */
  async get<T = any>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T = any>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

export default ApiClient.getInstance();


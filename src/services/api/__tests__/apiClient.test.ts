/**
 * API Client Unit Tests
 *
 * Tests for API client with interceptors
 */

import { ApiClient } from '../apiClient';
import { tokenService } from '../../auth';

// Mock dependencies
jest.mock('../../auth');
jest.mock('@/lib/env');

global.fetch = jest.fn();

describe('ApiClient', () => {
  let apiClient: ApiClient;
  const mockTokenService = tokenService as jest.Mocked<typeof tokenService>;
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

  beforeEach(() => {
    apiClient = ApiClient.getInstance();
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_API_BASE_URL = 'http://localhost:8080';
  });

  describe('request interceptors', () => {
    it('should add Authorization header when token exists', async () => {
      mockTokenService.getAccessToken.mockReturnValue('token_123');
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'success' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);

      await apiClient.get('/api/test');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/test',
        expect.objectContaining({
          method: 'GET',
        })
      );

      const callArgs = mockFetch.mock.calls[0][1];
      const headers = callArgs?.headers as Headers;
      expect(headers.get('Authorization')).toBe('Bearer token_123');
    });

    it('should add X-Tenant-ID header', async () => {
      mockTokenService.getAccessToken.mockReturnValue('token_123');
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'success' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);

      await apiClient.get('/api/test');

      const callArgs = mockFetch.mock.calls[0][1];
      const headers = callArgs?.headers as Headers;
      expect(headers.get('X-Tenant-ID')).toBeDefined();
    });

    it('should skip auth header when skipAuth is true', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'success' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);

      await apiClient.get('/api/test', { skipAuth: true });

      const callArgs = mockFetch.mock.calls[0][1];
      const headers = callArgs?.headers as Headers;
      expect(headers.get('Authorization')).toBeNull();
    });
  });

  describe('convenience methods', () => {
    beforeEach(() => {
      mockTokenService.getAccessToken.mockReturnValue('token_123');
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ data: 'success' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);
    });

    it('should make GET request', async () => {
      await apiClient.get('/api/test');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/test',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('should make POST request with body', async () => {
      const data = { name: 'Test' };
      await apiClient.post('/api/test', data);

      const callArgs = mockFetch.mock.calls[0][1];
      expect(callArgs?.method).toBe('POST');
      expect(callArgs?.body).toBe(JSON.stringify(data));
    });

    it('should make PUT request with body', async () => {
      const data = { name: 'Updated' };
      await apiClient.put('/api/test', data);

      const callArgs = mockFetch.mock.calls[0][1];
      expect(callArgs?.method).toBe('PUT');
      expect(callArgs?.body).toBe(JSON.stringify(data));
    });

    it('should make PATCH request with body', async () => {
      const data = { name: 'Patched' };
      await apiClient.patch('/api/test', data);

      const callArgs = mockFetch.mock.calls[0][1];
      expect(callArgs?.method).toBe('PATCH');
      expect(callArgs?.body).toBe(JSON.stringify(data));
    });

    it('should make DELETE request', async () => {
      await apiClient.delete('/api/test');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8080/api/test',
        expect.objectContaining({ method: 'DELETE' })
      );
    });
  });

  describe('error handling', () => {
    it('should throw error for non-OK responses', async () => {
      mockTokenService.getAccessToken.mockReturnValue('token_123');
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ message: 'Server error' }),
        headers: new Headers({ 'content-type': 'application/json' }),
      } as Response);

      await expect(apiClient.get('/api/test')).rejects.toThrow('API Error: 500 Internal Server Error');
    });

    it('should handle network errors', async () => {
      mockTokenService.getAccessToken.mockReturnValue('token_123');
      mockFetch.mockRejectedValue(new Error('Network failure'));

      await expect(apiClient.get('/api/test')).rejects.toThrow('Network failure');
    });
  });
});



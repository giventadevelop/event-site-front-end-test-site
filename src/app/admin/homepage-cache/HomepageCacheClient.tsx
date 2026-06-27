'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { refreshHomepageCacheServer } from './ApiServerActions';
import type { TenantSettingsDTO } from '@/app/admin/tenant-management/types';
import { HOMEPAGE_CACHE_INVALIDATE_CHANNEL } from '@/lib/homepageCacheKeys';

interface HomepageCacheClientProps {
  initialSettings: TenantSettingsDTO[];
}

export default function HomepageCacheClient({ initialSettings }: HomepageCacheClientProps) {
  const router = useRouter();
  const [settings, setSettings] = useState(initialSettings);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [reloading, setReloading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setSettings(initialSettings);
    setReloading(false);
  }, [initialSettings]);

  const handleRefresh = async (row: TenantSettingsDTO) => {
    const id = row.id;
    if (id == null) return;
    setLoadingId(id);
    setMessage(null);
    try {
      const result = await refreshHomepageCacheServer(id);
      setMessage({ type: 'success', text: `Cache refreshed for ${row.tenantId}. New version: ${result.version}` });
      setSettings((prev) =>
        prev.map((s) => (s.id === id ? { ...s, homepageCacheVersion: result.version } : s))
      );
      if (typeof BroadcastChannel !== 'undefined') {
        new BroadcastChannel(HOMEPAGE_CACHE_INVALIDATE_CHANNEL).postMessage('invalidate');
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to refresh cache',
      });
    } finally {
      setLoadingId(null);
    }
  };

  const handleReloadFromDb = () => {
    setReloading(true);
    setMessage(null);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      {message && (
        <div
          className={`rounded-lg border p-4 ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <button
          type="button"
          onClick={handleReloadFromDb}
          disabled={reloading}
          className="flex-shrink-0 inline-flex h-10 px-4 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold text-sm items-center justify-center gap-2 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          title="Reload data from database"
          aria-label="Reload data from database"
        >
          {reloading ? (
            <>
              <svg className="animate-spin w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Reloading…</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Reload data from database</span>
            </>
          )}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Tenant ID
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Cache version
              </th>
              <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {settings.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                  No tenant settings found. Create tenant settings first.
                </td>
              </tr>
            ) : (
              settings.map((row) => (
                <tr key={row.id ?? row.tenantId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{row.tenantId}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {typeof row.homepageCacheVersion === 'number' ? row.homepageCacheVersion : '0'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleRefresh(row)}
                      disabled={loadingId !== null}
                      className="flex-shrink-0 inline-flex h-10 px-4 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold text-sm items-center justify-center gap-2 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      title="Refresh cache records for this tenant"
                      aria-label="Refresh cache records for this tenant"
                    >
                      {loadingId === row.id ? (
                        <>
                          <svg
                            className="animate-spin w-5 h-5 text-blue-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          <span>Refreshing…</span>
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-5 h-5 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                          <span>Refresh cache records</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

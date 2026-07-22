import { fetchTenantSettings } from '@/app/admin/tenant-management/settings/ApiServerActions';
import { getTenantId } from '@/lib/env';
import AdminNavigation from '@/components/AdminNavigation';
import HomepageCacheClient from './HomepageCacheClient';
import Link from 'next/link';

export default async function HomepageCachePage() {
  const currentTenantId = getTenantId();
  let initialSettings: Awaited<ReturnType<typeof fetchTenantSettings>>['data'] = [];
  try {
    const result = await fetchTenantSettings(
      { page: 0, pageSize: 100 },
      { tenantId: currentTenantId }
    );
    initialSettings = result.data;
  } catch (err) {
    console.error('[HomepageCachePage] Error fetching tenant settings:', err);
  }

  return (
    <div className="w-full overflow-x-hidden box-border" style={{ paddingTop: '120px' }}>
      <div className="w-full pt-4 sm:pt-6 px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 mb-6 sm:mb-8">
        <div className="max-w-5xl mx-auto px-2.5 sm:px-3 md:px-4 lg:px-6 xl:px-8">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
            <Link
              href="/admin"
              className="flex-shrink-0 h-14 rounded-xl bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
              title="Back to Admin"
              aria-label="Back to Admin"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-200 flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </div>
              <span className="font-semibold text-indigo-700">Back to Admin</span>
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                Cache records
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Refresh the edge-cached homepage payload for this tenant. This bumps the cache version so the next request
                fetches fresh content (cache-busting). Only the current application tenant is shown.
              </p>
            </div>
          </div>
        </div>
        <AdminNavigation currentPage="homepage-cache" />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <HomepageCacheClient initialSettings={initialSettings} />
        </div>
      </div>
    </div>
  );
}

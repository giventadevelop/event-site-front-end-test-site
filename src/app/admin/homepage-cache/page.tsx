import { fetchTenantSettings } from '@/app/admin/tenant-management/settings/ApiServerActions';
import { getTenantId } from '@/lib/env';
import AdminNavigation from '@/components/AdminNavigation';
import HomepageCacheClient from './HomepageCacheClient';

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
      <div className="w-full px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 mb-6 sm:mb-8">
        <AdminNavigation />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Cache records
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Refresh the edge-cached homepage payload for this tenant. This bumps the cache version so the next request
            fetches fresh content (cache-busting). Only the current application tenant is shown.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <HomepageCacheClient initialSettings={initialSettings} />
        </div>
      </div>
    </div>
  );
}

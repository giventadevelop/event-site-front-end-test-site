import { Suspense } from 'react';
import { fetchTenantSettings } from './ApiServerActions';
import TenantSettingsList from '@/app/admin/tenant-management/components/TenantSettingsList';
import AdminNavigation from '@/components/AdminNavigation';
import Link from 'next/link';

export default async function TenantSettingsPage() {
  // Fetch initial data for server-side rendering
  let initialData = [];
  let initialTotalCount = 0;
  let error = null;

  try {
    const result = await fetchTenantSettings(
      { page: 0, pageSize: 10 },
      {}
    );
    initialData = result.data;
    initialTotalCount = result.totalCount;
  } catch (err) {
    console.error('Error fetching tenant settings:', err);
    error = err instanceof Error ? err.message : 'Failed to load settings';
  }

  return (
    <div className="w-full overflow-x-hidden box-border" style={{ paddingTop: '120px' }}>
      {/* Navigation Section - Full Width, Separate Responsive Container */}
      <div className="w-full px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 mb-6 sm:mb-8">
        <AdminNavigation />
      </div>
      {/* Main Content Section - Constrained Width */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8">
        {/* Page Header */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white text-center sm:text-left">Tenant Settings</h1>
              <p className="mt-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 text-center sm:text-left">
                Manage tenant-specific configurations and settings
              </p>
            </div>
            <Link
              href="/admin/tenant-management/settings/new"
              className="flex-shrink-0 h-12 sm:h-14 rounded-xl bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 flex items-center justify-center gap-2 sm:gap-3 transition-all duration-300 hover:scale-105 px-3 sm:px-6"
              title="Create New Settings"
              aria-label="Create New Settings"
            >
              <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-200 dark:bg-blue-700 flex items-center justify-center">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="font-semibold text-blue-700 dark:text-blue-300 text-xs sm:text-sm lg:text-base whitespace-nowrap">Create New Settings</span>
            </Link>
          </div>

          <div className="mt-4 rounded-md bg-blue-50 border border-blue-100 p-3 sm:p-4 text-xs sm:text-sm text-blue-800">
            <p className="font-semibold text-blue-900 mb-1.5">Outbound email sender configuration</p>
            <p>
              Platform <span className="font-semibold">From</span>, optional{' '}
              <span className="font-semibold">Copy-To</span>, and optional{' '}
              <span className="font-semibold">Reply-To</span> addresses (by type such as CONTACT, INFO, TICKETS) are
              managed separately—not on this page. Use{' '}
              <Link
                href="/admin/tenant-email-addresses"
                className="font-semibold text-blue-700 underline hover:text-blue-900"
              >
                Tenant Email Addresses
              </Link>{' '}
              to add or edit verified sender addresses, CC copies, and reply routing for contact forms and other
              outbound mail.
            </p>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400 dark:text-red-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-xs sm:text-sm font-medium text-red-800 dark:text-red-300">
                  Error loading settings
                </h3>
                <div className="mt-2 text-xs sm:text-sm text-red-700 dark:text-red-400">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings List */}
        <Suspense
          fallback={
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 md:p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          }
        >
          <TenantSettingsList
            initialData={initialData}
            initialTotalCount={initialTotalCount}
          />
        </Suspense>

        {/* Quick Stats */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Settings
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {initialTotalCount}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-green-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    User Registration Enabled
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {initialData.filter(setting => setting.allowUserRegistration).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-purple-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    WhatsApp Integration
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {initialData.filter(setting => setting.enableWhatsappIntegration).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-orange-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Email Marketing
                  </dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {initialData.filter(setting => setting.enableEmailMarketing).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

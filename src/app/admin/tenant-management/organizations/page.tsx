import { Suspense } from 'react';
import TenantOrganizationList from '@/app/admin/tenant-management/components/TenantOrganizationList';
import AdminNavigation from '@/components/AdminNavigation';
import Link from 'next/link';

export default async function TenantOrganizationsPage() {
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8" style={{ paddingTop: '120px' }}>
      {/* Header with back button */}
      <div className="max-w-5xl mx-auto flex items-center gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6 pt-4 sm:pt-6 px-2.5 sm:px-3 md:px-4 lg:px-6 xl:px-8">
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
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Tenant Organizations</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-xs sm:text-sm">
            Manage tenant organizations and their configurations.
          </p>
        </div>
      </div>

      <div className="mb-6 sm:mb-8">
        <AdminNavigation currentPage="tenant-organizations" />
      </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 md:p-6">
          <Suspense fallback={
            <div className="flex justify-center items-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">Loading organizations...</p>
              </div>
            </div>
          }>
            <TenantOrganizationList />
          </Suspense>
        </div>
    </div>
  );
}

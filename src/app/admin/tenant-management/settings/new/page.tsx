import { fetchRecentTenantOrganizationsForSelectServer } from '@/app/admin/tenant-management/organizations/organizationSelectServerActions';
import NewTenantSettingsClient from '@/app/admin/tenant-management/settings/new/NewTenantSettingsClient';
import Link from 'next/link';

interface PageProps {
  searchParams: Promise<{ tenantId?: string }> | { tenantId?: string };
}

export default async function NewTenantSettingsPage({ searchParams }: PageProps) {
  const resolvedSearchParams =
    typeof (searchParams as Promise<{ tenantId?: string }>).then === 'function'
      ? await (searchParams as Promise<{ tenantId?: string }>)
      : (searchParams as { tenantId?: string });

  const organizations = await fetchRecentTenantOrganizationsForSelectServer();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ paddingTop: '120px' }}>
      {/* Breadcrumb Navigation */}
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="inline-flex flex-wrap items-center gap-y-3 gap-x-2 md:gap-x-3">
          <li className="inline-flex items-center">
            <Link
              href="/admin"
              className="flex-shrink-0 h-14 rounded-xl bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
              title="Admin Dashboard"
              aria-label="Admin Dashboard"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-200 flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </div>
              <span className="font-semibold text-indigo-700">Admin Dashboard</span>
            </Link>
          </li>
          <li>
            <div className="flex items-center gap-2 md:gap-3">
              <svg className="w-5 h-5 text-indigo-300" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <Link
                href="/admin/tenant-management/settings"
                className="flex-shrink-0 h-14 rounded-xl bg-sky-100 hover:bg-sky-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
                title="Settings"
                aria-label="Settings"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-sky-200 flex items-center justify-center">
                  <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="font-semibold text-sky-700">Settings</span>
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center gap-2 md:gap-3">
              <svg className="w-5 h-5 text-indigo-300" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="flex-shrink-0 h-14 rounded-xl bg-blue-100 flex items-center justify-center gap-3 px-6">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="font-semibold text-blue-700">New Settings</span>
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Settings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Configure settings for a tenant organization. To add a new tenant with an auto-generated ID, create the organization first under{' '}
          <Link href="/admin/tenant-management/organizations/new" className="text-blue-600 hover:text-blue-800 font-medium">
            Organizations → New Organization
          </Link>
          .
        </p>
      </div>

      {/* Form */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Settings Configuration</h2>
        </div>
        <div className="px-6 py-6">
          <NewTenantSettingsClient
            organizations={organizations}
            initialTenantId={resolvedSearchParams.tenantId}
          />
        </div>
      </div>
    </div>
  );
}

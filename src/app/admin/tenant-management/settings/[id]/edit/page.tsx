import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import {
  fetchTenantSetting,
  fetchTenantSettingsByTenantId,
} from '@/app/admin/tenant-management/settings/ApiServerActions';
import { fetchRecentTenantOrganizationsForSelectServer } from '@/app/admin/tenant-management/organizations/organizationSelectServerActions';
import TenantSettingsEditClient from './TenantSettingsEditClient';
import Link from 'next/link';
import {
  getAppScopedTenantId,
  isSatelliteTenantSettingsScope,
} from '@/lib/tenantSettingsScope';
import { parseTenantSettingsTab, tenantSettingsTabQuery } from '@/lib/tenantSettingsTabs';

interface PageProps {
  params: { id: string } | Promise<{ id: string }>;
  searchParams?: { tab?: string } | Promise<{ tab?: string }>;
}

export default async function EditTenantSettingsPage({ params, searchParams }: PageProps) {
  // Await params for Next.js 15+ compatibility
  const resolvedParams = typeof params.then === 'function' ? await params : params;
  const { id } = resolvedParams;
  const resolvedSearchParams =
    searchParams && typeof (searchParams as Promise<{ tab?: string }>).then === 'function'
      ? await searchParams
      : searchParams;
  const initialTab = parseTenantSettingsTab(resolvedSearchParams?.tab);
  const settingsId = parseInt(id);

  if (isNaN(settingsId)) {
    notFound();
  }

  if (isSatelliteTenantSettingsScope()) {
    const configuredTenantId = getAppScopedTenantId();
    const forConfiguredTenant = await fetchTenantSettingsByTenantId(configuredTenantId);
    if (forConfiguredTenant?.id && forConfiguredTenant.id !== settingsId) {
      redirect(`/admin/tenant-management/settings/${forConfiguredTenant.id}/edit${tenantSettingsTabQuery(initialTab)}`);
    }
    if (!forConfiguredTenant) {
      redirect(
        `/admin/tenant-management/settings/new?tenantId=${encodeURIComponent(configuredTenantId)}`
      );
    }
  }

  // Fetch settings data
  let settings = null;
  let organizations = [];
  let error = null;

  try {
    settings = await fetchTenantSetting(settingsId);
    if (!settings) {
      notFound();
    }

    organizations = await fetchRecentTenantOrganizationsForSelectServer();
  } catch (err) {
    console.error('Error fetching settings:', err);
    error = err instanceof Error ? err.message : 'Failed to load settings';
  }

  const organizationName =
    settings?.tenantOrganization?.organizationName?.trim() ||
    organizations.find((org) => org.tenantId === settings?.tenantId)?.organizationName?.trim() ||
    '—';

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-[9.5rem]">
        <div className="mb-8">
          <Link
            href="/admin/tenant-management/settings"
            className="flex-shrink-0 h-14 rounded-xl bg-sky-100 hover:bg-sky-200 inline-flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
            title="Back to Settings"
            aria-label="Back to Settings"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-sky-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </div>
            <span className="font-semibold text-sky-700">Back to Settings</span>
          </Link>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
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
              <h3 className="text-sm font-medium text-red-800">
                Error loading settings
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-[9.5rem]">
      {/* Breadcrumb Navigation — pt-[9.5rem] clears fixed header (8rem) + breathing room */}
      <nav className="flex items-center py-3 mb-6" aria-label="Breadcrumb">
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
          <li>
            <div className="flex items-center gap-2 md:gap-3">
              <svg className="w-5 h-5 text-indigo-300" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <Link
                href={`/admin/tenant-management/settings/${id}`}
                className="flex-shrink-0 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
                title="Settings Details"
                aria-label="Settings Details"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <span className="font-semibold text-green-700">Settings Details</span>
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <span className="font-semibold text-blue-700">Edit</span>
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Settings</h1>
        <p className="mt-2 text-sm text-gray-600">
          Update tenant configuration settings
        </p>
        {settings && (
          <dl className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Tenant ID
              </dt>
              <dd className="mt-1 text-sm font-semibold text-gray-900 break-all">
                {settings.tenantId || '—'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                Organization
              </dt>
              <dd className="mt-1 text-sm font-semibold text-gray-900">
                {organizationName}
              </dd>
            </div>
          </dl>
        )}
      </div>

      {/* Tip about upload features */}
      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Email footer HTML and logo images can be uploaded in the <strong>Customization</strong> tab. Use the drag-and-drop feature to upload files easily.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Settings Configuration</h2>
        </div>
        <div className="px-6 py-6">
          {settings && (
            <TenantSettingsEditClient
              settings={settings}
              settingsId={settingsId}
              organizations={organizations}
              initialTab={initialTab}
            />
          )}
        </div>
      </div>
    </div>
  );
}
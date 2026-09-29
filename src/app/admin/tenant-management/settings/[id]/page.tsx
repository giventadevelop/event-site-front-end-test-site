import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { fetchTenantSetting, fetchTenantSettingsByTenantId } from '@/app/admin/tenant-management/settings/ApiServerActions';
import { fetchTenantOrganization, fetchTenantOrganizations } from '@/app/admin/tenant-management/organizations/ApiServerActions';
import Link from 'next/link';
import { TenantSettingsDTO, TenantOrganizationDTO } from '@/app/admin/tenant-management/types';
import TenantSettingsViewClient from './TenantSettingsViewClient';
import {
  getAppScopedTenantId,
  isSatelliteTenantSettingsScope,
} from '@/lib/tenantSettingsScope';
import { parseTenantSettingsTab, tenantSettingsTabQuery } from '@/lib/tenantSettingsTabs';

interface PageProps {
  params: { id: string } | Promise<{ id: string }>;
  searchParams?: { tab?: string } | Promise<{ tab?: string }>;
}

export default async function TenantSettingsViewPage({ params, searchParams }: PageProps) {
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
      redirect(`/admin/tenant-management/settings/${forConfiguredTenant.id}`);
    }
    if (!forConfiguredTenant) {
      notFound();
    }
  }

  // Fetch settings data
  let settings: TenantSettingsDTO | null = null;
  let organization: TenantOrganizationDTO | null = null;
  let error = null;

  try {
    settings = await fetchTenantSetting(settingsId);
    if (!settings) {
      notFound();
    }

    // Prefer organization data from settings response; hydrate if incomplete.
    if (settings.tenantOrganization?.id) {
      organization = settings.tenantOrganization;

      // Some API payloads include only tenantOrganization.id; fetch full org for display fields.
      if (!organization.organizationName?.trim()) {
        try {
          const fullOrganization = await fetchTenantOrganization(settings.tenantOrganization.id);
          if (fullOrganization) {
            organization = fullOrganization;
          }
        } catch (orgErr) {
          console.error('Error fetching organization by id:', orgErr);
        }
      }
    } else if (settings.tenantId) {
      // Fallback: resolve organization by tenantId when relationship is absent on tenant-settings payload.
      try {
        const orgResult = await fetchTenantOrganizations(
          { page: 0, pageSize: 1 },
          { tenantId: settings.tenantId }
        );
        if (orgResult.data.length > 0) {
          organization = orgResult.data[0];
        }
      } catch (orgErr) {
        console.error('Error fetching organization by tenantId:', orgErr);
      }
    }
  } catch (err) {
    console.error('Error fetching settings:', err);
    error = err instanceof Error ? err.message : 'Failed to load settings';
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ paddingTop: '120px' }}>
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ paddingTop: '120px' }}>
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
              <span className="flex-shrink-0 h-14 rounded-xl bg-green-100 flex items-center justify-center gap-3 px-6">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <span className="font-semibold text-green-700">Settings Details</span>
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-3xl font-bold text-gray-900">
                Tenant Settings
              </h1>
              {organization && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {organization.organizationName}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">
              Configuration settings for tenant ID: {settings?.tenantId}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/admin/tenant-management/settings/${id}/edit${tenantSettingsTabQuery(initialTab)}`}
              className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
              title="Edit Settings"
              aria-label="Edit Settings"
            >
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </Link>
            {organization && (
              <Link
                href={`/admin/tenant-management/organizations/${organization.id}`}
                className="flex-shrink-0 w-14 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                title="View Organization"
                aria-label="View Organization"
              >
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Settings Details */}
        <div className="lg:col-span-2">
          {settings && (
            <TenantSettingsViewClient
              settings={settings}
              settingsId={settingsId}
              organization={organization}
              initialTab={initialTab}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
            </div>
            <div className="px-6 py-4 space-y-3">
              <Link
                href={`/admin/tenant-management/settings/${id}/edit${tenantSettingsTabQuery(initialTab)}`}
                className="w-full flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105"
                title="Edit Settings"
                aria-label="Edit Settings"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <span className="font-semibold text-blue-700">Edit Settings</span>
              </Link>
              {organization && (
                <Link
                  href={`/admin/tenant-management/organizations/${organization.id}`}
                  className="w-full flex-shrink-0 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105"
                  title="View Organization"
                  aria-label="View Organization"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <span className="font-semibold text-green-700">View Organization</span>
                </Link>
              )}
            </div>
          </div>

          {/* Settings Summary */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Settings Summary</h3>
            </div>
            <div className="px-6 py-4">
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Active Features</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {[
                      settings?.allowUserRegistration && 'User Registration',
                      settings?.enableWhatsappIntegration && 'WhatsApp',
                      settings?.enableEmailMarketing && 'Email Marketing',
                      settings?.enableEventManagement && 'Event Management',
                      settings?.enablePaymentProcessing && 'Payment Processing'
                    ].filter(Boolean).join(', ') || 'None'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Customizations</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {[
                      settings?.customCss && 'Custom CSS',
                      settings?.customJs && 'Custom JS',
                      settings?.emailProviderConfig && 'Email Config'
                    ].filter(Boolean).join(', ') || 'None'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Limits Set</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {[
                      settings?.maxUsers && 'Users',
                      settings?.maxEvents && 'Events',
                      settings?.maxStorageGB && 'Storage',
                      settings?.maxApiCallsPerMonth && 'API Calls'
                    ].filter(Boolean).join(', ') || 'None'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Organization Info */}
          {organization && (
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Organization</h3>
              </div>
              <div className="px-6 py-4">
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <Link
                        href={`/admin/tenant-management/organizations/${organization.id}`}
                        className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        {organization.organizationName}
                      </Link>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${organization.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                          }`}
                      >
                        {organization.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Subscription</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {organization.subscriptionStatus || 'Unknown'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { fetchTenantOrganization } from '@/app/admin/tenant-management/organizations/ApiServerActions';
import { fetchTenantSettingsByTenantId } from '@/app/admin/tenant-management/settings/ApiServerActions';
import Link from 'next/link';
import { FaArrowLeft, FaEdit, FaTrash, FaCog, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { TenantOrganizationDTO, TenantSettingsDTO } from '@/app/admin/tenant-management/types';
import { formatAddressBlock } from '@/lib/formatAddress';

interface PageProps {
  params: { id: string };
}

export default async function TenantOrganizationViewPage({ params }: PageProps) {
  // Await params for Next.js 15+ compatibility
  const resolvedParams = typeof params.then === 'function' ? await params : params;
  const { id } = resolvedParams;
  const organizationId = parseInt(id);

  if (isNaN(organizationId)) {
    notFound();
  }

  // Fetch organization data
  let organization: TenantOrganizationDTO | null = null;
  let settings: TenantSettingsDTO | null = null;
  let error = null;

  try {
    organization = await fetchTenantOrganization(organizationId);
    if (!organization) {
      notFound();
    }

    // Fetch associated settings
    try {
      settings = await fetchTenantSettingsByTenantId(organization.tenantId);
    } catch (settingsError) {
      console.warn('Settings not found for organization:', settingsError);
      // Settings are optional, so we continue without them
    }
  } catch (err) {
    console.error('Error fetching organization:', err);
    error = err instanceof Error ? err.message : 'Failed to load organization';
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link
            href="/admin/tenant-management/organizations"
            className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Back to Organizations
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
                Error loading organization
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link
              href="/admin"
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              <FaArrowLeft className="w-4 h-4 mr-2" />
              Admin Dashboard
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <Link
                href="/admin/tenant-management/organizations"
                className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2"
              >
                Organizations
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                {organization?.organizationName || 'Organization'}
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
                {organization?.organizationName}
              </h1>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${organization?.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
                  }`}
              >
                {organization?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">
              {organization?.description?.trim() || 'No description provided'}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href={`/admin/tenant-management/organizations/${id}/edit`}
              className="flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
              title="Edit Organization"
              aria-label="Edit Organization"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
                <FaEdit className="w-6 h-6 text-blue-600" />
              </div>
              <span className="font-semibold text-blue-700">Edit Organization</span>
            </Link>
            {settings && (
              <Link
                href={`/admin/tenant-management/settings/${settings.id}`}
                className="flex-shrink-0 h-14 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
                title="View Settings"
                aria-label="View Settings"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                  <FaCog className="w-6 h-6 text-gray-600" />
                </div>
                <span className="font-semibold text-gray-700">View Settings</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Organization Details */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Organization Details
              </h3>
            </div>
            <div className="px-6 py-4">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Organization Name
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {organization?.organizationName}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Tenant ID
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 font-mono">
                    {organization?.tenantId}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Contact Email
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {organization?.contactEmail || 'Not provided'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Contact Phone
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {organization?.contactPhone || 'Not provided'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Website
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {organization?.websiteUrl ? (
                      <a
                        href={organization.websiteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-500"
                      >
                        {organization.websiteUrl}
                      </a>
                    ) : (
                      'Not provided'
                    )}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">
                    Address
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                    {formatAddressBlock({
                      addressLine1: organization?.addressLine1,
                      addressLine2: organization?.addressLine2,
                      city: organization?.city,
                      stateProvince: organization?.stateProvince,
                      zipCode: organization?.zipCode,
                      country: organization?.country,
                    }) || 'Not provided'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Subscription Status
                  </dt>
                  <dd className="mt-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${organization?.subscriptionStatus === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : organization?.subscriptionStatus === 'TRIAL'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                        }`}
                    >
                      {organization?.subscriptionStatus || 'Unknown'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Subscription Plan
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {organization?.subscriptionPlan || 'Not specified'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Created At
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {organization?.createdAt
                      ? new Date(organization.createdAt).toLocaleDateString()
                      : 'Unknown'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Updated At
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {organization?.updatedAt
                      ? new Date(organization.updatedAt).toLocaleDateString()
                      : 'Unknown'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Branding Section */}
          <div className="mt-6 bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Branding</h3>
            </div>
            <div className="px-6 py-4">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Primary Color
                  </dt>
                  <dd className="mt-1 flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: organization?.primaryColor || '#000000' }}
                    ></div>
                    <span className="text-sm text-gray-900 font-mono">
                      {organization?.primaryColor || 'Not set'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Secondary Color
                  </dt>
                  <dd className="mt-1 flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: organization?.secondaryColor || '#000000' }}
                    ></div>
                    <span className="text-sm text-gray-900 font-mono">
                      {organization?.secondaryColor || 'Not set'}
                    </span>
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">
                    Logo
                  </dt>
                  <dd className="mt-1">
                    {organization?.logoUrl ? (
                      <img
                        src={organization.logoUrl}
                        alt={`${organization.organizationName} logo`}
                        className="h-16 w-auto object-contain"
                      />
                    ) : (
                      <span className="text-sm text-gray-500">No logo uploaded</span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
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
                href={`/admin/tenant-management/organizations/${id}/edit`}
                className="w-full flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105"
                title="Edit Organization"
                aria-label="Edit Organization"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
                  <FaEdit className="w-6 h-6 text-blue-600" />
                </div>
                <span className="font-semibold text-blue-700">Edit Organization</span>
              </Link>
              {settings ? (
                <Link
                  href={`/admin/tenant-management/settings/${settings.id}`}
                  className="w-full flex-shrink-0 h-14 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105"
                  title="Manage Settings"
                  aria-label="Manage Settings"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                    <FaCog className="w-6 h-6 text-gray-600" />
                  </div>
                  <span className="font-semibold text-gray-700">Manage Settings</span>
                </Link>
              ) : (
                <Link
                  href={`/admin/tenant-management/settings/new?tenantId=${organization?.tenantId}`}
                  className="w-full flex-shrink-0 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105"
                  title="Create Settings"
                  aria-label="Create Settings"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
                    <FaCog className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="font-semibold text-green-700">Create Settings</span>
                </Link>
              )}
            </div>
          </div>

          {/* Settings Summary */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Settings Status</h3>
            </div>
            <div className="px-6 py-4">
              {settings ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">User Registration</span>
                    {settings.allowUserRegistration ? (
                      <FaToggleOn className="text-green-500" />
                    ) : (
                      <FaToggleOff className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">WhatsApp Integration</span>
                    {settings.enableWhatsappIntegration ? (
                      <FaToggleOn className="text-green-500" />
                    ) : (
                      <FaToggleOff className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Email Marketing</span>
                    {settings.enableEmailMarketing ? (
                      <FaToggleOn className="text-green-500" />
                    ) : (
                      <FaToggleOff className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Event Management</span>
                    {settings.enableEventManagement ? (
                      <FaToggleOn className="text-green-500" />
                    ) : (
                      <FaToggleOff className="text-gray-400" />
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-3">
                    No settings configured for this organization
                  </p>
                  <Link
                    href={`/admin/tenant-management/settings/new?tenantId=${organization?.tenantId}`}
                    className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                  >
                    Create Settings
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Organization Stats */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Statistics</h3>
            </div>
            <div className="px-6 py-4">
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${organization?.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}
                    >
                      {organization?.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Subscription</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {organization?.subscriptionStatus || 'Unknown'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Plan</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {organization?.subscriptionPlan || 'Not specified'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

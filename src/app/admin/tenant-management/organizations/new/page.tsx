import { redirect } from 'next/navigation';
import { createTenantOrganization } from '@/app/admin/tenant-management/organizations/ApiServerActions';
import TenantOrganizationFormClient from '@/app/admin/tenant-management/components/TenantOrganizationFormClient';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import { TenantOrganizationFormDTO } from '@/app/admin/tenant-management/types';

export default function NewTenantOrganizationPage() {
  async function handleSubmit(data: TenantOrganizationFormDTO) {
    'use server';

    try {
      await createTenantOrganization(data);
      redirect('/admin/tenant-management/organizations');
    } catch (error) {
      console.error('Error creating organization:', error);
      throw error;
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <Link href="/admin/tenant-management/organizations" className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2">
                Organizations
              </Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">New Organization</span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New Organization</h1>
        <p className="mt-2 text-sm text-gray-600">Add a new tenant organization to the system</p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Organization Information</h2>
        </div>
        <div className="px-6 py-6">
          <TenantOrganizationFormClient
            mode="create"
            onSubmit={handleSubmit}
            initialData={{
              organizationName: '',
              tenantId: '',
              contactEmail: '',
              contactPhone: '',
              description: '',
              addressLine1: '',
              addressLine2: '',
              city: '',
              stateProvince: '',
              zipCode: '',
              country: '',
              websiteUrl: '',
              primaryColor: '#3B82F6',
              secondaryColor: '#10B981',
              logoUrl: '',
              subscriptionStatus: 'TRIAL',
              subscriptionPlan: 'BASIC',
              isActive: true,
              createdAt: '',
              updatedAt: '',
            }}
          />
        </div>
      </div>
    </div>
  );
}

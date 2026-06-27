'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FaTimes, FaEdit, FaTrashAlt, FaCog, FaBuilding, FaCalendarAlt, FaDollarSign, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import type { TenantOrganizationDTO, TenantSettingsDTO } from '@/app/admin/tenant-management/types';

interface TenantDetailsModalProps {
  organization: TenantOrganizationDTO;
  settings?: TenantSettingsDTO | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onManageSettings?: () => void;
}

export default function TenantDetailsModal({
  organization,
  settings,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onManageSettings
}: TenantDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<'organization' | 'settings'>('organization');

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {organization.logoUrl && (
                  <img
                    src={organization.logoUrl}
                    alt="Organization logo"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {organization.organizationName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Tenant ID: {organization.tenantId}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('organization')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'organization'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <FaBuilding />
                Organization Details
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <FaCog />
                Settings
                {!settings && (
                  <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                    Not Configured
                  </span>
                )}
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="px-6 py-6 max-h-96 overflow-y-auto">
            {activeTab === 'organization' && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Organization Name</label>
                      <p className="text-sm text-gray-900">{organization.organizationName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Tenant ID</label>
                      <p className="text-sm text-gray-900 font-mono">{organization.tenantId}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Domain</label>
                      <p className="text-sm text-gray-900">{organization.domain || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Contact Email</label>
                      <p className="text-sm text-gray-900">{organization.contactEmail}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Contact Phone</label>
                      <p className="text-sm text-gray-900">{organization.contactPhone || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(organization.subscriptionStatus || '')}`}>
                          {organization.subscriptionStatus || 'Unknown'}
                        </span>
                        <div className={`flex items-center gap-1 ${organization.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                          {organization.isActive ? <FaToggleOn /> : <FaToggleOff />}
                          {organization.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Branding */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Branding</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Primary Color</label>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{ backgroundColor: organization.primaryColor || '#3B82F6' }}
                        />
                        <span className="text-sm text-gray-900 font-mono">
                          {organization.primaryColor || '#3B82F6'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Secondary Color</label>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{ backgroundColor: organization.secondaryColor || '#10B981' }}
                        />
                        <span className="text-sm text-gray-900 font-mono">
                          {organization.secondaryColor || '#10B981'}
                        </span>
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-500">Logo</label>
                      {organization.logoUrl ? (
                        <div className="mt-1">
                          <img
                            src={organization.logoUrl}
                            alt="Organization logo"
                            className="w-20 h-20 object-contain border border-gray-300 rounded"
                          />
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No logo uploaded</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Subscription Information */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Subscription Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Plan</label>
                      <p className="text-sm text-gray-900">{organization.subscriptionPlan || 'Not set'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Monthly Fee</label>
                      <p className="text-sm text-gray-900">
                        {organization.monthlyFeeUsd ? formatCurrency(organization.monthlyFeeUsd) : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Start Date</label>
                      <p className="text-sm text-gray-900">
                        {organization.subscriptionStartDate ? formatDate(organization.subscriptionStartDate) : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">End Date</label>
                      <p className="text-sm text-gray-900">
                        {organization.subscriptionEndDate ? formatDate(organization.subscriptionEndDate) : 'Not set'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Stripe Customer ID</label>
                      <p className="text-sm text-gray-900 font-mono">
                        {organization.stripeCustomerId || 'Not set'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-4">Timestamps</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Created</label>
                      <p className="text-sm text-gray-900">{formatDate(organization.createdAt)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Last Updated</label>
                      <p className="text-sm text-gray-900">{formatDate(organization.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                {settings ? (
                  <>
                    {/* General Settings */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">General Settings</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">User Registration</label>
                          <p className="text-sm text-gray-900">
                            {settings.allowUserRegistration ? 'Enabled' : 'Disabled'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Admin Approval Required</label>
                          <p className="text-sm text-gray-900">
                            {settings.requireAdminApproval ? 'Yes' : 'No'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Guest Registration</label>
                          <p className="text-sm text-gray-900">
                            {settings.enableGuestRegistration ? 'Enabled' : 'Disabled'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Max Guests Per Attendee</label>
                          <p className="text-sm text-gray-900">
                            {settings.maxGuestsPerAttendee || 'Not set'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Integration Settings */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">Integration Settings</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">WhatsApp Integration</label>
                          <p className="text-sm text-gray-900">
                            {settings.enableWhatsappIntegration ? 'Enabled' : 'Disabled'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Email Marketing</label>
                          <p className="text-sm text-gray-900">
                            {settings.enableEmailMarketing ? 'Enabled' : 'Disabled'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Limits */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">Usage Limits</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Max Events Per Month</label>
                          <p className="text-sm text-gray-900">
                            {settings.maxEventsPerMonth || 'Unlimited'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Max Attendees Per Event</label>
                          <p className="text-sm text-gray-900">
                            {settings.maxAttendeesPerEvent || 'Unlimited'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Default Event Capacity</label>
                          <p className="text-sm text-gray-900">
                            {settings.defaultEventCapacity || 'Not set'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Platform Fee Percentage</label>
                          <p className="text-sm text-gray-900">
                            {settings.platformFeePercentage ? `${settings.platformFeePercentage}%` : 'Not set'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Customization */}
                    {(settings.customCss || settings.customJs) && (
                      <div>
                        <h4 className="text-md font-medium text-gray-900 mb-4">Custom Styling</h4>
                        <div className="space-y-4">
                          {settings.customCss && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Custom CSS</label>
                              <p className="text-sm text-gray-500">Custom CSS is configured</p>
                            </div>
                          )}
                          {settings.customJs && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Custom JavaScript</label>
                              <p className="text-sm text-gray-500">Custom JavaScript is configured</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Timestamps */}
                    <div>
                      <h4 className="text-md font-medium text-gray-900 mb-4">Timestamps</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Created</label>
                          <p className="text-sm text-gray-900">{formatDate(settings.createdAt)}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Last Updated</label>
                          <p className="text-sm text-gray-900">{formatDate(settings.updatedAt)}</p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <FaCog className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No Settings Configured</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      This organization doesn't have any settings configured yet.
                    </p>
                    <div className="mt-6">
                      <button
                        onClick={onManageSettings}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm"
                      >
                        Configure Settings
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex gap-2">
                {onEdit && (
                  <button
                    onClick={onEdit}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2"
                  >
                    <FaEdit />
                    Edit
                  </button>
                )}
                {onManageSettings && (
                  <button
                    onClick={onManageSettings}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2"
                  >
                    <FaCog />
                    Manage Settings
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                {onDelete && (
                  <button
                    onClick={onDelete}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2"
                  >
                    <FaTrashAlt />
                    Delete
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

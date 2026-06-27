'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaCog, FaCode } from 'react-icons/fa';
import { TenantSettingsDTO, TenantOrganizationDTO } from '@/app/admin/tenant-management/types';

interface TenantSettingsViewClientProps {
  settings: TenantSettingsDTO;
  settingsId: number;
  organization?: TenantOrganizationDTO | null;
}

export default function TenantSettingsViewClient({ settings, settingsId, organization }: TenantSettingsViewClientProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'integrations' | 'limits' | 'customization'>('general');

  // Tab navigation with colorful icons
  const tabs = [
    { id: 'general' as const, label: 'General', icon: FaCog, color: 'blue' },
    { id: 'integrations' as const, label: 'Integrations', icon: FaCode, color: 'green' },
    { id: 'limits' as const, label: 'Limits', icon: FaCog, color: 'purple' },
    { id: 'customization' as const, label: 'Customization', icon: FaCode, color: 'orange' }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const getColorClasses = (color: string) => {
              if (color === 'blue') {
                return {
                  active: 'bg-blue-100 text-blue-600 border-blue-500',
                  inactive: 'bg-blue-50 text-blue-400 border-transparent hover:bg-blue-100 hover:text-blue-500',
                  iconBgActive: 'bg-blue-100',
                  iconBgInactive: 'bg-blue-50',
                  iconTextActive: 'text-blue-600',
                  iconTextInactive: 'text-blue-400',
                  textActive: 'text-blue-700',
                  textInactive: 'text-blue-500'
                };
              } else if (color === 'green') {
                return {
                  active: 'bg-green-100 text-green-600 border-green-500',
                  inactive: 'bg-green-50 text-green-400 border-transparent hover:bg-green-100 hover:text-green-500',
                  iconBgActive: 'bg-green-100',
                  iconBgInactive: 'bg-green-50',
                  iconTextActive: 'text-green-600',
                  iconTextInactive: 'text-green-400',
                  textActive: 'text-green-700',
                  textInactive: 'text-green-500'
                };
              } else if (color === 'purple') {
                return {
                  active: 'bg-purple-100 text-purple-600 border-purple-500',
                  inactive: 'bg-purple-50 text-purple-400 border-transparent hover:bg-purple-100 hover:text-purple-500',
                  iconBgActive: 'bg-purple-100',
                  iconBgInactive: 'bg-purple-50',
                  iconTextActive: 'text-purple-600',
                  iconTextInactive: 'text-purple-400',
                  textActive: 'text-purple-700',
                  textInactive: 'text-purple-500'
                };
              } else {
                return {
                  active: 'bg-orange-100 text-orange-600 border-orange-500',
                  inactive: 'bg-orange-50 text-orange-400 border-transparent hover:bg-orange-100 hover:text-orange-500',
                  iconBgActive: 'bg-orange-100',
                  iconBgInactive: 'bg-orange-50',
                  iconTextActive: 'text-orange-600',
                  iconTextInactive: 'text-orange-400',
                  textActive: 'text-orange-700',
                  textInactive: 'text-orange-500'
                };
              }
            };
            const colors = getColorClasses(tab.color);
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-4 border-b-2 font-semibold text-base flex items-center gap-3 rounded-t-lg transition-all duration-300 ${
                  isActive ? colors.active : colors.inactive
                }`}
              >
                <div className={`flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                  isActive ? colors.iconBgActive : colors.iconBgInactive
                }`}>
                  <Icon className={`w-10 h-10 ${isActive ? colors.iconTextActive : colors.iconTextInactive}`} />
                </div>
                <span className={isActive ? colors.textActive : colors.textInactive}>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* General Tab */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Tenant ID</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">{settings?.tenantId}</dd>
            </div>
            {organization && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Organization</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <Link
                    href={`/admin/tenant-management/organizations/${organization.id}`}
                    className="text-blue-600 hover:text-blue-500"
                  >
                    {organization.organizationName}
                  </Link>
                </dd>
              </div>
            )}
            {organization && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Organization identity</dt>
                <dd className="mt-1 text-sm text-gray-600">
                  Description, address, and website are on the{' '}
                  <Link
                    href={`/admin/tenant-management/organizations/${organization.id}`}
                    className="text-blue-600 hover:text-blue-500 font-medium"
                  >
                    organization record
                  </Link>
                  .
                </dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500">User Registration</dt>
              <dd className="mt-1">
                {settings?.allowUserRegistration ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg className="w-5 h-5 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Enabled
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <svg className="w-5 h-5 mr-1 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Disabled
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Admin Approval Required</dt>
              <dd className="mt-1">
                {settings?.requireAdminApproval ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg className="w-5 h-5 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Yes
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <svg className="w-5 h-5 mr-1 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    No
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Guest Registration</dt>
              <dd className="mt-1">
                {settings?.enableGuestRegistration ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg className="w-5 h-5 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Enabled
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <svg className="w-5 h-5 mr-1 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Disabled
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Membership Subscription Enabled</dt>
              <dd className="mt-1">
                {settings?.isMembershipSubscriptionEnabled ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg className="w-5 h-5 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Enabled
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <svg className="w-5 h-5 mr-1 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Disabled
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Max Guests Per Attendee</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {settings?.maxGuestsPerAttendee || 'Not set'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Default Event Capacity</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {settings?.defaultEventCapacity || 'Not set'}
              </dd>
            </div>
            {settings?.email && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{settings.email}</dd>
              </div>
            )}
            {settings?.phoneNumber && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                <dd className="mt-1 text-sm text-gray-900">{settings.phoneNumber}</dd>
              </div>
            )}
            {/* Social media URLs - always show so admins see available fields; empty = "Not set" */}
            <div className="sm:col-span-2 border-t border-gray-200 pt-4 mt-2">
              <dt className="text-sm font-medium text-gray-500 mb-2">Social Media URLs</dt>
              <dd className="mt-1 text-sm text-gray-900 space-y-1">
                <div><span className="font-medium text-gray-600">Facebook:</span>{' '}{settings?.facebookUrl?.trim() ? <a href={settings.facebookUrl.trim()} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{settings.facebookUrl.trim()}</a> : <span className="text-gray-400 italic">Not set</span>}</div>
                <div><span className="font-medium text-gray-600">Instagram:</span>{' '}{settings?.instagramUrl?.trim() ? <a href={settings.instagramUrl.trim()} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{settings.instagramUrl.trim()}</a> : <span className="text-gray-400 italic">Not set</span>}</div>
                <div><span className="font-medium text-gray-600">X (Twitter):</span>{' '}{settings?.twitterUrl?.trim() ? <a href={settings.twitterUrl.trim()} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{settings.twitterUrl.trim()}</a> : <span className="text-gray-400 italic">Not set</span>}</div>
                <div><span className="font-medium text-gray-600">LinkedIn:</span>{' '}{settings?.linkedinUrl?.trim() ? <a href={settings.linkedinUrl.trim()} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{settings.linkedinUrl.trim()}</a> : <span className="text-gray-400 italic">Not set</span>}</div>
                <div><span className="font-medium text-gray-600">YouTube:</span>{' '}{settings?.youtubeUrl?.trim() ? <a href={settings.youtubeUrl.trim()} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{settings.youtubeUrl.trim()}</a> : <span className="text-gray-400 italic">Not set</span>}</div>
                <div><span className="font-medium text-gray-600">TikTok:</span>{' '}{settings?.tiktokUrl?.trim() ? <a href={settings.tiktokUrl.trim()} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{settings.tiktokUrl.trim()}</a> : <span className="text-gray-400 italic">Not set</span>}</div>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Created At</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {settings?.createdAt
                  ? new Date(settings.createdAt).toLocaleDateString()
                  : 'Unknown'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Updated At</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {settings?.updatedAt
                  ? new Date(settings.updatedAt).toLocaleDateString()
                  : 'Unknown'}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {/* Integrations Tab */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Integration Settings</h3>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">WhatsApp Integration</dt>
              <dd className="mt-1">
                {settings?.enableWhatsappIntegration ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg className="w-5 h-5 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Enabled
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <svg className="w-5 h-5 mr-1 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Disabled
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Email Marketing</dt>
              <dd className="mt-1">
                {settings?.enableEmailMarketing ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <svg className="w-5 h-5 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Enabled
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <svg className="w-5 h-5 mr-1 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Disabled
                  </span>
                )}
              </dd>
            </div>
            {settings?.whatsappPhoneNumber && (
              <div>
                <dt className="text-sm font-medium text-gray-500">WhatsApp Phone Number</dt>
                <dd className="mt-1 text-sm text-gray-900">{settings.whatsappPhoneNumber}</dd>
              </div>
            )}
            {settings?.whatsappMaxMessagesPerDay && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Max Messages Per Day</dt>
                <dd className="mt-1 text-sm text-gray-900">{settings.whatsappMaxMessagesPerDay}</dd>
              </div>
            )}
            {settings?.whatsappRateLimit && (
              <div>
                <dt className="text-sm font-medium text-gray-500">Rate Limit (per minute)</dt>
                <dd className="mt-1 text-sm text-gray-900">{settings.whatsappRateLimit}</dd>
              </div>
            )}
            {settings?.emailProviderConfig && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Email Provider Config</dt>
                <dd className="mt-1">
                  <pre className="bg-gray-100 p-3 rounded-md text-xs overflow-x-auto">
                    {JSON.stringify(JSON.parse(settings.emailProviderConfig), null, 2)}
                  </pre>
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}

      {/* Limits Tab */}
      {activeTab === 'limits' && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Usage Limits</h3>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Max Events Per Month</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {settings?.maxEventsPerMonth || 'Unlimited'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Max Attendees Per Event</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {settings?.maxAttendeesPerEvent || 'Unlimited'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Default Event Capacity</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {settings?.defaultEventCapacity || 'Not set'}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Platform Fee Percentage</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {settings?.platformFeePercentage !== undefined && settings?.platformFeePercentage !== null
                  ? `${settings.platformFeePercentage}%`
                  : 'Not set'}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {/* Customization Tab */}
      {activeTab === 'customization' && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Custom Styling</h3>

          {/* Custom CSS */}
          <div>
            <dt className="text-sm font-medium text-gray-500 mb-2">Custom CSS</dt>
            <dd className="mt-1">
              {settings?.customCss ? (
                <pre className="bg-gray-100 p-3 rounded-md text-xs overflow-x-auto">
                  {settings.customCss}
                </pre>
              ) : (
                <span className="text-sm text-gray-500">No custom CSS</span>
              )}
            </dd>
          </div>

          {/* Custom JavaScript */}
          <div>
            <dt className="text-sm font-medium text-gray-500 mb-2">Custom JavaScript</dt>
            <dd className="mt-1">
              {settings?.customJs ? (
                <pre className="bg-gray-100 p-3 rounded-md text-xs overflow-x-auto">
                  {settings.customJs}
                </pre>
              ) : (
                <span className="text-sm text-gray-500">No custom JavaScript</span>
              )}
            </dd>
          </div>

          {/* Homepage Display Settings */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Homepage Display Settings</h4>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Show Events Section</dt>
                <dd className="mt-1">
                  {settings?.showEventsSectionInHomePage ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <svg className="w-5 h-5 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Visible
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <svg className="w-5 h-5 mr-1 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Hidden
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Show Team Members Section</dt>
                <dd className="mt-1">
                  {settings?.showTeamMembersSectionInHomePage ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <svg className="w-5 h-5 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Visible
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <svg className="w-5 h-5 mr-1 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Hidden
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Show Sponsors Section</dt>
                <dd className="mt-1">
                  {settings?.showSponsorsSectionInHomePage ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <svg className="w-5 h-5 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Visible
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <svg className="w-5 h-5 mr-1 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Hidden
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Membership Subscription Enabled</dt>
                <dd className="mt-1">
                  {settings?.isMembershipSubscriptionEnabled ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <svg className="w-5 h-5 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Enabled
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <svg className="w-5 h-5 mr-1 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Disabled
                    </span>
                  )}
                </dd>
              </div>
            </dl>
          </div>

          {/* Email Header Image */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Email Header Image</h4>
            {settings?.emailHeaderImageUrl ? (
              <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg">
                <div className="relative inline-block mb-2">
                  <Image
                    src={settings.emailHeaderImageUrl}
                    alt="Email header image"
                    width={400}
                    height={200}
                    className="max-w-full h-auto max-h-48 rounded-lg border border-gray-300 object-contain"
                  />
                </div>
                <p className="text-sm text-gray-700 mb-2">Email Header Image URL:</p>
                <a
                  href={settings.emailHeaderImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline text-sm flex items-center gap-2"
                >
                  {settings.emailHeaderImageUrl}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No email header image uploaded</p>
            )}
          </div>

          {/* Email Footer HTML */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Email Footer HTML</h4>
            {settings?.emailFooterHtmlUrl ? (
              <div className="p-4 bg-gray-50 border border-gray-300 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">Email Footer HTML File:</p>
                <a
                  href={settings.emailFooterHtmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline text-sm flex items-center gap-2"
                >
                  {settings.emailFooterHtmlUrl}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No email footer HTML file uploaded</p>
            )}
          </div>

          {/* Tenant Logo */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Tenant Logo</h4>
            {settings?.logoImageUrl ? (
              <div className="relative inline-block">
                <Image
                  src={settings.logoImageUrl}
                  alt="Tenant logo"
                  width={200}
                  height={200}
                  className="max-w-full h-auto max-h-48 rounded-lg border border-gray-300 object-contain"
                />
              </div>
            ) : (
              <p className="text-sm text-gray-500">No logo image uploaded</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import AdminNavigation from '@/components/AdminNavigation';
import { FaCog, FaEnvelope, FaUsers, FaCalendarAlt, FaSave } from 'react-icons/fa';

function LoadingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function AdminEventsSettingsPage() {
  const { userId } = await safeAuth();

  if (!userId) {
    notFound();
  }

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <AdminEventsSettingsContent />
    </Suspense>
  );
}

function AdminEventsSettingsContent() {
  return (
    <div className="max-w-4xl mx-auto px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Settings</h1>
        <p className="text-gray-600">
          Configure global settings for event management and registration.
        </p>
      </div>

      {/* Admin Navigation */}
      <AdminNavigation currentPage="event-settings" />

      {/* Settings Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <form className="space-y-6">
          {/* Email Settings */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaEnvelope className="mr-2 text-blue-600" />
              Email Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Confirmation Email Template
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Enter email template for registration confirmations..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reminder Email Template
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Enter email template for event reminders..."
                />
              </div>
            </div>
          </div>

          {/* Registration Settings */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaUsers className="mr-2 text-green-600" />
              Registration Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Registration Status
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="PENDING">Pending Approval</option>
                  <option value="REGISTERED">Automatically Registered</option>
                  <option value="WAITLISTED">Waitlisted</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Guests Per Registration
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="10"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requireApproval"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="requireApproval" className="ml-2 block text-sm text-gray-700">
                  Require admin approval for all registrations
                </label>
              </div>
            </div>
          </div>

          {/* Event Settings */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaCalendarAlt className="mr-2 text-purple-600" />
              Event Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Event Capacity
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Registration Deadline (days before event)
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="7"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="allowWaitlist"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="allowWaitlist" className="ml-2 block text-sm text-gray-700">
                  Enable waitlist when events are full
                </label>
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaCog className="mr-2 text-gray-600" />
              System Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="America/New_York">Eastern Time (ET)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableQR"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  defaultChecked
                />
                <label htmlFor="enableQR" className="ml-2 block text-sm text-gray-700">
                  Enable QR code generation for registrations
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="enableAnalytics"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  defaultChecked
                />
                <label htmlFor="enableAnalytics" className="ml-2 block text-sm text-gray-700">
                  Enable analytics and reporting
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-6">
            <button
              type="submit"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              <FaSave className="mr-2" />
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

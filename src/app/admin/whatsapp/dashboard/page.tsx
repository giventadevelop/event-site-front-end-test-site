import { Metadata } from 'next';
import { Suspense } from 'react';
import { FaWhatsapp, FaSpinner } from 'react-icons/fa';

import WhatsAppDashboard from './WhatsAppDashboard';
// import { WhatsAppErrorBoundary } from '@/components/whatsapp/WhatsAppErrorBoundary';

export const metadata: Metadata = {
  title: 'WhatsApp Dashboard | Admin',
  description: 'Monitor WhatsApp messaging analytics and performance',
};

export default function WhatsAppDashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <FaWhatsapp className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">WhatsApp Dashboard</h1>
              <p className="text-sm text-gray-600">
                Monitor your WhatsApp messaging analytics, delivery rates, and performance metrics
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-12">
            <FaSpinner className="animate-spin h-8 w-8 text-blue-600" />
            <span className="ml-2 text-gray-600">Loading dashboard...</span>
          </div>
        }
      >
        <WhatsAppDashboard />
      </Suspense>
    </div>
  );
}

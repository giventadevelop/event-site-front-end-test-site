import { safeAuth } from '@/lib/safe-auth';
import { redirect } from 'next/navigation';
import TestStripeClient from './TestStripeClient';
import AdminNavigation from '@/components/AdminNavigation';

export default async function TestStripePage() {
  const { userId } = await safeAuth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" style={{ paddingTop: '180px' }}>
      <div className="max-w-4xl mx-auto px-4">
        {/* Admin Navigation */}
        <AdminNavigation currentPage="test-stripe" />

        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Test Stripe Transaction</h1>
          <TestStripeClient />
        </div>
      </div>
    </div>
  );
}
import { safeAuth } from '@/lib/safe-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FaCheckCircle, FaArrowLeft, FaHome } from 'react-icons/fa';

export default async function TestStripeSuccessPage({
  searchParams,
}: {
  searchParams: { session_id?: string };
}) {
  const { userId } = await safeAuth();

  if (!userId) {
    redirect('/sign-in');
  }

  const sessionId = searchParams.session_id;

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Admin Home Button */}
        <div className="mb-6 flex justify-center">
          <Link href="/admin" className="flex items-center justify-center bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-lg shadow-sm hover:shadow-md px-4 py-3 transition-all duration-200">
            <FaHome className="mr-2" />
            <span className="font-semibold">Admin Home</span>
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Test Payment Successful!</h1>
            <p className="text-gray-600 mb-6">
              Your test Stripe transaction was completed successfully.
            </p>

            {sessionId && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Transaction Details</h3>
                <p className="text-sm text-gray-600">
                  <strong>Session ID:</strong> {sessionId}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Status:</strong> Completed
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/admin/test-stripe"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <FaArrowLeft />
                Test Another Payment
              </Link>
              <Link
                href="/admin"
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Back to Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
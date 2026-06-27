import { auth } from '@clerk/nextjs/server'
import { TaskList } from '@/components/task-list'
import Link from 'next/link'
import { Pagination } from '@/components/Pagination'
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";

const PAGE_SIZE = 3;

async function checkSubscriptionStatus(userId: string, isReturnFromStripe: boolean = false) {
  // Placeholder: always return true
  return true;
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Initialize headers and auth
  const cookiesList = await cookies();
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Get search params for Stripe return
  const success = searchParams?.success;
  const sessionId = searchParams?.session_id;
  const isReturnFromStripe = Boolean(success === 'true' || sessionId);

  // Check subscription status with more retries if returning from Stripe
  const hasActiveSubscription = await checkSubscriptionStatus(userId, isReturnFromStripe);

  if (!hasActiveSubscription) {
    // If we're returning from Stripe but subscription isn't active yet, wait a bit longer
    if (isReturnFromStripe) {
      // Wait for 2 seconds more
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Check one final time
      const finalCheck = await checkSubscriptionStatus(userId, true);
      if (!finalCheck) {
        redirect('/pricing?message=subscription-pending');
      }
    } else {
      redirect('/pricing?message=subscription-required');
    }
  }

  const currentPage = typeof searchParams.page === 'string'
    ? parseInt(searchParams.page)
    : 1;

  // Placeholder for totalTasks and tasks
  const totalTasks = 0;
  const tasks: any[] = [];

  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#39E079] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your tasks...</p>
          </div>
        </div>
      }
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="space-y-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">All Tasks</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage and track all your tasks in one place
              </p>
            </div>
            <Link
              href="/tasks/new"
              className="rounded-md bg-[#39E079] px-6 py-2 text-sm font-medium text-[#141414] hover:bg-[#32c96d] focus:outline-none focus:ring-2 focus:ring-[#39E079] focus:ring-offset-2"
            >
              Create Task
            </Link>
          </div>

          {/* Tasks Table */}
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow">
            <div className="px-4 py-5 sm:p-6">
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Title
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <TaskList tasks={tasks} />
                  </tbody>
                </table>
              </div>
            </div>
            <Pagination
              totalItems={totalTasks}
              pageSize={PAGE_SIZE}
              currentPage={currentPage}
            />
          </div>
        </div>
      </div>
    </Suspense>
  );
}
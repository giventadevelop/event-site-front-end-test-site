import { safeAuth } from '@/lib/safe-auth';
import { redirect } from 'next/navigation';
import ExecutiveCommitteeClient from './ExecutiveCommitteeClient';
import { fetchExecutiveCommitteeMembers } from './ApiServerActions';
import AdminNavigation from '@/components/AdminNavigation';
import Link from 'next/link';

export default async function ExecutiveCommitteePage() {
  // Fix for Next.js 15+: await auth() before using
  const { userId } = await safeAuth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Add timeout wrapper to prevent hanging
  let members = [];
  try {
    members = await Promise.race([
      fetchExecutiveCommitteeMembers(),
      new Promise<[]>((resolve) =>
        setTimeout(() => {
          console.warn('[ExecutiveCommittee] Data fetch timeout after 25 seconds');
          resolve([]);
        }, 25000)
      )
    ]);
  } catch (error) {
    console.error('Failed to fetch executive committee members:', error);
    members = []; // Ensure members is always an array
  }

  return (
    <div className="container mx-auto px-4 py-8" style={{ paddingTop: '180px' }}>
      {/* Header with back button */}
      <div className="max-w-5xl mx-auto flex items-start gap-2 sm:gap-3 md:gap-4 mb-8 px-2.5 sm:px-3 md:px-4 lg:px-6 xl:px-8">
        <Link
          href="/admin"
          className="flex-shrink-0 h-14 rounded-xl bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
          title="Back to Admin"
          aria-label="Back to Admin"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-200 flex items-center justify-center">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </div>
          <span className="font-semibold text-indigo-700">Back to Admin</span>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Executive Committee Management
          </h1>
          <div className="bg-gray-50 rounded-r-lg">
            <p className="text-gray-700 leading-relaxed">
              Manage executive committee team members, their profiles, and roles.
              Add new members, update existing profiles, and organize team structure.
            </p>
          </div>
        </div>
      </div>

      {/* Admin Navigation */}
      <div className="mb-8">
        <AdminNavigation currentPage="executive-committee" />
      </div>

      <ExecutiveCommitteeClient initialMembers={members} />
    </div>
  );
}




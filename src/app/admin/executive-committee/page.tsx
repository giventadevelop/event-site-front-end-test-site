import { safeAuth } from '@/lib/safe-auth';
import { redirect } from 'next/navigation';
import ExecutiveCommitteeClient from './ExecutiveCommitteeClient';
import { fetchExecutiveCommitteeMembers } from './ApiServerActions';
import AdminNavigation from '@/components/AdminNavigation';

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
      {/* Admin Navigation */}
      <AdminNavigation currentPage="executive-committee" />

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Executive Committee Management
        </h1>
        <div className="bg-gray-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <p className="text-gray-700 leading-relaxed">
            Manage executive committee team members, their profiles, and roles.
            Add new members, update existing profiles, and organize team structure.
          </p>
        </div>
      </div>

      <ExecutiveCommitteeClient initialMembers={members} />
    </div>
  );
}




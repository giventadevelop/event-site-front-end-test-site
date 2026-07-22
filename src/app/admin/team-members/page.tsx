import { safeAuth } from '@/lib/safe-auth';
import { redirect } from 'next/navigation';
import AdminNavigation from '@/components/AdminNavigation';
import TeamMembersClient from './TeamMembersClient';
import { fetchTeamMembers } from './ApiServerActions';
import { fetchTeamGroups } from '../team-groups/ApiServerActions';
import Link from 'next/link';

interface PageProps {
  searchParams: Promise<{ groupId?: string }>;
}

export default async function TeamMembersAdminPage({ searchParams }: PageProps) {
  const { userId } = await safeAuth();
  if (!userId) redirect('/sign-in');

  const sp = await searchParams;
  const groupId = sp.groupId ? Number(sp.groupId) : undefined;

  const [groups, members] = await Promise.all([
    fetchTeamGroups(),
    fetchTeamMembers(groupId),
  ]);

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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Team roster members</h1>
          <div className="bg-gray-50 rounded-r-lg">
            <p className="text-gray-700">
              Add players or band members with portraits, jersey numbers, and skills. Members belong to a team group.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <AdminNavigation currentPage="admin" />
      </div>

      <TeamMembersClient initialMembers={members} groups={groups} filterGroupId={groupId} />
    </div>
  );
}

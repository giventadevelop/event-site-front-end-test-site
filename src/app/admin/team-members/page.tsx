import { safeAuth } from '@/lib/safe-auth';
import { redirect } from 'next/navigation';
import AdminNavigation from '@/components/AdminNavigation';
import TeamMembersClient from './TeamMembersClient';
import { fetchTeamMembers } from './ApiServerActions';
import { fetchTeamGroups } from '../team-groups/ApiServerActions';

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
      <AdminNavigation currentPage="admin" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Team roster members</h1>
        <div className="bg-gray-50 border-l-4 border-rose-500 p-4 rounded-r-lg">
          <p className="text-gray-700">
            Add players or band members with portraits, jersey numbers, and skills. Members belong to a team group.
          </p>
        </div>
      </div>
      <TeamMembersClient initialMembers={members} groups={groups} filterGroupId={groupId} />
    </div>
  );
}

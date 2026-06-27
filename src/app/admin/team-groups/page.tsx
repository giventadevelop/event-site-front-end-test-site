import { safeAuth } from '@/lib/safe-auth';
import { redirect } from 'next/navigation';
import AdminNavigation from '@/components/AdminNavigation';
import TeamGroupsClient from './TeamGroupsClient';
import { fetchTeamGroups } from './ApiServerActions';

export default async function TeamGroupsAdminPage() {
  const { userId } = await safeAuth();
  if (!userId) redirect('/sign-in');

  let groups = [];
  try {
    groups = await fetchTeamGroups();
  } catch {
    groups = [];
  }

  return (
    <div className="container mx-auto px-4 py-8" style={{ paddingTop: '180px' }}>
      <AdminNavigation currentPage="admin" />
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Team groups</h1>
        <div className="bg-gray-50 border-l-4 border-violet-500 p-4 rounded-r-lg">
          <p className="text-gray-700">
            Manage squads and bands shown on the homepage carousel. Each group has its own roster members.
          </p>
        </div>
      </div>
      <TeamGroupsClient initialGroups={groups} />
    </div>
  );
}

import Link from 'next/link';
import RemoveMemberButton from './RemoveMemberButton';
import AddMemberForm from './AddMemberForm';
import UpdateMemberForm from './UpdateMemberForm';
import {
  fetchFocusGroupByIdServer,
  fetchFocusGroupMembersServer,
  fetchUserProfileByIdServer,
  type UserProfileSummary,
} from './ApiServerActions';

const DEFAULT_PAGE_SIZE = 20;

/** Always fetch fresh member list (no cache) so newly joined members appear. */
export const dynamic = 'force-dynamic';

function getProfileId(m: Record<string, unknown>): number | null {
  const raw = m.userProfileId;
  if (raw == null) return null;
  if (typeof raw === 'object' && raw !== null && 'id' in raw) return Number((raw as { id: unknown }).id);
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
}

export default async function ManageGroupMembersPage(
  props: {
    params: Promise<{ id: string }> | { id: string };
    searchParams?: Promise<{ page?: string; size?: string }> | { page?: string; size?: string };
  }
) {
  const params = typeof props.params.then === 'function' ? await props.params : props.params;
  const rawSearch = props.searchParams;
  const searchParams: { page?: string; size?: string } =
    rawSearch && typeof (rawSearch as Promise<unknown>).then === 'function'
      ? await (rawSearch as Promise<{ page?: string; size?: string }>)
      : (rawSearch as { page?: string; size?: string }) ?? {};
  const page = Math.max(0, parseInt(searchParams.page ?? '0', 10) || 0);
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams?.size ?? String(DEFAULT_PAGE_SIZE), 10) || DEFAULT_PAGE_SIZE));
  const focusGroupId = Number(params.id);

  const group = await fetchFocusGroupByIdServer(params.id);
  const { members, totalCount } = await fetchFocusGroupMembersServer(params.id, page, pageSize);

  const uniqueProfileIds = Array.from(
    new Set(members.map((m) => getProfileId(m)).filter((id): id is number => id != null))
  );
  const profileResults = await Promise.all(uniqueProfileIds.map((id) => fetchUserProfileByIdServer(id)));
  const profileMap = new Map<number, UserProfileSummary>();
  profileResults.forEach((p) => {
    if (p) profileMap.set(p.id, p);
  });

  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const displayPage = page + 1;
  const startItem = totalCount > 0 ? page * pageSize + 1 : 0;
  const endItem = totalCount > 0 ? page * pageSize + Math.min(pageSize, totalCount - page * pageSize) : 0;
  const isPrevDisabled = page === 0;
  const isNextDisabled = page >= totalPages - 1;
  const prevHref = `/admin/focus-groups/${params.id}/members?page=${Math.max(0, page - 1)}&size=${pageSize}`;
  const nextHref = `/admin/focus-groups/${params.id}/members?page=${Math.min(totalPages - 1, page + 1)}&size=${pageSize}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8" style={{ paddingTop: '120px' }}>
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 text-center sm:text-left">
          Manage Members for: {group?.name ?? 'Focus Group'}
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
          Search for an existing user by name or email, then set role and status.
          Use ORGANISER or EXECUTIVE for Contact Organisers on the public page. Status ACTIVE means they count as current members.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Add Member</h2>
        <AddMemberForm focusGroupId={focusGroupId} />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h2 className="text-lg font-medium text-gray-900">Members</h2>
          <Link
            href={`/admin/focus-groups/${params.id}/members`}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Refresh list
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">First Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map((m: Record<string, unknown>) => {
                const profileId = getProfileId(m);
                const profile = profileId != null ? profileMap.get(profileId) : null;
                const memberId = Number(m.id);
                return (
                  <tr key={String(m.id)} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900">{profile?.firstName ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{profile?.lastName ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{profile?.email ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{String(m.role || '').toUpperCase()}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">{String(m.status || '').toUpperCase()}</td>
                    <td className="px-4 py-3 text-right text-sm">
                      <div className="inline-flex flex-wrap items-center gap-2 justify-end">
                        <Link
                          href={profileId != null ? `/admin/manage-usage?profileId=${profileId}` : '/admin/manage-usage'}
                          className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-100 hover:bg-green-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                          title="View user profile"
                          aria-label="View user profile"
                        >
                          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        {memberId > 0 && (
                          <UpdateMemberForm
                            memberId={memberId}
                            focusGroupId={focusGroupId}
                            initialRole={String(m.role || 'MEMBER')}
                            initialStatus={String(m.status || 'ACTIVE')}
                          />
                        )}
                        {memberId > 0 && <RemoveMemberButton memberId={memberId} />}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {members.length === 0 && (
                <tr><td className="px-4 py-8 text-sm text-gray-500 text-center" colSpan={6}>No members found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8">
          <div className="flex justify-between items-center">
            <Link
              href={prevHref}
              className={`px-5 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg shadow-sm border-2 border-blue-400 hover:border-blue-500 flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md ${isPrevDisabled ? 'pointer-events-none bg-blue-100 border-blue-300 text-blue-500 cursor-not-allowed' : ''}`}
              title="Previous Page"
              aria-label="Previous Page"
              aria-disabled={isPrevDisabled}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Previous</span>
            </Link>
            <div className="px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
              <span className="text-sm font-bold text-blue-700">
                Page <span className="text-blue-600">{displayPage}</span> of <span className="text-blue-600">{totalPages}</span>
              </span>
            </div>
            <Link
              href={nextHref}
              className={`px-5 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg shadow-sm border-2 border-blue-400 hover:border-blue-500 flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md ${isNextDisabled ? 'pointer-events-none bg-blue-100 border-blue-300 text-blue-500 cursor-not-allowed' : ''}`}
              title="Next Page"
              aria-label="Next Page"
              aria-disabled={isNextDisabled}
            >
              <span>Next</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="text-center mt-3">
            {totalCount > 0 ? (
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
                <span className="text-sm text-gray-700">
                  Showing <span className="font-bold text-blue-600">{startItem}</span> to <span className="font-bold text-blue-600">{endItem}</span> of <span className="font-bold text-blue-600">{totalCount}</span> members
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-sm">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-orange-700">No members found</span>
                <span className="text-sm text-orange-600">[No members in this focus group]</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

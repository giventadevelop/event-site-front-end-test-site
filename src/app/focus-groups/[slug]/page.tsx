import { auth } from '@clerk/nextjs/server';
import { getAppUrl } from '@/lib/env';
import { fetchUserProfileServer } from '@/app/profile/ApiServerActions';
import FocusGroupJoinLeave from './FocusGroupJoinLeave';

async function fetchGroup(baseUrl: string, slug: string) {
  try {
    const res = await fetch(`${baseUrl}/api/proxy/focus-groups?slug.equals=${encodeURIComponent(slug)}&size=1`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch {
    return null;
  }
}

async function fetchEvents(baseUrl: string, groupId: number) {
  try {
    const res = await fetch(`${baseUrl}/api/proxy/event-details?focusGroupId.equals=${groupId}&sort=startDate,asc`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/** Fetch current user's membership for this focus group, if any. */
async function fetchMyMembership(baseUrl: string, focusGroupId: number, userProfileId: number) {
  try {
    const res = await fetch(
      `${baseUrl}/api/proxy/focus-group-members?focusGroupId.equals=${focusGroupId}&userProfileId.equals=${userProfileId}&size=1`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const list = Array.isArray(data) ? data : [];
    return list.length > 0 ? list[0] : null;
  } catch {
    return null;
  }
}

/** Fetch members with role EXECUTIVE or ORGANISER (committee). */
async function fetchCommitteeMembers(baseUrl: string, focusGroupId: number) {
  try {
    const res = await fetch(
      `${baseUrl}/api/proxy/focus-group-members?focusGroupId.equals=${focusGroupId}&size=200`,
      { cache: 'no-store' }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const list = Array.isArray(data) ? data : [];
    const committee = list.filter(
      (m: { role?: string }) => m?.role === 'EXECUTIVE' || m?.role === 'ORGANISER'
    );
    return committee;
  } catch {
    return [];
  }
}

async function fetchUserProfileById(baseUrl: string, id: number) {
  try {
    const res = await fetch(`${baseUrl}/api/proxy/user-profiles/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.id ? data : null;
  } catch {
    return null;
  }
}

/** Top padding so content (including cover image) is not cut off by the fixed header. Per design_systems/event_site_general_design_final.json pageLayout.container.topOffset. */
const PAGE_TOP_OFFSET = 120;

export default async function FocusGroupDetailPage({
  params,
}: {
  params: Promise<{ slug: string }> | { slug: string };
}) {
  const resolvedParams = typeof (params as Promise<{ slug: string }>).then === 'function'
    ? await (params as Promise<{ slug: string }>)
    : (params as { slug: string });
  const slug = typeof resolvedParams.slug === 'string' ? resolvedParams.slug : Array.isArray(resolvedParams.slug) ? resolvedParams.slug[0] : '';

  const baseUrl = getAppUrl();
  const group = await fetchGroup(baseUrl, slug);
  const events = group?.id ? await fetchEvents(baseUrl, group.id) : [];

  const { userId } = await auth();
  const profile = userId ? await fetchUserProfileServer(userId) : null;
  const isLoggedIn = !!userId;
  const myMembership = group?.id && profile?.id ? await fetchMyMembership(baseUrl, group.id, profile.id) : null;
  const isMember = !!myMembership;
  const membershipId = myMembership?.id ?? null;

  const committeeRaw = group?.id ? await fetchCommitteeMembers(baseUrl, group.id) : [];
  const committeeWithProfiles = await Promise.all(
    committeeRaw.map(async (m: { userProfileId?: number; id?: number; role?: string }, idx: number) => {
      const userProfileId = m?.userProfileId ?? (m as any)?.user_profile_id;
      const profileData = userProfileId ? await fetchUserProfileById(baseUrl, userProfileId) : null;
      const first = (profileData as any)?.firstName ?? (profileData as any)?.first_name ?? '';
      const last = (profileData as any)?.lastName ?? (profileData as any)?.last_name ?? '';
      const name = profileData
        ? [first, last].filter(Boolean).join(' ') || (profileData as any)?.email || 'Member'
        : 'Member';
      return { ...m, displayName: name, role: m?.role ?? (m as any)?.role, _idx: idx };
    })
  );

  /* Design system: semantic colors for card accents (blue, teal, purple cycle) */
  const cardAccentColors = ['border-indigo-500', 'border-teal-500', 'border-amber-500'] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50" style={{ paddingTop: `${PAGE_TOP_OFFSET}px` }}>
      {/* Container: design system pageLayout - max-w-7xl, responsive padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Page header section: design system sectionSpacing medium (mb-8) */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          {/* Cover image: fixed height 250px, contain so full image visible */}
          <div
            className="relative w-full h-[250px] overflow-hidden rounded-xl shadow-md bg-transparent"
            style={{
              backgroundImage: group?.coverImageUrl ? `url(${group.coverImageUrl})` : undefined,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
            role="img"
            aria-label={group?.name ? `${group.name} cover` : 'Focus group cover'}
          >
            {!group?.coverImageUrl && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-gray-400 text-sm">No cover image</span>
              </div>
            )}
          </div>
          {/* Title: design system pageHeader with colored accent (indigo) */}
          <h1 className="mt-6 text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 pb-2 border-b-2 border-indigo-200 text-center sm:text-left">
            {group?.name || 'Focus Group'}
          </h1>
          {/* Description: design system pageHeader.description - muted with slight color */}
          <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left max-w-3xl">
            {group?.description || 'Details coming soon.'}
          </p>
          {/* Join / Leave: PRD focus_group_member_organisers frontend */}
          {group?.id && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <FocusGroupJoinLeave
                focusGroupId={group.id}
                isLoggedIn={isLoggedIn}
                isMember={isMember}
                membershipId={membershipId}
                membershipStatus={myMembership?.status ?? (myMembership as any)?.status ?? null}
                groupName={group?.name || 'Focus Group'}
                redirectUrl={`/focus-groups/${slug}`}
              />
            </div>
          )}
        </div>

        {/* Executive / Organising Committee: PRD focus_group_member_organisers */}
        {committeeWithProfiles.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-indigo-800 border-l-4 border-indigo-500 pl-3 mb-4 sm:mb-6">
              Executive / Organising Committee
            </h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <ul className="space-y-3" role="list">
                {committeeWithProfiles.map((m: { id?: number; _idx?: number; displayName: string; role?: string }) => (
                  <li key={m.id ?? m._idx ?? 0} className="flex items-center gap-3 text-sm text-gray-700">
                    <span className="font-medium text-gray-900">{m.displayName}</span>
                    {m.role && (
                      <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 text-xs font-medium">
                        {m.role}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Upcoming Events: design system section title with colored left border (indigo) */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-indigo-800 border-l-4 border-indigo-500 pl-3 mb-4 sm:mb-6">
            Upcoming Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {events.map((e: any, idx: number) => {
              const accentClass = cardAccentColors[idx % cardAccentColors.length];
              return (
                <a
                  key={e.id}
                  href={`/events/${e.id}`}
                  className={`border border-gray-200 rounded-lg p-4 sm:p-5 hover:shadow-md transition-all duration-300 bg-white border-l-4 ${accentClass} hover:border-indigo-400`}
                  title={e.title}
                >
                  {/* Date: design system semantic color (blue/indigo for info) */}
                  <div className="text-sm font-medium text-indigo-600 truncate">
                    {e.startDate} • {e.startTime}
                  </div>
                  {/* Title: primary text with hover color */}
                  <div className="mt-1 text-lg font-semibold text-gray-900 hover:text-indigo-700 transition-colors">
                    {e.title}
                  </div>
                  {/* Description: design system muted */}
                  <div className="mt-2 text-sm text-gray-600 line-clamp-3">
                    {e.caption || e.description || ''}
                  </div>
                </a>
              );
            })}
            {events.length === 0 && (
              <div className="col-span-full text-center py-12 text-gray-500 text-sm">
                No upcoming events.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import Image from 'next/image';
import type { Metadata } from 'next';
import { auth } from '@clerk/nextjs/server';
import { getAppUrl } from '@/lib/env';
import { fetchUserProfileServer } from '@/app/profile/ApiServerActions';
import { parseFocusGroupDescription } from '@/lib/focusGroupExtras';
import FocusGroupJoinLeave from './FocusGroupJoinLeave';
import FocusGroupGuestInterestForm from './FocusGroupGuestInterestForm';
import {
  fetchFocusGroupEventsServer,
  fetchFocusGroupGalleryMediaServer,
  fetchFocusGroupMemberCountServer,
  fetchFocusGroupMembersPublicServer,
} from './FocusGroupDetailApiServerActions';

async function fetchGroup(baseUrl: string, slug: string) {
  try {
    const res = await fetch(
      `${baseUrl}/api/proxy/focus-groups?slug.equals=${encodeURIComponent(slug)}&size=1`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return Array.isArray(data) && data.length > 0 ? data[0] : null;
  } catch {
    return null;
  }
}

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

async function fetchCommitteeMembers(baseUrl: string, focusGroupId: number) {
  try {
    const res = await fetch(
      `${baseUrl}/api/proxy/focus-group-members?focusGroupId.equals=${focusGroupId}&role.in=EXECUTIVE&role.in=ORGANISER&size=50`,
      { cache: 'no-store' }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
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

const PAGE_TOP_OFFSET = 120;

type PageParams = Promise<{ slug: string }> | { slug: string };

async function resolveSlug(params: PageParams): Promise<string> {
  const resolved =
    typeof (params as Promise<{ slug: string }>).then === 'function'
      ? await (params as Promise<{ slug: string }>)
      : (params as { slug: string });
  return typeof resolved.slug === 'string'
    ? resolved.slug
    : Array.isArray(resolved.slug)
      ? resolved.slug[0]
      : '';
}

export async function generateMetadata({
  params,
}: {
  params: PageParams;
}): Promise<Metadata> {
  const slug = await resolveSlug(params);
  const baseUrl = getAppUrl();
  const group = await fetchGroup(baseUrl, slug);
  if (!group) {
    return { title: 'Focus Group' };
  }
  const { description } = parseFocusGroupDescription(group.description);
  const title = group.name || 'Focus Group';
  const desc =
    description?.slice(0, 160) ||
    `Join ${title} — community focus group events, meetings, and updates.`;
  const cover =
    typeof group.coverImageUrl === 'string' && group.coverImageUrl.trim()
      ? group.coverImageUrl.trim()
      : undefined;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      ...(cover ? { images: [{ url: cover }] } : {}),
      type: 'website',
    },
    twitter: {
      card: cover ? 'summary_large_image' : 'summary',
      title,
      description: desc,
      ...(cover ? { images: [cover] } : {}),
    },
  };
}

export default async function FocusGroupDetailPage({ params }: { params: PageParams }) {
  const slug = await resolveSlug(params);
  const baseUrl = getAppUrl();
  const group = await fetchGroup(baseUrl, slug);

  const { description: publicDescription, extras } = parseFocusGroupDescription(group?.description);
  const events = group?.id ? await fetchFocusGroupEventsServer(group.id) : [];
  const memberCount = group?.id ? await fetchFocusGroupMemberCountServer(group.id) : 0;
  const galleryMedia = group?.id ? await fetchFocusGroupGalleryMediaServer(group.id) : [];

  const { userId } = await auth();
  const profile = userId ? await fetchUserProfileServer(userId) : null;
  const isLoggedIn = !!userId;
  const myMembership =
    group?.id && profile?.id ? await fetchMyMembership(baseUrl, group.id, profile.id) : null;
  const isMember = !!myMembership && (myMembership.status === 'ACTIVE' || !myMembership.status);
  const membershipId = myMembership?.id ?? null;

  const showMemberGallery = extras.showMemberGalleryPublic === true || isMember;
  const memberGallery =
    showMemberGallery && group?.id ? await fetchFocusGroupMembersPublicServer(group.id) : [];

  const committeeRaw = group?.id ? await fetchCommitteeMembers(baseUrl, group.id) : [];
  const committeeWithProfiles = await Promise.all(
    committeeRaw.map(async (m: { userProfileId?: number; id?: number; role?: string }, idx: number) => {
      const userProfileId = m?.userProfileId ?? (m as { user_profile_id?: number }).user_profile_id;
      const profileData = userProfileId ? await fetchUserProfileById(baseUrl, userProfileId) : null;
      const first =
        (profileData as { firstName?: string })?.firstName ??
        (profileData as { first_name?: string })?.first_name ??
        '';
      const last =
        (profileData as { lastName?: string })?.lastName ??
        (profileData as { last_name?: string })?.last_name ??
        '';
      const email = (profileData as { email?: string })?.email ?? '';
      const name = profileData
        ? [first, last].filter(Boolean).join(' ') || email || 'Organiser'
        : 'Organiser';
      return {
        ...m,
        displayName: name,
        email: isMember ? email : '',
        role: m?.role,
        _idx: idx,
      };
    })
  );

  const coverUrl =
    typeof group?.coverImageUrl === 'string' && group.coverImageUrl.trim()
      ? group.coverImageUrl.trim()
      : null;
  const groupName = group?.name || 'Focus Group';

  const galleryItems: Array<{
    id?: number;
    fileUrl?: string;
    title?: string;
    description?: string;
    altText?: string;
  }> = [];
  if (coverUrl) {
    galleryItems.push({
      fileUrl: coverUrl,
      title: `${groupName} cover`,
      altText: `${groupName} cover`,
    });
  }
  for (const item of galleryMedia) {
    if (!item.fileUrl || item.fileUrl === coverUrl) continue;
    galleryItems.push(item);
  }

  const cardAccentColors = ['border-indigo-500', 'border-teal-500', 'border-amber-500'] as const;

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50"
      style={{ paddingTop: `${PAGE_TOP_OFFSET}px` }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-4 sm:mb-6 md:mb-8">
          <div
            className="relative w-full h-[250px] overflow-hidden rounded-xl shadow-md bg-transparent"
            style={{
              backgroundImage: coverUrl ? `url(${coverUrl})` : undefined,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
            role="img"
            aria-label={groupName ? `${groupName} cover` : 'Focus group cover'}
          >
            {!coverUrl && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-gray-400 text-sm">No cover image</span>
              </div>
            )}
          </div>
          <h1 className="mt-6 text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 pb-2 border-b-2 border-indigo-200 text-center sm:text-left">
            {groupName}
          </h1>
          <p className="text-sm text-gray-500 text-center sm:text-left mb-2">
            {memberCount === 1 ? '1 member' : `${memberCount} members`}
          </p>
          <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left max-w-3xl whitespace-pre-wrap">
            {publicDescription || 'Details coming soon.'}
          </p>
          {group?.id && (
            <div className="mt-4 flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-3">
                <FocusGroupJoinLeave
                  focusGroupId={group.id}
                  isLoggedIn={isLoggedIn}
                  isMember={isMember}
                  membershipId={membershipId}
                  membershipStatus={myMembership?.status ?? null}
                  groupName={groupName}
                  redirectUrl={`/focus-groups/${slug}`}
                />
              </div>
              {!isLoggedIn && (
                <FocusGroupGuestInterestForm focusGroupId={group.id} groupName={groupName} />
              )}
            </div>
          )}
        </div>

        {extras.announcements?.trim() && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-indigo-800 border-l-4 border-indigo-500 pl-3 mb-4">
              Announcements
            </h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{extras.announcements}</p>
            </div>
          </div>
        )}

        {extras.meetingSchedule?.trim() && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-indigo-800 border-l-4 border-indigo-500 pl-3 mb-4">
              Meeting Schedule
            </h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{extras.meetingSchedule}</p>
            </div>
          </div>
        )}

        {committeeWithProfiles.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-indigo-800 border-l-4 border-indigo-500 pl-3 mb-4 sm:mb-6">
              Contact Organisers
            </h2>
            <div className="bg-white rounded-lg shadow-md p-6">
              <ul className="space-y-3" role="list">
                {committeeWithProfiles.map(
                  (m: {
                    id?: number;
                    _idx?: number;
                    displayName: string;
                    role?: string;
                    email?: string;
                  }) => (
                    <li key={m.id ?? m._idx ?? 0} className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
                      <span className="font-medium text-gray-900">{m.displayName}</span>
                      {m.role && (
                        <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 text-xs font-medium">
                          {m.role}
                        </span>
                      )}
                      {m.email && (
                        <a href={`mailto:${m.email}`} className="text-indigo-600 hover:underline text-xs">
                          {m.email}
                        </a>
                      )}
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>
        )}

        {showMemberGallery && memberGallery.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-indigo-800 border-l-4 border-indigo-500 pl-3 mb-4">
              Members
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {memberGallery.map((m) => (
                <div
                  key={m.membershipId || m.userProfileId}
                  className="bg-white rounded-lg shadow-sm p-3 flex flex-col items-center text-center"
                >
                  <div className="relative w-14 h-14 rounded-full overflow-hidden bg-indigo-100 mb-2">
                    {m.imageUrl ? (
                      <Image src={m.imageUrl} alt={m.displayName} fill className="object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-indigo-600 font-semibold">
                        {(m.displayName || 'M').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="text-xs font-medium text-gray-900 line-clamp-2">{m.displayName}</div>
                  {m.role && m.role !== 'MEMBER' && (
                    <div className="text-[10px] text-indigo-600 mt-0.5">{m.role}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {galleryItems.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-indigo-800 border-l-4 border-indigo-500 pl-3 mb-4">
              Gallery
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {galleryItems.map((item, idx) => (
                <div
                  key={item.id ?? `${item.fileUrl}-${idx}`}
                  className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 shadow-sm"
                >
                  {item.fileUrl && (
                    <Image
                      src={item.fileUrl}
                      alt={item.altText || item.title || 'Gallery image'}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 25vw"
                      unoptimized
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-lg font-semibold text-indigo-800 border-l-4 border-indigo-500 pl-3 mb-4 sm:mb-6">
            Upcoming Events
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {events.map((e: { id?: number; startDate?: string; startTime?: string; title?: string; caption?: string; description?: string }, idx: number) => {
              const accentClass = cardAccentColors[idx % cardAccentColors.length];
              return (
                <a
                  key={e.id}
                  href={`/events/${e.id}`}
                  className={`border border-gray-200 rounded-lg p-4 sm:p-5 hover:shadow-md transition-all duration-300 bg-white border-l-4 ${accentClass} hover:border-indigo-400`}
                  title={e.title}
                >
                  <div className="text-sm font-medium text-indigo-600 truncate">
                    {e.startDate} • {e.startTime}
                  </div>
                  <div className="mt-1 text-lg font-semibold text-gray-900 hover:text-indigo-700 transition-colors">
                    {e.title}
                  </div>
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

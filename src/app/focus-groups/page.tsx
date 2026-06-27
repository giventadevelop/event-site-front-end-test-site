import Image from 'next/image';
import { getAppUrl } from '@/lib/env';
import FocusGroupsGridWithSearch from './FocusGroupsGridWithSearch';
import SubpageHomeDesignBackground from '@/components/SubpageHomeDesignBackground';
import subpageStyles from '@/components/SubpageHomeDesign.module.css';

async function fetchEventsForGroup(baseUrl: string, groupId: number) {
  try {
    const res = await fetch(`${baseUrl}/api/proxy/event-details?focusGroupId.equals=${groupId}&isActive.equals=true&sort=startDate,asc&size=3`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export default async function FocusGroupsPage() {
  const baseUrl = getAppUrl();
  const sort = 'name,asc';
  const size = 50;

  let groups: any[] = [];
  let total = 0;
  try {
    const res = await fetch(`${baseUrl}/api/proxy/focus-groups?isActive.equals=true&page=0&size=${size}&sort=${encodeURIComponent(sort)}`, {
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      groups = Array.isArray(data) ? data : [];
      total = Number(res.headers.get('x-total-count') || groups.length || 0);
    }
  } catch { }

  const groupsWithEvents = await Promise.all(
    groups.map(async (group) => {
      const events = group?.id ? await fetchEventsForGroup(baseUrl, group.id) : [];
      return { ...group, events };
    })
  );

  return (
    <>
      <SubpageHomeDesignBackground bodyClass="focus-groups-page-background" />
      <div
        className={`${subpageStyles.subpageRoot} home-page-layout relative z-[1] min-h-screen w-full overflow-x-hidden`}
      >
        <div
          className="w-full max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8"
          style={{ paddingTop: '120px', paddingBottom: '2rem' }}
        >
          <div className="mb-4 sm:mb-6 md:mb-8">
            <h1 className="hidden text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 text-center sm:text-left">
              Focus Groups
            </h1>
            <p className="hidden text-xs sm:text-sm text-gray-600 text-center sm:text-left">
              Explore our specialized groups and their upcoming activities.
            </p>
            <div className="mt-4 sm:mt-6 w-full rounded-lg overflow-hidden relative">
              <Image
                src="/images/MalayaleeUS-subpage-HeroImage.png"
                alt="Focus Groups"
                width={1200}
                height={400}
                className="w-full h-auto object-contain"
                priority
                sizes="100vw"
              />
              <div className="absolute inset-y-0 left-0 flex flex-col justify-center pl-6 sm:pl-8 lg:pl-12 pr-8 bg-gradient-to-r from-black/60 via-black/30 to-transparent max-w-xs sm:max-w-md">
                <span className="text-lg sm:text-xl lg:text-2xl font-bold text-white drop-shadow-md">
                  Focus Group
                </span>
                <span className="text-xs sm:text-sm text-white/95 drop-shadow-md mt-1 sm:mt-2">
                  Explore our specialized groups and their upcoming activities.
                </span>
              </div>
            </div>
          </div>

          <div className="homepage-glass-card services-glass-card-face rounded-2xl p-6 lg:p-8 mb-8 w-full max-w-[75%] mx-auto">
            <FocusGroupsGridWithSearch groups={groupsWithEvents} total={total} />
          </div>
        </div>
      </div>
    </>
  );
}

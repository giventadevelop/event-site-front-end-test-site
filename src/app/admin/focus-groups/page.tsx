import { getAppUrl } from '@/lib/env';
import AdminNavigation from '@/components/AdminNavigation';
import FocusGroupsListWithSearch from './FocusGroupsListWithSearch';

export default async function AdminFocusGroupsPage({ searchParams }: { searchParams?: { [k: string]: string | string[] | undefined } | Promise<{ [k: string]: string | string[] | undefined }> }) {
  const resolvedSearchParams = typeof searchParams?.then === 'function' ? await searchParams : searchParams;

  const baseUrl = getAppUrl();
  const sort = typeof resolvedSearchParams?.sort === 'string' ? resolvedSearchParams?.sort : 'createdAt,desc';
  // Fetch a larger set for client-side search (same pattern as executive-committee)
  const size = 1000;
  const page = 0;

  let groups: any[] = [];
  let total = 0;
  try {
    const url = `${baseUrl}/api/proxy/focus-groups?page=${page}&size=${size}&sort=${encodeURIComponent(sort)}`;

    const res = await fetch(url, { cache: 'no-store' });

    if (res.ok) {
      const data = await res.json();

      if (Array.isArray(data)) {
        groups = data;
      } else if (data && typeof data === 'object' && Array.isArray(data.content)) {
        groups = data.content;
      } else if (data && typeof data === 'object' && data.id) {
        groups = [data];
      } else {
        groups = [];
      }

      const totalCountHeader = res.headers.get('x-total-count') || res.headers.get('X-Total-Count');
      if (totalCountHeader) {
        total = Number(totalCountHeader);
      } else if (data && typeof data === 'object' && typeof data.totalElements === 'number') {
        total = data.totalElements;
      } else {
        total = groups.length;
      }
    } else {
      await res.text();
    }
  } catch (err) {
    console.error('[FocusGroups] Error fetching focus groups:', err);
  }

  return (
    <div className="w-full overflow-x-hidden box-border" style={{ paddingTop: '120px' }}>
      {/* Navigation Section - Full Width, Separate Responsive Container */}
      <div className="w-full px-2 sm:px-3 md:px-4 lg:px-6 xl:px-8 mb-6 sm:mb-8">
        <AdminNavigation />
      </div>
      {/* Main Content Section - Constrained Width */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-white text-center sm:text-left">Manage Focus Groups</h1>
          <a href="/admin/focus-groups/new" className="flex-shrink-0 h-12 sm:h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-2 sm:gap-3 transition-all duration-300 hover:scale-105 px-3 sm:px-6">
            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-200 flex items-center justify-center">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="font-semibold text-blue-700 text-xs sm:text-sm lg:text-base whitespace-nowrap">New Group</span>
          </a>
        </div>

        <FocusGroupsListWithSearch groups={groups} total={total} />
      </div>
    </div>
  );
}

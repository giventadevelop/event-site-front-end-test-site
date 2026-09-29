'use client';

import { Suspense, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import LiveUrlSearch from '../../components/LiveUrlSearch';

const SELECT_CLASS =
  'font-syro-primary w-full px-3 py-2 border border-syro-table-border rounded-lg bg-white text-syro-blue focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2';

const SEARCH_INPUT_CLASS =
  'font-syro-primary w-full px-4 py-2 border border-syro-table-border rounded-lg bg-white text-syro-blue placeholder:text-syro-dark-gray focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2';

export type ManagingCommitteeMembersFiltersProps = {
  dioceses: string[];
  roles: string[];
  regions: string[];
};

/**
 * Live text search + diocese / role / region dropdowns (URL params: q, diocese, role, region).
 * Options come from the loaded roster so empty Strapi still renders cleanly.
 */
export default function ManagingCommitteeMembersFilters(props: ManagingCommitteeMembersFiltersProps) {
  return (
    <Suspense
      fallback={
        <div className="space-y-3 mb-6">
          <div className="h-10 w-full animate-pulse rounded-lg bg-syro-table-border/40" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="h-10 animate-pulse rounded-lg bg-syro-table-border/40" />
            <div className="h-10 animate-pulse rounded-lg bg-syro-table-border/40" />
            <div className="h-10 animate-pulse rounded-lg bg-syro-table-border/40" />
          </div>
        </div>
      }
    >
      <ManagingCommitteeMembersFiltersInner {...props} />
    </Suspense>
  );
}

function ManagingCommitteeMembersFiltersInner({
  dioceses,
  roles,
  regions,
}: ManagingCommitteeMembersFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  /** Bump to remount LiveUrlSearch so its local input state clears with URL filters. */
  const [searchResetKey, setSearchResetKey] = useState(0);

  const dioceseValue = searchParams.get('diocese') ?? '';
  const roleValue = searchParams.get('role') ?? '';
  const regionValue = searchParams.get('region') ?? '';

  const setFilter = (param: 'diocese' | 'role' | 'region', value: string) => {
    const next = new URLSearchParams(searchParams.toString());
    next.delete('page');
    if (value.trim()) next.set(param, value.trim());
    else next.delete(param);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const hasAnyFilter = Boolean(
    searchParams.get('q')?.trim() || dioceseValue || roleValue || regionValue
  );

  const clearAllFilters = () => {
    setSearchResetKey((k) => k + 1);
    router.replace(pathname, { scroll: false });
  };

  return (
    <div className="mb-6 space-y-3" role="search" aria-label="Search and filter Managing Committee members">
      <LiveUrlSearch
        key={searchResetKey}
        id="managing-committee-members-search"
        ariaLabel="Search Managing Committee members by name, diocese, role, or region"
        label="Search by name, diocese, role, or region"
        placeholder="Search by name (or diocese / role / region)..."
        preserveParams={['diocese', 'role', 'region']}
        inputClassName={SEARCH_INPUT_CLASS}
      />

      {(dioceses.length > 0 || roles.length > 0 || regions.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {dioceses.length > 0 ? (
            <div>
              <label htmlFor="mcm-filter-diocese" className="sr-only">
                Filter by diocese
              </label>
              <select
                id="mcm-filter-diocese"
                className={SELECT_CLASS}
                value={dioceseValue}
                onChange={(e) => setFilter('diocese', e.target.value)}
                aria-label="Filter by diocese"
              >
                <option value="">All dioceses</option>
                {dioceses.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {roles.length > 0 ? (
            <div>
              <label htmlFor="mcm-filter-role" className="sr-only">
                Filter by role
              </label>
              <select
                id="mcm-filter-role"
                className={SELECT_CLASS}
                value={roleValue}
                onChange={(e) => setFilter('role', e.target.value)}
                aria-label="Filter by role"
              >
                <option value="">All roles</option>
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {regions.length > 0 ? (
            <div>
              <label htmlFor="mcm-filter-region" className="sr-only">
                Filter by elected region
              </label>
              <select
                id="mcm-filter-region"
                className={SELECT_CLASS}
                value={regionValue}
                onChange={(e) => setFilter('region', e.target.value)}
                aria-label="Filter by elected region"
              >
                <option value="">All regions</option>
                {regions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </div>
      )}

      {hasAnyFilter ? (
        <button
          type="button"
          onClick={clearAllFilters}
          className="font-syro-primary text-sm text-syro-dark-gray hover:text-syro-red hover:underline"
        >
          Clear all filters
        </button>
      ) : null}
    </div>
  );
}

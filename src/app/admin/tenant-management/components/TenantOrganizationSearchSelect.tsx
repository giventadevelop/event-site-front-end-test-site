'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { TenantOrganizationDTO } from '@/app/admin/tenant-management/types';
import {
  fetchRecentTenantOrganizationsForSelectServer,
  searchTenantOrganizationsForSelectServer,
} from '@/app/admin/tenant-management/organizations/organizationSelectServerActions';

const TENANT_ORG_SELECT_LIMIT = 20;

function formatOrgLabel(org: TenantOrganizationDTO): string {
  const name = org.organizationName?.trim() || 'Unnamed organization';
  const tenantId = org.tenantId?.trim() || '—';
  return `${name} (${tenantId})`;
}

function filterOrganizationsLocally(
  organizations: TenantOrganizationDTO[],
  query: string,
): TenantOrganizationDTO[] {
  const q = query.trim().toLowerCase();
  if (!q) return organizations;

  return organizations.filter((org) => {
    const name = org.organizationName?.toLowerCase() ?? '';
    const tenantId = org.tenantId?.toLowerCase() ?? '';
    const domain = org.domain?.toLowerCase() ?? '';
    return name.includes(q) || tenantId.includes(q) || domain.includes(q);
  });
}

interface TenantOrganizationSearchSelectProps {
  value?: string;
  onChange: (tenantId: string) => void;
  initialOrganizations?: TenantOrganizationDTO[];
  error?: string;
  required?: boolean;
}

export default function TenantOrganizationSearchSelect({
  value = '',
  onChange,
  initialOrganizations = [],
  error,
  required = true,
}: TenantOrganizationSearchSelectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [cachedOrganizations, setCachedOrganizations] = useState<TenantOrganizationDTO[]>(
    initialOrganizations,
  );
  const [displayOrganizations, setDisplayOrganizations] = useState<TenantOrganizationDTO[]>(
    initialOrganizations,
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<TenantOrganizationDTO | null>(null);

  const syncSelectedFromValue = useCallback(
    (organizations: TenantOrganizationDTO[], tenantId: string) => {
      if (!tenantId) {
        setSelectedOrg(null);
        return;
      }
      const match = organizations.find((org) => org.tenantId === tenantId);
      if (match) {
        setSelectedOrg(match);
        setSearchTerm(formatOrgLabel(match));
      }
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadRecent() {
      if (initialOrganizations.length > 0) {
        setCachedOrganizations(initialOrganizations);
        setDisplayOrganizations(initialOrganizations);
        syncSelectedFromValue(initialOrganizations, value);
        return;
      }

      setLoading(true);
      setLoadError(null);
      try {
        const recent = await fetchRecentTenantOrganizationsForSelectServer();
        if (cancelled) return;
        setCachedOrganizations(recent);
        setDisplayOrganizations(recent);
        syncSelectedFromValue(recent, value);
        if (recent.length === 0) {
          setLoadError('No organizations found. Create one under Tenant Organizations first.');
        }
      } catch {
        if (!cancelled) {
          setLoadError('Could not load organizations. Check that the API is running.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadRecent();
    return () => {
      cancelled = true;
    };
  }, [initialOrganizations, syncSelectedFromValue, value]);

  useEffect(() => {
    syncSelectedFromValue(cachedOrganizations, value);
  }, [value, cachedOrganizations, syncSelectedFromValue]);

  useEffect(() => {
    if (!value?.trim() || selectedOrg?.tenantId === value) return;

    const inCache = cachedOrganizations.some((org) => org.tenantId === value);
    if (inCache) return;

    let cancelled = false;

    async function resolvePreselected() {
      setLoading(true);
      try {
        const results = await searchTenantOrganizationsForSelectServer(value);
        if (cancelled) return;
        const match = results.find((org) => org.tenantId === value) ?? results[0];
        if (match) {
          setCachedOrganizations((prev) => {
            const byId = new Map<number, TenantOrganizationDTO>();
            for (const org of [match, ...prev]) {
              if (org.id != null) byId.set(org.id, org);
            }
            return Array.from(byId.values()).slice(0, TENANT_ORG_SELECT_LIMIT);
          });
          setSelectedOrg(match);
          setSearchTerm(formatOrgLabel(match));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void resolvePreselected();
    return () => {
      cancelled = true;
    };
  }, [value, cachedOrganizations, selectedOrg?.tenantId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (selectedOrg) {
          setSearchTerm(formatOrgLabel(selectedOrg));
        } else if (!value) {
          setSearchTerm('');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedOrg, value]);

  const runSearch = useCallback(
    (term: string) => {
      const trimmed = term.trim();

      if (!trimmed) {
        setDisplayOrganizations(cachedOrganizations);
        return;
      }

      const localMatches = filterOrganizationsLocally(cachedOrganizations, trimmed);
      if (localMatches.length > 0) {
        setDisplayOrganizations(localMatches.slice(0, TENANT_ORG_SELECT_LIMIT));
      }

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          const results = await searchTenantOrganizationsForSelectServer(trimmed);
          setDisplayOrganizations(results.slice(0, TENANT_ORG_SELECT_LIMIT));
          if (results.length > 0) {
            setCachedOrganizations((prev) => {
              const byId = new Map<number, TenantOrganizationDTO>();
              for (const org of [...results, ...prev]) {
                if (org.id != null) byId.set(org.id, org);
              }
              return Array.from(byId.values()).slice(0, TENANT_ORG_SELECT_LIMIT);
            });
          }
        } catch {
          setDisplayOrganizations(localMatches.slice(0, TENANT_ORG_SELECT_LIMIT));
        } finally {
          setLoading(false);
        }
      }, 300);
    },
    [cachedOrganizations],
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setIsOpen(true);
    if (!term.trim()) {
      setSelectedOrg(null);
      onChange('');
    }
    runSearch(term);
  };

  const handleSelect = (org: TenantOrganizationDTO) => {
    if (!org.tenantId) return;
    setSelectedOrg(org);
    setSearchTerm(formatOrgLabel(org));
    onChange(org.tenantId);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedOrg(null);
    setSearchTerm('');
    onChange('');
    setDisplayOrganizations(cachedOrganizations);
    setIsOpen(true);
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Tenant Organization {required && '*'}
      </label>
      <p className="text-xs text-gray-500 mb-2">
        Showing up to {TENANT_ORG_SELECT_LIMIT} most recently added organizations. Type to search by
        name, tenant ID, or domain.
      </p>

      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => setIsOpen(true)}
          placeholder="Search organizations..."
          className={`mt-1 block w-full border rounded-xl focus:ring-blue-500 pl-10 pr-10 px-4 py-3 text-base ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-400 focus:border-blue-500'
          }`}
          aria-label="Search tenant organization"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          autoComplete="off"
        />
        {(selectedOrg || searchTerm) && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            title="Clear selection"
            aria-label="Clear selection"
          >
            ×
          </button>
        )}
      </div>

      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-72 overflow-y-auto"
          role="listbox"
        >
          {loading && displayOrganizations.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">Loading organizations...</div>
          ) : displayOrganizations.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              {loadError || 'No matching organizations. Try a different search or create a new organization.'}
            </div>
          ) : (
            <ul className="py-1">
              {displayOrganizations.map((org) => (
                <li key={org.id ?? org.tenantId}>
                  <button
                    type="button"
                    onClick={() => handleSelect(org)}
                    className={`w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors ${
                      value === org.tenantId ? 'bg-blue-100' : ''
                    }`}
                    role="option"
                    aria-selected={value === org.tenantId}
                  >
                    <div className="font-medium text-gray-900">{org.organizationName}</div>
                    <div className="text-sm text-gray-500">
                      {org.tenantId}
                      {org.domain ? ` · ${org.domain}` : ''}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {selectedOrg && !isOpen && (
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg text-sm">
          <span className="font-medium text-blue-900">Selected: </span>
          <span className="text-blue-800">{formatOrgLabel(selectedOrg)}</span>
        </div>
      )}

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {loadError && !error && cachedOrganizations.length === 0 && (
        <p className="mt-1 text-sm text-orange-600">{loadError}</p>
      )}
    </div>
  );
}

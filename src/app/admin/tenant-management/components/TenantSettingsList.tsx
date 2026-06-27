'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaSearch, FaSort } from 'react-icons/fa';
import type { TenantSettingsDTO, TenantSettingsFilters, PaginationParams } from '@/app/admin/tenant-management/types';

interface TenantSettingsListProps {
  initialData?: TenantSettingsDTO[];
  initialTotalCount?: number;
  onRefresh?: () => void;
}

export default function TenantSettingsList({
  initialData = [],
  initialTotalCount = 0,
  onRefresh
}: TenantSettingsListProps) {
  // Don't use initialData in state to prevent flash - we'll fetch filtered data immediately
  const [settings, setSettings] = useState<TenantSettingsDTO[]>([]);
  const [loading, setLoading] = useState(true); // Start with loading true to prevent flash
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Filter state
  const [filters, setFilters] = useState<TenantSettingsFilters>({
    search: '',
    tenantId: '',
    sortBy: 'tenantId',
    sortOrder: 'asc'
  });

  // Selection state for bulk operations
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [organizationNameByTenantId, setOrganizationNameByTenantId] = useState<Record<string, string>>({});

  // Track if initial load has completed
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Load data function
  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/proxy/tenant-settings?' + new URLSearchParams({
        page: currentPage.toString(),
        size: pageSize.toString(),
        ...(filters.search && { 'tenantId.contains': filters.search }),
        ...(filters.tenantId && { 'tenantId.equals': filters.tenantId }),
        ...(filters.sortBy && { sort: `${filters.sortBy},${filters.sortOrder}` })
      }));

      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      const total = parseInt(response.headers.get('x-total-count') || '0');

      setSettings(Array.isArray(data) ? data : []);
      setTotalCount(total);
      setInitialLoadComplete(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadOrganizations = async () => {
    try {
      const response = await fetch('/api/proxy/tenant-organizations?' + new URLSearchParams({
        page: '0',
        size: '1000',
      }));

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        return;
      }

      const map: Record<string, string> = {};
      for (const org of data) {
        if (org?.tenantId && org?.organizationName) {
          map[String(org.tenantId)] = String(org.organizationName);
        }
      }
      setOrganizationNameByTenantId(map);
    } catch (err) {
      console.error('Failed to load tenant organizations for settings list:', err);
    }
  };

  // Load data on mount and when filters/pagination change
  useEffect(() => {
    loadData();
  }, [currentPage, pageSize, filters]);

  useEffect(() => {
    loadOrganizations();
  }, []);

  // Handle search
  const handleSearch = (searchTerm: string) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
    setCurrentPage(0); // Reset to first page when searching
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof TenantSettingsFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(0);
  };

  // Handle sorting
  const handleSort = (field: 'tenantId' | 'createdAt') => {
    setFilters(prev => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? settings.map(setting => setting.id!).filter(Boolean) : []);
  };

  const handleSelectOne = (id: number, checked: boolean) => {
    setSelectedIds(prev =>
      checked
        ? [...prev, id]
        : prev.filter(selectedId => selectedId !== id)
    );
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete these settings?')) {
      return;
    }

    try {
      const response = await fetch(`/api/proxy/tenant-settings/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadData(); // Refresh the list
        onRefresh?.();
      }
    } catch (err) {
      console.error('Failed to delete settings:', err);
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(totalCount / pageSize);
  const hasPrevPage = currentPage > 0;
  const hasNextPage = currentPage < totalPages - 1;
  const startItem = totalCount > 0 ? currentPage * pageSize + 1 : 0;
  const endItem = currentPage * pageSize + settings.length;

  if (loading && settings.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 sm:p-4 md:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white text-center sm:text-left">Tenant Settings</h2>
      </div>

      {/* Search and Filters */}
      <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search by tenant ID..."
                value={filters.search || ''}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-xs sm:text-sm"
              />
            </div>
          </div>
          <input
            type="text"
            placeholder="Filter by specific tenant ID..."
            value={filters.tenantId || ''}
            onChange={(e) => handleFilterChange('tenantId', e.target.value || undefined)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white text-xs sm:text-sm"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="user-table-scroll-container">
          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600 border border-gray-300 dark:border-gray-600" style={{ minWidth: '1040px', width: '100%' }}>
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="w-12 px-2 sm:px-3 py-2 sm:py-3 text-left border-b border-r border-gray-300 dark:border-gray-600">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === settings.length && settings.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="custom-checkbox"
                    onClick={(e) => e.stopPropagation()}
                  />
                </th>
                <th
                  className="w-44 px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 border-b border-r border-gray-300 dark:border-gray-600"
                  onClick={() => handleSort('tenantId')}
                >
                  <div className="flex items-center gap-2">
                    Tenant ID
                    <FaSort className="text-xs" />
                  </div>
                </th>
                <th className="w-44 px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-r border-gray-300 dark:border-gray-600">
                  Organization
                </th>
                <th className="w-36 px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-r border-gray-300 dark:border-gray-600">
                  User Registration
                </th>
                <th className="w-36 px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-r border-gray-300 dark:border-gray-600">
                  WhatsApp Integration
                </th>
                <th className="w-36 px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-r border-gray-300 dark:border-gray-600">
                  Email Marketing
                </th>
                <th className="w-36 px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-r border-gray-300 dark:border-gray-600">
                  Max Events/Month
                </th>
                <th className="w-48 px-2 sm:px-4 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b border-gray-300 dark:border-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-300 dark:divide-gray-600">
            {settings.map((setting, index) => (
              <tr key={setting.id} className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-blue-50 dark:bg-gray-700'} hover:bg-yellow-100 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-300 dark:border-gray-600`}>
                <td className="w-12 px-2 sm:px-3 py-2 sm:py-4 whitespace-nowrap border-r border-gray-200 dark:border-gray-600">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(setting.id!)}
                    onChange={(e) => handleSelectOne(setting.id!, e.target.checked)}
                    className="custom-checkbox"
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                <td className="w-44 px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900 dark:text-white border-r border-gray-200 dark:border-gray-600">
                  {setting.tenantId}
                </td>
                <td className="w-44 px-2 sm:px-4 py-2 sm:py-4 text-xs sm:text-sm text-gray-700 dark:text-gray-300 border-r border-gray-200 dark:border-gray-600">
                  {setting.tenantOrganization?.organizationName ||
                    organizationNameByTenantId[setting.tenantId] ||
                    '—'}
                </td>
                <td className="w-36 px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap border-r border-gray-200 dark:border-gray-600">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${setting.allowUserRegistration
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                    {setting.allowUserRegistration ? 'Enabled' : 'Disabled'}
                  </span>
                </td>
                <td className="w-36 px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap border-r border-gray-200 dark:border-gray-600">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${setting.enableWhatsappIntegration
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                    {setting.enableWhatsappIntegration ? 'Enabled' : 'Disabled'}
                  </span>
                </td>
                <td className="w-36 px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap border-r border-gray-200 dark:border-gray-600">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${setting.enableEmailMarketing
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                    {setting.enableEmailMarketing ? 'Enabled' : 'Disabled'}
                  </span>
                </td>
                <td className="w-36 px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-600">
                  {setting.maxEventsPerMonth || 'Unlimited'}
                </td>
                <td className="w-48 px-2 sm:px-4 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                  <div className="flex items-center justify-end gap-1 sm:gap-2" onClick={(e) => e.stopPropagation()}>
                    <Link
                      href={`/admin/tenant-management/settings/${setting.id}`}
                      className="flex-shrink-0 w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 flex items-center justify-center transition-all duration-300 hover:scale-110"
                      title="View details"
                      aria-label="View details"
                    >
                      <svg className="w-6 h-6 sm:w-10 sm:h-10 text-green-700 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>
                    <Link
                      href={`/admin/tenant-management/settings/${setting.id}/edit`}
                      className="flex-shrink-0 w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 flex items-center justify-center transition-all duration-300 hover:scale-110"
                      title="Edit settings"
                      aria-label="Edit settings"
                    >
                      <svg className="w-6 h-6 sm:w-10 sm:h-10 text-blue-500 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleDelete(setting.id!)}
                      className="flex-shrink-0 w-10 h-10 sm:w-14 sm:h-14 rounded-xl bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 flex items-center justify-center transition-all duration-300 hover:scale-110"
                      title="Delete settings"
                      aria-label="Delete settings"
                      type="button"
                    >
                      <svg className="w-6 h-6 sm:w-10 sm:h-10 text-red-500 dark:text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {settings.length === 0 && !loading && (
              <tr>
                <td className="px-2 sm:px-4 py-4 text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-center" colSpan={8}>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-sm">
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium text-orange-700">No settings found</span>
                    <span className="text-sm text-orange-600">[No settings match your criteria]</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Pagination Controls - Always visible, matching admin page style */}
      <div className="mt-8">
        <div className="flex justify-between items-center gap-2">
          {/* Previous Button */}
          <button
            onClick={() => setCurrentPage(prev => prev - 1)}
            disabled={!hasPrevPage || loading}
            className="px-3 sm:px-5 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg shadow-sm border-2 border-blue-400 hover:border-blue-500 disabled:bg-blue-100 disabled:border-blue-300 disabled:text-blue-500 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md"
            title="Previous Page"
            aria-label="Previous Page"
            type="button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="hidden sm:inline">Previous</span>
          </button>

          {/* Page Info */}
          <div className="px-2 sm:px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm flex-shrink-0">
            <span className="text-xs sm:text-sm font-bold text-blue-700">
              Page <span className="text-blue-600">{currentPage + 1}</span> of <span className="text-blue-600">{totalPages || 1}</span>
            </span>
          </div>

          {/* Next Button */}
          <button
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={!hasNextPage || loading}
            className="px-3 sm:px-5 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg shadow-sm border-2 border-blue-400 hover:border-blue-500 disabled:bg-blue-100 disabled:border-blue-300 disabled:text-blue-500 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md"
            title="Next Page"
            aria-label="Next Page"
            type="button"
          >
            <span className="hidden sm:inline">Next</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Item Count Text */}
        <div className="text-center mt-3">
          {totalCount > 0 ? (
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Showing <span className="font-bold text-blue-600 dark:text-blue-400">{startItem}</span> to <span className="font-bold text-blue-600 dark:text-blue-400">{endItem}</span> of <span className="font-bold text-blue-600 dark:text-blue-400">{totalCount}</span> settings
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-sm">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-orange-700">No settings found</span>
              <span className="text-sm text-orange-600">[No settings match your criteria]</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

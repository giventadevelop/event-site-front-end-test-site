'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { TenantEmailAddressDTO } from '@/types';
import { fetchTenantEmailAddressesServer } from '@/app/admin/tenant-email-addresses/ApiServerActions';

interface FromEmailSelectProps {
  value?: string;
  onChange: (email: string | undefined) => void;
  required?: boolean;
  filterByType?: TenantEmailAddressDTO['emailType']; // Optional: filter by email type
  showDisplayName?: boolean; // Show display name in dropdown
  onEmptyListChange?: (isEmpty: boolean) => void; // Callback to notify parent when list is empty
  error?: boolean; // Whether to show error styling (red border)
}

export default function FromEmailSelect({
  value,
  onChange,
  required = false,
  filterByType,
  showDisplayName = true,
  onEmptyListChange,
  error = false,
}: FromEmailSelectProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [emailAddresses, setEmailAddresses] = useState<TenantEmailAddressDTO[]>([]);
  const [filteredEmails, setFilteredEmails] = useState<TenantEmailAddressDTO[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<TenantEmailAddressDTO | null>(null);
  const [isEmptyList, setIsEmptyList] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load tenant email addresses on mount
    loadEmailAddresses();
  }, []);

  useEffect(() => {
    // Filter emails based on search term and optional type filter
    let filtered = emailAddresses;

    // Filter by type if specified (only filter if filterByType is explicitly provided)
    // If filterByType is undefined/null, show all email types
    if (filterByType !== undefined && filterByType !== null) {
      filtered = filtered.filter(email => email.emailType === filterByType);
    }

    // Filter by active status (only show active emails)
    filtered = filtered.filter(email => email.isActive === true);

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(email =>
        email.emailAddress.toLowerCase().includes(term) ||
        (email.displayName?.toLowerCase().includes(term) ?? false) ||
        email.emailType.toLowerCase().includes(term)
      );
    }

    // Sort: default emails first, then by email type, then by email address
    filtered.sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      if (a.emailType !== b.emailType) {
        return a.emailType.localeCompare(b.emailType);
      }
      return a.emailAddress.localeCompare(b.emailAddress);
    });

    // Show all filtered results (no limit) - user can search to narrow down
    setFilteredEmails(filtered);
  }, [searchTerm, emailAddresses, filterByType]);

  useEffect(() => {
    // Find selected email when value changes
    if (value) {
      const email = emailAddresses.find(e => e.emailAddress === value);
      setSelectedEmail(email || null);
      if (email) {
        setSearchTerm(email.emailAddress);
      }
    } else {
      setSelectedEmail(null);
      setSearchTerm('');
    }
  }, [value, emailAddresses]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadEmailAddresses = async () => {
    setLoading(true);
    try {
      // Fetch all email addresses (use large size to get all, regardless of email type)
      // Size of 1000 should be sufficient for most tenants, but we can fetch multiple pages if needed
      const addresses = await fetchTenantEmailAddressesServer(0, 1000);
      setEmailAddresses(addresses);
      // Check if the list is empty
      const isEmpty = Array.isArray(addresses) && addresses.length === 0;
      setIsEmptyList(isEmpty);
      // Notify parent component if callback is provided
      if (onEmptyListChange) {
        onEmptyListChange(isEmpty);
      }
    } catch (err: any) {
      console.error('Failed to load tenant email addresses:', err);
      setEmailAddresses([]);
      setIsEmptyList(true);
      // Notify parent component if callback is provided
      if (onEmptyListChange) {
        onEmptyListChange(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    setIsOpen(true);
    // CRITICAL: If user types but doesn't match the selected email, clear the form value
    // This ensures validation can catch empty field on form submission
    if (selectedEmail) {
      // If there's a selected email but user types something different, clear selection
      if (term !== selectedEmail.emailAddress) {
        setSelectedEmail(null);
        onChange(undefined);
      }
    } else {
      // If no email is selected, ensure form value is always cleared when user types
      // This way validation will catch it if user doesn't select from dropdown
      onChange(undefined);
    }
  };

  const handleSelectEmail = (email: TenantEmailAddressDTO) => {
    setSelectedEmail(email);
    setSearchTerm(email.emailAddress);
    onChange(email.emailAddress);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedEmail(null);
    setSearchTerm('');
    onChange(undefined);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative" style={{ isolation: 'isolate' }}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        From Email {required && <span className="text-red-500">*</span>}
      </label>

      {/* Search Input */}
      <div className="relative" style={{ zIndex: 10000 }}>
        {/* Hidden fake input to trick Chrome autocomplete - must be before the real input */}
        <input
          type="text"
          autoComplete="off"
          tabIndex={-1}
          style={{
            position: 'absolute',
            opacity: 0,
            height: 0,
            width: 0,
            pointerEvents: 'none',
            zIndex: -1
          }}
          aria-hidden="true"
          readOnly
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="search"
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => setIsOpen(true)}
          placeholder="Search email addresses..."
          className={`mt-1 block w-full border rounded-xl pl-10 pr-10 px-4 py-2 text-base ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-400 focus:border-blue-500 focus:ring-blue-500'
          }`}
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck="false"
          data-form-type="other"
          data-lpignore="true"
          data-1p-ignore="true"
          data-browser-autocomplete="off"
          name="fromEmailSearch"
          id="fromEmailSearch"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
        />
        {selectedEmail && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear selection"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (filteredEmails.length > 0 || loading) && (
        <div
          className="absolute w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg"
          style={{
            maxHeight: '400px', // Increased max height to show more results
            overflowY: 'auto',
            zIndex: 9999
          }}
        >
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading email addresses...</div>
          ) : filteredEmails.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No email addresses found</div>
          ) : (
            <ul className="py-1">
              {filteredEmails.map((email) => (
                <li
                  key={email.id}
                  onClick={() => handleSelectEmail(email)}
                  className={`px-4 py-2 cursor-pointer hover:bg-blue-50 ${
                    selectedEmail?.id === email.id ? 'bg-blue-100' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {email.emailAddress}
                        {email.isDefault && (
                          <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded">Default</span>
                        )}
                      </div>
                      {showDisplayName && email.displayName && (
                        <div className="text-sm text-gray-500">{email.displayName}</div>
                      )}
                      <div className="text-xs text-gray-400">
                        Type: {email.emailType}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Selected Email Display */}
      {selectedEmail && !isOpen && (
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm font-medium text-blue-900">
            Selected: {selectedEmail.emailAddress}
          </div>
          {showDisplayName && selectedEmail.displayName && (
            <div className="text-xs text-blue-700">{selectedEmail.displayName}</div>
          )}
          <div className="text-xs text-blue-700">
            Type: {selectedEmail.emailType}
          </div>
        </div>
      )}

      {/* Empty List Error Message */}
      {!loading && isEmptyList && (
        <div className="mt-2 p-3 bg-red-50 border border-red-300 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-red-700">
              The from email list is empty. Please contact Admin to add the list of from email addresses.
            </p>
          </div>
        </div>
      )}

      {/* Help Text */}
      {!isEmptyList && (
        <p className="mt-1 text-sm text-gray-500">
          Select a verified email address from your tenant configuration. Only active addresses are shown.
        </p>
      )}
    </div>
  );
}


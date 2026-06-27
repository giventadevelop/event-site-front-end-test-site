'use client';
import { useEffect, useState, useRef } from 'react';
import type { UserProfileDTO } from '@/types';
import Link from 'next/link';
import ReactDOM from 'react-dom';
// Icons removed - using inline SVGs instead
import * as XLSX from 'xlsx';
import { getTenantId } from '@/lib/env';
import { fetchUsersServer, patchUserProfileServer, bulkUploadUsersServer } from './ApiServerActions';
import AdminNavigation from '@/components/AdminNavigation';
import SuccessDialog from '@/components/SuccessDialog';

// Import UserDetailsTooltip and EditUserModal from the same file or extract if needed
// ... (copy UserDetailsTooltip and EditUserModal here or import them)

const SEARCH_FIELDS = [
  { label: 'First Name', value: 'firstName' },
  { label: 'Last Name', value: 'lastName' },
  { label: 'Email', value: 'email' },
  { label: 'Phone', value: 'phone' },
];

function AdminPromotionGuidance() {
  const tenantId = getTenantId();

  return (
    <details
      open
      className="mb-6 rounded-xl border-2 border-blue-200 bg-blue-50 shadow-sm group"
    >
      <summary className="cursor-pointer list-none px-4 py-3 sm:px-5 sm:py-4 flex items-start gap-3 hover:bg-blue-100/60 rounded-xl transition-colors [&::-webkit-details-marker]:hidden">
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center mt-0.5">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-blue-900 text-sm sm:text-base">How to add or promote an admin user</p>
          <p className="text-xs sm:text-sm text-blue-800/90 mt-0.5">
            Users must register on this site first, then appear in the list below where you can change their role.
          </p>
        </div>
        <svg
          className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1 transition-transform group-open:rotate-180"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>

      <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 border-t border-blue-200/80" role="note" aria-label="How to promote a user to admin">
        <ol className="mt-4 space-y-3 text-sm text-gray-700 list-none m-0 p-0">
          <li className="flex gap-3 items-start">
            <span className="flex-shrink-0 w-8 h-8 rounded-lg border-2 border-blue-300 bg-blue-100 font-bold text-sm flex items-center justify-center text-blue-700">
              1
            </span>
            <p className="pt-1 leading-relaxed">
              Ask the person to{' '}
              <Link href="/sign-up" className="font-semibold text-blue-700 underline hover:text-blue-900">
                register on this site
              </Link>{' '}
              (or sign in if they already have an account). Registration creates a profile linked to tenant{' '}
              <code className="text-xs bg-white/80 px-1.5 py-0.5 rounded border border-blue-200">{tenantId}</code>{' '}
              in the database.
            </p>
          </li>
          <li className="flex gap-3 items-start">
            <span className="flex-shrink-0 w-8 h-8 rounded-lg border-2 border-emerald-300 bg-emerald-100 font-bold text-sm flex items-center justify-center text-emerald-700">
              2
            </span>
            <p className="pt-1 leading-relaxed">
              After they complete sign-up, their profile appears in the user table below. Use search or filters to find
              them by name or email.
            </p>
          </li>
          <li className="flex gap-3 items-start">
            <span className="flex-shrink-0 w-8 h-8 rounded-lg border-2 border-purple-300 bg-purple-100 font-bold text-sm flex items-center justify-center text-purple-700">
              3
            </span>
            <p className="pt-1 leading-relaxed">
              Click <strong>Edit</strong> on their row, set <strong>Role</strong> to{' '}
              <strong>ADMIN</strong> (or <strong>SUPER ADMIN</strong> if needed), adjust status or other fields, then
              save.
            </p>
          </li>
          <li className="flex gap-3 items-start">
            <span className="flex-shrink-0 w-8 h-8 rounded-lg border-2 border-orange-300 bg-orange-100 font-bold text-sm flex items-center justify-center text-orange-700">
              4
            </span>
            <p className="pt-1 leading-relaxed">
              The promoted user must <strong>sign out and sign back in</strong> before the Admin menu appears in the
              site header.
            </p>
          </li>
        </ol>

        <div className="mt-4 rounded-lg border border-blue-200 bg-white/70 px-3 py-2.5 text-xs text-gray-600 space-y-1.5">
          <p>
            <strong className="text-gray-800">Cannot find the user?</strong> They may not have registered yet, or they
            signed up on a different tenant site. Bulk upload can create profiles, but the person still needs to sign in
            with the same email for full access.
          </p>
          <p>
            <strong className="text-gray-800">Guest / mobile payment profiles</strong> may exist with incomplete names;
            those users are updated automatically when they sign in with Clerk using the same email.
          </p>
        </div>
      </div>
    </details>
  );
}

function UserDetailsTooltip({ user, anchorRect, onClose }: { user: UserProfileDTO, anchorRect: DOMRect | null, onClose: () => void }) {
  if (!anchorRect) return null;

  const tooltipWidth = 450;
  const spacing = 12;

  // Always show tooltip to the right of the anchor cell, never above the columns
  let top = anchorRect.top;
  let left = anchorRect.right + spacing;

  // Clamp position to stay within the viewport
  const estimatedHeight = 300; // Heuristic average height
  if (top + estimatedHeight > window.innerHeight) {
    top = window.innerHeight - estimatedHeight - spacing;
  }
  if (top < spacing) {
    top = spacing;
  }
  if (left + tooltipWidth > window.innerWidth - spacing) {
    left = window.innerWidth - tooltipWidth - spacing;
  }

  const style: React.CSSProperties = {
    position: 'fixed',
    top: `${top}px`,
    left: `${left}px`,
    zIndex: 9999,
    background: 'white',
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
    padding: '16px',
    width: `${tooltipWidth}px`,
    fontSize: '14px',
    maxHeight: '400px',
    overflowY: 'auto',
    transition: 'opacity 0.1s ease-in-out',
  };

  const entries = Object.entries(user);
  return ReactDOM.createPortal(
    <div
      style={style}
      tabIndex={-1}
      className="admin-tooltip"
    >
      <div className="sticky top-0 right-0 z-10 bg-white flex justify-end" style={{ minHeight: 0 }}>
        <button
          onClick={onClose}
          className="w-10 h-10 text-2xl bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all"
          aria-label="Close tooltip"
        >
          &times;
        </button>
      </div>
      <table className="admin-tooltip-table">
        <tbody>
          {entries.map(([key, value]) => (
            <tr key={key}>
              <th>{key}</th>
              <td>{value === null || value === undefined || value === '' ? <span className="text-gray-400 italic">(empty)</span> : String(value)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>,
    document.body
  );
}

function EditUserModal({ user, open, onClose, onSave, loading }: {
  user: UserProfileDTO | null,
  open: boolean,
  onClose: () => void,
  onSave: (updated: Partial<UserProfileDTO>) => void,
  loading?: boolean,
}) {
  const [form, setForm] = useState<Partial<UserProfileDTO>>(user || {});
  useEffect(() => {
    setForm(user || {});
  }, [user]);
  if (!open || !user) return null;
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-md w-full max-w-lg relative my-auto max-h-[90vh] flex flex-col">
        <div className="flex-shrink-0 px-6 pt-6 pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Edit User</h2>
            <button 
              className="w-10 h-10 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-300 hover:scale-110" 
              onClick={onClose} 
              aria-label="Close modal"
              title="Close"
            >
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form
            id="edit-user-form"
            onSubmit={e => {
              e.preventDefault();
              onSave(form);
            }}
            className="space-y-4"
          >
          {/* Editable fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input 
                type="text" 
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:ring-blue-500 focus:border-blue-500 px-4 py-3 text-base" 
                value={form.firstName || ''} 
                onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input 
                type="text" 
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:ring-blue-500 focus:border-blue-500 px-4 py-3 text-base" 
                value={form.lastName || ''} 
                onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:ring-blue-500 focus:border-blue-500 px-4 py-3 text-base" 
                value={form.email || ''} 
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input 
                type="text" 
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:ring-blue-500 focus:border-blue-500 px-4 py-3 text-base" 
                value={form.phone || ''} 
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
              <input 
                type="text" 
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:ring-blue-500 focus:border-blue-500 px-4 py-3 text-base" 
                value={form.addressLine1 || ''} 
                onChange={e => setForm(f => ({ ...f, addressLine1: e.target.value }))} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
              <input 
                type="text" 
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:ring-blue-500 focus:border-blue-500 px-4 py-3 text-base" 
                value={form.addressLine2 || ''} 
                onChange={e => setForm(f => ({ ...f, addressLine2: e.target.value }))} 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input 
                type="text" 
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:ring-blue-500 focus:border-blue-500 px-4 py-3 text-base" 
                value={form.city || ''} 
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input 
                type="text" 
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:ring-blue-500 focus:border-blue-500 px-4 py-3 text-base" 
                value={form.state || ''} 
                onChange={e => setForm(f => ({ ...f, state: e.target.value }))} 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
              <input 
                type="text" 
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:ring-blue-500 focus:border-blue-500 px-4 py-3 text-base" 
                value={form.zipCode || ''} 
                onChange={e => setForm(f => ({ ...f, zipCode: e.target.value }))} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input 
                type="text" 
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:ring-blue-500 focus:border-blue-500 px-4 py-3 text-base" 
                value={form.country || ''} 
                onChange={e => setForm(f => ({ ...f, country: e.target.value }))} 
              />
            </div>
          </div>
          {/* India related details section title */}
          <div className="pt-2 pb-1">
            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 mb-2">India related details</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Family Name</label>
              <input 
                type="text" 
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:ring-blue-500 focus:border-blue-500 px-4 py-3 text-base" 
                value={form.familyName || ''} 
                onChange={e => setForm(f => ({ ...f, familyName: e.target.value }))} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City/Town</label>
              <input 
                type="text" 
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:ring-blue-500 focus:border-blue-500 px-4 py-3 text-base" 
                value={form.cityTown || ''} 
                onChange={e => setForm(f => ({ ...f, cityTown: e.target.value }))} 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
              <input 
                type="text" 
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:ring-blue-500 focus:border-blue-500 px-4 py-3 text-base" 
                value={form.district || ''} 
                onChange={e => setForm(f => ({ ...f, district: e.target.value }))} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Educational Institution</label>
              <input 
                type="text" 
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:ring-blue-500 focus:border-blue-500 px-4 py-3 text-base" 
                value={form.educationalInstitution || ''} 
                onChange={e => setForm(f => ({ ...f, educationalInstitution: e.target.value }))} 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image URL</label>
            <input 
              type="text" 
              className="mt-1 block w-full border border-gray-400 rounded-xl focus:ring-blue-500 focus:border-blue-500 px-4 py-3 text-base" 
              value={form.profileImageUrl || ''} 
              onChange={e => setForm(f => ({ ...f, profileImageUrl: e.target.value }))} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea 
              className="mt-1 block w-full border border-gray-400 rounded-xl focus:ring-blue-500 focus:border-blue-500 px-4 py-3 text-base" 
              rows={3}
              value={form.notes || ''} 
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select 
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:ring-blue-500 focus:border-blue-500 px-4 py-3 text-base" 
                value={form.userRole || ''} 
                onChange={e => setForm(f => ({ ...f, userRole: e.target.value }))}
              >
                <option value="">Select Role</option>
                <option value="SUPER_ADMIN">SUPER ADMIN</option>
                <option value="ADMIN">ADMIN</option>
                <option value="ORGANIZER">ORGANIZER</option>
                <option value="VOLUNTEER">VOLUNTEER</option>
                <option value="MEMBER">MEMBER</option>
              </select>
              <p className="mt-1.5 text-xs text-gray-500 leading-relaxed">
                Set to <strong>ADMIN</strong> to grant access to the Admin panel. The user must already be registered on
                this site; after saving, ask them to sign out and sign back in.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select 
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:ring-blue-500 focus:border-blue-500 px-4 py-3 text-base" 
                value={form.userStatus || ''} 
                onChange={e => setForm(f => ({ ...f, userStatus: e.target.value }))}
              >
                <option value="">Select Status</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="PENDING_APPROVAL">PENDING APPROVAL</option>
                <option value="SUSPENDED">SUSPENDED</option>
                <option value="BANNED">BANNED</option>
                <option value="REJECTED">REJECTED</option>
                <option value="APPROVED">APPROVED</option>
              </select>
            </div>
          </div>
          </form>
        </div>
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-gray-50">
          {/* Form Action Buttons - Design System Pattern */}
          <div className="flex flex-row gap-2 sm:gap-3 mt-4">
            {/* Save Button - Green */}
            <button 
              type="submit" 
              form="edit-user-form"
              disabled={loading}
              className="flex-1 sm:flex-1 flex-shrink-0 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center gap-0 sm:gap-3 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              title={loading ? 'Saving...' : 'Save Changes'}
              aria-label={loading ? 'Saving...' : 'Save Changes'}
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
                {loading ? (
                  <svg className="animate-spin w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="font-semibold text-green-700 hidden sm:inline">{loading ? 'Saving...' : 'Save'}</span>
            </button>

            {/* Cancel Button - Red */}
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 sm:flex-1 flex-shrink-0 h-14 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center gap-0 sm:gap-3 transition-all duration-300 hover:scale-105"
              title="Cancel"
              aria-label="Cancel"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-200 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <span className="font-semibold text-red-700 hidden sm:inline">Cancel</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

const renderRoleBadge = (role: string | null | undefined) => {
  const baseClasses = 'px-2 py-1 text-xs font-semibold rounded-full';
  switch (role) {
    case 'SUPER_ADMIN':
      return <span className={`bg-blue-100 text-blue-800 ${baseClasses}`}>SUPER_ADMIN</span>;
    case 'ADMIN':
      return <span className={`bg-blue-100 text-blue-800 ${baseClasses}`}>ADMIN</span>;
    case 'ORGANIZER':
      return <span className={`bg-purple-100 text-purple-800 ${baseClasses}`}>ORGANIZER</span>;
    case 'VOLUNTEER':
      return <span className={`bg-gray-100 text-gray-800 ${baseClasses}`}>VOLUNTEER</span>;
    case 'MEMBER':
      return <span className={`bg-gray-100 text-gray-800 ${baseClasses}`}>MEMBER</span>;
    default:
      return <span className={`bg-gray-100 text-gray-500 italic ${baseClasses}`}>{role || 'NOT SET'}</span>;
  }
};

const renderStatusBadge = (status: string | null | undefined) => {
  const baseClasses = 'px-2 py-1 text-xs font-semibold rounded-full';
  switch (status) {
    case 'ACTIVE':
    case 'APPROVED':
      return <span className={`bg-green-100 text-green-800 ${baseClasses}`}>{status}</span>;
    case 'PENDING_APPROVAL':
      return <span className={`bg-yellow-100 text-yellow-800 ${baseClasses}`}>PENDING_APPROVAL</span>;
    case 'INACTIVE':
      return <span className={`bg-gray-100 text-gray-500 ${baseClasses}`}>INACTIVE</span>;
    case 'SUSPENDED':
      return <span className={`bg-orange-100 text-orange-800 ${baseClasses}`}>SUSPENDED</span>;
    case 'BANNED':
      return <span className={`bg-red-100 text-red-800 ${baseClasses}`}>BANNED</span>;
    case 'REJECTED':
      return <span className={`bg-red-100 text-red-800 ${baseClasses}`}>REJECTED</span>;
    default:
      return <span className={`bg-gray-100 text-gray-500 italic ${baseClasses}`}>{status || 'NOT SET'}</span>;
  }
};

export default function ManageUsageClient({ adminProfile }: { adminProfile: UserProfileDTO | null }) {
  const [users, setUsers] = useState<UserProfileDTO[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [search, setSearch] = useState('');
  const [searchField, setSearchField] = useState('firstName');
  const [status, setStatus] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [approvingId, setApprovingId] = useState<number | null>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [hoveredUserId, setHoveredUserId] = useState<number | null>(null);
  const [popoverAnchor, setPopoverAnchor] = useState<DOMRect | null>(null);
  const [popoverUser, setPopoverUser] = useState<UserProfileDTO | null>(null);
  const tooltipTimer = useRef<NodeJS.Timeout | null>(null);
  const [editUser, setEditUser] = useState<UserProfileDTO | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkMessage, setBulkMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [page, setPage] = useState(1); // 1-indexed for UI
  const pageSize = 10;

  // Fetch users (paginated)
  async function fetchUsers() {
    setLoading(true);
    try {
      const { data, totalCount } = await fetchUsersServer({
        search,
        searchField,
        status,
        role,
        page,
        pageSize,
      });

      // Support both pageable and array fallback
      if (Array.isArray(data)) {
        setUsers(data);
        setTotalUsers(totalCount || data.length);
      } else if (data && Array.isArray(data.content)) {
        setUsers(data.content);
        setTotalUsers(totalCount || data.totalElements || data.total || 0);
      } else {
        setUsers([]);
        setTotalUsers(0);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  }

  const handleNextPage = () => {
    if (page * pageSize < totalUsers) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, searchField, status, role, page]);

  // Helper to build a complete UserProfileDTO for PATCH
  function buildPatchedUser(user: UserProfileDTO, patch: Partial<UserProfileDTO>): UserProfileDTO {
    return {
      id: user.id,
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      addressLine1: user.addressLine1,
      addressLine2: user.addressLine2,
      city: user.city,
      state: user.state,
      zipCode: user.zipCode,
      country: user.country,
      notes: user.notes,
      familyName: user.familyName,
      cityTown: user.cityTown,
      district: user.district,
      educationalInstitution: user.educationalInstitution,
      profileImageUrl: user.profileImageUrl,
      userRole: user.userRole,
      userStatus: user.userStatus,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      tenantId: user.tenantId,
      reviewedByAdminId: user.reviewedByAdminId,
      reviewedByAdminAt: user.reviewedByAdminAt,
      ...patch,
    };
  }

  async function handleApprove(user: UserProfileDTO) {
    if (!user.id) {
      setBulkMessage('Selected user record missing id.');
      return;
    }
    if (!adminProfile?.id) {
      setBulkMessage('Admin profile not loaded. Please refresh and try again.');
      // Soft fallback: allow approve when admin profile missing id is not required
      // return; // uncomment to enforce strict requirement
    }
    setApprovingId(user.id);
    try {
      const now = new Date().toISOString();
      const payload = buildPatchedUser(user, {
        userStatus: 'APPROVED',
        reviewedByAdminId: adminProfile?.id ?? undefined,
        reviewedByAdminAt: now,
        updatedAt: now,
      });
      const res = await patchUserProfileServer(user.id, payload);
      if (res && !res.error) {
        setUsers(users => users.map(u => u.id === user.id ? { ...u, userStatus: 'APPROVED', reviewedByAdminId: adminProfile?.id, reviewedByAdminAt: now, updatedAt: now } : u));
      } else {
        setBulkMessage('Approve failed: ' + (res?.error || 'Unknown error'));
        setTimeout(() => setBulkMessage(null), 4000);
      }
    } catch (err: any) {
      setBulkMessage('Approve error: ' + (err?.message || err));
      setTimeout(() => setBulkMessage(null), 4000);
    } finally {
      setApprovingId(null);
    }
  }

  async function handleReject(user: UserProfileDTO) {
    if (!user.id) {
      setBulkMessage('Selected user record missing id.');
      return;
    }
    if (!adminProfile?.id) {
      setBulkMessage('Admin profile not loaded. Please refresh and try again.');
      // return; // uncomment to enforce strict requirement
    }
    setRejectingId(user.id);
    try {
      const now = new Date().toISOString();
      const payload = buildPatchedUser(user, {
        userStatus: 'REJECTED',
        reviewedByAdminId: adminProfile?.id ?? undefined,
        reviewedByAdminAt: now,
        updatedAt: now,
      });
      const res = await patchUserProfileServer(user.id, payload);
      if (res && !res.error) {
        setUsers(users => users.map(u => u.id === user.id ? { ...u, userStatus: 'REJECTED', reviewedByAdminId: adminProfile?.id, reviewedByAdminAt: now, updatedAt: now } : u));
      } else {
        setBulkMessage('Reject failed: ' + (res?.error || 'Unknown error'));
        setTimeout(() => setBulkMessage(null), 4000);
      }
    } catch (err: any) {
      setBulkMessage('Reject error: ' + (err?.message || err));
      setTimeout(() => setBulkMessage(null), 4000);
    } finally {
      setRejectingId(null);
    }
  }

  async function handleEditSave(updated: Partial<UserProfileDTO>) {
    if (!editUser?.id) return;
    setEditLoading(true);
    try {
      const res = await patchUserProfileServer(editUser.id, { ...editUser, ...updated });
      if (res && !res.error) {
        const savedUser = { ...editUser, ...updated };
        setUsers(users => users.map(u => u.id === editUser.id ? savedUser : u));
        setEditUser(null);
        const displayName = [savedUser.firstName, savedUser.lastName].filter(Boolean).join(' ') || savedUser.email || 'User';
        setSuccessMessage(`${displayName} was saved successfully.`);
        setShowSuccessDialog(true);
      } else {
        setBulkMessage('Save failed: ' + (res?.error || 'Unknown error'));
        setTimeout(() => setBulkMessage(null), 4000);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setBulkMessage('Save error: ' + message);
      setTimeout(() => setBulkMessage(null), 4000);
    } finally {
      setEditLoading(false);
    }
  }

  async function handleBulkUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBulkMessage(null);
    setBulkLoading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      let rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      if (!Array.isArray(rows)) {
        rows = [rows];
      }
      const users = rows.map((row: any, i: number) => {
        const now = new Date().toISOString();
        const getUniqueId = () =>
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? 'bulk_' + crypto.randomUUID()
            : 'bulk_' + Date.now() + '_' + i;
        return {
          userId: row.userId && String(row.userId).trim() ? row.userId : getUniqueId(),
          createdAt: row.createdAt && String(row.createdAt).trim() ? row.createdAt : now,
          updatedAt: row.updatedAt && String(row.updatedAt).trim() ? row.updatedAt : now,
          firstName: row.firstName || "",
          lastName: row.lastName || "",
          email: row.email || "",
          phone: row.phone || "",
          addressLine1: row.addressLine1 || "",
          addressLine2: row.addressLine2 || "",
          city: row.city || "",
          state: row.state || "",
          zipCode: row.zipCode ? String(row.zipCode) : "",
          country: row.country || "",
          notes: row.notes || "",
          familyName: row.familyName || "",
          cityTown: row.cityTown || "",
          district: row.district || "",
          educationalInstitution: row.educationalInstitution || "",
          profileImageUrl: row.profileImageUrl || "",
          userRole: row.userRole || "MEMBER",
          userStatus: row.userStatus || "pending",
        };
      });
      const res = await bulkUploadUsersServer(users);
      if (res && !res.error) {
        setBulkMessage('Bulk upload successful!');
        fetchUsers();
        setTimeout(() => setBulkMessage(null), 4000);
      } else {
        setBulkMessage('Bulk upload failed: ' + (res?.error || 'Unknown error'));
      }
    } catch (err: any) {
      setBulkMessage('Bulk upload error: ' + err.message);
    } finally {
      setBulkLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  const handleMouseEnter = (user: UserProfileDTO, e: React.MouseEvent) => {
    if (tooltipTimer.current) {
      clearTimeout(tooltipTimer.current);
    }
    setPopoverUser(user);
    setPopoverAnchor((e.currentTarget as HTMLElement).getBoundingClientRect());
  };

  const handleMouseLeave = () => {
    tooltipTimer.current = setTimeout(() => {
      setPopoverUser(null);
    }, 200);
  };

  const startEntry = (page - 1) * pageSize + 1;
  const endEntry = Math.min(page * pageSize, totalUsers);
  const totalPages = Math.ceil(totalUsers / pageSize) || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8" style={{ paddingTop: '120px' }}>
      <AdminNavigation />
      {/* Page Header */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 text-center sm:text-left">
          Manage Users
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left">
          Manage user profiles, roles, and statuses for your organization
        </p>
      </div>

      <AdminPromotionGuidance />

        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={bulkLoading}
            className="flex-shrink-0 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            title="Bulk Upload User List"
            aria-label="Bulk Upload User List"
            type="button"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>
            <span className="font-semibold text-green-700">{bulkLoading ? 'Uploading...' : 'Bulk Upload User List'}</span>
          </button>
          <input type="file" ref={fileInputRef} onChange={handleBulkUpload} className="hidden" accept=".xlsx" />
          <a
            href="https://eventapp-media-bucket.s3.us-east-2.amazonaws.com/media/users_profile_list_bulk_upload_template/users_profile_list_bulk_upload_template.xlsx"
            download="users_profile_list_bulk_upload_template.xlsx"
            className="flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
            title="Download Bulk Upload Template File"
            aria-label="Download Bulk Upload Template File"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <span className="font-semibold text-blue-700">Download Bulk Upload Template File</span>
          </a>
        </div>

      {/* Filter and Action Controls */}
      <div className="bg-white shadow-md rounded-lg p-4 sm:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Search Input */}
          <div className="flex items-center gap-2">
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
              className="border border-gray-400 rounded-l-xl focus:ring-blue-500 focus:border-blue-500 px-4 py-3 text-base min-h-[48px]"
            >
              {SEARCH_FIELDS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
            <input
              type="text"
              placeholder={`Search by ${SEARCH_FIELDS.find(f => f.value === searchField)?.label}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full border border-gray-400 rounded-r-xl focus:ring-blue-500 focus:border-blue-500 px-4 py-3 text-base min-h-[48px]"
            />
          </div>

          {/* Status Filter (tenant-scoped) */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="block w-full border border-gray-400 rounded-xl focus:ring-blue-500 focus:border-blue-500 px-4 py-3 text-base min-h-[48px]"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="BANNED">Banned</option>
            <option value="REJECTED">Rejected</option>
            <option value="APPROVED">Approved</option>
          </select>

          {/* Role Filter (tenant-scoped) */}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="block w-full border border-gray-400 rounded-xl focus:ring-blue-500 focus:border-blue-500 px-4 py-3 text-base min-h-[48px]"
          >
            <option value="">All Roles</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="ADMIN">Admin</option>
            <option value="ORGANIZER">Organizer</option>
            <option value="VOLUNTEER">Volunteer</option>
            <option value="MEMBER">Member</option>
          </select>
        </div>
        {bulkMessage && <p className="mt-2 text-sm text-center text-red-600">{bulkMessage}</p>}
      </div>

      {/* Users Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Rainbow Gradient Scrollbar CSS */}
        <style dangerouslySetInnerHTML={{
          __html: `
            .table-scroll-container {
              overflow-x: scroll !important;
              overflow-y: visible !important;
              scrollbar-width: thin !important;
              scrollbar-color: #EC4899 #FCE7F3 !important; /* Pink thumb, pink track (Firefox) */
              -ms-overflow-style: -ms-autohiding-scrollbar !important;
            }

            /* WebKit browsers (Chrome, Safari, Edge) */
            .table-scroll-container::-webkit-scrollbar {
              height: 20px !important; /* Larger for visibility */
              display: block !important;
              -webkit-appearance: none !important;
              appearance: none !important;
            }

            .table-scroll-container::-webkit-scrollbar-track {
              background: linear-gradient(90deg, #DBEAFE, #E9D5FF, #FCE7F3, #FED7AA) !important;
              border-radius: 10px !important;
              -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.15) !important;
              box-shadow: inset 0 0 6px rgba(0,0,0,0.15) !important;
            }

            .table-scroll-container::-webkit-scrollbar-thumb {
              background: linear-gradient(90deg, #3B82F6, #8B5CF6, #EC4899, #F97316) !important;
              border-radius: 10px !important;
              border: 4px solid #F3F4F6 !important;
              -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.4) !important;
              box-shadow: inset 0 0 6px rgba(0,0,0,0.4) !important;
              min-width: 50px !important; /* CRITICAL: Ensures thumb is always visible */
              background-clip: padding-box !important;
            }

            .table-scroll-container::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(90deg, #2563EB, #7C3AED, #DB2777, #EA580C) !important;
              border-color: #E5E7EB !important;
            }

            .table-scroll-container::-webkit-scrollbar-thumb:active {
              background: linear-gradient(90deg, #1D4ED8, #6D28D9, #BE185D, #C2410C) !important;
              border-color: #D1D5DB !important;
            }

            .table-scroll-container::-webkit-scrollbar-button {
              display: none !important;
            }

            .table-scroll-container::-webkit-scrollbar-corner {
              background: #E0E7FF !important;
            }

            /* Flexbox spacer for right-side centering */
            .table-scroll-container::after {
              content: '';
              display: block;
              width: 100vw; /* Full viewport width of scrollable space */
              height: 1px;
              flex-shrink: 0;
            }

            .table-scroll-container {
              display: flex !important;
            }
          `
        }} />

        {/* Outer wrapper with gradient border */}
        <div className="rounded-lg shadow w-full overflow-hidden" style={{
          background: 'linear-gradient(to right, #3B82F6, #8B5CF6, #EC4899, #F97316)',
          padding: '4px'
        }}>
          {/* Inner scroll container with gradient background */}
          <div
            className="w-full table-scroll-container"
            style={{
              overflowX: 'scroll',
              overflowY: 'visible',
              WebkitOverflowScrolling: 'touch',
              maxWidth: '100%',
              display: 'flex',
              position: 'relative',
              width: '100%',
              minHeight: '1px',
              scrollbarGutter: 'stable',
              background: 'linear-gradient(to right, #3B82F6, #8B5CF6, #EC4899, #F97316)',
              borderRadius: '8px',
              padding: '20px'
            }}
          >
            {/* Table with semi-transparent white background */}
            <table
              className="divide-y divide-gray-300 dark:divide-gray-600 border border-gray-300 dark:border-gray-600"
              style={{
                width: 'max-content',
                minWidth: 'fit-content', /* Responsive: fits content naturally */
                flexShrink: 0,
                background: 'rgba(255, 255, 255, 0.95)', /* Semi-transparent white */
                borderRadius: '8px',
                overflow: 'hidden'
              }}
            >
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r border-gray-300">Name</th>
                  <th scope="col" className="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r border-gray-300">Contact</th>
                  <th scope="col" className="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r border-gray-300">Role</th>
                  <th scope="col" className="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r border-gray-300">Status</th>
                  <th scope="col" className="px-8 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-r border-gray-300">Joined</th>
                  <th scope="col" className="px-8 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300">
              {loading && Array.from({ length: pageSize }).map((_, i) => (
                <tr key={`skel-${i}`} className={`${i % 2 === 0 ? 'bg-white' : 'bg-blue-50'} border-b border-gray-300`}>
                  <td className="px-8 py-4 whitespace-nowrap border-r border-gray-200"><div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div></td>
                  <td className="px-8 py-4 whitespace-nowrap border-r border-gray-200"><div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div></td>
                  <td className="px-8 py-4 whitespace-nowrap border-r border-gray-200"><div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div></td>
                  <td className="px-8 py-4 whitespace-nowrap border-r border-gray-200"><div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse"></div></td>
                  <td className="px-8 py-4 whitespace-nowrap border-r border-gray-200"><div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div></td>
                  <td className="px-8 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end items-center gap-2">
                      <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && users.map((user, index) => (
                <tr key={user.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-blue-50'} hover:bg-yellow-100 transition-colors border-b border-gray-300`}>
                  <td className="px-8 py-4 whitespace-nowrap border-r border-gray-200" onMouseEnter={(e) => handleMouseEnter(user, e)} onMouseLeave={handleMouseLeave}>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full object-cover" src={user.profileImageUrl || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=random`} alt={`${user.firstName} ${user.lastName}`} />
                      </div>
                      <div className="ml-4">
                        <div className="text-xs font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-4 whitespace-nowrap border-r border-gray-200" onMouseEnter={(e) => handleMouseEnter(user, e)} onMouseLeave={handleMouseLeave}>
                    <div className="text-xs text-gray-900">{user.phone}</div>
                    <div className="text-xs text-gray-500">{user.city}, {user.state}</div>
                  </td>
                  <td className="px-8 py-4 whitespace-nowrap border-r border-gray-200">{renderRoleBadge(user.userRole)}</td>
                  <td className="px-8 py-4 whitespace-nowrap border-r border-gray-200">{renderStatusBadge(user.userStatus)}</td>
                  <td className="px-8 py-4 whitespace-nowrap text-xs text-gray-500 border-r border-gray-200">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-8 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setEditUser(user)}
                        disabled={editLoading && editUser?.id === user.id}
                        className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50"
                        aria-label="Edit User"
                        title="Edit User"
                      >
                        <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>

                      <button
                        onClick={() => handleApprove(user)}
                        disabled={approvingId === user.id || user.userStatus === 'ACTIVE' || user.userStatus === 'APPROVED'}
                        className="flex-shrink-0 w-14 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Approve User"
                        title="Approve User"
                      >
                        {approvingId === user.id ? (
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                        ) : (
                          <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(user)}
                        disabled={rejectingId === user.id || user.userStatus === 'REJECTED'}
                        className="flex-shrink-0 w-14 h-14 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Reject User"
                        title="Reject User"
                      >
                        {rejectingId === user.id ? (
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                        ) : (
                          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
        {/* Pagination Controls - Always visible, matching admin page style */}
        <div className="mt-8">
          <div className="flex justify-between items-center">
            {/* Previous Button */}
            <button
              onClick={handlePrevPage}
              disabled={page <= 1 || loading}
              className="px-5 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg shadow-sm border-2 border-blue-400 hover:border-blue-500 disabled:bg-blue-100 disabled:border-blue-300 disabled:text-blue-500 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md"
              title="Previous Page"
              aria-label="Previous Page"
              type="button"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Previous</span>
            </button>

            {/* Page Info */}
            <div className="px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
              <span className="text-sm font-bold text-blue-700">
                Page <span className="text-blue-600">{page}</span> of <span className="text-blue-600">{totalPages}</span>
              </span>
            </div>

            {/* Next Button */}
            <button
              onClick={handleNextPage}
              disabled={page >= totalPages || loading}
              className="px-5 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg shadow-sm border-2 border-blue-400 hover:border-blue-500 disabled:bg-blue-100 disabled:border-blue-300 disabled:text-blue-500 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md"
              title="Next Page"
              aria-label="Next Page"
              type="button"
            >
              <span>Next</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Item Count Text */}
          <div className="text-center mt-3">
            {totalUsers > 0 ? (
              <div className="inline-flex items-center px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
                <span className="text-sm text-gray-700">
                  Showing <span className="font-bold text-blue-600">{startEntry}</span> to <span className="font-bold text-blue-600">{endEntry}</span> of <span className="font-bold text-blue-600">{totalUsers}</span> users
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-sm">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium text-orange-700">No users found</span>
                <span className="text-sm text-orange-600">[No users match your criteria]</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {popoverUser && (
        <div
          onMouseEnter={() => {
            if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
          }}
          onMouseLeave={() => {
            tooltipTimer.current = setTimeout(() => {
              setPopoverUser(null);
            }, 200);
          }}
        >
          <UserDetailsTooltip
            user={popoverUser}
            anchorRect={popoverAnchor}
            onClose={() => setPopoverUser(null)}
          />
        </div>
      )}

      {editUser && (
        <EditUserModal
          user={editUser}
          open={!!editUser}
          onClose={() => setEditUser(null)}
          onSave={handleEditSave}
          loading={editLoading}
        />
      )}

      <SuccessDialog
        isOpen={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        title="Saved Successfully!"
        message={successMessage}
        buttonText="OK"
      />
    </div>
  );
}

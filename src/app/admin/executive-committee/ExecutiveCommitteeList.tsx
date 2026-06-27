'use client';

import React, { useState, useRef, useEffect } from 'react';
import type { ExecutiveCommitteeTeamMemberDTO } from '@/types/executiveCommitteeTeamMember';
import ReactDOM from 'react-dom';

interface ExecutiveCommitteeListProps {
  members: ExecutiveCommitteeTeamMemberDTO[];
  onEdit: (member: ExecutiveCommitteeTeamMemberDTO) => void;
  onView: (member: ExecutiveCommitteeTeamMemberDTO) => void;
  onDelete: (member: ExecutiveCommitteeTeamMemberDTO) => void;
  onUpload: (member: ExecutiveCommitteeTeamMemberDTO) => void;
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

// DetailsTooltip component following the UI style guide
function MemberDetailsTooltip({ member, anchorRect, onClose }: {
  member: ExecutiveCommitteeTeamMemberDTO,
  anchorRect: DOMRect | null,
  onClose: () => void
}) {
  if (!anchorRect) return null;

  const tooltipWidth = 400;
  const spacing = 8;

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
  if (left + tooltipWidth > window.innerWidth) {
    left = window.innerWidth - tooltipWidth - spacing;
  }

  const style: React.CSSProperties = {
    position: 'fixed',
    top,
    left,
    zIndex: 9999,
    width: tooltipWidth,
    background: 'white',
    border: '1px solid #cbd5e1',
    borderRadius: 8,
    boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
    padding: '16px',
    fontSize: '14px',
    maxHeight: '400px',
    overflowY: 'auto',
    transition: 'opacity 0.1s ease-in-out',
  };

  return ReactDOM.createPortal(
    <div style={style} tabIndex={-1} className="admin-tooltip">
      {/* Sticky, always-visible close button */}
      <div className="sticky top-0 right-0 z-10 bg-white flex justify-end">
        <button
          onClick={onClose}
          className="w-10 h-10 text-2xl bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all"
          aria-label="Close tooltip"
        >
          &times;
        </button>
      </div>

      {/* Tooltip content */}
      <div className="space-y-4">
        <div className="border-b border-gray-200 pb-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {member.firstName} {member.lastName}
          </h3>
          <div className="text-sm text-gray-600">
            <p><strong>Designation:</strong> {member.designation || 'Not specified'}</p>
            <p><strong>Title:</strong> {member.title || 'Not specified'}</p>
            <p><strong>Department:</strong> {member.department || 'Not specified'}</p>
          </div>
        </div>

        <div className="border-b border-gray-200 pb-3">
          <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Email:</strong> {member.email || 'Not provided'}</p>
            {member.linkedinUrl && (
              <p><strong>LinkedIn:</strong> <a href={member.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">View Profile</a></p>
            )}
            {member.twitterUrl && (
              <p><strong>Twitter:</strong> <a href={member.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-600">View Profile</a></p>
            )}
            {member.websiteUrl && (
              <p><strong>Website:</strong> <a href={member.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-800">Visit Site</a></p>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-2">Expertise & Details</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Expertise:</strong> {
              member.expertise ? (
                Array.isArray(member.expertise) ?
                  member.expertise.join(', ') :
                  typeof member.expertise === 'string' ?
                    (member.expertise.startsWith('[') ?
                      JSON.parse(member.expertise).join(', ') :
                      member.expertise
                    ) :
                    'Not specified'
              ) : 'Not specified'
            }</p>
            <p><strong>Status:</strong> <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${member.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
              }`}>
              {member.isActive ? 'Active' : 'Inactive'}
            </span></p>
            <p><strong>Priority Order:</strong> {member.priorityOrder || 'Not set'}</p>
            {member.bio && <p><strong>Bio:</strong> {member.bio}</p>}
            {member.joinDate && <p><strong>Join Date:</strong> {new Date(member.joinDate).toLocaleDateString()}</p>}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function ExecutiveCommitteeList({
  members,
  onEdit,
  onView,
  onDelete,
  onUpload,
  page,
  pageSize,
  totalCount,
  onPageChange,
}: ExecutiveCommitteeListProps) {
  // Search: filter by first name, last name, or title (case-insensitive)
  const [searchTerm, setSearchTerm] = useState('');
  const filteredMembers = searchTerm.trim()
    ? members.filter((m) => {
        const q = searchTerm.trim().toLowerCase();
        const first = (m.firstName || '').toLowerCase();
        const last = (m.lastName || '').toLowerCase();
        const title = (m.title || '').toLowerCase();
        const designation = (m.designation || '').toLowerCase();
        const department = (m.department || '').toLowerCase();
        return first.includes(q) || last.includes(q) || title.includes(q) || designation.includes(q) || department.includes(q);
      })
    : members;
  const filteredCount = filteredMembers.length;
  const totalPages = Math.max(1, Math.ceil(filteredCount / pageSize));
  const startItem = filteredCount > 0 ? page * pageSize + 1 : 0;
  const endItem = filteredCount > 0 ? Math.min((page + 1) * pageSize, filteredCount) : 0;
  const paginatedMembers = filteredMembers.slice(page * pageSize, (page + 1) * pageSize);

  // Reset to first page when search changes
  useEffect(() => {
    onPageChange(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only reset page when searchTerm changes
  }, [searchTerm]);
  
  const handlePrevPage = () => {
    if (page > 0) {
      onPageChange(page - 1);
    }
  };
  
  const handleNextPage = () => {
    if (page < totalPages - 1) {
      onPageChange(page + 1);
    }
  };
  // Tooltip state management
  const [tooltipMember, setTooltipMember] = useState<ExecutiveCommitteeTeamMemberDTO | null>(null);
  const [tooltipAnchor, setTooltipAnchor] = useState<DOMRect | null>(null);
  const tooltipTimer = useRef<NodeJS.Timeout | null>(null);

  // Tooltip handlers
  const handleMouseEnter = (member: ExecutiveCommitteeTeamMemberDTO, e: React.MouseEvent) => {
    if (tooltipTimer.current) {
      clearTimeout(tooltipTimer.current);
    }
    setTooltipMember(member);
    setTooltipAnchor((e.currentTarget as HTMLElement).getBoundingClientRect());
  };

  const handleMouseLeave = () => {
    tooltipTimer.current = setTimeout(() => {
      setTooltipMember(null);
    }, 200);
  };

  const handleTooltipClose = () => {
    if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
    setTooltipMember(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (tooltipTimer.current) clearTimeout(tooltipTimer.current);
    };
  }, []);

  if (members.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">👥</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
        <p className="text-gray-500">Get started by adding your first executive committee member.</p>
      </div>
    );
  }
  
  const isLoading = false; // Can be passed as prop if needed

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden mx-8 my-6">
      {/* Search bar */}
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <label htmlFor="exec-committee-search" className="sr-only">Search members</label>
        <input
          id="exec-committee-search"
          type="search"
          placeholder="Search by first name, last name, title, designation, or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-xl px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          aria-label="Search members by name, title, designation, or department"
        />
        {searchTerm.trim() && (
          <p className="mt-2 text-sm text-gray-600">
            Showing {filteredCount} of {members.length} member{members.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Tooltip note for users */}
      <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
        <p className="text-sm text-blue-700">
          💡 <strong>Tip:</strong> Hover over the Member or Title & Department columns to see detailed information in a tooltip.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priority
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Member
              </th>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title & Department
              </th>
              <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedMembers.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {member.priorityOrder ?? '—'}
                </td>
                <td
                  className="px-3 py-3 whitespace-nowrap cursor-pointer"
                  onMouseEnter={(e) => handleMouseEnter(member, e)}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      {member.profileImageUrl ? (
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={member.profileImageUrl}
                          alt={`${member.firstName} ${member.lastName}`}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center">
                          <span className="text-teal-600 font-semibold text-sm">
                            {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {member.firstName} {member.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {member.designation || 'No designation'}
                      </div>
                    </div>
                  </div>
                </td>
                <td
                  className="px-2 py-3 whitespace-nowrap cursor-pointer"
                  onMouseEnter={(e) => handleMouseEnter(member, e)}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="text-sm text-gray-900">{member.title}</div>
                  <div className="text-sm text-gray-500">{member.department || 'No department'}</div>
                </td>
                <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onView(member);
                      }}
                      className="flex-shrink-0 w-14 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                      title="View details"
                      aria-label="View details"
                    >
                      <svg className="w-10 h-10 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(member);
                      }}
                      className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                      title="Edit member"
                      aria-label="Edit member"
                    >
                      <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(member);
                      }}
                      className="flex-shrink-0 w-14 h-14 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                      title="Delete member"
                      aria-label="Delete member"
                    >
                      <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpload(member);
                      }}
                      className="flex-shrink-0 w-14 h-14 rounded-xl bg-purple-100 hover:bg-purple-200 flex items-center justify-center transition-all duration-300 hover:scale-110"
                      title="Upload profile image"
                      aria-label="Upload profile image"
                    >
                      <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls - Always visible, matching admin page style */}
      <div className="mt-8">
        <div className="flex justify-between items-center gap-2">
          {/* Previous Button */}
          <button
            onClick={handlePrevPage}
            disabled={page === 0 || isLoading}
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
              Page <span className="text-blue-600">{page + 1}</span> of <span className="text-blue-600">{totalPages}</span>
            </span>
          </div>

          {/* Next Button */}
          <button
            onClick={handleNextPage}
            disabled={page >= totalPages - 1 || isLoading}
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
          {filteredCount > 0 ? (
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
              <span className="text-sm text-gray-700">
                Showing <span className="font-bold text-blue-600">{startItem}</span> to <span className="font-bold text-blue-600">{endItem}</span> of <span className="font-bold text-blue-600">{filteredCount}</span> members
                {searchTerm.trim() ? ` (filtered from ${members.length})` : ''}
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-sm">
              <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-orange-700">
                {searchTerm.trim() ? 'No members match your search.' : 'No members found.'}
              </span>
              {searchTerm.trim() && (
                <span className="text-sm text-orange-600">Try different keywords.</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tooltip */}
      {tooltipMember && (
        <MemberDetailsTooltip
          member={tooltipMember}
          anchorRect={tooltipAnchor}
          onClose={handleTooltipClose}
        />
      )}
    </div>
  );
}

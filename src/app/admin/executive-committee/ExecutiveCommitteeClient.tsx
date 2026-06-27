'use client';

import { useState } from 'react';
import { FaPlus, FaEdit, FaTrashAlt, FaEye } from 'react-icons/fa';
import type { ExecutiveCommitteeTeamMemberDTO } from '@/types/executiveCommitteeTeamMember';
import ExecutiveCommitteeForm from './ExecutiveCommitteeForm';
import ExecutiveCommitteeList from './ExecutiveCommitteeList';
import ImageUploadDialog from './ImageUploadDialog';
import { Modal } from '@/components/Modal';
import { deleteExecutiveCommitteeMember } from './ApiServerActions';

interface ExecutiveCommitteeClientProps {
  initialMembers: ExecutiveCommitteeTeamMemberDTO[];
}

/** Sort by priority order ascending (lower number = higher rank, same as API sort=priorityOrder,asc) */
function sortByPriority(members: ExecutiveCommitteeTeamMemberDTO[]): ExecutiveCommitteeTeamMemberDTO[] {
  return [...members].sort((a, b) => (a.priorityOrder ?? 0) - (b.priorityOrder ?? 0));
}

export default function ExecutiveCommitteeClient({ initialMembers }: ExecutiveCommitteeClientProps) {
  const [members, setMembers] = useState<ExecutiveCommitteeTeamMemberDTO[]>(() => sortByPriority(initialMembers));
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<ExecutiveCommitteeTeamMemberDTO | null>(null);
  const [viewingMember, setViewingMember] = useState<ExecutiveCommitteeTeamMemberDTO | null>(null);
  const [deletingMember, setDeletingMember] = useState<ExecutiveCommitteeTeamMemberDTO | null>(null);
  const [uploadingMember, setUploadingMember] = useState<ExecutiveCommitteeTeamMemberDTO | null>(null);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const totalCount = members.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const handleMemberCreated = (newMember: ExecutiveCommitteeTeamMemberDTO) => {
    setMembers(prev => sortByPriority([...prev, newMember]));
    setIsFormOpen(false);
  };

  const handleMemberUpdated = (updatedMember: ExecutiveCommitteeTeamMemberDTO) => {
    setMembers(prev => sortByPriority(prev.map(member =>
      member.id === updatedMember.id ? updatedMember : member
    )));
    setEditingMember(null);
  };

  const handleMemberDeleted = (deletedId: number) => {
    setMembers(prev => prev.filter(member => member.id !== deletedId));
    setDeletingMember(null);
  };

  const handleImageUploadSuccess = (imageUrl: string) => {
    if (uploadingMember?.id) {
      // Update the member's profile image URL
      setMembers(prev => prev.map(member =>
        member.id === uploadingMember.id
          ? { ...member, profileImageUrl: imageUrl }
          : member
      ));
    }
    setUploadingMember(null);

    // Show success message
    console.log('Profile image updated successfully:', imageUrl);

    // Note: The page will be reloaded by the ImageUploadDialog
    // This ensures the latest data is fetched from the server
  };

  const openEditForm = (member: ExecutiveCommitteeTeamMemberDTO) => {
    setEditingMember(member);
  };

  const openViewForm = (member: ExecutiveCommitteeTeamMemberDTO) => {
    setViewingMember(member);
  };

  const openDeleteModal = (member: ExecutiveCommitteeTeamMemberDTO) => {
    setDeletingMember(member);
  };

  const openUploadDialog = (member: ExecutiveCommitteeTeamMemberDTO) => {
    setUploadingMember(member);
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Team Members ({members.length})
          </h2>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="flex-shrink-0 h-14 rounded-xl bg-teal-100 hover:bg-teal-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
          title="Add Member"
          aria-label="Add Member"
          type="button"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-teal-200 flex items-center justify-center">
            <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="font-semibold text-teal-700">Add Member</span>
        </button>
      </div>

      {/* Image Guidelines Tip Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              📸 Profile Image Guidelines
            </h3>
            <div className="text-sm text-blue-700 space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Optimal Specifications:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li><strong>Dimensions:</strong> 800×1000px (4:5 aspect ratio)</li>
                    <li><strong>Format:</strong> JPG or WebP</li>
                    <li><strong>File Size:</strong> Under 200KB</li>
                    <li><strong>Quality:</strong> 80-85%</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium">Content Guidelines:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li><strong>Positioning:</strong> Face centered in upper 60%</li>
                    <li><strong>Background:</strong> Clean, professional</li>
                    <li><strong>Lighting:</strong> Even, flattering</li>
                    <li><strong>Expression:</strong> Professional, approachable</li>
                  </ul>
                </div>
              </div>
              <div className="mt-3 p-2 bg-blue-100 rounded border border-blue-200">
                <p className="text-xs">
                  <strong>Why 4:5 Ratio?</strong> This ensures consistent card heights across all devices and prevents
                  stretched or distorted images in the "Our Team" section. The portrait format works perfectly with our
                  responsive grid layout.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Member List */}
      <ExecutiveCommitteeList
        members={members}
        onEdit={openEditForm}
        onView={openViewForm}
        onDelete={openDeleteModal}
        onUpload={openUploadDialog}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        onPageChange={setPage}
      />

      {/* Add/Edit Form Modal */}
      {(isFormOpen || editingMember) && (
        <Modal
          open={isFormOpen || !!editingMember}
          onClose={() => {
            setIsFormOpen(false);
            setEditingMember(null);
          }}
          title={editingMember ? 'Edit Team Member' : 'Add New Team Member'}
          preventBackdropClose={true}
        >
          <ExecutiveCommitteeForm
            member={editingMember}
            onSuccess={editingMember ? handleMemberUpdated : handleMemberCreated}
            onCancel={() => {
              setIsFormOpen(false);
              setEditingMember(null);
            }}
          />
        </Modal>
      )}

      {/* View Member Modal - all fields matching Edit Member dialog */}
      {viewingMember && (
        <Modal
          open={!!viewingMember}
          onClose={() => setViewingMember(null)}
          title="View Team Member"
          preventBackdropClose={true}
        >
          <div className="space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Profile image */}
            {viewingMember.profileImageUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image</label>
                <img
                  src={viewingMember.profileImageUrl}
                  alt={`${viewingMember.firstName} ${viewingMember.lastName}`}
                  className="h-32 w-32 rounded-lg object-cover border border-gray-200"
                />
              </div>
            )}

            {/* Basic info - same order as Edit form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">First Name</label>
                <p className="mt-1 text-sm text-gray-900">{viewingMember.firstName || '—'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Last Name</label>
                <p className="mt-1 text-sm text-gray-900">{viewingMember.lastName || '—'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <p className="mt-1 text-sm text-gray-900">{viewingMember.title || '—'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Designation</label>
                <p className="mt-1 text-sm text-gray-900">{viewingMember.designation || '—'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <p className="mt-1 text-sm text-gray-900">{viewingMember.department || '—'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Join Date</label>
                <p className="mt-1 text-sm text-gray-900">
                  {viewingMember.joinDate ? new Date(viewingMember.joinDate).toLocaleDateString() : '—'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority Order</label>
                <p className="mt-1 text-sm text-gray-900">{viewingMember.priorityOrder ?? '—'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900 break-all">{viewingMember.email || '—'}</p>
              </div>
            </div>

            {viewingMember.bio && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Bio</label>
                <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{viewingMember.bio}</p>
              </div>
            )}

            {viewingMember.expertise && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Expertise</label>
                <p className="mt-1 text-sm text-gray-900">
                  {typeof viewingMember.expertise === 'string' && viewingMember.expertise.startsWith('[')
                    ? (() => {
                        try {
                          const arr = JSON.parse(viewingMember.expertise as string);
                          return Array.isArray(arr) ? arr.join(', ') : viewingMember.expertise;
                        } catch {
                          return viewingMember.expertise;
                        }
                      })()
                    : String(viewingMember.expertise)}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Image Background</label>
                <p className="mt-1 text-sm text-gray-900">{viewingMember.imageBackground || '—'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Image Style</label>
                <p className="mt-1 text-sm text-gray-900">{viewingMember.imageStyle || '—'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
                <p className="mt-1 text-sm text-gray-900 truncate">
                  {viewingMember.linkedinUrl ? (
                    <a href={viewingMember.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {viewingMember.linkedinUrl}
                    </a>
                  ) : '—'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Twitter URL</label>
                <p className="mt-1 text-sm text-gray-900 truncate">
                  {viewingMember.twitterUrl ? (
                    <a href={viewingMember.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {viewingMember.twitterUrl}
                    </a>
                  ) : '—'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Website URL</label>
                <p className="mt-1 text-sm text-gray-900 truncate">
                  {viewingMember.websiteUrl ? (
                    <a href={viewingMember.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {viewingMember.websiteUrl}
                    </a>
                  ) : '—'}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <p className="mt-1">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${viewingMember.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {viewingMember.isActive ? 'Active' : 'Inactive'}
                </span>
              </p>
            </div>

            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  setViewingMember(null);
                  openEditForm(viewingMember);
                }}
                className="flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
                title="Edit Member"
                aria-label="Edit Member"
                type="button"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
                  <FaEdit className="w-6 h-6 text-blue-600" />
                </div>
                <span className="font-semibold text-blue-700">Edit</span>
              </button>
              <button
                onClick={() => setViewingMember(null)}
                className="flex-shrink-0 h-14 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
                title="Close"
                aria-label="Close"
                type="button"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-200 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span className="font-semibold text-red-700">Close</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deletingMember && (
        <Modal
          open={!!deletingMember}
          onClose={() => setDeletingMember(null)}
          title="Confirm Deletion"
          preventBackdropClose={true}
        >
          <div className="text-center">
            <p className="text-lg">
              Are you sure you want to delete the team member: <strong>{deletingMember.firstName} {deletingMember.lastName}</strong>?
            </p>
            <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
            <div className="mt-6 flex justify-center gap-4">
              <button
                onClick={() => setDeletingMember(null)}
                className="flex-shrink-0 h-14 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
                title="Cancel"
                aria-label="Cancel"
                type="button"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-200 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span className="font-semibold text-red-700">Cancel</span>
              </button>
              <button
                onClick={async () => {
                  if (deletingMember.id) {
                    const success = await deleteExecutiveCommitteeMember(deletingMember.id);
                    if (success) {
                      handleMemberDeleted(deletingMember.id);
                    } else {
                      alert('Failed to delete member. Please try again.');
                    }
                  }
                }}
                className="flex-shrink-0 h-14 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
                title="Confirm Delete"
                aria-label="Confirm Delete"
                type="button"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-200 flex items-center justify-center">
                  <FaTrashAlt className="w-6 h-6 text-red-600" />
                </div>
                <span className="font-semibold text-red-700">Confirm Delete</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Image Upload Dialog */}
      {uploadingMember && (
        <ImageUploadDialog
          member={uploadingMember}
          isOpen={!!uploadingMember}
          onClose={() => setUploadingMember(null)}
          onUploadSuccess={handleImageUploadSuccess}
        />
      )}
    </div>
  );
}

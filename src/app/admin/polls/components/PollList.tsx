'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ConfirmModal } from '@/components/ui/Modal';
import type { EventPollDTO } from '@/types';

interface PollListProps {
  polls: EventPollDTO[];
  onEdit: (poll: EventPollDTO) => void;
  onDelete: (pollId: number) => void;
  onView: (poll: EventPollDTO) => void;
  onCreate: () => void;
  isLoading?: boolean;
}

export function PollList({ 
  polls, 
  onEdit, 
  onDelete, 
  onView, 
  onCreate, 
  isLoading = false 
}: PollListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPollForDelete, setSelectedPollForDelete] = useState<EventPollDTO | null>(null);

  const filteredPolls = polls.filter(poll =>
    poll.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (poll.description && poll.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusBadge = (poll: EventPollDTO) => {
    const now = new Date();
    const startDate = new Date(poll.startDate);
    const endDate = poll.endDate ? new Date(poll.endDate) : null;

    if (!poll.isActive) {
      return <Badge className="bg-gray-100 text-gray-600 border-gray-200">Inactive</Badge>;
    }

    if (now < startDate) {
      return <Badge className="bg-yellow-50 text-yellow-700 border-yellow-200">Scheduled</Badge>;
    }

    if (endDate && now > endDate) {
      return <Badge className="bg-red-50 text-red-700 border-red-200">Ended</Badge>;
    }

    return <Badge className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = (poll: EventPollDTO) => {
    setSelectedPollForDelete(poll);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedPollForDelete?.id) {
      onDelete(selectedPollForDelete.id);
      setIsDeleteModalOpen(false);
      setSelectedPollForDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Polls</h2>
          <button
            onClick={onCreate}
            className="flex-shrink-0 h-14 rounded-xl bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
            title="Create Poll"
            aria-label="Create Poll"
            type="button"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="font-semibold text-indigo-700">Create Poll</span>
          </button>
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="flex space-x-2">
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 bg-clip-text text-transparent">
          Poll Management
        </h2>
        <button
          onClick={onCreate}
          className="flex-shrink-0 h-14 rounded-xl bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
          title="Create Poll"
          aria-label="Create Poll"
          type="button"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-200 flex items-center justify-center">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="font-semibold text-indigo-700">Create Poll</span>
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-500 h-5 w-5" />
        <Input
          placeholder="Search polls..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 py-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500 transition-all"
        />
      </div>

      {filteredPolls.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">
              {searchTerm ? 'No polls found matching your search.' : 'No polls created yet.'}
            </p>
            {!searchTerm && (
              <button
                onClick={onCreate}
                className="mt-4 flex-shrink-0 h-14 rounded-xl bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
                title="Create Your First Poll"
                aria-label="Create Your First Poll"
                type="button"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-200 flex items-center justify-center">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span className="font-semibold text-indigo-700">Create Your First Poll</span>
              </button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {filteredPolls.map((poll) => (
            <Card key={poll.id} className="border-2 border-gray-100 hover:border-indigo-200 bg-gradient-to-br from-white to-indigo-50 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-cyan-50 border-b border-indigo-100">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <CardTitle className="text-xl font-bold text-gray-800">{poll.title}</CardTitle>
                    {poll.description && (
                      <CardDescription className="text-gray-600 text-base">
                        {poll.description}
                      </CardDescription>
                    )}
                  </div>
                  {getStatusBadge(poll)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Start Date:</span>
                    <span>{formatDate(poll.startDate)}</span>
                  </div>
                  {poll.endDate && (
                    <div className="flex justify-between">
                      <span>End Date:</span>
                      <span>{formatDate(poll.endDate)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Max Responses:</span>
                    <span>{poll.maxResponsesPerUser || 1} per user</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Multiple Choices:</span>
                    <span>{poll.allowMultipleChoices ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Anonymous:</span>
                    <span>{poll.isAnonymous ? 'Yes' : 'No'}</span>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => onView(poll)}
                    className="flex-shrink-0 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
                    title="View Poll"
                    aria-label="View Poll"
                    type="button"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <span className="font-semibold text-green-700">View</span>
                  </button>
                  <button
                    onClick={() => onEdit(poll)}
                    className="flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
                    title="Edit Poll"
                    aria-label="Edit Poll"
                    type="button"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <span className="font-semibold text-blue-700">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(poll)}
                    className="flex-shrink-0 h-14 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
                    title="Delete Poll"
                    aria-label="Delete Poll"
                    type="button"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-200 flex items-center justify-center">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </div>
                    <span className="font-semibold text-red-700">Delete</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedPollForDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Poll"
        message={`Are you sure you want to delete "${selectedPollForDelete?.title || 'this poll'}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
}


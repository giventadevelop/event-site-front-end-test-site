'use client';

import { useState, useEffect } from 'react';
import { PollList } from './components/PollList';
import { PollCreationForm } from './components/PollCreationForm';
import { PollDetailsModal } from './components/PollDetailsModal';
import { SuccessDialog } from '@/components/ui/SuccessDialog';
import { 
  createEventPollServer, 
  updateEventPollServer, 
  deleteEventPollServer,
  createEventPollOptionServer,
  updateEventPollOptionServer,
  fetchEventPollOptionsServer,
  deleteEventPollOptionServer
} from './ApiServerActions';
import type { EventPollDTO, EventPollOptionDTO } from '@/types';

interface PollManagementClientProps {
  initialPolls: EventPollDTO[];
}

export function PollManagementClient({ initialPolls }: PollManagementClientProps) {
  const [polls, setPolls] = useState<EventPollDTO[]>(initialPolls);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPoll, setEditingPoll] = useState<EventPollDTO | null>(null);
  const [viewingPoll, setViewingPoll] = useState<EventPollDTO | null>(null);
  const [pollOptions, setPollOptions] = useState<EventPollOptionDTO[]>([]);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState({ title: '', message: '' });

  const showSuccess = (title: string, message: string) => {
    setSuccessMessage({ title, message });
    setShowSuccessDialog(true);
  };

  const handleCreatePoll = async (
    pollData: Omit<EventPollDTO, 'id' | 'createdAt' | 'updatedAt'>,
    options: Omit<EventPollOptionDTO, 'id' | 'createdAt' | 'updatedAt' | 'pollId'>[]
  ) => {
    try {
      setIsLoading(true);
      
      // Create the poll first
      const createdPoll = await createEventPollServer(pollData);
      
      // Create poll options
      const createdOptions = await Promise.all(
        options.map(option => 
          createEventPollOptionServer({
            ...option,
            pollId: createdPoll.id,
          })
        )
      );
      
      // Update local state
      setPolls(prev => [createdPoll, ...prev]);
      setShowCreateForm(false);
      
      // Show success message
      showSuccess('Poll Created Successfully!', 'Your new poll has been created and is now available for voting.');
    } catch (error) {
      console.error('Error creating poll:', error);
      alert('Failed to create poll. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePoll = async (
    pollData: Omit<EventPollDTO, 'id' | 'createdAt' | 'updatedAt'>,
    options: (Omit<EventPollOptionDTO, 'id' | 'createdAt' | 'updatedAt' | 'pollId'> & { id?: number })[]
  ) => {
    if (!editingPoll?.id) return;

    try {
      setIsLoading(true);
      
      // Update the poll
      const updatedPoll = await updateEventPollServer(editingPoll.id, pollData);
      
      // Get existing options
      const existingOptions = await fetchEventPollOptionsServer({ 
        'pollId.equals': editingPoll.id 
      });
      
      // Separate options into existing (with ID) and new (without ID)
      const existingOptionIds = options.filter(opt => opt.id).map(opt => opt.id!);
      const newOptions = options.filter(opt => !opt.id);
      
      // Delete options that were removed (exist in database but not in form)
      const optionsToDelete = existingOptions.filter(
        existing => !existingOptionIds.includes(existing.id!)
      );
      
      await Promise.all(
        optionsToDelete.map(option => 
          option.id ? deleteEventPollOptionServer(option.id) : Promise.resolve()
        )
      );
      
      // Update existing options (PATCH calls)
      const updatePromises = options
        .filter(opt => opt.id) // Only existing options
        .map(option => {
          const { id, ...optionData } = option;
          return updateEventPollOptionServer(id!, {
            ...optionData,
            pollId: editingPoll.id,
          });
        });
      
      // Create new options (POST calls)
      const createPromises = newOptions.map(option => 
        createEventPollOptionServer({
          ...option,
          pollId: editingPoll.id,
        })
      );
      
      // Execute all updates and creates in parallel
      await Promise.all([...updatePromises, ...createPromises]);
      
      // Update local state
      setPolls(prev => prev.map(poll => 
        poll.id === editingPoll.id ? updatedPoll : poll
      ));
      setEditingPoll(null);
      
      // Show success message
      showSuccess('Poll Updated Successfully!', 'Your poll has been updated with the latest changes.');
    } catch (error) {
      console.error('Error updating poll:', error);
      alert('Failed to update poll. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePoll = async (pollId: number) => {
    try {
      setIsLoading(true);
      
      // Get and delete poll options first
      const options = await fetchEventPollOptionsServer({ 
        'pollId.equals': pollId 
      });
      
      await Promise.all(
        options.map(option => 
          option.id ? deleteEventPollOptionServer(option.id) : Promise.resolve()
        )
      );
      
      // Delete the poll
      await deleteEventPollServer(pollId);
      
      // Update local state
      setPolls(prev => prev.filter(poll => poll.id !== pollId));
      
      // Show success message
      showSuccess('Poll Deleted Successfully!', 'The poll has been permanently removed from the system.');
    } catch (error) {
      console.error('Error deleting poll:', error);
      alert('Failed to delete poll. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewPoll = async (poll: EventPollDTO) => {
    try {
      // Fetch poll options
      const options = await fetchEventPollOptionsServer({ 
        'pollId.equals': poll.id 
      });
      setPollOptions(options);
      setViewingPoll(poll);
    } catch (error) {
      console.error('Error fetching poll options:', error);
      alert('Failed to load poll details.');
    }
  };

  const handleEditPoll = async (poll: EventPollDTO) => {
    try {
      // Fetch poll options
      const options = await fetchEventPollOptionsServer({ 
        'pollId.equals': poll.id 
      });
      setPollOptions(options);
      setEditingPoll(poll);
    } catch (error) {
      console.error('Error fetching poll options:', error);
      alert('Failed to load poll for editing.');
    }
  };

  if (showCreateForm) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Create New Poll</h2>
          <p className="text-gray-600 mt-2">
            Configure your poll settings and options
          </p>
        </div>
        
        <PollCreationForm
          onSubmit={handleCreatePoll}
          onCancel={() => setShowCreateForm(false)}
          isLoading={isLoading}
        />
      </div>
    );
  }

  if (editingPoll) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Edit Poll</h2>
          <p className="text-gray-600 mt-2">
            Update poll settings and options
          </p>
        </div>
        
        <PollCreationForm
          onSubmit={handleUpdatePoll}
          onCancel={() => setEditingPoll(null)}
          initialData={editingPoll}
          initialOptions={pollOptions}
          isLoading={isLoading}
        />
      </div>
    );
  }

  if (viewingPoll) {
    return (
      <PollDetailsModal
        poll={viewingPoll}
        options={pollOptions}
        onClose={() => setViewingPoll(null)}
      />
    );
  }

  return (
    <>
      <PollList
        polls={polls}
        onEdit={handleEditPoll}
        onDelete={handleDeletePoll}
        onView={handleViewPoll}
        onCreate={() => setShowCreateForm(true)}
        isLoading={isLoading}
      />

      {/* Success Dialog */}
      <SuccessDialog
        open={showSuccessDialog}
        onClose={() => setShowSuccessDialog(false)}
        title={successMessage.title}
        message={successMessage.message}
        buttonText="Continue"
      />
    </>
  );
}


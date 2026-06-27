'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import type { EventPollDTO, EventPollOptionDTO } from '@/types';

interface PollOption {
  id?: number;
  optionText: string;
  displayOrder: number;
  isActive: boolean;
}

interface PollCreationFormProps {
  onSubmit: (pollData: Omit<EventPollDTO, 'id' | 'createdAt' | 'updatedAt'>, options: (Omit<EventPollOptionDTO, 'id' | 'createdAt' | 'updatedAt' | 'pollId'> & { id?: number })[]) => Promise<void>;
  onCancel: () => void;
  initialData?: EventPollDTO;
  initialOptions?: EventPollOptionDTO[];
  isLoading?: boolean;
}

export function PollCreationForm({ 
  onSubmit, 
  onCancel, 
  initialData, 
  initialOptions = [], 
  isLoading = false 
}: PollCreationFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    isActive: initialData?.isActive ?? true,
    isAnonymous: initialData?.isAnonymous ?? false,
    allowMultipleChoices: initialData?.allowMultipleChoices ?? false,
    startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().slice(0, 16) : '',
    endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().slice(0, 16) : '',
    maxResponsesPerUser: initialData?.maxResponsesPerUser ?? 1,
    resultsVisibleTo: initialData?.resultsVisibleTo ?? 'ALL',
    eventId: initialData?.eventId || undefined,
  });

  const optionsArray = Array.isArray(initialOptions)
    ? initialOptions
    : (initialOptions && typeof initialOptions === 'object' && 'content' in initialOptions && Array.isArray((initialOptions as { content: EventPollOptionDTO[] }).content))
      ? (initialOptions as { content: EventPollOptionDTO[] }).content
      : [];

  const [options, setOptions] = useState<PollOption[]>(
    optionsArray.length > 0
      ? optionsArray.map((opt, index) => ({
          id: opt.id,
          optionText: opt.optionText ?? '',
          displayOrder: (opt as EventPollOptionDTO & { displayOrder?: number }).displayOrder ?? index,
          isActive: (opt as EventPollOptionDTO & { isActive?: boolean }).isActive ?? true,
        }))
      : [
          { optionText: '', displayOrder: 0, isActive: true },
          { optionText: '', displayOrder: 1, isActive: true },
        ]
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Poll title is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (formData.endDate && new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    const validOptions = options.filter(opt => opt.optionText.trim());
    if (validOptions.length < 2) {
      newErrors.options = 'At least 2 poll options are required';
    }

    if (formData.maxResponsesPerUser < 1) {
      newErrors.maxResponsesPerUser = 'Max responses per user must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const validOptions = options.filter(opt => opt.optionText.trim()).map(opt => ({
      ...opt,
      // Preserve the ID if it exists (for updates)
      ...(opt.id && { id: opt.id })
    }));
    
    // Convert datetime-local format to proper ISO format for backend
    const formattedFormData = {
      ...formData,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : '',
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : '',
    };
    
    await onSubmit(formattedFormData, validOptions);
  };

  const addOption = () => {
    const newOrder = Math.max(...options.map(opt => opt.displayOrder), -1) + 1;
    setOptions([...options, { optionText: '', displayOrder: newOrder, isActive: true }]);
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      // Reorder remaining options
      const reorderedOptions = newOptions.map((opt, i) => ({
        ...opt,
        displayOrder: i,
      }));
      setOptions(reorderedOptions);
    }
  };

  const updateOption = (index: number, field: keyof PollOption, value: any) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const moveOption = (fromIndex: number, toIndex: number) => {
    const newOptions = [...options];
    const [movedOption] = newOptions.splice(fromIndex, 1);
    newOptions.splice(toIndex, 0, movedOption);
    
    // Update display order
    const reorderedOptions = newOptions.map((opt, index) => ({
      ...opt,
      displayOrder: index,
    }));
    
    setOptions(reorderedOptions);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Poll Details</CardTitle>
          <CardDescription>Configure the basic information for your poll</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Poll Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter poll title"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter poll description (optional)"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className={errors.startDate ? 'border-red-500' : ''}
              />
              {errors.startDate && <p className="text-sm text-red-500">{errors.startDate}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className={errors.endDate ? 'border-red-500' : ''}
              />
              {errors.endDate && <p className="text-sm text-red-500">{errors.endDate}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Poll Options</CardTitle>
          <CardDescription>Add the choices for your poll</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {options.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
              <Input
                value={option.optionText}
                onChange={(e) => updateOption(index, 'optionText', e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-1"
              />
              <button
                type="button"
                onClick={() => removeOption(index)}
                disabled={options.length <= 2}
                className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-300 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                title="Delete Option"
                aria-label="Delete Option"
              >
                <Trash2 className="w-6 h-6 text-red-600" />
              </button>
            </div>
          ))}
          
          {errors.options && <p className="text-sm text-red-500">{errors.options}</p>}
          
          <button
            type="button"
            onClick={addOption}
            className="w-full flex-shrink-0 h-14 rounded-xl bg-purple-100 hover:bg-purple-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
            title="Add Option"
            aria-label="Add Option"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-200 flex items-center justify-center">
              <Plus className="h-6 w-6 text-purple-600" />
            </div>
            <span className="font-semibold text-purple-700">Add Option</span>
          </button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Poll Settings</CardTitle>
          <CardDescription>Configure how users can interact with your poll</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">Active</Label>
              <p className="text-sm text-gray-500">Make this poll available for voting</p>
            </div>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="isAnonymous">Anonymous Voting</Label>
              <p className="text-sm text-gray-500">Allow users to vote without revealing their identity</p>
            </div>
            <Switch
              id="isAnonymous"
              checked={formData.isAnonymous}
              onCheckedChange={(checked) => setFormData({ ...formData, isAnonymous: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allowMultipleChoices">Multiple Choices</Label>
              <p className="text-sm text-gray-500">Allow users to select multiple options</p>
            </div>
            <Switch
              id="allowMultipleChoices"
              checked={formData.allowMultipleChoices}
              onCheckedChange={(checked) => setFormData({ ...formData, allowMultipleChoices: checked })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxResponsesPerUser">Max Responses Per User</Label>
            <Input
              id="maxResponsesPerUser"
              type="number"
              min="1"
              value={formData.maxResponsesPerUser}
              onChange={(e) => setFormData({ ...formData, maxResponsesPerUser: parseInt(e.target.value) || 1 })}
              className={errors.maxResponsesPerUser ? 'border-red-500' : ''}
            />
            {errors.maxResponsesPerUser && <p className="text-sm text-red-500">{errors.maxResponsesPerUser}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="resultsVisibleTo">Results Visible To</Label>
            <select
              id="resultsVisibleTo"
              value={formData.resultsVisibleTo}
              onChange={(e) => setFormData({ ...formData, resultsVisibleTo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">All Users</option>
              <option value="VOTERS_ONLY">Voters Only</option>
              <option value="ADMINS_ONLY">Admins Only</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button 
          type="button" 
          onClick={onCancel}
          className="flex-shrink-0 h-14 rounded-xl bg-teal-100 hover:bg-teal-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
          title="Cancel"
          aria-label="Cancel"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-teal-200 flex items-center justify-center">
            <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <span className="font-semibold text-teal-700">Cancel</span>
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading}
          className="flex-shrink-0 h-14 rounded-xl bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 disabled:bg-gray-100 disabled:border-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:scale-100 px-6"
          title={initialData ? 'Update Poll' : 'Create Poll'}
          aria-label={initialData ? 'Update Poll' : 'Create Poll'}
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-200 flex items-center justify-center">
            {isLoading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
            ) : (
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className="font-semibold text-indigo-700">
            {isLoading ? 'Saving...' : (initialData ? 'Update Poll' : 'Create Poll')}
          </span>
        </Button>
      </div>
    </form>
  );
}


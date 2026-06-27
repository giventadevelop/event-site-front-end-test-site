'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { TeamGroupDTO } from '@/types/teamGroup';
import type { TeamMemberDTO, TeamMemberFormData } from '@/types/teamMember';
import { createTeamMember, updateTeamMember } from './ApiServerActions';
import { uploadSquadMemberProfileImage } from './TeamMemberUploadActions';
import DragDropImageUpload from '@/components/DragDropImageUpload';

interface TeamMemberFormProps {
  member?: TeamMemberDTO | null;
  groups: TeamGroupDTO[];
  defaultGroupId?: number;
  onSuccess: (member: TeamMemberDTO) => void;
  onCancel: () => void;
}

function parseExpertise(raw?: string): string[] {
  if (!raw) return [''];
  if (raw.startsWith('[')) {
    try {
      const p = JSON.parse(raw);
      return Array.isArray(p) && p.length ? p : [''];
    } catch {
      return [raw];
    }
  }
  return raw.trim() ? raw.split(/\s+/).filter(Boolean) : [''];
}

export default function TeamMemberForm({
  member,
  groups,
  defaultGroupId,
  onSuccess,
  onCancel,
}: TeamMemberFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(member?.profileImageUrl || null);
  const [expertiseItems, setExpertiseItems] = useState<string[]>(() => parseExpertise(member?.expertise));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, setValue, watch } = useForm<TeamMemberFormData>({
    defaultValues: {
      teamGroupId: member?.teamGroupId ?? defaultGroupId ?? groups[0]?.id ?? 0,
      firstName: member?.firstName || '',
      lastName: member?.lastName || '',
      title: member?.title || '',
      designation: member?.designation || '',
      bio: member?.bio || '',
      email: member?.email || '',
      expertise: parseExpertise(member?.expertise),
      priorityOrder: member?.priorityOrder ?? 0,
      isActive: member?.isActive ?? true,
      jerseyNumber: member?.jerseyNumber ?? undefined,
      position: member?.position || '',
      lineupSubtitle: member?.lineupSubtitle || '',
      instrument: member?.instrument || '',
      vocalRole: member?.vocalRole || '',
      userProfileId: member?.userProfileId ?? undefined,
    },
  });

  const watchedGroupId = watch('teamGroupId');
  const isMusic = groups.find((g) => g.id === Number(watchedGroupId))?.teamType === 'MUSIC';

  const onSubmit = async (data: TeamMemberFormData) => {
    setError('');
    if (!data.teamGroupId) {
      setError('Team group is required');
      return;
    }
    if (!data.firstName?.trim() || !data.lastName?.trim()) {
      setError('First and last name are required');
      return;
    }
    setSaving(true);
    try {
      const filteredExpertise = expertiseItems.filter((x) => x.trim());
      const payload = {
        teamGroupId: Number(data.teamGroupId),
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        title: data.title?.trim() || `${data.firstName} ${data.lastName}`,
        designation: data.designation?.trim() || undefined,
        bio: data.bio?.trim() || undefined,
        email: data.email?.trim() || undefined,
        expertise: filteredExpertise.length ? JSON.stringify(filteredExpertise) : undefined,
        priorityOrder: Number(data.priorityOrder) || 0,
        isActive: data.isActive ?? true,
        jerseyNumber:
          data.jerseyNumber != null && !Number.isNaN(Number(data.jerseyNumber))
            ? Number(data.jerseyNumber)
            : null,
        position: data.position?.trim() || undefined,
        lineupSubtitle: data.lineupSubtitle?.trim() || undefined,
        instrument: data.instrument?.trim() || undefined,
        vocalRole: data.vocalRole?.trim() || undefined,
        userProfileId: data.userProfileId ? Number(data.userProfileId) : null,
        profileImageUrl: member?.profileImageUrl,
      };

      let result =
        member?.id != null
          ? await updateTeamMember(member.id, payload)
          : await createTeamMember(payload as Omit<TeamMemberDTO, 'id'>);

      if (!result?.id) throw new Error('Save failed');

      if (imageFile) {
        const url = await uploadSquadMemberProfileImage(result.id, imageFile);
        if (url && !url.startsWith('upload-successful')) {
          result = (await updateTeamMember(result.id, { profileImageUrl: url })) ?? result;
        }
      }

      onSuccess(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = 'mt-1 w-full border border-gray-400 rounded-xl px-4 py-3 text-base';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-3xl max-h-[70vh] overflow-y-auto pr-2">
      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div>
        <label className="block text-sm font-medium text-gray-700">Team group *</label>
        <select {...register('teamGroupId', { valueAsNumber: true })} className={inputClass}>
          {groups.map((g) => (
            <option key={g.id} value={g.id ?? ''}>
              {g.name} ({g.teamType})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">First name *</label>
          <input {...register('firstName')} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Last name *</label>
          <input {...register('lastName')} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input {...register('title')} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Priority order</label>
          <input type="number" {...register('priorityOrder', { valueAsNumber: true })} className={inputClass} />
          <p className="text-xs text-gray-500 mt-1">Lower number = appears first in carousel.</p>
        </div>
        {!isMusic && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Jersey number</label>
              <input type="number" {...register('jerseyNumber', { valueAsNumber: true })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Position</label>
              <input {...register('position')} className={inputClass} />
            </div>
          </>
        )}
        {isMusic && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Instrument</label>
              <input {...register('instrument')} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Vocal role</label>
              <input {...register('vocalRole')} className={inputClass} />
            </div>
          </>
        )}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Lineup subtitle</label>
          <input {...register('lineupSubtitle')} placeholder="e.g. FIRST TEAM" className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" {...register('email')} className={inputClass} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">User profile ID (optional)</label>
          <input type="number" {...register('userProfileId', { valueAsNumber: true })} className={inputClass} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Skills / expertise</label>
        {expertiseItems.map((item, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              value={item}
              onChange={(e) => {
                const next = [...expertiseItems];
                next[i] = e.target.value;
                setExpertiseItems(next);
                setValue('expertise', next);
              }}
              className={inputClass}
            />
          </div>
        ))}
        <button
          type="button"
          className="text-sm text-blue-600"
          onClick={() => setExpertiseItems((prev) => [...prev, ''])}
        >
          + Add skill
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Portrait image</label>
        <DragDropImageUpload
          selectedFile={imageFile}
          previewUrl={imagePreview}
          onFileSelect={(file) => {
            setImageFile(file);
            const reader = new FileReader();
            reader.onload = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
          }}
          onFileRemove={() => {
            setImageFile(null);
            setImagePreview(null);
          }}
        />
      </div>

      <label className="flex items-center gap-2">
        <input type="checkbox" {...register('isActive')} />
        <span className="text-sm">Active on roster</span>
      </label>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-semibold disabled:opacity-50"
        >
          {saving ? 'Saving…' : member?.id ? 'Update member' : 'Create member'}
        </button>
        <button type="button" onClick={onCancel} className="px-6 py-3 rounded-xl bg-gray-100 font-semibold">
          Cancel
        </button>
      </div>
    </form>
  );
}

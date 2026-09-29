'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import Link from 'next/link';
import { useAuth } from '@clerk/nextjs';
import { useParams } from 'next/navigation';
import { FaClock, FaMicrophone, FaAddressBook, FaHandshake, FaEnvelope, FaUserTie } from 'react-icons/fa';
import DataTable, { Column } from '@/components/ui/DataTable';
import Modal, { ConfirmModal } from '@/components/ui/Modal';
import type { EventAgendaItemDTO, EventDetailsDTO, EventMediaDTO } from '@/types';
import {
  createEventAgendaItemServer,
  deleteEventAgendaItemServer,
  fetchEventAgendaItemsServer,
  fetchEventMediaForAgendaServer,
  updateEventAgendaItemServer,
} from './ApiServerActions';
import AgendaFlyerPanel from './AgendaFlyerPanel';

const emptyForm: Partial<EventAgendaItemDTO> = {
  title: '',
  description: '',
  startTime: '',
  endTime: '',
  scheduleDate: '',
  imageUrl: '',
  sortOrder: 0,
  isPublished: true,
};

function todayIsoDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Keep date inputs valid (YYYY-MM-DD) so native form validation does not block submit. */
function toDateInputValue(value: string | null | undefined): string {
  if (!value) return '';
  const raw = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  return '';
}

/**
 * Client-side upload — do not call the uploadMedia server action from inside this form.
 * Invoking a server action from a nested form can break subsequent onSubmit handlers in Next.js.
 */
async function uploadAgendaItemImageClient(params: {
  eventId: number;
  file: File;
  title: string;
  description: string;
}): Promise<EventMediaDTO> {
  const tenantId = process.env.NEXT_PUBLIC_TENANT_ID;
  if (!tenantId) {
    throw new Error('NEXT_PUBLIC_TENANT_ID is not set');
  }

  const body = new FormData();
  body.append('files', params.file);
  body.append('eventId', String(params.eventId));
  body.append('eventFlyer', 'false');
  body.append('isAgendaFlyer', 'false');
  body.append('isEventManagementOfficialDocument', 'false');
  body.append('isHeroImage', 'false');
  body.append('isActiveHeroImage', 'false');
  body.append('isPublic', 'true');
  body.append('isTeamMemberProfileImage', 'false');
  body.append('tenantId', tenantId);
  body.append('titles', params.title);
  body.append('descriptions', params.description || '');
  body.append('startDisplayingFromDate', todayIsoDate());

  const res = await fetch('/api/proxy/event-medias/upload-multiple', {
    method: 'POST',
    body,
  });

  if (!res.ok) {
    throw new Error(await res.text() || 'Failed to upload image');
  }

  const result = await res.json();
  const uploadedList: EventMediaDTO[] = Array.isArray(result) ? result : result ? [result] : [];
  const uploaded = uploadedList[0];
  if (!uploaded) {
    throw new Error('Upload succeeded but no media was returned');
  }
  return uploaded;
}

export default function EventAgendaPage() {
  const { userId } = useAuth();
  const params = useParams();
  const eventId = params?.id as string;
  const eventIdNum = parseInt(eventId, 10);

  const [event, setEvent] = useState<EventDetailsDTO | null>(null);
  const [items, setItems] = useState<EventAgendaItemDTO[]>([]);
  const [eventMedia, setEventMedia] = useState<EventMediaDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  /** Shown inside the modal — page toasts sit under the dialog overlay and are easy to miss. */
  const [formError, setFormError] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<EventAgendaItemDTO | null>(null);
  const [formData, setFormData] = useState<Partial<EventAgendaItemDTO>>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingImage, setUploadingImage] = useState(false);
  const fieldRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>>({});
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  /** Survives accidental selectedItem clears while the edit modal stays open. */
  const editingItemIdRef = useRef<number | null>(null);
  /** EventMedia id when the edit dialog was opened — needed to clear-before-swap on Hibernate. */
  const initialEventMediaIdRef = useRef<number | null>(null);
  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  useEffect(() => {
    if (userId && eventId) {
      loadAll();
    }
  }, [userId, eventId]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const loadAll = async (opts?: { quiet?: boolean }) => {
    try {
      if (!opts?.quiet) setLoading(true);
      const eventResponse = await fetch(`/api/proxy/event-details/${eventId}`);
      if (eventResponse.ok) {
        setEvent(await eventResponse.json());
      }
      const [agenda, media] = await Promise.all([
        fetchEventAgendaItemsServer(eventIdNum),
        fetchEventMediaForAgendaServer(eventIdNum),
      ]);
      setItems(agenda);
      setEventMedia(media.filter((m) => m.fileUrl || m.preSignedUrl));
    } catch (err: any) {
      setToastMessage({ type: 'error', message: err.message || 'Failed to load agenda' });
      throw err;
    } finally {
      if (!opts?.quiet) setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      ...emptyForm,
      event: { id: eventIdNum } as EventDetailsDTO,
    });
    setErrors({});
    setFormError(null);
    setSelectedItem(null);
    editingItemIdRef.current = null;
    initialEventMediaIdRef.current = null;
  };

  const closeCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
    resetForm();
  }, [eventIdNum]);

  const closeEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    resetForm();
  }, [eventIdNum]);

  const validate = (): boolean => {
    const data = formDataRef.current;
    const errs: Record<string, string> = {};
    if (!data.title || data.title.trim() === '') {
      errs.title = 'Title is required';
    }
    if (!data.startTime || data.startTime.trim() === '') {
      errs.startTime = 'Start time is required';
    }
    const hasErrors = Object.keys(errs).length > 0;
    if (hasErrors) {
      flushSync(() => setErrors(errs));
      const first = Object.keys(errs)[0];
      fieldRefs.current[first]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      setErrors({});
    }
    return !hasErrors;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    if (formError) setFormError(null);
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (name === 'eventMediaId') {
      const mediaId = value ? parseInt(value, 10) : null;
      const media = eventMedia.find((m) => m.id === mediaId);
      setFormData((prev) => ({
        ...prev,
        eventMedia: mediaId ? ({ id: mediaId } as EventMediaDTO) : null,
        imageUrl: media?.fileUrl || media?.preSignedUrl || (mediaId ? prev.imageUrl : ''),
      }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : name === 'sortOrder' ? Number(value) || 0 : value,
    }));
  };

  const buildPayload = (data: Partial<EventAgendaItemDTO> = formDataRef.current) => ({
    title: (data.title || '').trim(),
    description: data.description?.trim() || null,
    startTime: (data.startTime || '').trim(),
    endTime: data.endTime?.trim() || null,
    scheduleDate: data.scheduleDate && String(data.scheduleDate).trim() !== '' ? data.scheduleDate : null,
    imageUrl: data.imageUrl?.trim() || null,
    sortOrder: data.sortOrder ?? 0,
    isPublished: data.isPublished ?? true,
    event: { id: eventIdNum } as EventDetailsDTO,
    eventMedia: data.eventMedia?.id ? ({ id: data.eventMedia.id } as EventMediaDTO) : null,
  });

  const saveCreate = async () => {
    setFormError(null);
    if (!validate()) {
      setFormError('Please fix the highlighted fields');
      return;
    }
    try {
      setSaving(true);
      await createEventAgendaItemServer(buildPayload() as any);
      setIsCreateModalOpen(false);
      resetForm();
      await loadAll({ quiet: true });
      setToastMessage({ type: 'success', message: 'Agenda item created' });
    } catch (err: any) {
      console.error('[EventAgendaPage] create failed', err);
      setFormError(err.message || 'Failed to create agenda item');
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async () => {
    setFormError(null);
    const itemId = selectedItem?.id ?? editingItemIdRef.current;
    if (!itemId) {
      setFormError('No agenda item selected to update');
      return;
    }
    if (!validate()) {
      setFormError('Please fix the highlighted fields');
      return;
    }

    const payload = buildPayload();
    // Snapshot of what the table must show after save (nulls included).
    const savedRow: Partial<EventAgendaItemDTO> = {
      title: payload.title,
      description: payload.description,
      startTime: payload.startTime,
      endTime: payload.endTime,
      scheduleDate: payload.scheduleDate,
      imageUrl: payload.imageUrl,
      sortOrder: payload.sortOrder,
      isPublished: payload.isPublished,
      eventMedia: payload.eventMedia,
    };

    const applySavedToList = (list: EventAgendaItemDTO[]) =>
      list.map((row) =>
        Number(row.id) === Number(itemId)
          ? {
              ...row,
              ...savedRow,
              id: Number(itemId),
              // Force cleared media even if API/reload still echoes old values.
              imageUrl: savedRow.imageUrl ?? null,
              eventMedia: savedRow.eventMedia ?? null,
            }
          : row
      );

    try {
      setSaving(true);
      const previousEventMediaId =
        initialEventMediaIdRef.current ?? selectedItem?.eventMedia?.id ?? null;
      await updateEventAgendaItemServer(itemId, payload, {
        previousEventMediaId,
        eventId: eventIdNum,
      });

      // Update table from what the user saved — do not prefer API echo (it can return stale imageUrl).
      setItems((prev) => applySavedToList(prev));
      setIsEditModalOpen(false);
      resetForm();

      try {
        const [agenda, media] = await Promise.all([
          fetchEventAgendaItemsServer(eventIdNum),
          fetchEventMediaForAgendaServer(eventIdNum),
        ]);
        // Re-apply saved fields on the edited row so a stale GET cannot resurrect old image/text.
        setItems(applySavedToList(agenda));
        setEventMedia(media.filter((m) => m.fileUrl || m.preSignedUrl));
      } catch (reloadErr) {
        console.warn('[EventAgendaPage] reload after update failed; table already updated locally', reloadErr);
      }
      setToastMessage({ type: 'success', message: 'Agenda item updated' });
    } catch (err: any) {
      console.error('[EventAgendaPage] update failed', err);
      setFormError(err.message || 'Failed to update agenda item');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem?.id) return;
    try {
      setSaving(true);
      await deleteEventAgendaItemServer(selectedItem.id);
      setIsDeleteModalOpen(false);
      resetForm();
      await loadAll();
      setToastMessage({ type: 'success', message: 'Agenda item deleted' });
    } catch (err: any) {
      setToastMessage({ type: 'error', message: err.message || 'Failed to delete agenda item' });
    } finally {
      setSaving(false);
    }
  };

  const refreshEventMedia = async () => {
    try {
      const media = await fetchEventMediaForAgendaServer(eventIdNum);
      setEventMedia(media.filter((m) => m.fileUrl || m.preSignedUrl));
    } catch {
      // Keep existing list on refresh failure
    }
  };

  const handleAgendaImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setToastMessage({ type: 'error', message: 'Please select an image file' });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setToastMessage({ type: 'error', message: 'File size must be less than 10MB' });
      return;
    }
    if (!Number.isFinite(eventIdNum) || eventIdNum <= 0) {
      setToastMessage({ type: 'error', message: 'Event ID is missing' });
      return;
    }

    setUploadingImage(true);
    try {
      const titleBase = formData.title?.trim() || 'Agenda item';
      const uploaded = await uploadAgendaItemImageClient({
        eventId: eventIdNum,
        file,
        title: `${titleBase} agenda thumbnail`,
        description: formData.description?.trim() || '',
      });

      const imageUrl = uploaded.fileUrl || uploaded.preSignedUrl || '';
      if (!imageUrl) {
        throw new Error('Upload succeeded but no image URL was returned');
      }

      setFormData((prev) => ({
        ...prev,
        imageUrl,
        eventMedia: uploaded.id ? ({ id: uploaded.id } as EventMediaDTO) : prev.eventMedia,
      }));
      await refreshEventMedia();
      setToastMessage({ type: 'success', message: 'Image uploaded' });
    } catch (err: any) {
      setToastMessage({ type: 'error', message: err.message || 'Failed to upload image' });
    } finally {
      setUploadingImage(false);
      if (imageFileInputRef.current) {
        imageFileInputRef.current.value = '';
      }
    }
  };

  const clearAgendaImage = () => {
    setFormData((prev) => ({
      ...prev,
      imageUrl: '',
      eventMedia: null,
    }));
  };

  const openCreate = () => {
    resetForm();
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  const openEdit = (item: EventAgendaItemDTO) => {
    editingItemIdRef.current = item.id ?? null;
    let previousMediaId = item.eventMedia?.id ?? null;
    if (previousMediaId == null && item.imageUrl) {
      const match = eventMedia.find(
        (m) => m.fileUrl === item.imageUrl || m.preSignedUrl === item.imageUrl
      );
      previousMediaId = match?.id ?? null;
    }
    initialEventMediaIdRef.current = previousMediaId;
    setSelectedItem(item);
    setFormData({
      title: item.title || '',
      description: item.description || '',
      startTime: item.startTime || '',
      endTime: item.endTime || '',
      scheduleDate: toDateInputValue(item.scheduleDate),
      imageUrl: item.imageUrl || '',
      sortOrder: item.sortOrder ?? 0,
      isPublished: item.isPublished ?? true,
      event: { id: eventIdNum } as EventDetailsDTO,
      eventMedia: previousMediaId ? ({ id: previousMediaId } as EventMediaDTO) : null,
    });
    setErrors({});
    setFormError(null);
    setIsEditModalOpen(true);
  };

  const formatTimeRange = (item: EventAgendaItemDTO) =>
    item.endTime ? `${item.startTime} – ${item.endTime}` : item.startTime;

  const columns: Column<EventAgendaItemDTO>[] = [
    {
      key: 'sortOrder',
      label: 'Order',
      width: '80px',
      render: (_value, item) => <span className="font-semibold text-gray-700">{item.sortOrder}</span>,
    },
    {
      key: 'scheduleDate',
      label: 'Date',
      render: (_value, item) => (
        <span className="text-sm text-gray-700">{item.scheduleDate || 'Event day'}</span>
      ),
    },
    {
      key: 'startTime',
      label: 'Time',
      render: (_value, item) => (
        <span className="inline-flex items-center px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-sm font-semibold">
          {formatTimeRange(item)}
        </span>
      ),
    },
    {
      key: 'title',
      label: 'Program',
      render: (_value, item) => (
        <div>
          <div className="font-semibold text-gray-900">{item.title}</div>
          {item.description && <div className="text-sm text-gray-600 line-clamp-2">{item.description}</div>}
        </div>
      ),
    },
    {
      key: 'isPublished',
      label: 'Published',
      render: (_value, item) => (
        <span
          className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
            item.isPublished ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
          }`}
        >
          {item.isPublished ? 'Yes' : 'Draft'}
        </span>
      ),
    },
    {
      key: 'imageUrl',
      label: 'Image',
      render: (_value, item) => {
        const src = item.imageUrl && String(item.imageUrl).trim();
        return src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="" className="w-16 h-16 object-contain rounded-lg bg-gray-50" />
        ) : (
          <span className="text-gray-400 text-sm">—</span>
        );
      },
    },
  ];

  const renderForm = (mode: 'create' | 'edit') => (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (mode === 'edit') void saveEdit();
        else void saveCreate();
      }}
      className="space-y-4"
    >
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title *</label>
        <input
          ref={(el) => { if (el) fieldRefs.current.title = el; }}
          id="title"
          name="title"
          type="text"
          value={formData.title || ''}
          onChange={handleChange}
          onBlur={() => { if (!formData.title?.trim()) setErrors((p) => ({ ...p, title: 'Title is required' })); }}
          className={`mt-1 block w-full border rounded-xl focus:ring-blue-500 px-4 py-3 text-base ${
            errors.title ? 'border-red-500 focus:border-red-500' : 'border-gray-400 focus:border-blue-500'
          }`}
        />
        {errors.title && <div className="text-red-500 text-sm mt-1">{errors.title}</div>}
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          id="description"
          name="description"
          rows={2}
          value={formData.description || ''}
          onChange={handleChange}
          className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label htmlFor="scheduleDate" className="block text-sm font-medium text-gray-700">Date (optional)</label>
          <input
            id="scheduleDate"
            name="scheduleDate"
            type="date"
            value={formData.scheduleDate || ''}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
          />
        </div>
        <div>
          <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Start time *</label>
          <input
            ref={(el) => { if (el) fieldRefs.current.startTime = el; }}
            id="startTime"
            name="startTime"
            type="text"
            placeholder="8:00 AM"
            value={formData.startTime || ''}
            onChange={handleChange}
            onBlur={() => { if (!formData.startTime?.trim()) setErrors((p) => ({ ...p, startTime: 'Start time is required' })); }}
            className={`mt-1 block w-full border rounded-xl focus:ring-blue-500 px-4 py-3 text-base ${
              errors.startTime ? 'border-red-500 focus:border-red-500' : 'border-gray-400 focus:border-blue-500'
            }`}
          />
          {errors.startTime && <div className="text-red-500 text-sm mt-1">{errors.startTime}</div>}
        </div>
        <div>
          <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">End time</label>
          <input
            id="endTime"
            name="endTime"
            type="text"
            placeholder="10:00 AM"
            value={formData.endTime || ''}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="sortOrder" className="block text-sm font-medium text-gray-700">Sort order</label>
          <input
            id="sortOrder"
            name="sortOrder"
            type="number"
            value={formData.sortOrder ?? 0}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
          />
        </div>
        <div className="flex items-end pb-3">
          <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              name="isPublished"
              checked={formData.isPublished ?? true}
              onChange={handleChange}
              className="h-5 w-5 rounded border-gray-400 text-blue-600"
            />
            Published on event page
          </label>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Agenda item image</label>
        <input
          ref={imageFileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={saving || uploadingImage}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleAgendaImageUpload(file);
          }}
        />
        <div
          className={`relative border-2 border-dashed rounded-xl p-4 transition-all ${
            uploadingImage ? 'border-cyan-400 bg-cyan-50' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          } ${saving || uploadingImage ? 'opacity-70' : ''}`}
        >
          {uploadingImage ? (
            <div className="flex flex-col items-center justify-center text-cyan-700 py-4">
              <svg className="animate-spin w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-sm font-medium">Uploading image…</p>
            </div>
          ) : formData.imageUrl ? (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={formData.imageUrl}
                alt="Agenda item preview"
                className="w-32 h-32 object-contain rounded-lg border border-gray-200 bg-gray-50"
              />
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => imageFileInputRef.current?.click()}
                  disabled={saving || uploadingImage}
                  className="flex-shrink-0 h-12 rounded-xl bg-cyan-100 hover:bg-cyan-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  title="Replace image"
                  aria-label="Replace image"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-cyan-200 flex items-center justify-center">
                    <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <span className="font-semibold text-cyan-700">Replace image</span>
                </button>
                <button
                  type="button"
                  onClick={clearAgendaImage}
                  disabled={saving || uploadingImage}
                  className="flex-shrink-0 h-12 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  title="Remove image"
                  aria-label="Remove image"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-200 flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <span className="font-semibold text-red-700">Remove image</span>
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => imageFileInputRef.current?.click()}
              disabled={saving || uploadingImage}
              className="w-full flex flex-col items-center justify-center text-gray-500 py-6 cursor-pointer disabled:cursor-not-allowed"
              title="Upload image"
              aria-label="Upload image"
            >
              <svg className="w-10 h-10 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm font-medium text-gray-700">Click to upload an image</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, or WEBP up to 10MB</p>
            </button>
          )}
        </div>
      </div>
      {eventMedia.length > 0 && (
        <div>
          <label htmlFor="eventMediaId" className="block text-sm font-medium text-gray-700">Or pick existing event media</label>
          <select
            id="eventMediaId"
            name="eventMediaId"
            value={formData.eventMedia?.id ?? ''}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
          >
            <option value="">None</option>
            {eventMedia.map((m) => (
              <option key={m.id} value={m.id}>
                {m.title || m.fileUrl || `Media ${m.id}`}
              </option>
            ))}
          </select>
        </div>
      )}
      {formError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {formError}
        </div>
      )}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          disabled={saving || uploadingImage}
          onClick={() => {
            if (mode === 'edit') void saveEdit();
            else void saveCreate();
          }}
          className="flex-shrink-0 h-14 rounded-xl bg-cyan-100 hover:bg-cyan-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          title={mode === 'edit' ? 'Update Item' : 'Create Item'}
          aria-label={mode === 'edit' ? 'Update Item' : 'Create Item'}
        >
          <span className="font-semibold text-cyan-700">
            {uploadingImage ? 'Uploading…' : saving ? 'Saving…' : mode === 'edit' ? 'Update Item' : 'Create Item'}
          </span>
        </button>
      </div>
    </form>
  );

  if (!userId) {
    return <div className="flex justify-center items-center h-screen"><p>Loading...</p></div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ paddingTop: '180px' }}>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/admin/events/${eventId}/edit`}
          className="flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
          title="Back to Event"
          aria-label="Back to Event"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </div>
          <span className="font-semibold text-blue-700">Back to Event</span>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Event Day Agenda
            {event && <span className="text-lg font-normal text-gray-600 ml-2">- {event.title}</span>}
          </h1>
          <p className="text-gray-600">Timed program items for this event day. Overlapping times are allowed.</p>
        </div>
      </div>

      {toastMessage && (
        <div
          className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] max-w-lg w-[calc(100%-2rem)] p-4 rounded-lg shadow-lg ${
            toastMessage.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
          role="status"
        >
          {toastMessage.message}
        </div>
      )}

      <div className="flex justify-center mb-8">
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl shadow-lg p-6 w-full max-w-4xl">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-purple-800 mb-2">🎭 Event Management Features</h2>
            <p className="text-sm text-purple-600">Manage performers, contacts, sponsors, emails, program directors, and agenda for this event</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Link href={`/admin/events/${eventId}/performers`} className="flex flex-col items-center justify-center bg-pink-50 hover:bg-pink-100 text-pink-800 rounded-lg shadow-md p-4 text-xs transition-all group" title="Featured Performers" aria-label="Featured Performers">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-pink-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <FaMicrophone className="w-10 h-10 text-pink-500" />
              </div>
              <span className="font-semibold text-center leading-tight">Featured Performers</span>
            </Link>
            <Link href={`/admin/events/${eventId}/contacts`} className="flex flex-col items-center justify-center bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg shadow-md p-4 text-xs transition-all group" title="Event Contacts" aria-label="Event Contacts">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <FaAddressBook className="w-10 h-10 text-emerald-500" />
              </div>
              <span className="font-semibold text-center leading-tight">Event Contacts</span>
            </Link>
            <Link href={`/admin/events/${eventId}/sponsors`} className="flex flex-col items-center justify-center bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg shadow-md p-4 text-xs transition-all group" title="Event Sponsors" aria-label="Event Sponsors">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <FaHandshake className="w-10 h-10 text-amber-500" />
              </div>
              <span className="font-semibold text-center leading-tight">Event Sponsors</span>
            </Link>
            <Link href={`/admin/events/${eventId}/emails`} className="flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg shadow-md p-4 text-xs transition-all group" title="Event Emails" aria-label="Event Emails">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <FaEnvelope className="w-10 h-10 text-blue-500" />
              </div>
              <span className="font-semibold text-center leading-tight">Event Emails</span>
            </Link>
            <Link href={`/admin/events/${eventId}/program-directors`} className="flex flex-col items-center justify-center bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-lg shadow-md p-4 text-xs transition-all group" title="Program Directors" aria-label="Program Directors">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-indigo-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <FaUserTie className="w-10 h-10 text-indigo-500" />
              </div>
              <span className="font-semibold text-center leading-tight">Program Directors</span>
            </Link>
            <Link href={`/admin/events/${eventId}/agenda`} className="flex flex-col items-center justify-center bg-cyan-50 hover:bg-cyan-100 text-cyan-800 rounded-lg shadow-md p-4 text-xs transition-all group" title="Event Day Agenda" aria-label="Event Day Agenda">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-cyan-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                <FaClock className="w-10 h-10 text-cyan-500" />
              </div>
              <span className="font-semibold text-center leading-tight">Event Day Agenda</span>
            </Link>
          </div>
        </div>
      </div>

      {eventId && <AgendaFlyerPanel eventId={String(eventId)} />}

      <div className="mb-6 flex justify-end">
        <button
          type="button"
          onClick={openCreate}
          className="flex-shrink-0 h-14 rounded-xl bg-cyan-100 hover:bg-cyan-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
          title="Add Agenda Item"
          aria-label="Add Agenda Item"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-cyan-200 flex items-center justify-center">
            <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="font-semibold text-cyan-700">Add Agenda Item</span>
        </button>
      </div>

      <DataTable
        data={items}
        columns={columns}
        loading={loading}
        onEdit={openEdit}
        onDelete={(item) => {
          setSelectedItem(item);
          setIsDeleteModalOpen(true);
        }}
        emptyMessage="No agenda items yet. Add the day’s program (Pookkalam, Sadya, cultural sets…)."
      />

      <Modal isOpen={isCreateModalOpen} onClose={closeCreateModal} title="Add Agenda Item" size="lg">
        {isCreateModalOpen ? renderForm('create') : null}
      </Modal>
      <Modal isOpen={isEditModalOpen} onClose={closeEditModal} title="Edit Agenda Item" size="lg">
        {isEditModalOpen ? renderForm('edit') : null}
      </Modal>
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setSelectedItem(null); }}
        onConfirm={handleDelete}
        title="Delete Agenda Item"
        message={`Delete “${selectedItem?.title || 'this item'}”? This cannot be undone.`}
        confirmText={saving ? 'Deleting…' : 'Delete'}
        cancelText="Keep"
      />
    </div>
  );
}

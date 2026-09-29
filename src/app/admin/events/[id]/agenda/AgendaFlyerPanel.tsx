'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import type { EventMediaDTO } from '@/types';
import {
  editMediaServer,
  fetchAgendaFlyerServer,
  uploadMedia,
} from '@/app/admin/events/[id]/media/ApiServerActions';

function todayIsoDate() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function AgendaFlyerPanel({ eventId }: { eventId: string | number }) {
  const [flyer, setFlyer] = useState<EventMediaDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFlyer = useCallback(async () => {
    setLoading(true);
    try {
      const current = await fetchAgendaFlyerServer(eventId);
      setFlyer(current);
    } catch (error) {
      console.error('[AgendaFlyerPanel] Failed to load flyer', error);
      setFlyer(null);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void loadFlyer();
  }, [loadFlyer]);

  const handleUpload = async (file: File) => {
    const eventIdNum = Number(eventId);
    if (!Number.isFinite(eventIdNum) || eventIdNum <= 0) {
      setMessage('Event ID is missing.');
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      await uploadMedia(eventIdNum, {
        title: 'Agenda Flyer',
        description: '',
        eventFlyer: false,
        isAgendaFlyer: true,
        isEventManagementOfficialDocument: false,
        isHeroImage: false,
        isActiveHeroImage: false,
        isPublic: true,
        files: [file],
        startDisplayingFromDate: todayIsoDate(),
      });
      await loadFlyer();
      setMessage('Agenda flyer saved.');
    } catch (error) {
      console.error('[AgendaFlyerPanel] Upload failed', error);
      setMessage(error instanceof Error ? error.message : 'Failed to upload agenda flyer.');
    } finally {
      setSaving(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    void handleUpload(file);
  };

  const handleRemove = async () => {
    if (!flyer?.id) return;
    setSaving(true);
    setMessage(null);
    try {
      await editMediaServer(flyer.id, {
        ...flyer,
        isAgendaFlyer: false,
      });
      setFlyer(null);
      setMessage('Agenda flyer removed from this event. The file remains in media.');
    } catch (error) {
      console.error('[AgendaFlyerPanel] Unflag failed', error);
      setMessage(error instanceof Error ? error.message : 'Failed to remove agenda flyer.');
    } finally {
      setSaving(false);
    }
  };

  const previewUrl = flyer?.fileUrl || flyer?.preSignedUrl || null;

  return (
    <div className="mb-8 rounded-xl border border-sky-200 bg-sky-50/80 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start gap-6">
        <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-sky-100 flex items-center justify-center">
          <svg className="w-8 h-8 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-sky-900">Agenda Flyer</h2>
          <p className="text-sm text-sky-800 mt-1">
            One full-day schedule image for this event (for example the Onam program flyer). This is separate from Event Flyer and from per-row agenda thumbnails.
          </p>

          {loading ? (
            <p className="text-sm text-sky-700 mt-4">Loading agenda flyer…</p>
          ) : previewUrl ? (
            <div className="mt-4 flex flex-col sm:flex-row gap-4 items-start">
              <div className="relative w-full sm:w-48 h-32 rounded-lg overflow-hidden bg-white border border-sky-200">
                <Image
                  src={previewUrl}
                  alt={flyer?.title || 'Agenda Flyer'}
                  fill
                  className="object-contain"
                  sizes="192px"
                />
              </div>
              <div className="flex flex-col gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={saving}
                  className="flex-shrink-0 h-14 rounded-xl bg-sky-100 hover:bg-sky-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  title="Replace Agenda Flyer"
                  aria-label="Replace Agenda Flyer"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-sky-200 flex items-center justify-center">
                    <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <span className="font-semibold text-sky-700">{saving ? 'Saving…' : 'Replace'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => void handleRemove()}
                  disabled={saving}
                  className="flex-shrink-0 h-14 rounded-xl bg-red-100 hover:bg-red-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  title="Remove Agenda Flyer"
                  aria-label="Remove Agenda Flyer"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-200 flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </div>
                  <span className="font-semibold text-red-700">Remove</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={saving}
                className="flex-shrink-0 h-14 rounded-xl bg-sky-100 hover:bg-sky-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                title="Upload Agenda Flyer"
                aria-label="Upload Agenda Flyer"
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-sky-200 flex items-center justify-center">
                  <svg className="w-6 h-6 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <span className="font-semibold text-sky-700">{saving ? 'Uploading…' : 'Upload Agenda Flyer'}</span>
              </button>
            </div>
          )}

          {message && (
            <p className="text-sm text-sky-900 mt-3">{message}</p>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}

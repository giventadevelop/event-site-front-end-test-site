'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  fetchHomepageYoutubeOverride,
  saveHomepageYoutubeOverride,
} from './ApiServerActions';
import type { HomepageYoutubeOverrideDTO } from '@/types';

function toDatetimeLocal(iso?: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromDatetimeLocal(value: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

function looksLikeYoutubeUrl(value: string): boolean {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, '');
    return host === 'youtu.be' || host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com');
  } catch {
    return false;
  }
}

export default function HomepageYoutubeLiveClient() {
  const [recordId, setRecordId] = useState<number | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchHomepageYoutubeOverride()
      .then((result) => {
        if (cancelled) return;
        if (result.error) {
          setError(result.error);
          setRecordId(null);
          return;
        }
        setError(null);
        applyRecord(result.record);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function applyRecord(record: HomepageYoutubeOverrideDTO | null) {
    setRecordId(record?.id ?? null);
    setYoutubeUrl(record?.youtubeUrl ?? '');
    setTitle(record?.title ?? '');
    setDescription(record?.description ?? '');
    setIsActive(record?.isActive !== false);
    setStartsAt(toDatetimeLocal(record?.startsAt));
    setEndsAt(toDatetimeLocal(record?.endsAt));
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    const trimmedUrl = youtubeUrl.trim();
    if (isActive && !trimmedUrl) {
      next.youtubeUrl = 'A YouTube URL is required while the override is active.';
    } else if (trimmedUrl && !looksLikeYoutubeUrl(trimmedUrl)) {
      next.youtubeUrl = 'Enter a youtube.com, youtube-nocookie.com, or youtu.be URL.';
    }
    if (startsAt && endsAt) {
      const start = new Date(startsAt).getTime();
      const end = new Date(endsAt).getTime();
      if (!Number.isNaN(start) && !Number.isNaN(end) && end <= start) {
        next.endsAt = 'End time must be after the start time.';
      }
    }
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSavedMessage(null);
    if (!validate()) return;
    setSaving(true);
    setError(null);
    const result = await saveHomepageYoutubeOverride({
      id: recordId,
      youtubeUrl: youtubeUrl.trim(),
      title: title.trim(),
      description: description.trim(),
      isActive,
      startsAt: fromDatetimeLocal(startsAt),
      endsAt: fromDatetimeLocal(endsAt),
    });
    setSaving(false);
    if (result.error || !result.record) {
      setError(result.error || 'Could not save the YouTube override.');
      return;
    }
    applyRecord(result.record);
    setSavedMessage('Homepage YouTube URL saved. It replaces the automatic stream until the end time passes.');
  }

  const inputClass = (name: string) =>
    `mt-1 block w-full border rounded-xl px-4 py-3 text-base focus:ring-blue-500 ${
      fieldErrors[name] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-400 focus:border-blue-500'
    }`;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ paddingTop: '120px' }}>
      <div className="mb-6">
        <Link href="/admin" className="text-sm font-semibold text-indigo-700 hover:text-indigo-900">
          Admin Home
        </Link>
        <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-indigo-800">Homepage YouTube live</h1>
        <p className="mt-2 text-sm text-gray-600">
          This URL is shown on the MOSC redesign homepage player while it is active and has not passed its end time,
          including when the start time is still in the future. After it expires, or when this form is empty or turned
          off, the page uses the automatic Devalokam Aramana stream.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-5">
        {loading ? <p className="text-sm text-gray-600">Loading the current override...</p> : null}
        {error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">{error}</div>
        ) : null}
        {savedMessage ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">{savedMessage}</div>
        ) : null}

        <div>
          <label htmlFor="youtubeUrl" className="block text-sm font-medium text-gray-700">
            YouTube URL
          </label>
          <input
            id="youtubeUrl"
            name="youtubeUrl"
            type="url"
            value={youtubeUrl}
            onChange={(event) => setYoutubeUrl(event.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className={inputClass('youtubeUrl')}
          />
          {fieldErrors.youtubeUrl ? <div className="text-red-500 text-sm mt-1">{fieldErrors.youtubeUrl}</div> : null}
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={500}
            className={inputClass('title')}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            className={inputClass('description')}
          />
        </div>

        <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(event) => setIsActive(event.target.checked)}
            className="h-4 w-4 rounded border-gray-400 text-indigo-600 focus:ring-indigo-500"
          />
          Show this URL on the homepage
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startsAt" className="block text-sm font-medium text-gray-700">
              Starts
            </label>
            <input
              id="startsAt"
              name="startsAt"
              type="datetime-local"
              value={startsAt}
              onChange={(event) => setStartsAt(event.target.value)}
              className={inputClass('startsAt')}
            />
            <p className="text-xs text-gray-500 mt-1">Optional. A future start still shows this video as Upcoming.</p>
          </div>
          <div>
            <label htmlFor="endsAt" className="block text-sm font-medium text-gray-700">
              Ends
            </label>
            <input
              id="endsAt"
              name="endsAt"
              type="datetime-local"
              value={endsAt}
              onChange={(event) => setEndsAt(event.target.value)}
              className={inputClass('endsAt')}
            />
            {fieldErrors.endsAt ? <div className="text-red-500 text-sm mt-1">{fieldErrors.endsAt}</div> : null}
            <p className="text-xs text-gray-500 mt-1">Optional. After this time the automatic stream is used again.</p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving || loading}
            className="h-14 rounded-xl bg-indigo-100 hover:bg-indigo-200 px-6 font-semibold text-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save YouTube URL'}
          </button>
        </div>
      </form>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  deleteGalleryYoutubeVideo,
  fetchGalleryYoutubeVideosAdmin,
  saveGalleryYoutubeVideo,
} from './ApiServerActions';

type VideoRow = {
  key: string;
  id: number | null;
  youtubeUrl: string;
  title: string;
  description: string;
  isActive: boolean;
};

function emptyRow(): VideoRow {
  return {
    key: `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    id: null,
    youtubeUrl: '',
    title: '',
    description: '',
    isActive: true,
  };
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

export default function GalleryYoutubeVideosClient() {
  const [rows, setRows] = useState<VideoRow[]>([emptyRow()]);
  const [removedIds, setRemovedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchGalleryYoutubeVideosAdmin()
      .then((result) => {
        if (cancelled) return;
        if (result.error) {
          setError(result.error);
          return;
        }
        const loaded = result.records.map((record) => ({
          key: `id-${record.id}`,
          id: record.id ?? null,
          youtubeUrl: record.youtubeUrl ?? '',
          title: record.title ?? '',
          description: record.description ?? '',
          isActive: record.isActive !== false,
        }));
        setRows(loaded.length > 0 ? loaded : [emptyRow()]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function updateRow(key: string, patch: Partial<VideoRow>) {
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function addRow() {
    setRows((current) => [...current, emptyRow()]);
  }

  function removeRow(row: VideoRow) {
    if (row.id != null) {
      setRemovedIds((current) => [...current, row.id as number]);
    }
    setRows((current) => {
      const next = current.filter((item) => item.key !== row.key);
      return next.length > 0 ? next : [emptyRow()];
    });
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};
    rows.forEach((row, index) => {
      const url = row.youtubeUrl.trim();
      const hasDetails = row.title.trim() || row.description.trim();
      if (!url && !hasDetails && row.id == null) return;
      if (!url) {
        nextErrors[row.key] = `Video ${index + 1} needs a YouTube URL.`;
        return;
      }
      if (!looksLikeYoutubeUrl(url)) {
        nextErrors[row.key] = `Video ${index + 1} must be a YouTube URL.`;
      }
    });
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSavedMessage(null);
    if (!validate()) return;
    setSaving(true);
    setError(null);

    for (const id of removedIds) {
      const deleted = await deleteGalleryYoutubeVideo(id);
      if (deleted.error) {
        setSaving(false);
        setError(deleted.error);
        return;
      }
    }

    const kept: VideoRow[] = [];
    let order = 0;
    for (const row of rows) {
      const url = row.youtubeUrl.trim();
      if (!url) continue;
      const saved = await saveGalleryYoutubeVideo({
        id: row.id,
        youtubeUrl: url,
        title: row.title.trim(),
        description: row.description.trim(),
        displayOrder: order,
        isActive: row.isActive,
      });
      if (saved.error || !saved.record) {
        setSaving(false);
        setError(saved.error || 'Could not save a gallery video.');
        return;
      }
      kept.push({
        key: `id-${saved.record.id}`,
        id: saved.record.id ?? null,
        youtubeUrl: saved.record.youtubeUrl ?? url,
        title: saved.record.title ?? '',
        description: saved.record.description ?? '',
        isActive: saved.record.isActive !== false,
      });
      order += 1;
    }

    setRemovedIds([]);
    setRows(kept.length > 0 ? kept : [emptyRow()]);
    setSaving(false);
    setSavedMessage('Gallery videos saved. Add album videos from each album media page so they appear inside that album.');
  }

  const inputClass = (key: string) =>
    `mt-1 block w-full border rounded-xl px-4 py-3 text-base focus:ring-blue-500 ${
      fieldErrors[key] ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-400 focus:border-blue-500'
    }`;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8" style={{ paddingTop: '120px' }}>
      <div className="mb-6">
        <Link href="/admin" className="text-sm font-semibold text-indigo-700 hover:text-indigo-900">
          Admin Home
        </Link>
        <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-indigo-800">Gallery YouTube videos</h1>
        <p className="mt-2 text-sm text-gray-600">
          Public gallery videos are added on each album&apos;s media page, with the photo uploads. They appear inside that album.
        </p>
        <p className="mt-2 text-sm text-gray-600">
          This list is kept for older entries. New public videos belong on an album media page.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {loading ? <p className="text-sm text-gray-600">Loading gallery videos...</p> : null}
        {error ? <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-800">{error}</div> : null}
        {savedMessage ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-800">{savedMessage}</div>
        ) : null}

        {rows.map((row, index) => (
          <div key={row.key} className="bg-white rounded-xl shadow-lg p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-gray-800">Video {index + 1}</h2>
              <button
                type="button"
                onClick={() => removeRow(row)}
                className="text-sm font-semibold text-red-700 hover:text-red-900"
              >
                Remove
              </button>
            </div>
            <div>
              <label htmlFor={`url-${row.key}`} className="block text-sm font-medium text-gray-700">
                YouTube URL
              </label>
              <input
                id={`url-${row.key}`}
                type="url"
                value={row.youtubeUrl}
                onChange={(event) => updateRow(row.key, { youtubeUrl: event.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                className={inputClass(row.key)}
              />
              {fieldErrors[row.key] ? <div className="text-red-500 text-sm mt-1">{fieldErrors[row.key]}</div> : null}
            </div>
            <div>
              <label htmlFor={`title-${row.key}`} className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <input
                id={`title-${row.key}`}
                type="text"
                value={row.title}
                maxLength={500}
                onChange={(event) => updateRow(row.key, { title: event.target.value })}
                className="mt-1 block w-full border border-gray-400 rounded-xl px-4 py-3 text-base focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor={`description-${row.key}`} className="block text-sm font-medium text-gray-700">
                Details
              </label>
              <textarea
                id={`description-${row.key}`}
                value={row.description}
                rows={3}
                onChange={(event) => updateRow(row.key, { description: event.target.value })}
                className="mt-1 block w-full border border-gray-400 rounded-xl px-4 py-3 text-base focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={row.isActive}
                onChange={(event) => updateRow(row.key, { isActive: event.target.checked })}
                className="h-4 w-4 rounded border-gray-400 text-indigo-600 focus:ring-indigo-500"
              />
              Show this video in the gallery
            </label>
          </div>
        ))}

        <button
          type="button"
          onClick={addRow}
          className="h-14 w-full rounded-xl bg-blue-100 hover:bg-blue-200 px-6 font-semibold text-blue-700"
        >
          Add Another URL
        </button>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving || loading}
            className="h-14 rounded-xl bg-indigo-100 hover:bg-indigo-200 px-6 font-semibold text-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save gallery videos'}
          </button>
        </div>
      </form>
    </div>
  );
}

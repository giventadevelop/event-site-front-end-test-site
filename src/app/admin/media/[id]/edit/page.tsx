"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import type { EventMediaDTO } from "@/types";
import { format } from 'date-fns-tz';
import { eventMediaService } from "../../../../../../services/eventMediaService";
import { useAuth } from "@clerk/nextjs";
import type { UserProfileDTO } from "@/types";
import { FaUsers, FaPhotoVideo, FaCalendarAlt } from 'react-icons/fa';
import Link from "next/link";

export default function EditMediaPage() {
  const router = useRouter();
  const params = useParams();
  const mediaId = params?.id;
  const [media, setMedia] = useState<EventMediaDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userProfileId, setUserProfileId] = useState<number | null>(null);
  const { userId } = useAuth();

  useEffect(() => {
    async function fetchProfile() {
      if (!userId) return;
      try {
        const res = await fetch(`/api/proxy/user-profiles/by-user/${userId}`);
        if (res.ok) {
          const profile: UserProfileDTO = await res.json();
          setUserProfileId(profile.id ?? null);
        }
      } catch {
        setUserProfileId(null);
      }
    }
    fetchProfile();
  }, [userId]);

  useEffect(() => {
    async function fetchMedia() {
      setLoading(true);
      setError(null);
      try {
        if (!mediaId) throw new Error('No mediaId');
        const data = await eventMediaService.fetchById(Number(mediaId));
        setMedia(data);
      } catch (e: any) {
        setError(e.message || "Failed to load media file");
      } finally {
        setLoading(false);
      }
    }
    if (mediaId) fetchMedia();
  }, [mediaId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!media) return;
    setSaving(true);
    setError(null);
    const now = new Date();
    const formattedNow = format(now, "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
    // Ensure all required fields are present and non-null, matching backend expectations
    const initialFormData = {
      title: media.title,
      description: media.description ?? '',
      eventMediaType: media.eventMediaType,
      storageType: media.storageType,
      fileUrl: media.fileUrl ?? '',
      contentType: media.contentType ?? '',
      fileSize: typeof media.fileSize === 'number' ? media.fileSize : 0,
      isPublic: media.isPublic ?? false,
      eventFlyer: media.eventFlyer ?? false,
      isEventManagementOfficialDocument: media.isEventManagementOfficialDocument ?? false,
      isHeroImage: media.isHeroImage ?? false,
      isActiveHeroImage: media.isActiveHeroImage ?? false,
      isFeaturedEventImage: media.isFeaturedEventImage ?? false,
      startDisplayingFromDate: media.startDisplayingFromDate ?
        (typeof media.startDisplayingFromDate === 'string' ?
          media.startDisplayingFromDate :
          new Date(media.startDisplayingFromDate).toISOString().split('T')[0]) : '',
      altText: media.altText ?? '',
      displayOrder: typeof media.displayOrder === 'number' ? media.displayOrder : 0,
      downloadCount: typeof media.downloadCount === 'number' ? media.downloadCount : 0
    };
    const fullDto: EventMediaDTO = {
      id: media.id!,
      tenantId: media.tenantId || process.env.NEXT_PUBLIC_TENANT_ID || '',
      title: initialFormData.title,
      description: initialFormData.description,
      eventMediaType: initialFormData.eventMediaType,
      storageType: initialFormData.storageType,
      fileUrl: initialFormData.fileUrl,
      contentType: initialFormData.contentType,
      fileSize: initialFormData.fileSize,
      isPublic: initialFormData.isPublic,
      eventFlyer: initialFormData.eventFlyer,
      isEventManagementOfficialDocument: initialFormData.isEventManagementOfficialDocument,
      preSignedUrl: media.preSignedUrl ?? '',
      preSignedUrlExpiresAt: media.preSignedUrlExpiresAt ?? '',
      isFeaturedEventImage: initialFormData.isFeaturedEventImage,
      isHeroImage: initialFormData.isHeroImage,
      isActiveHeroImage: initialFormData.isActiveHeroImage,
      isHomePageHeroImage: media.isHomePageHeroImage ?? false,
      isLiveEventImage: media.isLiveEventImage ?? false,
      startDisplayingFromDate: media.startDisplayingFromDate ?
        (typeof media.startDisplayingFromDate === 'string' ?
          media.startDisplayingFromDate :
          new Date(media.startDisplayingFromDate).toISOString().split('T')[0]) : '',
      eventId: media.eventId!,
      uploadedById: userProfileId ?? undefined,
      createdAt: media.createdAt || formattedNow,
      updatedAt: formattedNow
    };
    console.log('PUT EventMediaDTO being sent:', fullDto);
    try {
      const response = await fetch(`/api/proxy/event-medias/${fullDto.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullDto),
      });
      if (!response.ok) throw new Error('Failed to update media file');
      router.push('/admin/media');
    } catch (e: any) {
      setError(e.message || 'Failed to update media file');
    } finally {
      setSaving(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value, type } = e.target;
    let newValue: any = value;
    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      newValue = e.target.checked;
    } else if (type === "number") {
      newValue = value === '' ? undefined : Number(value);
    }
    setMedia((prev) => prev ? {
      ...prev,
      [name]: newValue
    } : prev);
  }

  if (loading) return <div className="p-8 pt-24">Loading media file...</div>;
  if (!media) return <div className="p-8 pt-24 text-red-500">Media file not found.</div>;

  return (
    <div className="max-w-xl mx-auto p-8 pt-24 bg-white rounded shadow">
      {/* Dashboard Card with Grid Buttons */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Link href="/admin/manage-usage" className="flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg shadow-sm px-4 py-4 transition font-semibold text-sm cursor-pointer">
              <FaUsers className="mb-2 text-2xl" />
              <span>Manage Users [Usage]</span>
            </Link>
            <Link href="/admin/manage-events" className="flex flex-col items-center justify-center bg-green-50 hover:bg-green-100 text-green-700 rounded-lg shadow-sm px-4 py-4 transition font-semibold text-sm cursor-pointer">
              <FaCalendarAlt className="mb-2 text-2xl" />
              Manage Events
            </Link>
          </div>
        </div>
      </div>
      {/* Header details table */}
      <div className="mb-4 overflow-x-auto">
        <table className="min-w-full border border-gray-300 rounded text-sm bg-blue-50">
          <tbody>
            <tr>
              <td className="border px-2 py-1 font-semibold bg-blue-100">Media File ID</td>
              <td className="border px-2 py-1 font-mono text-blue-700">{media.id}</td>
              <td className="border px-2 py-1 font-semibold bg-blue-100">Event ID</td>
              <td className="border px-2 py-1 font-mono text-blue-700">{media.eventId}</td>
            </tr>
            <tr>
              <td className="border px-2 py-1 font-semibold bg-blue-100">Media Type</td>
              <td className="border px-2 py-1">{media.eventMediaType}</td>
              <td className="border px-2 py-1 font-semibold bg-blue-100">Storage Type</td>
              <td className="border px-2 py-1">{media.storageType}</td>
            </tr>
            <tr>
              <td className="border px-2 py-1 font-semibold bg-blue-100">File Size</td>
              <td className="border px-2 py-1">{media.fileSize}</td>
              <td className="border px-2 py-1 font-semibold bg-blue-100">Created At</td>
              <td className="border px-2 py-1">{media.createdAt ? new Date(media.createdAt).toLocaleString() : ''}</td>
            </tr>
            <tr>
              <td className="border px-2 py-1 font-semibold bg-blue-100">Updated At</td>
              <td className="border px-2 py-1" colSpan={3}>{media.updatedAt ? new Date(media.updatedAt).toLocaleString() : ''}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="flex justify-center">
        <h1 className="text-2xl font-bold mb-6 text-white bg-blue-600 rounded px-6 py-3 w-full text-center">Edit Media File</h1>
      </div>
      {error && <div className="bg-red-50 text-red-500 p-3 rounded mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="eventId" value={media.eventId ?? ''} />
        <input type="hidden" name="uploadedById" value={media.uploadedById ?? ''} />
        <div>
          <label className="block font-semibold mb-1">Title</label>
          <input type="text" name="title" value={media.title} onChange={handleChange} className="w-full border rounded px-3 py-2" required />
        </div>
        <div>
          <label className="block font-semibold mb-1">Description</label>
          <textarea name="description" value={media.description ?? ''} onChange={handleChange} className="w-full border rounded px-3 py-2" rows={3} />
        </div>
        <div>
          <label className="block font-semibold mb-1">Alt Text</label>
          <input type="text" name="altText" value={media.altText ?? ''} onChange={handleChange} className="w-full border rounded px-3 py-2" maxLength={500} />
        </div>
        <div>
          <label className="block font-semibold mb-1">Display Order</label>
          <input type="number" name="displayOrder" value={media.displayOrder ?? ''} onChange={handleChange} className="w-full border rounded px-3 py-2" min={0} />
        </div>
        <div>
          <label className="block font-semibold mb-1">Start Displaying From Date</label>
          <input
            type="date"
            name="startDisplayingFromDate"
            value={media.startDisplayingFromDate ?
              (typeof media.startDisplayingFromDate === 'string' ?
                media.startDisplayingFromDate :
                new Date(media.startDisplayingFromDate).toISOString().split('T')[0]) : ''}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
          <p className="text-sm text-gray-500 mt-1">
            Leave empty to display immediately, or set a future date to schedule when this media should start being displayed.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-0 mb-4 border border-gray-300 rounded overflow-hidden">
          {[
            { name: 'eventFlyer', label: 'Event Flyer', checked: media.eventFlyer ?? false, id: 'eventFlyer' },
            { name: 'isEventManagementOfficialDocument', label: 'Event Management Official Document', checked: media.isEventManagementOfficialDocument ?? false, id: 'isEventManagementOfficialDocument' },
            { name: 'isHeroImage', label: 'Hero Image', checked: media.isHeroImage ?? false, id: 'isHeroImage' },
            { name: 'isActiveHeroImage', label: 'Active Hero Image', checked: media.isActiveHeroImage ?? false, id: 'isActiveHeroImage' },
            { name: 'isFeaturedEventImage', label: 'Featured Event Image', checked: media.isFeaturedEventImage ?? false, id: 'isFeaturedEventImage' },
            { name: 'isLiveEventImage', label: 'Live Event Image', checked: media.isLiveEventImage ?? false, id: 'isLiveEventImage' },
            { name: 'isPublic', label: 'Public', checked: media.isPublic ?? false, id: 'isPublic' },
          ].map(({ name, label, checked, id }) => (
            <div key={id} className="border border-gray-300 flex flex-col items-center justify-center px-3 py-2">
              <label htmlFor={id} className="flex flex-col items-center">
                <span className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    name={name}
                    checked={checked}
                    onChange={handleChange}
                    className="custom-checkbox"
                    id={id}
                  />
                  <span className="custom-checkbox-tick">
                    {checked && (
                      <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l5 5L19 7" />
                      </svg>
                    )}
                  </span>
                </span>
                <span className="mt-2 text-xs text-center select-none break-words max-w-[6rem]">{label}</span>
              </label>
            </div>
          ))}
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type {
  PublicProfileDTO,
  ProfileWritingDTO,
  ProfileAchievementDTO,
  ProfileAffiliationDTO,
  ProfileMediaAssetDTO,
  ProfileWritingType,
  ProfileWritingStatus,
  ProfileAchievementCategory,
} from '@/types/profileSite';
import {
  upsertPublicProfileServer,
  createProfileWritingServer,
  updateProfileWritingServer,
  deleteProfileWritingServer,
  createProfileAchievementServer,
  updateProfileAchievementServer,
  deleteProfileAchievementServer,
  createProfileAffiliationServer,
  updateProfileAffiliationServer,
  deleteProfileAffiliationServer,
  createProfileMediaAssetServer,
  updateProfileMediaAssetServer,
  deleteProfileMediaAssetServer,
  applySiteTypePresetsForTenant,
} from '@/app/admin/profile-site/ApiServerActions';
import { getTenantId } from '@/lib/env';

type Tab = 'profile' | 'writings' | 'achievements' | 'affiliations' | 'downloads' | 'presets';

interface Props {
  initialProfile: PublicProfileDTO | null;
  initialWritings: ProfileWritingDTO[];
  initialAchievements: ProfileAchievementDTO[];
  initialAffiliations: ProfileAffiliationDTO[];
  initialAssets: ProfileMediaAssetDTO[];
}

export default function ProfileSiteAdminClient({
  initialProfile,
  initialWritings,
  initialAchievements,
  initialAffiliations,
  initialAssets,
}: Props) {
  const [tab, setTab] = useState<Tab>('profile');
  const [profile, setProfile] = useState<Partial<PublicProfileDTO>>(
    initialProfile ?? { displayName: '', isPublished: false, contactFormEnabled: false }
  );
  const [writings, setWritings] = useState(initialWritings);
  const [achievements, setAchievements] = useState(initialAchievements);
  const [affiliations, setAffiliations] = useState(initialAffiliations);
  const [assets, setAssets] = useState(initialAssets);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'profile', label: 'Public profile' },
    { id: 'writings', label: 'Writings' },
    { id: 'achievements', label: 'Achievements' },
    { id: 'affiliations', label: 'Affiliations' },
    { id: 'downloads', label: 'Downloads' },
    { id: 'presets', label: 'Site presets' },
  ];

  async function saveProfile() {
    if (!profile.displayName?.trim()) {
      setMessage('Display name is required.');
      return;
    }
    setSaving(true);
    setMessage(null);
    const result = await upsertPublicProfileServer({
      displayName: profile.displayName.trim(),
      tagline: profile.tagline ?? '',
      headline: profile.headline ?? '',
      bioMarkdown: profile.bioMarkdown ?? '',
      profileImageUrl: profile.profileImageUrl ?? '',
      coverImageUrl: profile.coverImageUrl ?? '',
      location: profile.location ?? '',
      languages: profile.languages ?? '',
      publicSlug: profile.publicSlug ?? '',
      contactEmail: profile.contactEmail ?? '',
      contactFormEnabled: profile.contactFormEnabled ?? false,
      linkedinUrl: profile.linkedinUrl ?? '',
      twitterUrl: profile.twitterUrl ?? '',
      facebookUrl: profile.facebookUrl ?? '',
      instagramUrl: profile.instagramUrl ?? '',
      youtubeUrl: profile.youtubeUrl ?? '',
      websiteUrl: profile.websiteUrl ?? '',
      cvDocumentUrl: profile.cvDocumentUrl ?? '',
      metaTitle: profile.metaTitle ?? '',
      metaDescription: profile.metaDescription ?? '',
      isPublished: profile.isPublished ?? false,
    });
    setSaving(false);
    if (result) {
      setProfile(result);
      setMessage('Profile saved.');
    } else {
      setMessage('Failed to save profile. Ensure backend API is deployed.');
    }
  }

  async function applyPresets() {
    setSaving(true);
    const ok = await applySiteTypePresetsForTenant(getTenantId(), 'PERSONAL_PROFILE');
    setSaving(false);
    setMessage(ok ? 'Personal profile homepage presets applied.' : 'Failed to apply presets.');
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8" style={{ paddingTop: '160px' }}>
      <div className="mb-6">
        <Link href="/admin" className="text-blue-600 hover:underline text-sm">← Admin home</Link>
        <h1 className="text-3xl font-bold mt-2">Profile site management</h1>
        <p className="text-gray-600 mt-1">Manage public portfolio content for this tenant.</p>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">{message}</div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border-2 transition-all ${
              tab === t.id ? 'bg-blue-100 border-blue-400 text-blue-700' : 'bg-white border-gray-300 text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <ProfileField label="Display name *" value={profile.displayName ?? ''} onChange={(v) => setProfile((p) => ({ ...p, displayName: v }))} />
          <ProfileField label="Tagline" value={profile.tagline ?? ''} onChange={(v) => setProfile((p) => ({ ...p, tagline: v }))} />
          <ProfileField label="Headline" value={profile.headline ?? ''} onChange={(v) => setProfile((p) => ({ ...p, headline: v }))} />
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Bio (markdown/plain)</span>
            <textarea
              rows={6}
              value={profile.bioMarkdown ?? ''}
              onChange={(e) => setProfile((p) => ({ ...p, bioMarkdown: e.target.value }))}
              className="mt-1 block w-full border border-gray-400 rounded-xl px-4 py-3"
            />
          </label>
          <ProfileField label="Profile image URL" value={profile.profileImageUrl ?? ''} onChange={(v) => setProfile((p) => ({ ...p, profileImageUrl: v }))} />
          <ProfileField label="Cover image URL" value={profile.coverImageUrl ?? ''} onChange={(v) => setProfile((p) => ({ ...p, coverImageUrl: v }))} />
          <ProfileField label="Contact email" value={profile.contactEmail ?? ''} onChange={(v) => setProfile((p) => ({ ...p, contactEmail: v }))} />
          <ProfileField label="CV document URL" value={profile.cvDocumentUrl ?? ''} onChange={(v) => setProfile((p) => ({ ...p, cvDocumentUrl: v }))} />
          <ProfileField label="LinkedIn URL" value={profile.linkedinUrl ?? ''} onChange={(v) => setProfile((p) => ({ ...p, linkedinUrl: v }))} />
          <ProfileField label="Website URL" value={profile.websiteUrl ?? ''} onChange={(v) => setProfile((p) => ({ ...p, websiteUrl: v }))} />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={profile.isPublished ?? false}
              onChange={(e) => setProfile((p) => ({ ...p, isPublished: e.target.checked }))}
            />
            <span className="text-sm font-medium">Published (visible on public site)</span>
          </label>
          <button type="button" onClick={saveProfile} disabled={saving} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50">
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </div>
      )}

      {tab === 'writings' && (
        <WritingsAdmin writings={writings} setWritings={setWritings} setMessage={setMessage} />
      )}
      {tab === 'achievements' && (
        <AchievementsAdmin items={achievements} setItems={setAchievements} setMessage={setMessage} />
      )}
      {tab === 'affiliations' && (
        <AffiliationsAdmin items={affiliations} setItems={setAffiliations} setMessage={setMessage} />
      )}
      {tab === 'downloads' && (
        <DownloadsAdmin items={assets} setItems={setAssets} setMessage={setMessage} />
      )}
      {tab === 'presets' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-700 mb-4">
            Apply <strong>PERSONAL_PROFILE</strong> homepage section presets (disables events/sponsors, enables profile sections).
            Set <code>site_type</code> on the organization record separately under Tenant Management.
          </p>
          <button type="button" onClick={applyPresets} disabled={saving} className="px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold disabled:opacity-50">
            Apply personal profile presets
          </button>
        </div>
      )}
    </div>
  );
}

function ProfileField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 block w-full border border-gray-400 rounded-xl px-4 py-3"
      />
    </label>
  );
}

function WritingsAdmin({
  writings,
  setWritings,
  setMessage,
}: {
  writings: ProfileWritingDTO[];
  setWritings: React.Dispatch<React.SetStateAction<ProfileWritingDTO[]>>;
  setMessage: (m: string | null) => void;
}) {
  const empty: Omit<ProfileWritingDTO, 'id' | 'tenantId'> = {
    title: '',
    writingType: 'ORIGINAL',
    status: 'DRAFT',
    displayOrder: writings.length,
  };
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<number | null>(null);

  async function save() {
    if (!form.title?.trim()) return;
    const payload = { ...form, title: form.title.trim() };
    const result = editingId
      ? await updateProfileWritingServer(editingId, payload)
      : await createProfileWritingServer(payload);
    if (!result) {
      setMessage('Failed to save writing.');
      return;
    }
    if (editingId) {
      setWritings((prev) => prev.map((w) => (w.id === editingId ? result : w)));
    } else {
      setWritings((prev) => [...prev, result]);
    }
    setForm(empty);
    setEditingId(null);
    setMessage('Writing saved.');
  }

  return (
    <AdminListShell title="Writings">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        <ProfileField label="Title *" value={form.title} onChange={(v) => setForm((f) => ({ ...f, title: v }))} />
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Type</span>
          <select
            value={form.writingType ?? 'ORIGINAL'}
            onChange={(e) => setForm((f) => ({ ...f, writingType: e.target.value as ProfileWritingType }))}
            className="mt-1 block w-full border border-gray-400 rounded-xl px-4 py-3"
          >
            <option value="ORIGINAL">Original</option>
            <option value="REPUBLISHED">Republished</option>
            <option value="EXTERNAL_LINK">External link</option>
          </select>
        </label>
        <ProfileField label="Publication name" value={form.publicationName ?? ''} onChange={(v) => setForm((f) => ({ ...f, publicationName: v }))} />
        <ProfileField label="External URL" value={form.externalUrl ?? ''} onChange={(v) => setForm((f) => ({ ...f, externalUrl: v }))} />
        <label className="block md:col-span-2">
          <span className="text-sm font-medium text-gray-700">Excerpt</span>
          <textarea rows={2} value={form.excerpt ?? ''} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} className="mt-1 block w-full border border-gray-400 rounded-xl px-4 py-3" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-gray-700">Status</span>
          <select value={form.status ?? 'DRAFT'} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ProfileWritingStatus }))} className="mt-1 block w-full border border-gray-400 rounded-xl px-4 py-3">
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </label>
      </div>
      <button type="button" onClick={save} className="mb-6 px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold">{editingId ? 'Update' : 'Add'} writing</button>
      <ul className="space-y-2">
        {writings.map((w) => (
          <li key={w.id} className="flex justify-between items-center border rounded-lg px-4 py-3">
            <span className="font-medium">{w.title} <span className="text-xs text-gray-500">({w.status})</span></span>
            <div className="flex gap-2">
              <button type="button" className="text-blue-600 text-sm" onClick={() => { setEditingId(w.id!); setForm(w); }}>Edit</button>
              <button type="button" className="text-red-600 text-sm" onClick={async () => { if (w.id && await deleteProfileWritingServer(w.id)) setWritings((p) => p.filter((x) => x.id !== w.id)); }}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </AdminListShell>
  );
}

function AchievementsAdmin({
  items,
  setItems,
  setMessage,
}: {
  items: ProfileAchievementDTO[];
  setItems: React.Dispatch<React.SetStateAction<ProfileAchievementDTO[]>>;
  setMessage: (m: string | null) => void;
}) {
  const [form, setForm] = useState<Partial<ProfileAchievementDTO>>({ title: '', category: 'OTHER', displayOrder: items.length });
  const [editingId, setEditingId] = useState<number | null>(null);

  async function save() {
    if (!form.title?.trim()) return;
    const result = editingId
      ? await updateProfileAchievementServer(editingId, form)
      : await createProfileAchievementServer({ title: form.title, category: form.category, description: form.description, issuer: form.issuer, achievementDate: form.achievementDate, displayOrder: form.displayOrder, isFeatured: form.isFeatured });
    if (!result) { setMessage('Failed to save achievement.'); return; }
    if (editingId) setItems((p) => p.map((a) => (a.id === editingId ? result : a)));
    else setItems((p) => [...p, result]);
    setForm({ title: '', category: 'OTHER' });
    setEditingId(null);
    setMessage('Achievement saved.');
  }

  return (
    <AdminListShell title="Achievements">
      <ProfileField label="Title *" value={form.title ?? ''} onChange={(v) => setForm((f) => ({ ...f, title: v }))} />
      <ProfileField label="Issuer" value={form.issuer ?? ''} onChange={(v) => setForm((f) => ({ ...f, issuer: v }))} />
      <label className="block mb-4">
        <span className="text-sm font-medium text-gray-700">Category</span>
        <select value={form.category ?? 'OTHER'} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ProfileAchievementCategory }))} className="mt-1 block w-full border border-gray-400 rounded-xl px-4 py-3">
          {['AWARD', 'HONOR', 'SPEAKING', 'EDUCATION', 'OTHER'].map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </label>
      <button type="button" onClick={save} className="mb-4 px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold">{editingId ? 'Update' : 'Add'}</button>
      <ul className="space-y-2">{items.map((a) => (
        <li key={a.id} className="flex justify-between border rounded-lg px-4 py-3">
          <span>{a.title}</span>
          <div className="flex gap-2">
            <button type="button" className="text-blue-600 text-sm" onClick={() => { setEditingId(a.id!); setForm(a); }}>Edit</button>
            <button type="button" className="text-red-600 text-sm" onClick={async () => { if (a.id && await deleteProfileAchievementServer(a.id)) setItems((p) => p.filter((x) => x.id !== a.id)); }}>Delete</button>
          </div>
        </li>
      ))}</ul>
    </AdminListShell>
  );
}

function AffiliationsAdmin({
  items,
  setItems,
  setMessage,
}: {
  items: ProfileAffiliationDTO[];
  setItems: React.Dispatch<React.SetStateAction<ProfileAffiliationDTO[]>>;
  setMessage: (m: string | null) => void;
}) {
  const [form, setForm] = useState<Partial<ProfileAffiliationDTO>>({ organizationName: '', displayOrder: items.length });
  const [editingId, setEditingId] = useState<number | null>(null);

  async function save() {
    if (!form.organizationName?.trim()) return;
    const result = editingId
      ? await updateProfileAffiliationServer(editingId, form)
      : await createProfileAffiliationServer({ organizationName: form.organizationName, role: form.role, description: form.description, url: form.url, logoUrl: form.logoUrl, displayOrder: form.displayOrder });
    if (!result) { setMessage('Failed to save affiliation.'); return; }
    if (editingId) setItems((p) => p.map((a) => (a.id === editingId ? result : a)));
    else setItems((p) => [...p, result]);
    setForm({ organizationName: '' });
    setEditingId(null);
    setMessage('Affiliation saved.');
  }

  return (
    <AdminListShell title="Affiliations">
      <ProfileField label="Organization *" value={form.organizationName ?? ''} onChange={(v) => setForm((f) => ({ ...f, organizationName: v }))} />
      <ProfileField label="Role" value={form.role ?? ''} onChange={(v) => setForm((f) => ({ ...f, role: v }))} />
      <button type="button" onClick={save} className="mb-4 px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold">{editingId ? 'Update' : 'Add'}</button>
      <ul className="space-y-2">{items.map((a) => (
        <li key={a.id} className="flex justify-between border rounded-lg px-4 py-3">
          <span>{a.organizationName}</span>
          <div className="flex gap-2">
            <button type="button" className="text-blue-600 text-sm" onClick={() => { setEditingId(a.id!); setForm(a); }}>Edit</button>
            <button type="button" className="text-red-600 text-sm" onClick={async () => { if (a.id && await deleteProfileAffiliationServer(a.id)) setItems((p) => p.filter((x) => x.id !== a.id)); }}>Delete</button>
          </div>
        </li>
      ))}</ul>
    </AdminListShell>
  );
}

function DownloadsAdmin({
  items,
  setItems,
  setMessage,
}: {
  items: ProfileMediaAssetDTO[];
  setItems: React.Dispatch<React.SetStateAction<ProfileMediaAssetDTO[]>>;
  setMessage: (m: string | null) => void;
}) {
  const [form, setForm] = useState<Partial<ProfileMediaAssetDTO>>({ title: '', fileUrl: '', isDownloadable: true, displayOrder: items.length });
  const [editingId, setEditingId] = useState<number | null>(null);

  async function save() {
    if (!form.title?.trim() || !form.fileUrl?.trim()) return;
    const result = editingId
      ? await updateProfileMediaAssetServer(editingId, form)
      : await createProfileMediaAssetServer({ title: form.title, fileUrl: form.fileUrl, description: form.description, fileType: form.fileType, isDownloadable: form.isDownloadable ?? true, displayOrder: form.displayOrder });
    if (!result) { setMessage('Failed to save download.'); return; }
    if (editingId) setItems((p) => p.map((a) => (a.id === editingId ? result : a)));
    else setItems((p) => [...p, result]);
    setForm({ title: '', fileUrl: '', isDownloadable: true });
    setEditingId(null);
    setMessage('Download saved.');
  }

  return (
    <AdminListShell title="Downloadable assets">
      <ProfileField label="Title *" value={form.title ?? ''} onChange={(v) => setForm((f) => ({ ...f, title: v }))} />
      <ProfileField label="File URL *" value={form.fileUrl ?? ''} onChange={(v) => setForm((f) => ({ ...f, fileUrl: v }))} />
      <ProfileField label="File type" value={form.fileType ?? ''} onChange={(v) => setForm((f) => ({ ...f, fileType: v }))} />
      <button type="button" onClick={save} className="mb-4 px-5 py-2 bg-blue-600 text-white rounded-lg font-semibold">{editingId ? 'Update' : 'Add'}</button>
      <ul className="space-y-2">{items.map((a) => (
        <li key={a.id} className="flex justify-between border rounded-lg px-4 py-3">
          <span>{a.title}</span>
          <div className="flex gap-2">
            <button type="button" className="text-blue-600 text-sm" onClick={() => { setEditingId(a.id!); setForm(a); }}>Edit</button>
            <button type="button" className="text-red-600 text-sm" onClick={async () => { if (a.id && await deleteProfileMediaAssetServer(a.id)) setItems((p) => p.filter((x) => x.id !== a.id)); }}>Delete</button>
          </div>
        </li>
      ))}</ul>
    </AdminListShell>
  );
}

function AdminListShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

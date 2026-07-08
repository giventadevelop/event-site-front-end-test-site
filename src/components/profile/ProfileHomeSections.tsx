'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTenantSettings } from '@/components/TenantSettingsProvider';
import { HomeSectionRail } from '@/components/HomeSectionRail';
import { HomeSectionTitle } from '@/components/HomeSectionTitle';
import { parseProfileSiteListResponse } from '@/lib/parseProfileSiteResponses';
import { ProfileWritingCard } from '@/components/profile/ProfileWritingViews';
import { formatProfileDate } from '@/lib/profileSitePaths';
import type {
  PublicProfileDTO,
  ProfileWritingDTO,
  ProfileAchievementDTO,
  ProfileAffiliationDTO,
  ProfileMediaAssetDTO,
} from '@/types/profileSite';

async function fetchProxyList<T>(path: string, publishedOnly = false): Promise<T[]> {
  const params = new URLSearchParams({ sort: 'displayOrder,asc' });
  if (publishedOnly) params.append('status.equals', 'PUBLISHED');
  const res = await fetch(`/api/proxy/${path}?${params}`, { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return parseProfileSiteListResponse<T>(data);
}

async function fetchPublicProfile(): Promise<PublicProfileDTO | null> {
  const res = await fetch('/api/proxy/public-profiles?size=1', { cache: 'no-store' });
  if (!res.ok) return null;
  const data = await res.json();
  const list = parseProfileSiteListResponse<PublicProfileDTO>(data);
  const profile = list[0] ?? null;
  if (profile && !profile.isPublished) return null;
  return profile;
}

export function ProfileHeroSection({ profile }: { profile: PublicProfileDTO }) {
  return (
    <section className="relative py-20 bg-gradient-to-br from-background via-muted to-background overflow-hidden">
      {profile.coverImageUrl && (
        <div className="absolute inset-0 opacity-20">
          <Image src={profile.coverImageUrl} alt="" fill className="object-cover" unoptimized />
        </div>
      )}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-10">
        {profile.profileImageUrl && (
          <div className="relative w-40 h-40 md:w-52 md:h-52 rounded-full overflow-hidden sacred-shadow-lg border-4 border-primary/30 flex-shrink-0">
            <Image src={profile.profileImageUrl} alt={profile.displayName} fill className="object-cover" unoptimized />
          </div>
        )}
        <div className="text-center md:text-left">
          <p className="font-caption text-sm uppercase tracking-widest text-primary mb-2">{profile.tagline}</p>
          <h1 className="font-heading text-4xl md:text-5xl font-semibold text-foreground mb-3">{profile.displayName}</h1>
          {profile.headline && <p className="font-body text-xl text-muted-foreground mb-6">{profile.headline}</p>}
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            {profile.cvDocumentUrl && (
              <a
                href={profile.cvDocumentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-primary text-primary-foreground rounded-sacred font-semibold reverent-hover"
              >
                Download CV
              </a>
            )}
            <Link href="/profile" className="px-6 py-3 border-2 border-primary text-primary rounded-sacred font-semibold reverent-hover">
              Account profile
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProfileWritingsSection({ writings }: { writings: ProfileWritingDTO[] }) {
  if (writings.length === 0) return null;
  return (
    <section id="profile-writings" className="py-16 bg-card">
      <HomeSectionRail eyebrow="Writings" containerClassName="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <HomeSectionTitle className="text-3xl font-heading font-semibold text-center mb-10">Selected works</HomeSectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {writings.map((w) => (
            <ProfileWritingCard key={w.id} writing={w} />
          ))}
        </div>
      </HomeSectionRail>
    </section>
  );
}

export function ProfileAchievementsSection({ items }: { items: ProfileAchievementDTO[] }) {
  if (items.length === 0) return null;
  return (
    <section className="py-16 bg-muted">
      <HomeSectionRail eyebrow="Achievements" containerClassName="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <HomeSectionTitle className="text-3xl font-heading font-semibold text-center mb-10">Achievements</HomeSectionTitle>
        <ul className="space-y-6">
          {items.map((a) => (
            <li key={a.id} className="bg-card rounded-lg sacred-shadow p-6 border-l-4 border-primary">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
                {a.imageUrl && (
                  <div className="relative w-full sm:w-28 h-28 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                    <Image src={a.imageUrl} alt="" fill className="object-cover" unoptimized />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-heading font-semibold text-lg">{a.title}</h3>
                      {a.issuer && <p className="text-sm text-muted-foreground">{a.issuer}</p>}
                    </div>
                    {a.achievementDate && (
                      <span className="text-sm font-caption text-primary whitespace-nowrap">
                        {formatProfileDate(a.achievementDate)}
                      </span>
                    )}
                  </div>
                  {a.description && <p className="font-body text-sm mt-2 text-muted-foreground">{a.description}</p>}
                  {a.url?.trim() && (
                    <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary font-semibold mt-2 inline-block hover:underline">
                      Learn more →
                    </a>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </HomeSectionRail>
    </section>
  );
}

export function ProfileAffiliationsSection({ items }: { items: ProfileAffiliationDTO[] }) {
  if (items.length === 0) return null;
  return (
    <section className="py-16 bg-card">
      <HomeSectionRail eyebrow="Community" containerClassName="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <HomeSectionTitle className="text-3xl font-heading font-semibold text-center mb-10">Affiliations</HomeSectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {items.map((a) => (
            <div key={a.id} className="flex gap-4 bg-background rounded-lg sacred-shadow p-5">
              {a.logoUrl && (
                <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden">
                  <Image src={a.logoUrl} alt={a.organizationName} fill className="object-contain" unoptimized />
                </div>
              )}
              <div>
                <h3 className="font-heading font-semibold">{a.organizationName}</h3>
                {a.role && <p className="text-sm text-primary">{a.role}</p>}
                {a.description && <p className="text-sm text-muted-foreground mt-1">{a.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </HomeSectionRail>
    </section>
  );
}

export function ProfileDownloadsSection({ assets }: { assets: ProfileMediaAssetDTO[] }) {
  const downloadable = assets.filter((a) => a.isDownloadable !== false);
  if (downloadable.length === 0) return null;
  return (
    <section className="py-16 bg-muted">
      <HomeSectionRail eyebrow="Downloads" containerClassName="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <HomeSectionTitle className="text-3xl font-heading font-semibold text-center mb-10">Publications &amp; downloads</HomeSectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {downloadable.map((a) => (
            <div key={a.id}>
              <Link
                href={`/downloads/${a.id}`}
                className="flex flex-col bg-card rounded-lg sacred-shadow overflow-hidden reverent-hover h-full"
              >
                {a.coverImageUrl ? (
                  <div className="relative w-full h-36 bg-muted">
                    <Image src={a.coverImageUrl} alt="" fill className="object-cover" unoptimized />
                  </div>
                ) : null}
                <div className="px-5 py-4 flex flex-col flex-1 gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-semibold text-foreground">{a.title}</span>
                    {a.fileType && <span className="text-xs uppercase text-muted-foreground shrink-0">{a.fileType}</span>}
                  </div>
                  {a.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{a.description}</p>
                  )}
                  <span className="text-sm text-primary font-semibold mt-auto">View details →</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </HomeSectionRail>
    </section>
  );
}

export function ProfileContactSection({ profile }: { profile: PublicProfileDTO }) {
  const socials = [
    { label: 'LinkedIn', url: profile.linkedinUrl },
    { label: 'Twitter', url: profile.twitterUrl },
    { label: 'Website', url: profile.websiteUrl },
    { label: 'YouTube', url: profile.youtubeUrl },
  ].filter((s) => s.url?.trim());

  if (!profile.contactEmail && socials.length === 0) return null;

  return (
    <section id="profile-contact" className="py-16 bg-card">
      <HomeSectionRail eyebrow="Contact" containerClassName="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <HomeSectionTitle className="text-3xl font-heading font-semibold mb-6">Get in touch</HomeSectionTitle>
        {profile.contactEmail && (
          <p className="font-body text-lg mb-4">
            <a href={`mailto:${profile.contactEmail}`} className="text-primary hover:underline">{profile.contactEmail}</a>
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-4">
          {socials.map((s) => (
            <a key={s.label} href={s.url!} target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">
              {s.label}
            </a>
          ))}
        </div>
      </HomeSectionRail>
    </section>
  );
}

export function ProfileAboutSection({ profile }: { profile: PublicProfileDTO }) {
  if (!profile.bioMarkdown?.trim()) return null;
  return (
    <section id="profile-about" className="py-16 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <HomeSectionTitle className="text-3xl font-heading font-semibold text-center mb-8">About</HomeSectionTitle>
        <div className="font-body text-lg text-muted-foreground whitespace-pre-wrap leading-relaxed">{profile.bioMarkdown}</div>
        {(profile.location || profile.languages) && (
          <p className="mt-6 text-sm text-muted-foreground text-center">
            {[profile.location, profile.languages].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>
    </section>
  );
}

export default function ProfileHomeSections() {
  const {
    showProfileHero,
    showProfileWritings,
    showProfileAchievements,
    showProfileAffiliations,
    showProfileDownloads,
    showProfileContact,
    loading: settingsLoading,
  } = useTenantSettings();

  const [profile, setProfile] = useState<PublicProfileDTO | null>(null);
  const [writings, setWritings] = useState<ProfileWritingDTO[]>([]);
  const [achievements, setAchievements] = useState<ProfileAchievementDTO[]>([]);
  const [affiliations, setAffiliations] = useState<ProfileAffiliationDTO[]>([]);
  const [assets, setAssets] = useState<ProfileMediaAssetDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const [p, w, a, af, m] = await Promise.all([
          showProfileHero || showProfileContact ? fetchPublicProfile() : Promise.resolve(null),
          showProfileWritings ? fetchProxyList<ProfileWritingDTO>('profile-writings', true) : Promise.resolve([]),
          showProfileAchievements ? fetchProxyList<ProfileAchievementDTO>('profile-achievements') : Promise.resolve([]),
          showProfileAffiliations ? fetchProxyList<ProfileAffiliationDTO>('profile-affiliations') : Promise.resolve([]),
          showProfileDownloads ? fetchProxyList<ProfileMediaAssetDTO>('profile-media-assets') : Promise.resolve([]),
        ]);
        if (!cancelled) {
          setProfile(p);
          setWritings(w);
          setAchievements(a);
          setAffiliations(af);
          setAssets(m);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (!settingsLoading) load();
    return () => { cancelled = true; };
  }, [
    settingsLoading,
    showProfileHero,
    showProfileWritings,
    showProfileAchievements,
    showProfileAffiliations,
    showProfileDownloads,
    showProfileContact,
  ]);

  if (settingsLoading || loading) return null;
  if (!profile && writings.length === 0 && achievements.length === 0) return null;

  return (
    <>
      {showProfileHero && profile && <ProfileHeroSection profile={profile} />}
      {profile && <ProfileAboutSection profile={profile} />}
      {showProfileWritings && <ProfileWritingsSection writings={writings} />}
      {showProfileAchievements && <ProfileAchievementsSection items={achievements} />}
      {showProfileAffiliations && <ProfileAffiliationsSection items={affiliations} />}
      {showProfileDownloads && <ProfileDownloadsSection assets={assets} />}
      {showProfileContact && profile && <ProfileContactSection profile={profile} />}
    </>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTenantSettings } from '@/components/TenantSettingsProvider';
import { HomeSectionRail } from '@/components/HomeSectionRail';
import { HomeSectionTitle } from '@/components/HomeSectionTitle';
import { ProfileWritingCard } from '@/components/profile/ProfileWritingViews';
import { formatProfileDate } from '@/lib/profileSitePaths';
import {
  fetchPublishedPublicProfileClient,
  fetchPublishedWritingsClient,
  fetchAchievementsClient,
  fetchAffiliationsClient,
  fetchMediaAssetsClient,
  fetchProjectsClient,
  isTalksMediaAsset,
  isDownloadDocumentAsset,
  parseOutcomeMetrics,
} from '@/lib/profileSiteClient';
import type {
  PublicProfileDTO,
  ProfileWritingDTO,
  ProfileAchievementDTO,
  ProfileAffiliationDTO,
  ProfileMediaAssetDTO,
  ProfileProjectDTO,
} from '@/types/profileSite';

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
            {profile.bookingUrl?.trim() && (
              <a
                href={profile.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-accent text-accent-foreground rounded-sacred font-semibold reverent-hover"
              >
                Book a call
              </a>
            )}
            <Link href="/about" className="px-6 py-3 border-2 border-primary text-primary rounded-sacred font-semibold reverent-hover">
              About
            </Link>
            <Link href="/contact" className="px-6 py-3 border-2 border-primary text-primary rounded-sacred font-semibold reverent-hover">
              Contact
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
      <HomeSectionRail eyebrow="Perspectives" containerClassName="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <HomeSectionTitle className="text-3xl font-heading font-semibold text-center mb-4">Selected works</HomeSectionTitle>
        <p className="font-body text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
          Essays and notes — subscribe below to get new Perspectives in your inbox.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {writings.map((w) => (
            <ProfileWritingCard key={w.id} writing={w} />
          ))}
        </div>
      </HomeSectionRail>
    </section>
  );
}

export function ProfileTalksSection({
  speaking,
  media,
}: {
  speaking: ProfileAchievementDTO[];
  media: ProfileMediaAssetDTO[];
}) {
  if (speaking.length === 0 && media.length === 0) return null;
  return (
    <section id="profile-talks" className="py-16 bg-background">
      <HomeSectionRail eyebrow="Talks & media" containerClassName="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <HomeSectionTitle className="text-3xl font-heading font-semibold text-center mb-10">Talks &amp; media</HomeSectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {speaking.map((a) => (
            <article key={`speak-${a.id}`} className="bg-card rounded-lg sacred-shadow p-5 border-t-4 border-primary">
              <p className="font-caption text-xs uppercase tracking-wide text-primary mb-2">Speaking</p>
              <h3 className="font-heading font-semibold text-lg mb-2">{a.title}</h3>
              {a.issuer && <p className="text-sm text-muted-foreground mb-2">{a.issuer}</p>}
              {a.achievementDate && (
                <p className="text-sm font-caption text-primary mb-2">{formatProfileDate(a.achievementDate)}</p>
              )}
              {a.description && <p className="font-body text-sm text-muted-foreground line-clamp-3">{a.description}</p>}
              {a.url?.trim() && (
                <a href={a.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary font-semibold mt-3 inline-block hover:underline">
                  Watch / details →
                </a>
              )}
            </article>
          ))}
          {media.map((m) => (
            <article key={`media-${m.id}`} className="bg-card rounded-lg sacred-shadow overflow-hidden flex flex-col">
              {m.coverImageUrl && (
                <div className="relative w-full h-36 bg-muted">
                  <Image src={m.coverImageUrl} alt="" fill className="object-cover" unoptimized />
                </div>
              )}
              <div className="p-5 flex flex-col flex-1">
                <p className="font-caption text-xs uppercase tracking-wide text-primary mb-2">
                  {m.mediaKind || 'Media'}
                </p>
                <h3 className="font-heading font-semibold text-lg mb-2">{m.title}</h3>
                {m.description && <p className="font-body text-sm text-muted-foreground line-clamp-3 mb-3">{m.description}</p>}
                <a
                  href={m.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary font-semibold mt-auto hover:underline"
                >
                  Open →
                </a>
              </div>
            </article>
          ))}
        </div>
      </HomeSectionRail>
    </section>
  );
}

export function ProfileProjectsSection({ projects }: { projects: ProfileProjectDTO[] }) {
  if (projects.length === 0) return null;
  const featured = projects.filter((p) => p.isFeatured).slice(0, 5);
  const display = featured.length > 0 ? featured : projects.slice(0, 5);

  return (
    <section id="profile-projects" className="py-16 bg-muted">
      <HomeSectionRail eyebrow="Projects" containerClassName="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <HomeSectionTitle className="text-3xl font-heading font-semibold text-center mb-10">Projects &amp; case studies</HomeSectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {display.map((p) => {
            const metrics = parseOutcomeMetrics(p.outcomeMetricsJson);
            return (
              <article key={p.id} className="bg-card rounded-lg sacred-shadow overflow-hidden flex flex-col">
                {p.coverImageUrl && (
                  <div className="relative w-full h-40 bg-muted">
                    <Image src={p.coverImageUrl} alt="" fill className="object-cover" unoptimized />
                  </div>
                )}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-heading font-semibold text-lg mb-1">{p.title}</h3>
                  {p.role && <p className="text-sm text-primary mb-2">{p.role}</p>}
                  {p.summary && <p className="font-body text-sm text-muted-foreground line-clamp-3 mb-4">{p.summary}</p>}
                  {metrics.length > 0 && (
                    <dl className="grid grid-cols-2 gap-3 mb-4">
                      {metrics.slice(0, 4).map((m) => (
                        <div key={`${m.label}-${m.value}`} className="bg-muted/60 rounded-lg px-3 py-2">
                          <dt className="font-caption text-xs text-muted-foreground">{m.label}</dt>
                          <dd className="font-heading font-semibold text-foreground">{m.value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  {p.projectUrl?.trim() && (
                    <a
                      href={p.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary font-semibold mt-auto hover:underline"
                    >
                      View project →
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </HomeSectionRail>
    </section>
  );
}

export function ProfileAchievementsSection({ items }: { items: ProfileAchievementDTO[] }) {
  const nonSpeaking = items.filter((a) => a.category !== 'SPEAKING');
  if (nonSpeaking.length === 0) return null;
  return (
    <section className="py-16 bg-muted">
      <HomeSectionRail eyebrow="Achievements" containerClassName="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <HomeSectionTitle className="text-3xl font-heading font-semibold text-center mb-10">Achievements</HomeSectionTitle>
        <ul className="space-y-6">
          {nonSpeaking.map((a) => (
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
  const downloadable = assets.filter(isDownloadDocumentAsset);
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

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState(false);

  const showSubscribe = profile.isPublished !== false;
  const showContactForm = profile.contactFormEnabled === true;
  const hasBooking = Boolean(profile.bookingUrl?.trim());

  if (!profile.contactEmail && socials.length === 0 && !showSubscribe && !hasBooking) return null;

  async function submitAudience(payload: { email: string; firstName?: string; lastName?: string; message?: string }) {
    setSubmitting(true);
    setFeedback(null);
    setFeedbackError(false);
    try {
      const res = await fetch('/api/public/profile-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        setFeedback(text || 'Something went wrong. Please try again.');
        setFeedbackError(true);
        return;
      }
      setFeedback(showContactForm && payload.message ? 'Message sent. Thank you!' : 'You are subscribed to Perspectives. Thank you!');
      setEmail('');
      setFirstName('');
      setLastName('');
      setMessage('');
    } catch {
      setFeedback('Network error. Please try again.');
      setFeedbackError(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="profile-contact" className="py-16 bg-card">
      <HomeSectionRail eyebrow="Contact" containerClassName="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <HomeSectionTitle className="text-3xl font-heading font-semibold mb-6">Get in touch</HomeSectionTitle>
        {profile.contactEmail && (
          <p className="font-body text-lg mb-4">
            <a href={`mailto:${profile.contactEmail}`} className="text-primary hover:underline">{profile.contactEmail}</a>
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {socials.map((s) => (
            <a key={s.label} href={s.url!} target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">
              {s.label}
            </a>
          ))}
          {hasBooking && (
            <a
              href={profile.bookingUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold reverent-hover"
            >
              Schedule a call
            </a>
          )}
        </div>

        {showSubscribe && (
          <div className="space-y-8">
            {/* Perspectives newsletter — always available when published */}
            <div className="text-left max-w-md mx-auto bg-muted/50 rounded-xl p-6 border border-border/30">
              <h3 className="font-heading font-semibold text-lg mb-1 text-center">Perspectives newsletter</h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Occasional essays and notes. No spam.
              </p>
              <form
                className="space-y-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!email.trim()) return;
                  submitAudience({
                    email: email.trim(),
                    firstName: firstName.trim() || undefined,
                    lastName: lastName.trim() || undefined,
                  });
                }}
              >
                <input
                  type="email"
                  required
                  placeholder="Email *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-400 rounded-xl px-4 py-3 text-base"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold disabled:opacity-50"
                >
                  {submitting ? 'Sending…' : 'Subscribe'}
                </button>
              </form>
            </div>

            {showContactForm && (
              <div className="text-left max-w-md mx-auto bg-muted/50 rounded-xl p-6 border border-border/30">
                <h3 className="font-heading font-semibold text-lg mb-1 text-center">Collaboration inquiry</h3>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Prefer email? Send a short note — or use Book a call above.
                </p>
                <form
                  className="space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!email.trim()) return;
                    submitAudience({
                      email: email.trim(),
                      firstName: firstName.trim() || undefined,
                      lastName: lastName.trim() || undefined,
                      message: message.trim() || undefined,
                    });
                  }}
                >
                  <input
                    type="email"
                    required
                    placeholder="Email *"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-400 rounded-xl px-4 py-3 text-base"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full border border-gray-400 rounded-xl px-4 py-3 text-base"
                    />
                    <input
                      type="text"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full border border-gray-400 rounded-xl px-4 py-3 text-base"
                    />
                  </div>
                  <textarea
                    placeholder="Your message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="w-full border border-gray-400 rounded-xl px-4 py-3 text-base"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold disabled:opacity-50"
                  >
                    {submitting ? 'Sending…' : 'Send message'}
                  </button>
                </form>
              </div>
            )}

            {feedback && (
              <p className={`text-sm text-center ${feedbackError ? 'text-destructive' : 'text-success'}`}>{feedback}</p>
            )}
          </div>
        )}
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
        <p className="mt-8 text-center">
          <Link href="/about" className="text-primary font-semibold hover:underline">
            Full about page →
          </Link>
        </p>
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
    showProfileProjects,
    loading: settingsLoading,
  } = useTenantSettings();

  const [profile, setProfile] = useState<PublicProfileDTO | null>(null);
  const [writings, setWritings] = useState<ProfileWritingDTO[]>([]);
  const [achievements, setAchievements] = useState<ProfileAchievementDTO[]>([]);
  const [affiliations, setAffiliations] = useState<ProfileAffiliationDTO[]>([]);
  const [assets, setAssets] = useState<ProfileMediaAssetDTO[]>([]);
  const [projects, setProjects] = useState<ProfileProjectDTO[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const needProfile = showProfileHero || showProfileContact;
        const needAchievementsOrTalks = showProfileAchievements || showProfileDownloads;
        const [p, w, a, af, m, proj] = await Promise.all([
          needProfile ? fetchPublishedPublicProfileClient() : Promise.resolve(null),
          showProfileWritings ? fetchPublishedWritingsClient() : Promise.resolve([]),
          needAchievementsOrTalks ? fetchAchievementsClient() : Promise.resolve([]),
          showProfileAffiliations ? fetchAffiliationsClient() : Promise.resolve([]),
          showProfileDownloads || showProfileAchievements ? fetchMediaAssetsClient() : Promise.resolve([]),
          showProfileProjects ? fetchProjectsClient() : Promise.resolve([]),
        ]);
        if (!cancelled) {
          setProfile(p);
          setWritings(w);
          setAchievements(a);
          setAffiliations(af);
          setAssets(m);
          setProjects(proj);
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
    showProfileProjects,
  ]);

  if (settingsLoading || loading) return null;
  if (!profile && writings.length === 0 && achievements.length === 0 && projects.length === 0) return null;

  const speaking = achievements.filter((a) => a.category === 'SPEAKING');
  const talksMedia = assets.filter(isTalksMediaAsset);

  return (
    <>
      {showProfileHero && profile && <ProfileHeroSection profile={profile} />}
      {profile && <ProfileAboutSection profile={profile} />}
      {showProfileWritings && <ProfileWritingsSection writings={writings} />}
      {showProfileProjects && <ProfileProjectsSection projects={projects} />}
      {(showProfileAchievements || showProfileDownloads) && (
        <ProfileTalksSection speaking={speaking} media={talksMedia} />
      )}
      {showProfileAchievements && <ProfileAchievementsSection items={achievements} />}
      {showProfileAffiliations && <ProfileAffiliationsSection items={affiliations} />}
      {showProfileDownloads && <ProfileDownloadsSection assets={assets} />}
      {showProfileContact && profile && <ProfileContactSection profile={profile} />}
    </>
  );
}

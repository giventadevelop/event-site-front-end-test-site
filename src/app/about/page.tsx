import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  fetchPublishedPublicProfileForPagesServer,
} from '@/lib/profileSiteServer';

export const dynamic = 'force-dynamic';

export default async function ProfileAboutPage() {
  const profile = await fetchPublishedPublicProfileForPagesServer();
  if (!profile) notFound();

  return (
    <main className="min-h-screen bg-background pt-28 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="font-caption text-sm uppercase tracking-widest text-primary mb-2">About</p>
        <h1 className="font-heading text-4xl font-semibold text-foreground mb-4">{profile.displayName}</h1>
        {profile.headline && (
          <p className="font-body text-xl text-muted-foreground mb-8">{profile.headline}</p>
        )}
        {profile.profileImageUrl && (
          <div className="relative w-32 h-32 rounded-full overflow-hidden mb-8 border-4 border-primary/30">
            <Image src={profile.profileImageUrl} alt={profile.displayName} fill className="object-cover" unoptimized />
          </div>
        )}
        {profile.bioMarkdown?.trim() ? (
          <div className="font-body text-lg text-muted-foreground whitespace-pre-wrap leading-relaxed mb-10">
            {profile.bioMarkdown}
          </div>
        ) : (
          <p className="font-body text-muted-foreground mb-10">Bio coming soon.</p>
        )}
        {(profile.location || profile.languages) && (
          <p className="text-sm text-muted-foreground mb-8">
            {[profile.location, profile.languages].filter(Boolean).join(' · ')}
          </p>
        )}
        <div className="flex flex-wrap gap-4">
          <Link href="/contact" className="px-6 py-3 bg-primary text-primary-foreground rounded-sacred font-semibold">
            Contact
          </Link>
          <Link href="/#profile-writings" className="px-6 py-3 border-2 border-primary text-primary rounded-sacred font-semibold">
            Perspectives
          </Link>
          <Link href="/" className="px-6 py-3 border border-border text-foreground rounded-sacred font-semibold">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}

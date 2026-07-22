import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  fetchPublishedPublicProfileForPagesServer,
  fetchTenantOrganizationForProfilePagesServer,
} from '@/lib/profileSiteServer';
import { ProfileContactPageClient } from '@/components/profile/ProfileContactPageClient';

export const dynamic = 'force-dynamic';

function formatOrgAddress(org: {
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  stateProvince?: string | null;
  zipCode?: string | null;
  country?: string | null;
}): string | null {
  const line1 = [org.addressLine1, org.addressLine2].filter(Boolean).join(', ');
  const line2 = [org.city, org.stateProvince, org.zipCode].filter(Boolean).join(', ');
  const parts = [line1, line2, org.country].filter(Boolean);
  return parts.length ? parts.join(' · ') : null;
}

export default async function ProfileContactPage() {
  const [profile, org] = await Promise.all([
    fetchPublishedPublicProfileForPagesServer(),
    fetchTenantOrganizationForProfilePagesServer(),
  ]);
  if (!profile) notFound();

  const address = org ? formatOrgAddress(org) : null;

  return (
    <main className="min-h-screen bg-background pt-28 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="font-caption text-sm uppercase tracking-widest text-primary mb-2">Contact</p>
        <h1 className="font-heading text-4xl font-semibold text-foreground mb-4">Get in touch</h1>
        <p className="font-body text-muted-foreground mb-8">
          Collaboration, speaking, or a Perspectives subscription — pick what fits.
        </p>

        {address && (
          <div className="mb-8 p-4 bg-muted/50 rounded-xl border border-border/30">
            <p className="font-caption text-xs uppercase tracking-wide text-primary mb-1">Address</p>
            <p className="font-body text-foreground">{address}</p>
          </div>
        )}

        <ProfileContactPageClient profile={profile} />

        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/about" className="text-primary font-semibold hover:underline">
            About →
          </Link>
          <Link href="/" className="text-primary font-semibold hover:underline">
            Home →
          </Link>
        </div>
      </div>
    </main>
  );
}

import Link from 'next/link';
import SubpageHomeDesignBackground from '@/components/SubpageHomeDesignBackground';
import {
  fetchPublishedPublicProfileForPagesServer,
  fetchPublishedProfileWritingsServer,
  fetchProfileAffiliationsForLinksServer,
} from '@/lib/profileSiteServer';

type LinkItem = {
  label: string;
  href: string;
  group: string;
};

function collectSocialLinks(profile: Awaited<ReturnType<typeof fetchPublishedPublicProfileForPagesServer>>): LinkItem[] {
  if (!profile) return [];
  const entries: Array<[string, string | undefined]> = [
    ['Website', profile.websiteUrl],
    ['LinkedIn', profile.linkedinUrl],
    ['Twitter / X', profile.twitterUrl],
    ['Facebook', profile.facebookUrl],
    ['Instagram', profile.instagramUrl],
    ['YouTube', profile.youtubeUrl],
  ];
  return entries
    .filter(([, url]) => !!url?.trim())
    .map(([label, url]) => ({
      label,
      href: url!.trim(),
      group: 'Social',
    }));
}

export default async function LinksListPage() {
  const [profile, writings, affiliations] = await Promise.all([
    fetchPublishedPublicProfileForPagesServer(),
    fetchPublishedProfileWritingsServer(),
    fetchProfileAffiliationsForLinksServer(),
  ]);

  const socialLinks = collectSocialLinks(profile);
  const externalWritings = writings
    .filter((w) => w.writingType === 'EXTERNAL_LINK' && !!w.externalUrl?.trim())
    .map((w) => ({
      label: w.title,
      href: w.externalUrl!.trim(),
      group: 'Featured links',
    }));
  const affiliationLinks = affiliations
    .filter((a) => !!a.url?.trim())
    .map((a) => ({
      label: a.role ? `${a.organizationName} — ${a.role}` : a.organizationName,
      href: a.url!.trim(),
      group: 'Affiliations',
    }));

  const allLinks = [...socialLinks, ...externalWritings, ...affiliationLinks];
  const groups = Array.from(new Set(allLinks.map((l) => l.group)));

  return (
    <>
      <SubpageHomeDesignBackground />
      <main className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-heading text-3xl md:text-4xl font-semibold text-foreground mb-3">Links</h1>
          <p className="font-body text-muted-foreground mb-10 max-w-2xl">
            Social profiles, external articles, and affiliated organizations.
          </p>

          {allLinks.length === 0 ? (
            <p className="font-body text-muted-foreground">No links available yet.</p>
          ) : (
            <div className="space-y-10">
              {groups.map((group) => (
                <section key={group}>
                  <h2 className="font-heading text-xl font-semibold text-foreground mb-4">{group}</h2>
                  <ul className="space-y-3">
                    {allLinks
                      .filter((l) => l.group === group)
                      .map((link) => (
                        <li key={`${link.group}-${link.href}-${link.label}`}>
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between gap-4 bg-card rounded-lg sacred-shadow px-5 py-4 hover:bg-muted/50 reverent-transition"
                          >
                            <span className="font-body font-medium text-foreground">{link.label}</span>
                            <span className="text-primary text-sm font-semibold flex-shrink-0">Open →</span>
                          </a>
                        </li>
                      ))}
                  </ul>
                </section>
              ))}
            </div>
          )}

          <p className="mt-12 text-sm text-muted-foreground">
            Looking for on-site articles?{' '}
            <Link href="/news" className="text-primary font-semibold hover:underline">
              Visit News
            </Link>
            .
          </p>
        </div>
      </main>
    </>
  );
}

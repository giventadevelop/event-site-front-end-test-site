import React from 'react';
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SpiritualOrganizationsCmsSidebar from '../../components/SpiritualOrganizationsCmsSidebar';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';
import {
  getSpiritualOrganisationBySlug,
  getSpiritualOrganisationsData,
} from '../getSpiritualOrganisationData';
import type { SpiritualOrganisationEntry } from '../types';
import {
  mergeContactLists,
  parseSpiritualOrganisationDescription,
  type ExtractedContact,
  type OfficerSection,
} from '../parseDescription';

export const dynamic = 'force-dynamic';

function formatWebsiteHref(website: string): string {
  const trimmed = website.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/\//, '')}`;
}

function formatWebsiteLabel(website: string): string {
  return website.trim().replace(/^https?:\/\//i, '').replace(/\/$/, '');
}

function SpiritualOrganisationOfficersSection({ officers }: { officers: OfficerSection[] }) {
  if (officers.length === 0) return null;

  return (
    <div className="space-y-6 mt-2">
      {officers.map((section, index) => (
        <div key={`${section.heading}-${index}`} className="space-y-2">
          {section.heading ? (
            <h3 className="font-syro-primary font-medium text-base text-syro-dark-gray">
              {section.heading}
            </h3>
          ) : null}
          {section.lines.map((line) => (
            <p key={line} className="font-syro-primary text-syro-dark-gray">
              {line}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}

function SpiritualOrganisationContactSection({
  entry,
  extracted,
}: {
  entry: SpiritualOrganisationEntry;
  extracted: ExtractedContact;
}) {
  const addressLines = entry.address?.trim()
    ? entry.address
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
    : extracted.addressLines;

  const phones = mergeContactLists(entry.phones, extracted.phones);
  const emails = mergeContactLists(entry.email, extracted.emails);
  const websites = mergeContactLists(entry.website, extracted.websites);

  const hasContact =
    addressLines.length > 0 || phones.length > 0 || emails.length > 0 || websites.length > 0;

  if (!hasContact) return null;

  return (
    <>
      <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 mt-10 pl-4 border-l-4 border-syro-red">
        Office Bearers &amp; Contact
      </h2>
      <div className="bg-syro-bg-gray rounded-lg p-6 border-l-4 border-syro-red mb-8">
        <div className="space-y-2 font-syro-primary text-syro-dark-gray">
          {addressLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
          {phones.length > 0 ? (
            <div className={addressLines.length > 0 ? 'mt-4' : undefined}>
              <p className="mb-2">
                <strong>Ph.:</strong> {phones.join(', ')}
              </p>
            </div>
          ) : null}
          {emails.length > 0 ? (
            <div className="mt-6 pt-4 border-t border-syro-table-border">
              <p className="mb-2">
                <strong>Email:</strong>
              </p>
              {emails.map((email) => (
                <p key={email}>
                  <a
                    href={`mailto:${email}`}
                    className="text-syro-red hover:underline transition-all duration-300"
                  >
                    {email}
                  </a>
                </p>
              ))}
            </div>
          ) : null}
          {websites.length > 0 ? (
            <div
              className={
                emails.length > 0
                  ? 'mt-4'
                  : addressLines.length > 0 || phones.length > 0
                    ? 'mt-6 pt-4 border-t border-syro-table-border'
                    : undefined
              }
            >
              <p className="mb-2">
                <strong>Website:</strong>
              </p>
              {websites.map((website) => (
                <p key={website}>
                  <a
                    href={formatWebsiteHref(website)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-syro-red hover:underline transition-all duration-300"
                  >
                    {formatWebsiteLabel(website)}
                  </a>
                </p>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getSpiritualOrganisationBySlug(slug);
  if (!entry) {
    return { title: 'Organization Not Found | Spiritual Organizations | MOSC' };
  }
  const parsed = parseSpiritualOrganisationDescription(entry.description);
  const excerpt = parsed.narrative[0] ?? entry.description?.split('\n\n')[0]?.trim();
  return {
    title: `${entry.name} | Spiritual Organizations | MOSC`,
    description: excerpt ?? `Spiritual organization: ${entry.name}.`,
  };
}

export default async function SpiritualOrganisationCmsEntryPage({ params }: PageProps) {
  const { slug } = await params;
  const [entry, { entries }] = await Promise.all([
    getSpiritualOrganisationBySlug(slug),
    getSpiritualOrganisationsData(),
  ]);

  if (!entry) {
    notFound();
  }

  const sidebarEntries = entries.map((item) => ({
    name: item.name,
    slug: item.slug,
    href: `/mosc-redesign/spiritual-organizations-cms/${item.slug}`,
  }));

  const { narrative, officers, contact } = parseSpiritualOrganisationDescription(entry.description);

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title={entry.name} breadcrumbFrom="spiritual-organizations-cms" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8 mb-8">
                {entry.imageUrl ? (
                  <div className="mb-8 flex justify-center">
                    <Image
                      src={entry.imageUrl}
                      alt={entry.imageAlt ?? entry.name}
                      width={175}
                      height={175}
                      className="rounded-lg object-contain"
                      style={{ width: '175px', height: '175px' }}
                      priority
                      unoptimized={entry.imageUrl.startsWith('http')}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                ) : null}

                <div className="space-y-6 font-syro-primary text-syro-dark-gray leading-relaxed">
                  {narrative.map((paragraph) => (
                    <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                  ))}
                  <SpiritualOrganisationOfficersSection officers={officers} />
                  <SpiritualOrganisationContactSection entry={entry} extracted={contact} />
                </div>
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            <div className="space-y-6 lg:col-span-1">
              <SpiritualOrganizationsCmsSidebar entries={sidebarEntries} currentSlug={slug} />
            </div>
          </div>

          <div className="mt-8 lg:hidden">
            <QuickLinks />
          </div>
        </div>
      </section>
    </div>
  );
}

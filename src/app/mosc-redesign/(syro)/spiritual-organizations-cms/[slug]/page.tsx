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

export const dynamic = 'force-dynamic';

function splitContactList(value: string | null): string[] {
  if (!value?.trim()) return [];
  return value
    .split(/[,;\n]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatWebsiteHref(website: string): string {
  const trimmed = website.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^\/\//, '')}`;
}

function SpiritualOrganisationContactSection({ entry }: { entry: SpiritualOrganisationEntry }) {
  const emails = splitContactList(entry.email);
  const phones = splitContactList(entry.phones);
  const addressLines = entry.address
    ? entry.address.split('\n').map((line) => line.trim()).filter(Boolean)
    : [];
  const hasContact =
    addressLines.length > 0 || emails.length > 0 || phones.length > 0 || Boolean(entry.website?.trim());

  if (!hasContact) return null;

  const websiteHref = entry.website?.trim() ? formatWebsiteHref(entry.website) : null;
  const websiteLabel = entry.website?.trim().replace(/^https?:\/\//i, '').replace(/\/$/, '') ?? '';

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
          {websiteHref ? (
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
              <a
                href={websiteHref}
                target="_blank"
                rel="noopener noreferrer"
                className="text-syro-red hover:underline transition-all duration-300"
              >
                {websiteLabel}
              </a>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

function descriptionParagraphs(description: string | null): string[] {
  if (!description?.trim()) return [];
  return description
    .split(/\n\n+/)
    .map((block) => block.trim())
    .filter(Boolean);
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
  const excerpt = entry.description?.split('\n\n')[0]?.trim();
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

  const paragraphs = descriptionParagraphs(entry.description);

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
                  {paragraphs.map((paragraph) => (
                    <p key={paragraph.slice(0, 48)}>{paragraph}</p>
                  ))}
                  <SpiritualOrganisationContactSection entry={entry} />
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

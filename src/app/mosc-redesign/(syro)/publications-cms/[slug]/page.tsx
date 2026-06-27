import React from 'react';
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PublicationsCmsSidebar from '../../components/PublicationsCmsSidebar';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';
import {
  getPublicationEntryBySlug,
  getPublicationEntriesData,
} from '../getPublicationEntriesData';
import type { PublicationEntry } from '../types';

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

function PublicationContactSection({ entry }: { entry: PublicationEntry }) {
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
      <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4 mt-10">
        Subscribe and Contact
      </h2>
      <div className="bg-syro-bg-gray rounded-lg p-6 border-l-4 border-syro-red mb-8">
        <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-4">
          {entry.name}
        </h3>
        <div className="space-y-2 font-syro-primary text-syro-dark-gray">
          {addressLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
          {phones.length > 0 ? (
            <div className={addressLines.length > 0 ? 'mt-4' : undefined}>
              <p className="mb-2">
                <strong>Tel.:</strong> {phones.join(', ')}
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
            <div className={emails.length > 0 ? 'mt-4' : addressLines.length > 0 || phones.length > 0 ? 'mt-6 pt-4 border-t border-syro-table-border' : undefined}>
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

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getPublicationEntryBySlug(slug);
  if (!entry) {
    return { title: 'Publication Not Found | Publications | MOSC' };
  }
  return {
    title: `${entry.name} | Publications | MOSC`,
    description: entry.excerpt ?? `Publication: ${entry.name}.`,
  };
}

const PLACEHOLDER_IMAGE = '/images/publications/mal.jpg';

export default async function PublicationsCmsEntryPage({ params }: PageProps) {
  const { slug } = await params;
  const [entry, { entries }] = await Promise.all([
    getPublicationEntryBySlug(slug),
    getPublicationEntriesData(),
  ]);

  if (!entry) {
    notFound();
  }

  const sidebarEntries = entries.map((item) => ({
    name: item.name,
    slug: item.slug,
    href: `/mosc-redesign/publications-cms/${item.slug}`,
  }));

  const imageSrc = entry.imageUrl ?? PLACEHOLDER_IMAGE;

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title={entry.name} breadcrumbFrom="publications-cms" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                <div className="mb-8 flex justify-center">
                  <Image
                    src={imageSrc}
                    alt={entry.imageAlt ?? entry.name}
                    width={175}
                    height={175}
                    className="rounded-lg object-contain"
                    style={{ width: '175px', height: '175px' }}
                    priority
                    unoptimized={Boolean(imageSrc.startsWith('http'))}
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>

                <div className="prose prose-lg max-w-none">
                  {entry.body ? (
                    <div
                      className="font-syro-primary text-syro-dark-gray leading-relaxed [&_p]:mb-6 [&_p]:leading-relaxed [&_h2]:font-syro-display [&_h2]:font-semibold [&_h2]:text-2xl [&_h2]:text-syro-blue [&_h2]:mb-4 [&_h2]:mt-10 [&_h3]:font-syro-display [&_h3]:font-semibold [&_h3]:text-xl [&_h3]:text-syro-blue [&_h3]:mb-4 [&_ul]:space-y-2 [&_ul]:mb-8 [&_li]:flex [&_li]:items-start"
                      dangerouslySetInnerHTML={{ __html: entry.body }}
                    />
                  ) : entry.excerpt ? (
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      {entry.excerpt}
                    </p>
                  ) : null}
                  <PublicationContactSection entry={entry} />
                </div>
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            <div className="space-y-6 lg:col-span-1">
              <PublicationsCmsSidebar entries={sidebarEntries} currentSlug={slug} />
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

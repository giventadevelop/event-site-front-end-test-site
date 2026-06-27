import React from 'react';
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import TheologicalSeminariesCmsSidebar from '../../components/TheologicalSeminariesCmsSidebar';
import SyroPageBanner from '../../components/SyroPageBanner';
import {
  getTheologicalSeminaryEntryBySlug,
  getTheologicalSeminaryEntriesData,
} from '../getTheologicalSeminaryEntriesData';
import type { TheologicalSeminaryEntry } from '../types';

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

function SeminaryContactSection({ entry }: { entry: TheologicalSeminaryEntry }) {
  const emails = splitContactList(entry.email);
  const addressLines = entry.address
    ? entry.address.split('\n').map((line) => line.trim()).filter(Boolean)
    : [];
  const hasContact =
    addressLines.length > 0 ||
    emails.length > 0 ||
    Boolean(entry.phones?.trim()) ||
    Boolean(entry.website?.trim());

  if (!hasContact) return null;

  const websiteHref = entry.website?.trim() ? formatWebsiteHref(entry.website) : null;
  const websiteLabel = entry.website?.trim().replace(/^https?:\/\//i, '').replace(/\/$/, '') ?? '';

  return (
    <div className="mt-10 pt-8 border-t border-syro-red/20">
      <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6 pb-2 border-b-2 border-syro-red">
        Contact Us
      </h2>
      <div className="space-y-3 font-syro-primary text-syro-dark-gray leading-relaxed">
        <p className="font-medium text-syro-blue">{entry.name.toUpperCase()}</p>
        {addressLines.length > 0 ? (
          <p className="leading-relaxed">
            {addressLines.map((line, index) => (
              <React.Fragment key={line}>
                {index > 0 ? <br /> : null}
                {line}
              </React.Fragment>
            ))}
          </p>
        ) : null}
        {entry.phones?.trim() ? (
          <p>
            <span className="font-medium text-syro-blue">Tel:</span> {entry.phones.trim()}
          </p>
        ) : null}
        {emails.length > 0 ? (
          <p>
            <span className="font-medium text-syro-blue">contact emails :</span>
            <br />
            {emails.map((email, index) => (
              <React.Fragment key={email}>
                {index > 0 ? <br /> : null}
                <a href={`mailto:${email}`} className="text-syro-red hover:underline">
                  {email}
                </a>
              </React.Fragment>
            ))}
          </p>
        ) : null}
        {websiteHref ? (
          <p>
            <a
              href={websiteHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-syro-red hover:underline"
            >
              {websiteLabel}
            </a>
          </p>
        ) : null}
      </div>
    </div>
  );
}

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getTheologicalSeminaryEntryBySlug(slug);
  if (!entry) {
    return { title: 'Seminary Not Found | Theological Seminaries | MOSC' };
  }
  return {
    title: `${entry.name} | Theological Seminaries | MOSC`,
    description: entry.excerpt ?? `Theological seminary: ${entry.name}.`,
  };
}

const PLACEHOLDER_IMAGE = '/images/theological/sem-300x176.jpg';

export default async function TheologicalSeminariesCmsEntryPage({ params }: PageProps) {
  const { slug } = await params;
  const [entry, { entries }] = await Promise.all([
    getTheologicalSeminaryEntryBySlug(slug),
    getTheologicalSeminaryEntriesData(),
  ]);

  if (!entry) {
    notFound();
  }

  const sidebarEntries = entries.map((item) => ({
    name: item.name,
    slug: item.slug,
    href: `/mosc-redesign/theological-seminaries-cms/${item.slug}`,
  }));

  const imageSrc = entry.imageUrl ?? PLACEHOLDER_IMAGE;
  const bannerTitle = entry.subtitle ? `${entry.name} (${entry.subtitle})` : entry.name;

  return (
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner title={bannerTitle} breadcrumbFrom="theological-seminaries-cms" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8 mb-8">
                <div className="mb-8 flex justify-center">
                  <Image
                    src={imageSrc}
                    alt={entry.imageAlt ?? entry.name}
                    width={300}
                    height={176}
                    className="rounded-lg object-contain"
                    style={{ width: '175px', height: '175px' }}
                    priority
                    unoptimized={Boolean(imageSrc.startsWith('http'))}
                    sizes="(max-width: 768px) 100vw, 28rem"
                  />
                </div>

                {(entry.location || entry.established) && (
                  <div className="flex flex-wrap gap-6 mb-8 pb-6 border-b border-syro-table-border">
                    {entry.location ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-syro-red" role="img" aria-label="Location">
                          📍
                        </span>
                        <span className="font-syro-primary text-base text-syro-dark-gray">
                          {entry.location}
                        </span>
                      </div>
                    ) : null}
                    {entry.established ? (
                      <div className="flex items-center space-x-2">
                        <span className="text-syro-red" role="img" aria-label="Established">
                          📅
                        </span>
                        <span className="font-syro-primary text-base text-syro-dark-gray">
                          Established {entry.established}
                        </span>
                      </div>
                    ) : null}
                  </div>
                )}

                <div className="prose prose-lg max-w-none">
                  {entry.body ? (
                    <div
                      className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed [&_p]:mb-6 [&_p]:leading-relaxed [&_h2]:font-syro-display [&_h2]:font-semibold [&_h2]:text-2xl [&_h2]:text-syro-blue [&_h2]:mb-6 [&_h2]:pb-2 [&_h2]:border-b-2 [&_h2]:border-syro-red [&_a]:text-syro-red [&_a]:hover:underline"
                      dangerouslySetInnerHTML={{ __html: entry.body }}
                    />
                  ) : entry.excerpt ? (
                    <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed">
                      {entry.excerpt}
                    </p>
                  ) : null}
                </div>
                <SeminaryContactSection entry={entry} />
              </div>
            </div>

            <div className="space-y-6 lg:col-span-1">
              <TheologicalSeminariesCmsSidebar entries={sidebarEntries} currentSlug={slug} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

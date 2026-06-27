import React from 'react';
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';
import TrainingCmsSidebar from '../../components/TrainingCmsSidebar';
import {
  DEFAULT_IMAGE_BY_SLUG,
  getTrainingProgramBySlug,
  getTrainingProgramsData,
} from '../getTrainingProgramsData';
import type { TrainingProgramEntry } from '../types';

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

function TrainingContactSection({ entry }: { entry: TrainingProgramEntry }) {
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
    <div className="mt-10 pt-8 border-t border-syro-red/20">
      <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6 pb-2 border-b-2 border-syro-red">
        Contact Address
      </h2>
      <div className="space-y-5 font-syro-primary text-syro-dark-gray">
        {addressLines.length > 0 ? (
          <div>
            <h3 className="font-syro-display font-medium text-lg text-syro-blue mb-2">
              Postal Address
            </h3>
            <p className="leading-relaxed">
              {addressLines.map((line, index) => (
                <React.Fragment key={`${line}-${index}`}>
                  {index > 0 ? <br /> : null}
                  {line}
                </React.Fragment>
              ))}
            </p>
          </div>
        ) : null}
        {phones.length > 0 ? (
          <p className={addressLines.length > 0 ? 'pt-2' : undefined}>
            <span className="font-medium text-syro-blue">Ph:</span> {phones.join(', ')}
          </p>
        ) : null}
        {emails.length > 0 ? (
          <div>
            <h3 className="font-syro-display font-medium text-lg text-syro-blue mb-1">Email</h3>
            {emails.map((email) => (
              <a key={email} href={`mailto:${email}`} className="text-syro-red hover:underline block">
                {email}
              </a>
            ))}
          </div>
        ) : null}
        {websiteHref ? (
          <div>
            <h3 className="font-syro-display font-medium text-lg text-syro-blue mb-1">Website</h3>
            <a
              href={websiteHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-syro-red hover:underline"
            >
              {websiteLabel}
            </a>
          </div>
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
  const entry = await getTrainingProgramBySlug(slug);
  if (!entry) {
    return { title: 'Program Not Found | Training | MOSC' };
  }
  return {
    title: `${entry.name} | Training | MOSC`,
    description: entry.excerpt ?? `Training program: ${entry.name}.`,
  };
}

export default async function TrainingCmsProgramPage({ params }: PageProps) {
  const { slug } = await params;
  const [entry, { entries }] = await Promise.all([
    getTrainingProgramBySlug(slug),
    getTrainingProgramsData(),
  ]);

  if (!entry) {
    notFound();
  }

  const sidebarEntries = entries.map((item) => ({
    name: item.name,
    slug: item.slug,
    href: `/mosc-redesign/training-cms/${item.slug}`,
  }));

  const imageSrc = entry.imageUrl ?? DEFAULT_IMAGE_BY_SLUG[entry.slug] ?? '/images/training/sruti.jpg';

  return (
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner title={entry.name} breadcrumbFrom="training-cms" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8 mb-8">
                <div className="mb-8 flex justify-center">
                  <Image
                    src={imageSrc}
                    alt={entry.imageAlt ?? entry.name}
                    width={800}
                    height={500}
                    className="rounded-lg object-contain"
                    style={{ width: '175px', height: '175px' }}
                    priority
                    unoptimized={Boolean(imageSrc.startsWith('http'))}
                    sizes="(max-width: 768px) 100vw, 28rem"
                  />
                </div>

                <div className="prose prose-lg max-w-none">
                  {entry.body ? (
                    <div
                      className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed [&_p]:mb-6 [&_p]:leading-relaxed [&_h2]:font-syro-display [&_h2]:font-semibold [&_h2]:text-2xl [&_h2]:text-syro-blue [&_h2]:mb-6 [&_h2]:pb-2 [&_h2]:border-b-2 [&_h2]:border-syro-red [&_h3]:font-syro-display [&_h3]:font-medium [&_h3]:text-lg [&_h3]:text-syro-blue [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:space-y-2 [&_a]:text-syro-red [&_a]:hover:underline"
                      dangerouslySetInnerHTML={{ __html: entry.body }}
                    />
                  ) : entry.excerpt ? (
                    <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed">
                      {entry.excerpt}
                    </p>
                  ) : null}
                </div>

                <TrainingContactSection entry={entry} />
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>
            <div className="space-y-6 lg:col-span-1">
              <TrainingCmsSidebar entries={sidebarEntries} currentSlug={slug} />
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

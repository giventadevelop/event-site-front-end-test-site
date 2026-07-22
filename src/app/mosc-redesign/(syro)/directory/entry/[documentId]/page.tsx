import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDirectoryEntryByDocumentId } from '../../entries/getDirectoryEntriesData';
import { DIRECTORY_ENTRY_TYPE_LABELS } from '../../entries/types';
import SyroPageBanner from '../../../components/SyroPageBanner';
import DirectoryBackLink from '../../components/DirectoryBackLink';

type PageProps = { params: Promise<{ documentId: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { documentId } = await params;
  const entry = await getDirectoryEntryByDocumentId(documentId);
  if (!entry) return { title: 'Entry Not Found | Directory | MOSC' };
  return {
    title: `${entry.name} | Directory | Malankara Orthodox Syrian Church`,
    description: entry.description ?? `Directory entry for ${entry.name}.`,
  };
}

export default async function DirectoryEntryDetailPage({ params }: PageProps) {
  const { documentId } = await params;
  const entry = await getDirectoryEntryByDocumentId(documentId);
  if (!entry) notFound();

  const typeLabel = DIRECTORY_ENTRY_TYPE_LABELS[entry.directoryType];
  const cmsListPathByType: Partial<Record<typeof entry.directoryType, string>> = {
    'church-dignitaries': '/mosc-redesign/church-dignitaries-cms',
    'pilgrim-centres': '/mosc-redesign/pilgrim-centres-cms',
    'managing-committee': '/mosc-redesign/managing-committee-cms',
    'working-committee': '/mosc-redesign/working-committee-cms',
  };
  const listPath =
    cmsListPathByType[entry.directoryType] ?? `/mosc-redesign/directory/${entry.directoryType}`;

  return (
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner title={entry.name} breadcrumbFrom="directory" />
      <section className="relative bg-syro-bg-gray py-8 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DirectoryBackLink href={listPath} label={`Back to ${typeLabel}`} />
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {entry.imageUrl && (
              <div className="relative w-40 h-40 flex-shrink-0 rounded-xl overflow-hidden bg-syro-bg-gray sacred-shadow">
                <Image
                  src={entry.imageUrl}
                  alt={entry.imageAlt ?? entry.name}
                  fill
                  className="object-cover"
                  sizes="160px"
                  priority
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="font-heading font-semibold text-2xl lg:text-3xl text-syro-blue">
                {entry.name}
              </h1>
              {entry.description && (
                <p className="font-body text-syro-dark-gray mt-2">{entry.description}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg p-6 sacred-shadow-sm border-l-4 border-syro-red space-y-4 shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px]">
            {entry.address && (
              <div>
                <h3 className="font-heading font-medium text-syro-blue mb-1">Address</h3>
                <p className="font-body text-syro-dark-gray whitespace-pre-line">{entry.address}</p>
              </div>
            )}
            {entry.email && (
              <div>
                <h3 className="font-heading font-medium text-syro-blue mb-1">Email</h3>
                <a href={`mailto:${entry.email}`} className="font-body text-syro-blue hover:underline">
                  {entry.email}
                </a>
              </div>
            )}
            {entry.phones && (
              <div>
                <h3 className="font-heading font-medium text-syro-blue mb-1">Phone(s)</h3>
                <p className="font-body text-syro-dark-gray">{entry.phones}</p>
              </div>
            )}
            {entry.website && (
              <div>
                <h3 className="font-heading font-medium text-syro-blue mb-1">Website</h3>
                <a
                  href={entry.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-syro-blue hover:underline"
                >
                  {entry.website}
                </a>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

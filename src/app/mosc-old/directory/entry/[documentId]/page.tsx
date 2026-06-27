import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDirectoryEntryByDocumentId } from '../../entries/getDirectoryEntriesData';
import { DIRECTORY_ENTRY_TYPE_LABELS } from '../../entries/types';

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
  const listPath = `/mosc-old/directory/${entry.directoryType}`;

  return (
    <div className="min-h-screen bg-background">
      <section className="relative bg-gradient-to-br from-background to-muted py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href={listPath} className="font-body text-primary hover:underline mb-4 inline-block">
            ← {typeLabel}
          </Link>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {entry.imageUrl && (
              <div className="relative w-40 h-40 flex-shrink-0 rounded-xl overflow-hidden bg-muted/40 sacred-shadow">
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
              <h1 className="font-heading font-semibold text-2xl lg:text-3xl text-foreground">
                {entry.name}
              </h1>
              {entry.description && (
                <p className="font-body text-muted-foreground mt-2">{entry.description}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-muted/20 rounded-lg p-6 sacred-shadow-sm border-l-4 border-primary space-y-4">
            {entry.address && (
              <div>
                <h3 className="font-heading font-medium text-foreground mb-1">Address</h3>
                <p className="font-body text-muted-foreground whitespace-pre-line">{entry.address}</p>
              </div>
            )}
            {entry.email && (
              <div>
                <h3 className="font-heading font-medium text-foreground mb-1">Email</h3>
                <a href={`mailto:${entry.email}`} className="font-body text-primary hover:underline">
                  {entry.email}
                </a>
              </div>
            )}
            {entry.phones && (
              <div>
                <h3 className="font-heading font-medium text-foreground mb-1">Phone(s)</h3>
                <p className="font-body text-muted-foreground">{entry.phones}</p>
              </div>
            )}
            {entry.website && (
              <div>
                <h3 className="font-heading font-medium text-foreground mb-1">Website</h3>
                <a
                  href={entry.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-primary hover:underline"
                >
                  {entry.website}
                </a>
              </div>
            )}
          </div>
          <div className="mt-8">
            <Link href={listPath} className="font-body text-primary font-medium hover:underline">
              ← Back to {typeLabel}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

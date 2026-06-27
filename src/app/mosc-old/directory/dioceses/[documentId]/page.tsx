import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDioceseByDocumentId } from '../getDiocesesData';

type PageProps = { params: Promise<{ documentId: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { documentId } = await params;
  const diocese = await getDioceseByDocumentId(documentId);
  if (!diocese) return { title: 'Diocese Not Found | Directory | MOSC' };
  return {
    title: `${diocese.name} | Dioceses | Directory | Malankara Orthodox Syrian Church`,
    description: diocese.description ?? `Directory entry for ${diocese.name}.`,
  };
}

export default async function DioceseDetailPage({ params }: PageProps) {
  const { documentId } = await params;
  const diocese = await getDioceseByDocumentId(documentId);
  if (!diocese) notFound();

  return (
    <div className="min-h-screen bg-background">
      <section className="relative bg-gradient-to-br from-background to-muted py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/mosc-old/directory/dioceses" className="font-body text-primary hover:underline mb-4 inline-block">
            ← Dioceses
          </Link>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {diocese.imageUrl && (
              <div className="relative w-40 h-40 flex-shrink-0 rounded-xl overflow-hidden bg-muted/40 sacred-shadow">
                <Image
                  src={diocese.imageUrl}
                  alt={diocese.imageAlt ?? diocese.name}
                  fill
                  className="object-cover"
                  sizes="160px"
                  priority
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="font-heading font-semibold text-2xl lg:text-3xl text-foreground">
                {diocese.name}
              </h1>
              {diocese.description && (
                <p className="font-body text-muted-foreground mt-2">{diocese.description}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-muted/20 rounded-lg p-6 sacred-shadow-sm border-l-4 border-primary space-y-4">
            {diocese.address && (
              <div>
                <h3 className="font-heading font-medium text-foreground mb-1">Address</h3>
                <p className="font-body text-muted-foreground whitespace-pre-line">{diocese.address}</p>
              </div>
            )}
            {diocese.email && (
              <div>
                <h3 className="font-heading font-medium text-foreground mb-1">Email</h3>
                <a href={`mailto:${diocese.email}`} className="font-body text-primary hover:underline">
                  {diocese.email}
                </a>
              </div>
            )}
            {diocese.phones && (
              <div>
                <h3 className="font-heading font-medium text-foreground mb-1">Phone(s)</h3>
                <p className="font-body text-muted-foreground">{diocese.phones}</p>
              </div>
            )}
            {diocese.website && (
              <div>
                <h3 className="font-heading font-medium text-foreground mb-1">Website</h3>
                <a
                  href={diocese.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-primary hover:underline"
                >
                  {diocese.website}
                </a>
              </div>
            )}
          </div>
          <div className="mt-8">
            <Link href="/mosc-old/directory/dioceses" className="font-body text-primary font-medium hover:underline inline-flex items-center gap-1">
              ← Back to Dioceses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

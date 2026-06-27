import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPriestByDocumentId } from '../getPriestsData';

type PageProps = { params: Promise<{ documentId: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { documentId } = await params;
  const priest = await getPriestByDocumentId(documentId);
  if (!priest) return { title: 'Priest Not Found | Directory | MOSC' };
  return {
    title: `${priest.name} | Priests | Directory | Malankara Orthodox Syrian Church`,
    description: priest.dioceseName ? `${priest.name}, ${priest.dioceseName}.` : `Directory entry for ${priest.name}.`,
  };
}

export default async function PriestDetailPage({ params }: PageProps) {
  const { documentId } = await params;
  const priest = await getPriestByDocumentId(documentId);
  if (!priest) notFound();

  return (
    <div className="min-h-screen bg-background">
      <section className="relative bg-gradient-to-br from-background to-muted py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/mosc-old/directory/priests" className="font-body text-primary hover:underline mb-4 inline-block">← Priests</Link>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {priest.imageUrl && (
              <div className="relative w-40 h-40 flex-shrink-0 rounded-xl overflow-hidden bg-muted/40 sacred-shadow">
                <Image src={priest.imageUrl} alt={priest.imageAlt ?? priest.name} fill className="object-cover" sizes="160px" priority />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="font-heading font-semibold text-2xl lg:text-3xl text-foreground">
                {priest.title ? `${priest.title} ${priest.name}` : priest.name}
              </h1>
              {priest.dioceseName && <p className="font-body text-muted-foreground mt-1">{priest.dioceseName}</p>}
              {priest.parishName && <p className="font-body text-muted-foreground">Vicar, {priest.parishName}</p>}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-muted/20 rounded-lg p-6 sacred-shadow-sm border-l-4 border-primary space-y-4">
            {priest.address && (
              <div>
                <h3 className="font-heading font-medium text-foreground mb-1">Address</h3>
                <p className="font-body text-muted-foreground whitespace-pre-line">{priest.address}</p>
              </div>
            )}
            {priest.email && (
              <div>
                <h3 className="font-heading font-medium text-foreground mb-1">Email</h3>
                <a href={`mailto:${priest.email}`} className="font-body text-primary hover:underline">{priest.email}</a>
              </div>
            )}
            {priest.phones && (
              <div>
                <h3 className="font-heading font-medium text-foreground mb-1">Phone(s)</h3>
                <p className="font-body text-muted-foreground">{priest.phones}</p>
              </div>
            )}
          </div>
          <div className="mt-8">
            <Link href="/mosc-old/directory/priests" className="font-body text-primary font-medium hover:underline">← Back to Priests</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

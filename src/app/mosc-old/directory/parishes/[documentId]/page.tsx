import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getParishByDocumentId } from '../getParishesData';

type PageProps = { params: Promise<{ documentId: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { documentId } = await params;
  const parish = await getParishByDocumentId(documentId);
  if (!parish) return { title: 'Parish Not Found | Directory | MOSC' };
  return {
    title: `${parish.name} | Parishes | Directory | Malankara Orthodox Syrian Church`,
    description: parish.dioceseName ? `${parish.name}, ${parish.dioceseName}.` : `Directory entry for ${parish.name}.`,
  };
}

export default async function ParishDetailPage({ params }: PageProps) {
  const { documentId } = await params;
  const parish = await getParishByDocumentId(documentId);
  if (!parish) notFound();

  const locationParts = [parish.addressLine1, parish.city, parish.state, parish.postalCode, parish.country].filter(Boolean);
  const fullAddress = parish.address || (locationParts.length ? locationParts.join(', ') : null);

  return (
    <div className="min-h-screen bg-background">
      <section className="relative bg-gradient-to-br from-background to-muted py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/mosc-old/directory/parishes" className="font-body text-primary hover:underline mb-4 inline-block">← Parishes</Link>
          <h1 className="font-heading font-semibold text-2xl lg:text-3xl text-foreground">{parish.name}</h1>
          {parish.dioceseName && <p className="font-body text-muted-foreground mt-1">{parish.dioceseName}</p>}
        </div>
      </section>

      <section className="py-12 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-muted/20 rounded-lg p-6 sacred-shadow-sm border-l-4 border-primary space-y-4">
            {fullAddress && (
              <div>
                <h3 className="font-heading font-medium text-foreground mb-1">Address</h3>
                <p className="font-body text-muted-foreground whitespace-pre-line">{fullAddress}</p>
              </div>
            )}
            {parish.email && (
              <div>
                <h3 className="font-heading font-medium text-foreground mb-1">Email</h3>
                <a href={`mailto:${parish.email}`} className="font-body text-primary hover:underline">{parish.email}</a>
              </div>
            )}
            {(parish.phones || parish.phoneSecondary) && (
              <div>
                <h3 className="font-heading font-medium text-foreground mb-1">Phone(s)</h3>
                <p className="font-body text-muted-foreground">{[parish.phones, parish.phoneSecondary].filter(Boolean).join(' / ')}</p>
              </div>
            )}
          </div>
          <div className="mt-8">
            <Link href="/mosc-old/directory/parishes" className="font-body text-primary font-medium hover:underline">← Back to Parishes</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

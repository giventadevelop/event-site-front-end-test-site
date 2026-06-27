import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBishopByDocumentId } from '../getBishopsData';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ documentId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { documentId } = await params;
  const bishop = await getBishopByDocumentId(documentId);
  if (!bishop) {
    return { title: 'Bishop Not Found | Directory | MOSC' };
  }
  return {
    title: `${bishop.name} | Bishops | Directory | Malankara Orthodox Syrian Church`,
    description: bishop.dioceseName
      ? `${bishop.name}, ${bishop.dioceseName}. Directory of bishops.`
      : `Directory entry for ${bishop.name}.`,
  };
}

export default async function BishopDetailPage({ params }: PageProps) {
  const { documentId } = await params;
  if (process.env.NODE_ENV === 'development') {
    console.log('[BishopPage] rendering', documentId);
  }
  const bishop = await getBishopByDocumentId(documentId);

  if (!bishop) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="relative bg-gradient-to-br from-background to-muted py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/mosc-old/directory/bishops"
            className="font-body text-primary hover:underline mb-4 inline-block"
          >
            ← Bishops
          </Link>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {bishop.imageUrl && (
              <div className="relative w-40 h-40 flex-shrink-0 rounded-xl overflow-hidden bg-muted/40 sacred-shadow">
                <Image
                  src={bishop.imageUrl}
                  alt={bishop.imageAlt ?? bishop.name}
                  fill
                  className="object-cover"
                  sizes="160px"
                  priority
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="font-heading font-semibold text-2xl lg:text-3xl text-foreground">
                {bishop.name}
              </h1>
              {bishop.dioceseName && (
                <p className="font-body text-muted-foreground mt-1">
                  {bishop.dioceseName}
                </p>
              )}
              <p className="font-body text-sm text-muted-foreground mt-2 capitalize">
                {bishop.bishopType.replace(/-/g, ' ')}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-muted/20 rounded-lg p-6 sacred-shadow-sm border-l-4 border-primary space-y-4">
            {bishop.address && (
              <div>
                <h3 className="font-heading font-medium text-foreground mb-1">Address</h3>
                <p className="font-body text-muted-foreground whitespace-pre-line">{bishop.address}</p>
              </div>
            )}
            {bishop.email && (
              <div>
                <h3 className="font-heading font-medium text-foreground mb-1">Email</h3>
                <a href={`mailto:${bishop.email}`} className="font-body text-primary hover:underline">
                  {bishop.email}
                </a>
              </div>
            )}
            {bishop.phones && (
              <div>
                <h3 className="font-heading font-medium text-foreground mb-1">Phone(s)</h3>
                <p className="font-body text-muted-foreground">{bishop.phones}</p>
              </div>
            )}
          </div>
          <div className="mt-8">
            <Link
              href="/mosc-old/directory/bishops"
              className="font-body text-primary font-medium hover:underline inline-flex items-center gap-1"
            >
              ← Back to Bishops
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

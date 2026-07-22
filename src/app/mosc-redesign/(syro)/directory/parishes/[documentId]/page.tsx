import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getParishByDocumentId } from '../getParishesData';
import SyroPageBanner from '../../../components/SyroPageBanner';
import DirectoryBackLink from '../../components/DirectoryBackLink';

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
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner title={parish.name} breadcrumbFrom="directory" />
      <section className="relative bg-syro-bg-gray py-8 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <DirectoryBackLink href="/mosc-redesign/parishes-cms" label="Back to Parishes" />
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {parish.imageUrl ? (
              <div className="relative w-40 h-40 flex-shrink-0 rounded-xl overflow-hidden bg-syro-bg-gray sacred-shadow">
                <Image
                  src={parish.imageUrl}
                  alt={parish.imageAlt ?? parish.name}
                  fill
                  className="object-contain"
                  sizes="160px"
                  priority
                  unoptimized={parish.imageUrl.startsWith('http')}
                />
              </div>
            ) : null}
            <div className="min-w-0 flex-1">
              <h1 className="font-heading font-semibold text-2xl lg:text-3xl text-syro-blue">
                {parish.name}
              </h1>
              {parish.dioceseName ? (
                <p className="font-body text-syro-dark-gray mt-1">{parish.dioceseName}</p>
              ) : null}
              {parish.vicarName ? (
                <p className="font-body text-syro-dark-gray mt-2">
                  Vicar: <span className="font-medium text-syro-blue">{parish.vicarName}</span>
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg p-6 sacred-shadow-sm border-l-4 border-syro-red space-y-4 shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px]">
            {fullAddress && (
              <div>
                <h3 className="font-heading font-medium text-syro-blue mb-1">Address</h3>
                <p className="font-body text-syro-dark-gray whitespace-pre-line">{fullAddress}</p>
              </div>
            )}
            {parish.email && (
              <div>
                <h3 className="font-heading font-medium text-syro-blue mb-1">Email</h3>
                <a href={`mailto:${parish.email}`} className="font-body text-syro-blue hover:underline">{parish.email}</a>
              </div>
            )}
            {(parish.phones || parish.phoneSecondary) && (
              <div>
                <h3 className="font-heading font-medium text-syro-blue mb-1">Phone(s)</h3>
                <p className="font-body text-syro-dark-gray">{[parish.phones, parish.phoneSecondary].filter(Boolean).join(' / ')}</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

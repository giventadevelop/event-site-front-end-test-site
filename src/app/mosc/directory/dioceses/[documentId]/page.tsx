import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDioceseByDocumentId } from '../getDiocesesData';
import SyroPageBanner from '../../../components/SyroPageBanner';

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
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner title={diocese.name} breadcrumbFrom="directory" />
      <section className="relative bg-syro-bg-gray py-8 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/mosc/directory/dioceses"
            className="inline-block no-underline font-light text-white bg-[#dc3545] py-2.5 px-5 border-r-[7px] border-r-[#be1929] mb-4 transition-[1s] hover:bg-[#be1929] hover:border-r-[6px] hover:border-r-[#dc3545] hover:text-white"
          >
            ← Back to Dioceses
          </Link>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {diocese.imageUrl && (
              <div className="relative w-40 h-40 flex-shrink-0 rounded-xl overflow-hidden bg-syro-bg-gray sacred-shadow">
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
              <h1 className="font-heading font-semibold text-2xl lg:text-3xl text-syro-blue">
                {diocese.name}
              </h1>
              {diocese.description && (
                <p className="font-body text-syro-dark-gray mt-2">{diocese.description}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg p-6 sacred-shadow-sm border-l-4 border-syro-red space-y-4 shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px]">
            {diocese.address && (
              <div>
                <h3 className="font-heading font-medium text-syro-blue mb-1">Address</h3>
                <p className="font-body text-syro-dark-gray whitespace-pre-line">{diocese.address}</p>
              </div>
            )}
            {diocese.email && (
              <div>
                <h3 className="font-heading font-medium text-syro-blue mb-1">Email</h3>
                <a href={`mailto:${diocese.email}`} className="font-body text-syro-blue hover:underline">
                  {diocese.email}
                </a>
              </div>
            )}
            {diocese.phones && (
              <div>
                <h3 className="font-heading font-medium text-syro-blue mb-1">Phone(s)</h3>
                <p className="font-body text-syro-dark-gray">{diocese.phones}</p>
              </div>
            )}
            {diocese.website && (
              <div>
                <h3 className="font-heading font-medium text-syro-blue mb-1">Website</h3>
                <a
                  href={diocese.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-body text-syro-blue hover:underline"
                >
                  {diocese.website}
                </a>
              </div>
            )}
          </div>
          <div className="mt-8">
            <Link
            href="/mosc/directory/dioceses"
            className="inline-block no-underline font-light text-white bg-[#dc3545] py-2.5 px-5 border-r-[7px] border-r-[#be1929] mt-4 transition-[1s] hover:bg-[#be1929] hover:border-r-[6px] hover:border-r-[#dc3545] hover:text-white inline-flex items-center gap-1"
          >
            ← Back to Dioceses
          </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

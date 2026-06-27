import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPriestByDocumentId } from '../getPriestsData';
import SyroPageBanner from '../../../components/SyroPageBanner';

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

  const displayName = priest.title ? `${priest.title} ${priest.name}` : priest.name;
  return (
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner title={displayName} breadcrumbFrom="directory" />
      <section className="relative bg-syro-bg-gray py-8 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/mosc-redesign/directory/priests"
            className="inline-block no-underline font-light text-white bg-[#dc3545] py-2.5 px-5 border-r-[7px] border-r-[#be1929] mb-4 transition-[1s] hover:bg-[#be1929] hover:border-r-[6px] hover:border-r-[#dc3545] hover:text-white"
          >
            ← Back to Priests
          </Link>
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {priest.imageUrl && (
              <div className="relative w-40 h-40 flex-shrink-0 rounded-xl overflow-hidden bg-syro-bg-gray sacred-shadow">
                <Image src={priest.imageUrl} alt={priest.imageAlt ?? priest.name} fill className="object-cover" sizes="160px" priority />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h1 className="font-heading font-semibold text-2xl lg:text-3xl text-syro-blue">
                {priest.title ? `${priest.title} ${priest.name}` : priest.name}
              </h1>
              {priest.dioceseName && <p className="font-body text-syro-dark-gray mt-1">{priest.dioceseName}</p>}
              {priest.parishName && <p className="font-body text-syro-dark-gray">Vicar, {priest.parishName}</p>}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg p-6 sacred-shadow-sm border-l-4 border-syro-red space-y-4 shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px]">
            {priest.address && (
              <div>
                <h3 className="font-heading font-medium text-syro-blue mb-1">Address</h3>
                <p className="font-body text-syro-dark-gray whitespace-pre-line">{priest.address}</p>
              </div>
            )}
            {priest.email && (
              <div>
                <h3 className="font-heading font-medium text-syro-blue mb-1">Email</h3>
                <a href={`mailto:${priest.email}`} className="font-body text-syro-blue hover:underline">{priest.email}</a>
              </div>
            )}
            {priest.phones && (
              <div>
                <h3 className="font-heading font-medium text-syro-blue mb-1">Phone(s)</h3>
                <p className="font-body text-syro-dark-gray">{priest.phones}</p>
              </div>
            )}
          </div>
          <div className="mt-8">
            <Link
            href="/mosc-redesign/directory/priests"
            className="inline-block no-underline font-light text-white bg-[#dc3545] py-2.5 px-5 border-r-[7px] border-r-[#be1929] mt-4 transition-[1s] hover:bg-[#be1929] hover:border-r-[6px] hover:border-r-[#dc3545] hover:text-white"
          >
            ← Back to Priests
          </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBishopByDocumentId } from '../getBishopsData';
import SyroPageBanner from '../../../components/SyroPageBanner';

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
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner title={bishop.name} breadcrumbFrom="directory" />
      <section className="relative bg-syro-bg-gray py-8 lg:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/mosc-redesign/directory/bishops"
            className="inline-block no-underline font-light text-white bg-[#dc3545] py-2.5 px-5 border-r-[7px] border-r-[#be1929] mb-4 transition-[1s] hover:bg-[#be1929] hover:border-r-[6px] hover:border-r-[#dc3545] hover:text-white"
          >
            ← Back to Bishops
          </Link>
          <div className="bg-white rounded-lg sacred-shadow-sm border-l-4 border-syro-red shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] overflow-hidden">
            <div className="flex flex-col sm:flex-row gap-6 p-6 items-stretch">
              {bishop.imageUrl && (
                <div className="relative w-full min-h-[12rem] sm:w-[35%] sm:min-h-0 flex-shrink-0 rounded-xl overflow-hidden sacred-shadow self-stretch flex items-center justify-center">
                  <Image
                    src={bishop.imageUrl}
                    alt={bishop.imageAlt ?? bishop.name}
                    fill
                    className="object-contain object-center"
                    sizes="(min-width: 1024px) 560px, (min-width: 640px) 35vw, 100vw"
                    quality={95}
                    priority
                  />
                </div>
              )}
              <div className="min-w-0 flex-1 space-y-4">
                <div>
                  <h1 className="font-heading font-semibold text-2xl lg:text-3xl text-syro-blue">
                    {bishop.name}
                  </h1>
                  {bishop.dioceseName && (
                    <p className="font-body text-syro-dark-gray mt-1">
                      {bishop.dioceseName}
                    </p>
                  )}
                  <p className="font-body text-sm text-syro-dark-gray mt-2 capitalize">
                    {bishop.bishopType.replace(/-/g, ' ')}
                  </p>
                </div>
                {bishop.address && (
                  <div>
                    <h3 className="font-heading font-medium text-sm text-syro-blue mb-1">Address</h3>
                    <p className="font-body text-syro-dark-gray whitespace-pre-line">
                      {bishop.address
                        .split(/[,\n]+/)
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .join('\n')}
                    </p>
                  </div>
                )}
                {bishop.email && (
                  <div>
                    <h3 className="font-heading font-medium text-sm text-syro-blue mb-1">Email</h3>
                    <div className="font-body text-syro-blue space-y-1">
                      {bishop.email
                        .split(/[,\n]+/)
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .map((email) => (
                          <a key={email} href={`mailto:${email}`} className="hover:underline block">
                            {email}
                          </a>
                        ))}
                    </div>
                  </div>
                )}
                {bishop.phones && (
                  <div>
                    <h3 className="font-heading font-medium text-sm text-syro-blue mb-1">Phone(s)</h3>
                    <p className="font-body text-syro-dark-gray whitespace-pre-line">
                      {bishop.phones
                        .split(/[,\n]+/)
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .join('\n')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

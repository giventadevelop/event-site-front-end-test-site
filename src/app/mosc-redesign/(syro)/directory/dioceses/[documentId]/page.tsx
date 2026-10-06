import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDioceseByDocumentId, getDiocesesData } from '../getDiocesesData';
import { getParishesData } from '../../parishes/getParishesData';
import SyroPageBanner from '../../../components/SyroPageBanner';
import QuickLinks from '../../../components/QuickLinks';
import DiocesesCmsSidebar from '../../../dioceses-cms/components/DiocesesCmsSidebar';

const DETAIL_BASE = '/mosc-redesign/directory/dioceses';

/** Non-diocese Strapi rows sometimes stored in the dioceses collection. */
const NON_DIOCESE_SLUG_PARTS = ['mgocsm', 'under-direct-control'];

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
  const [diocese, parishResult, listResult] = await Promise.all([
    getDioceseByDocumentId(documentId),
    getParishesData({
      dioceseDocumentId: documentId,
      page: 1,
      pageSize: 1,
    }),
    getDiocesesData({
      page: 1,
      pageSize: 100,
      sort: null,
    }),
  ]);
  if (!diocese) notFound();

  const parishTotal = parishResult.pagination.total;
  const hasParishes = parishTotal > 0;
  const parishesListHref = `/mosc-redesign/parishes-cms?diocese=${encodeURIComponent(documentId)}`;
  const descriptionParagraphs = diocese.description
    ?.split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean) ?? [];

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title={diocese.name} breadcrumbFrom="dioceses-cms" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] px-4 py-8 md:p-8">
                {diocese.imageUrl && (
                  <div className="mb-8">
                    <Image
                      src={diocese.imageUrl}
                      alt={diocese.imageAlt ?? diocese.name}
                      width={800}
                      height={500}
                      className="rounded-lg w-full h-auto object-contain"
                      sizes="(min-width: 1024px) 66vw, 100vw"
                      priority
                      unoptimized={diocese.imageUrl.startsWith('http')}
                    />
                  </div>
                )}

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    {diocese.name}
                  </h2>

                  {descriptionParagraphs.map((paragraph) => (
                    <p
                      key={paragraph.slice(0, 48)}
                      className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6 whitespace-pre-line"
                    >
                      {paragraph}
                    </p>
                  ))}

                  {diocese.address && (
                    <div className="mb-6">
                      <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-2">Address</h3>
                      <p className="font-syro-primary text-syro-dark-gray whitespace-pre-line">{diocese.address}</p>
                    </div>
                  )}
                  {diocese.email && (
                    <div className="mb-6">
                      <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-2">Email</h3>
                      <a href={`mailto:${diocese.email}`} className="font-syro-primary text-syro-blue hover:underline">
                        {diocese.email}
                      </a>
                    </div>
                  )}
                  {diocese.phones && (
                    <div className="mb-6">
                      <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-2">Phone(s)</h3>
                      <p className="font-syro-primary text-syro-dark-gray">{diocese.phones}</p>
                    </div>
                  )}
                  {diocese.website && (
                    <div className="mb-6">
                      <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-2">Website</h3>
                      <a
                        href={diocese.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-syro-primary text-syro-blue hover:underline"
                      >
                        {diocese.website}
                      </a>
                    </div>
                  )}
                  {hasParishes && (
                    <div className="bg-syro-red/10 rounded-lg p-6">
                      <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-2">Parishes</h3>
                      <p className="font-syro-primary text-syro-dark-gray mb-4">
                        {parishTotal} parish{parishTotal !== 1 ? 'es' : ''} in this diocese are listed in the directory.
                      </p>
                      <Link
                        href={parishesListHref}
                        className="syro-primary-button inline-flex items-center gap-2"
                      >
                        <span>View paginated list of parishes</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            <div className="space-y-6 lg:col-span-1">
              <DiocesesCmsSidebar
                currentDocumentId={documentId}
                entries={listResult.dioceses
                  .filter((entry) => entry.documentId && entry.name)
                  .filter((entry) => !NON_DIOCESE_SLUG_PARTS.some((part) => entry.slug.toLowerCase().includes(part)))
                  .map((entry) => ({
                    documentId: entry.documentId,
                    name: entry.name,
                    href: `${DETAIL_BASE}/${entry.documentId}`,
                  }))}
              />
            </div>
          </div>
          <div className="mt-8 lg:hidden">
            <QuickLinks />
          </div>
        </div>
      </section>
    </div>
  );
}

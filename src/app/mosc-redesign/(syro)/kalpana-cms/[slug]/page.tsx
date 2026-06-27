import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';
import {
  getKalpanaDocumentsByEditionSlug,
  getKalpanaEditionBySlug,
} from '../getKalpanaDocumentsData';
import { synthesizeKalpanaEditionFromSlug } from '../getKalpanaData';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const edition = await getKalpanaEditionBySlug(slug);
  if (!edition) {
    return { title: 'Kalpana Not Found | MOSC' };
  }
  return {
    title: `${edition.title} | Kalpana | MOSC`,
    description: `Download Kalpana circulars for ${edition.year}.`,
  };
}

export default async function KalpanaEditionDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [edition, documents] = await Promise.all([
    getKalpanaEditionBySlug(slug),
    getKalpanaDocumentsByEditionSlug(slug),
  ]);

  if (!edition && documents.length === 0) {
    notFound();
  }

  const displayEdition = edition ?? synthesizeKalpanaEditionFromSlug(slug);
  if (!displayEdition) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner title={displayEdition.title} breadcrumbFrom="kalpana-cms" />

      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link
              href="/mosc-redesign/kalpana-cms"
              className="font-syro-primary text-syro-red hover:underline inline-flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Kalpana editions
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-syro-card p-8">
            <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
              {displayEdition.title}
            </h2>

            {documents.length > 0 ? (
              <ul className="space-y-3">
                {documents.map((doc) => {
                  const href = doc.pdfUrl ?? doc.sourceUrl;
                  if (!href) return null;
                  const isExternal = /^https?:\/\//i.test(href);

                  return (
                    <li key={doc.documentId || doc.slug}>
                      {isExternal ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-syro-primary text-syro-dark-gray hover:text-syro-red transition-colors duration-300 flex items-start gap-2 group"
                        >
                          <svg
                            className="w-5 h-5 mt-0.5 flex-shrink-0 text-syro-red"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <span className="group-hover:underline">{doc.title}</span>
                        </a>
                      ) : (
                        <Link
                          href={href}
                          className="font-syro-primary text-syro-dark-gray hover:text-syro-red transition-colors duration-300 flex items-start gap-2 group"
                        >
                          <svg
                            className="w-5 h-5 mt-0.5 flex-shrink-0 text-syro-red"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <span className="group-hover:underline">{doc.title}</span>
                        </Link>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="font-syro-primary text-syro-dark-gray">
                No Kalpana documents are available for this year yet. Please check back later.
              </p>
            )}
          </div>
        </div>
      </section>

      <QuickLinks />
    </div>
  );
}

'use client';

import React from 'react';
import Link from 'next/link';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';
import { MoscHubCardMedia, MoscHubCardMediaPlaceholder } from '../components/MoscHubCardMedia';
import type { PublicOfficialDocumentTreePage } from './ApiServerActions';

export type DownloadCard = {
  title: string;
  link: string;
  image?: string;
  /** Legacy static rows use alert when link is # */
  isPlaceholder: boolean;
};

const BANNER_DESCRIPTION =
  'Church resources, forms, publications, and documents available for download.';

type Props = {
  staticCards: DownloadCard[];
  officialLibraryCards: DownloadCard[];
  officialTreePage: PublicOfficialDocumentTreePage;
  currentFilters: {
    page: number;
    categoryId: number | null;
    year: number | null;
  };
};

function DownloadCardGrid({ items, keyPrefix }: { items: DownloadCard[]; keyPrefix: string }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
      {items.map((item, index) => (
        <div
          key={`${keyPrefix}-${item.title}-${index}`}
          className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] hover:shadow-[rgba(0,0,0,0.35)_0px_5px_15px] transition-shadow duration-300 p-8 flex flex-col h-full"
        >
          {item.image ? (
            <MoscHubCardMedia src={item.image} alt={item.title} />
          ) : (
            <MoscHubCardMediaPlaceholder
              icon={
                <svg
                  className="w-10 h-10 text-syro-red"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              }
            />
          )}
          <h3 className="font-syro-display text-xl font-semibold text-syro-blue mb-2 line-clamp-2">
            {item.title}
          </h3>
          <div className="flex-1 min-h-[24px]" aria-hidden="true" />
          <Link
            href={item.link}
            className="syro-primary-button inline-flex items-center gap-2 w-fit"
            onClick={(e) => {
              if (item.isPlaceholder) {
                e.preventDefault();
                globalThis.alert('This resource will be available for download soon. Please check back later.');
              }
            }}
          >
            Download
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      ))}
    </div>
  );
}

function buildTree(content: PublicOfficialDocumentTreePage['content']) {
  const root: Record<string, unknown> = {};
  for (const item of content) {
    const segments = item.pathSegments.length > 0 ? item.pathSegments : [item.fileName];
    let cursor = root as Record<string, unknown>;
    for (let i = 0; i < segments.length; i += 1) {
      const segment = segments[i];
      if (i === segments.length - 1) {
        const files = Array.isArray(cursor.__files) ? cursor.__files : [];
        files.push(item);
        cursor.__files = files;
      } else {
        if (!cursor[segment] || typeof cursor[segment] !== 'object') {
          cursor[segment] = {};
        }
        cursor = cursor[segment] as Record<string, unknown>;
      }
    }
  }
  return root;
}

function TreeNode({ node, depth = 0 }: { node: Record<string, unknown>; depth?: number }) {
  const keys = Object.keys(node).filter((k) => k !== '__files').sort((a, b) => a.localeCompare(b));
  const files = (Array.isArray(node.__files) ? node.__files : []) as PublicOfficialDocumentTreePage['content'];

  return (
    <ul className={depth === 0 ? 'space-y-2' : 'space-y-1'}>
      {keys.map((key) => (
        <li key={`${depth}-${key}`}>
          <details open={depth < 2} className="group">
            <summary className="cursor-pointer list-none inline-flex items-center gap-2 text-sm font-semibold text-syro-blue">
              <span className="inline-block w-4 text-center text-syro-red group-open:rotate-90 transition-transform">▶</span>
              {key}
            </summary>
            <div className="pl-6 pt-1">
              <TreeNode node={node[key] as Record<string, unknown>} depth={depth + 1} />
            </div>
          </details>
        </li>
      ))}
      {files.map((file) => (
        <li key={`file-${file.id ?? file.treePath}`} className="ml-1 border-l-2 border-syro-gold/30 pl-3 py-1">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-syro-dark">{file.fileName}</div>
              <div className="text-xs text-gray-500">
                Priority: {file.priorityRanking}
                {file.officialDocumentYear ? ` | Year: ${file.officialDocumentYear}` : ''}
              </div>
            </div>
            {file.downloadUrl ? (
              <a
                href={file.downloadUrl}
                className="syro-primary-button inline-flex items-center gap-2 text-xs px-3 py-1.5"
                target="_blank"
                rel="noopener noreferrer"
              >
                Download
              </a>
            ) : (
              <span className="text-xs text-gray-400">No link</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function DownloadsOldPageClient({
  staticCards,
  officialLibraryCards,
  officialTreePage,
  currentFilters,
}: Props) {
  const tree = buildTree(officialTreePage.content);
  const totalPages = Math.max(officialTreePage.totalPages || 1, 1);
  const currentPage = Math.min(Math.max(currentFilters.page, 1), totalPages);

  const queryWithPage = (page: number) => {
    const params = new globalThis.URLSearchParams();
    params.set('page', String(page));
    if (currentFilters.categoryId) params.set('categoryId', String(currentFilters.categoryId));
    if (currentFilters.year) params.set('year', String(currentFilters.year));
    return `/mosc-redesign/downloads-old?${params.toString()}`;
  };

  const queryWithFilter = (categoryId: number | null, year: number | null) => {
    const params = new globalThis.URLSearchParams();
    params.set('page', '1');
    if (categoryId) params.set('categoryId', String(categoryId));
    if (year) params.set('year', String(year));
    return `/mosc-redesign/downloads-old?${params.toString()}`;
  };

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Downloads"
        breadcrumbFrom="home"
        description={BANNER_DESCRIPTION}
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {officialLibraryCards.length > 0 && (
            <>
              <h3 className="text-2xl font-light text-[#798daf] mb-10 pl-8 border-l-[7px] border-syro-red">
                Official library
              </h3>
              <DownloadCardGrid items={officialLibraryCards} keyPrefix="lib" />
            </>
          )}

          <h3 className="text-2xl font-light text-[#798daf] mb-6 pl-8 border-l-[7px] border-syro-red">
            Official Library Explorer
          </h3>
          <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-6 mb-12">
            <div className="flex flex-wrap gap-3 items-center justify-between mb-5">
              <div className="text-sm text-gray-600">
                Showing page <span className="font-semibold">{currentPage}</span> of{' '}
                <span className="font-semibold">{totalPages}</span> (
                <span className="font-semibold">{officialTreePage.totalElements}</span> files). Lower priority values are shown first.
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={queryWithFilter(null, currentFilters.year)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold ${
                    !currentFilters.categoryId ? 'bg-syro-blue text-white' : 'bg-syro-bg-gray text-syro-blue'
                  }`}
                >
                  All categories
                </Link>
                {officialTreePage.categoryOptions.map((cat) => (
                  <Link
                    key={cat.id}
                    href={queryWithFilter(cat.id, currentFilters.year)}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold ${
                      currentFilters.categoryId === cat.id ? 'bg-syro-blue text-white' : 'bg-syro-bg-gray text-syro-blue'
                    }`}
                  >
                    {cat.displayName}
                  </Link>
                ))}
              </div>
            </div>

            {officialTreePage.content.length === 0 ? (
              <div className="text-sm text-gray-500">No files available for the selected filters.</div>
            ) : (
              <TreeNode node={tree} />
            )}

            <div className="mt-6 flex items-center justify-between">
              {currentPage > 1 ? (
                <Link href={queryWithPage(currentPage - 1)} className="syro-primary-button inline-flex items-center gap-2">
                  Previous
                </Link>
              ) : (
                <span className="text-sm text-gray-400">Previous</span>
              )}
              {currentPage < totalPages ? (
                <Link href={queryWithPage(currentPage + 1)} className="syro-primary-button inline-flex items-center gap-2">
                  Next
                </Link>
              ) : (
                <span className="text-sm text-gray-400">Next</span>
              )}
            </div>
          </div>

          <h3 className="text-2xl font-light text-[#798daf] mb-10 pl-8 border-l-[7px] border-syro-red">
            Church Resources
          </h3>

          <DownloadCardGrid items={staticCards} keyPrefix="static" />

          <QuickLinks />
        </div>
      </section>
    </div>
  );
}

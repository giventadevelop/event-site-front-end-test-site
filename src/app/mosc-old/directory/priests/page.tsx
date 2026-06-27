import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { getPriestsData } from './getPriestsData';
import type { Priest } from './types';

export const metadata: Metadata = {
  title: 'Priests | Directory | Malankara Orthodox Syrian Church',
  description: 'Directory of priests of the Malankara Orthodox Syrian Church.',
  keywords: ['MOSC Directory', 'Priests'],
};

const PAGE_SIZE = 20;
const BASE_PATH = '/mosc-old/directory/priests';

type PageProps = { searchParams: Promise<{ page?: string; q?: string }> };

function buildUrl(page: number, q?: string): string {
  const params = new URLSearchParams();
  if (page > 1) params.set('page', String(page));
  if (q?.trim()) params.set('q', q.trim());
  const query = params.toString();
  return query ? `${BASE_PATH}?${query}` : BASE_PATH;
}

export default async function PriestsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const nameSearch = typeof params.q === 'string' ? params.q : undefined;
  const searchTerm = nameSearch?.trim() ?? '';
  const hasSearch = searchTerm.length > 0;

  const { priests, pagination } = await getPriestsData({
    nameSearch: nameSearch?.trim() || undefined,
    page,
    pageSize: PAGE_SIZE,
  });

  const subtitle = hasSearch
    ? `${pagination.total} priest${pagination.total !== 1 ? 's' : ''} matching "${searchTerm}".`
    : `${pagination.total} priest${pagination.total !== 1 ? 's' : ''}. Data from the directory API.`;

  return (
    <div className="min-h-screen bg-background">
      <section className="relative bg-gradient-to-br from-background to-muted py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/mosc-old/directory" className="font-body text-primary hover:underline mb-4 inline-block">← Directory</Link>
          <h1 className="font-heading font-semibold text-3xl lg:text-4xl text-foreground">Priests</h1>
          <p className="font-body text-muted-foreground mt-2">{subtitle}</p>
        </div>
      </section>

      <section className="py-12 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6" role="search" aria-label="Search priests by name">
            <form method="get" action={BASE_PATH} className="flex flex-wrap gap-2 items-center">
              <label htmlFor="priests-name-search" className="sr-only">Search by name</label>
              <input
                id="priests-name-search"
                type="search"
                name="q"
                defaultValue={nameSearch ?? ''}
                placeholder="Search by name..."
                className="font-body flex-1 min-w-[200px] px-4 py-2 border border-border rounded-lg bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              />
              <button type="submit" className="font-body font-medium px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 reverent-transition">
                Search
              </button>
              {hasSearch && (
                <Link href={BASE_PATH} className="font-body text-sm text-muted-foreground hover:text-primary hover:underline">
                  Clear search
                </Link>
              )}
            </form>
          </div>

          {priests.length === 0 ? (
            <div className="bg-muted/20 rounded-lg p-8 text-center">
              <p className="font-body text-muted-foreground">No priests listed yet. Data is loaded from the directory API.</p>
              <Link href="/mosc-old/directory" className="font-body text-primary font-medium mt-4 inline-block hover:underline">Back to Directory</Link>
            </div>
          ) : (
            <>
              <ul className="space-y-6">
                {priests.map((p) => (
                  <PriestCard key={p.documentId} priest={p} />
                ))}
              </ul>
              {pagination.pageCount > 1 && (
                <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
                  <span className="font-body text-sm text-muted-foreground">Page {pagination.page} of {pagination.pageCount}</span>
                  <div className="flex gap-3">
                    {pagination.page > 1 && (
                      <Link href={buildUrl(pagination.page - 1, nameSearch)} className="px-4 py-2 bg-primary/10 text-primary font-body font-medium rounded-lg hover:bg-primary/20 reverent-transition">Previous</Link>
                    )}
                    {pagination.page < pagination.pageCount && (
                      <Link href={buildUrl(pagination.page + 1, nameSearch)} className="px-4 py-2 bg-primary/10 text-primary font-body font-medium rounded-lg hover:bg-primary/20 reverent-transition">Next</Link>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function PriestCard({ priest }: { priest: Priest }) {
  return (
    <li className="bg-muted/20 rounded-lg p-6 sacred-shadow-sm border-l-4 border-primary hover:sacred-shadow reverent-transition">
      <Link href={`/mosc-old/directory/priests/${priest.documentId}`} className="flex gap-4 group">
        {priest.imageUrl && (
          <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted/40">
            <Image src={priest.imageUrl} alt={priest.imageAlt ?? priest.name} fill className="object-cover" sizes="80px" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h2 className="font-heading font-semibold text-xl text-foreground group-hover:text-primary reverent-transition">
            {priest.title ? `${priest.title} ${priest.name}` : priest.name}
          </h2>
          {priest.dioceseName && <p className="font-body text-sm text-muted-foreground mt-1">{priest.dioceseName}</p>}
          {priest.parishName && <p className="font-body text-sm text-muted-foreground">Vicar, {priest.parishName}</p>}
          <span className="inline-flex items-center font-body text-primary text-sm font-medium mt-2">
            View details
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </span>
        </div>
      </Link>
    </li>
  );
}

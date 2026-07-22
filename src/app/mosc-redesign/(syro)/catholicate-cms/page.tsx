import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';
import LiveUrlSearch from '../components/LiveUrlSearch';
import { MoscHubCardMedia } from '../components/MoscHubCardMedia';
import DirectoryPagination from '../directory/components/DirectoryPagination';
import { DIRECTORY_PAGE_SIZE } from '../directory/types/listPagination';
import { buildCmsListUrl } from '../lib/cmsListUrl';
import {
  MOSC_REDESIGN_CARD,
  MOSC_REDESIGN_CARD_HOVER,
  MOSC_REDESIGN_CONTAINER,
  MOSC_REDESIGN_PAGE_SECTION,
  MOSC_REDESIGN_PRIMARY_BUTTON,
} from '@/lib/mosc-redesign-design-tokens';
import { getCatholicateEntriesData } from './getCatholicateEntriesData';
import { isCatholicateIntroEntry } from './types';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'The Catholicate',
  description:
    'The Catholicate of the Malankara Orthodox Syrian Church — history, spiritual leadership, and the succession of Catholicoi of the East in Malankara.',
};

const STATIC_INTRO_EXCERPT =
  "The word 'Catholicos' means \"the general head\" or \"general bishop\". It can be considered as equivalent to \"universal Bishop\". This title and rank is much more ancient than the title Patriarch in the church. In the ministry of the early church there were only three ranks: Episcopos (Bishop), Priest and Deacon. By the end of the third century certain bishops of important cities gained pre-eminence and came to be known as Metropolitans. The same rank in the Churches outside the Roman Empire was called Catholicos. There were three ancient Catholicates: the Catholicate of the East (Persia), the Catholicate of Armenia and the Catholicate of Georgia.";

const PLACEHOLDER_IMAGE = '/images/catholicate/Catholicos-1.jpg';
const BASE_PATH = '/mosc-redesign/catholicate-cms';

const ReadMoreIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

export default async function CatholicateCmsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const nameSearch = typeof params.q === 'string' ? params.q : undefined;
  const searchTerm = nameSearch?.trim() ?? '';
  const hasSearch = searchTerm.length > 0;

  const [{ entries: allEntries }, { entries: cardEntries, pagination }] = await Promise.all([
    getCatholicateEntriesData({ loadAll: true }),
    getCatholicateEntriesData({
      nameSearch: searchTerm || undefined,
      page,
      pageSize: DIRECTORY_PAGE_SIZE,
      excludeIntro: true,
    }),
  ]);

  const introEntry = allEntries.find((entry) => isCatholicateIntroEntry(entry));
  const introExcerpt = introEntry?.excerpt ?? STATIC_INTRO_EXCERPT;
  const introReadMoreHref = introEntry
    ? `/mosc-redesign/catholicate-cms/${introEntry.slug}`
    : '/mosc-redesign/catholicate-intro';

  const subtitle = hasSearch
    ? `${pagination.total} entr${pagination.total !== 1 ? 'ies' : 'y'} matching "${searchTerm}".`
    : `${pagination.total} entr${pagination.total !== 1 ? 'ies' : 'y'}.`;

  return (
    <div className="bg-parchment font-dm-sans text-warmGray-dark">
      <SyroPageBanner title="The Catholicate" breadcrumbFrom="home" />

      <section className={MOSC_REDESIGN_PAGE_SECTION}>
        <div className={MOSC_REDESIGN_CONTAINER}>
          <div className={`${MOSC_REDESIGN_CARD} ${MOSC_REDESIGN_CARD_HOVER} p-6 md:p-10 mb-12 md:mb-16`}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              <div className="lg:col-span-4 flex justify-center">
                <div className="relative w-full max-w-[200px] aspect-square rounded-xl overflow-hidden border border-burgundy/25 bg-parchment-deep shadow-sm">
                  <Image
                    src="/images/logos/Current_Edits/MOSC-Logo-only.png"
                    alt="The Catholicate"
                    fill
                    className="object-contain p-2"
                    sizes="200px"
                  />
                </div>
              </div>
              <div className="lg:col-span-8">
                <span className="inline-block text-burgundy text-xs font-bold tracking-widest uppercase mb-3 border border-burgundy/30 px-3 py-1 rounded-full bg-burgundy/10">
                  Introduction
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-warmBrown-dark mb-4 leading-tight">
                  The Catholicate of the{' '}
                  <span className="text-burgundy">Malankara Orthodox Syrian Church</span>
                </h2>
                <p className="text-base leading-relaxed text-warmGray-dark mb-6">
                  <strong className="text-warmBrown-dark">Introduction</strong> — {introExcerpt}
                </p>
                <Link href={introReadMoreHref} className={MOSC_REDESIGN_PRIMARY_BUTTON}>
                  <span>Read more</span>
                  <ReadMoreIcon />
                </Link>
              </div>
            </div>
          </div>

          <div className="mb-6 md:mb-8">
            <span className="text-burgundy text-xs font-bold tracking-widest uppercase">Succession</span>
            <h3 className="mt-2 text-2xl md:text-3xl font-bold text-warmBrown-dark border-l-4 border-burgundy pl-4">
              Catholicos of the East in Malankara
            </h3>
            <p className="mt-4 text-base text-warmGray-dark">{subtitle}</p>
          </div>

          <div className="mb-8">
            <LiveUrlSearch
              id="catholicate-cms-search"
              ariaLabel="Search Catholicate entries by name"
              placeholder="Search by name..."
              inputClassName="font-dm-sans w-full px-4 py-2 border border-burgundy/25 rounded-lg bg-parchment-light text-warmBrown-dark placeholder:text-warmGray-dark/70 focus:outline-none focus:ring-2 focus:ring-burgundy focus:ring-offset-2"
            />
          </div>

          {cardEntries.length === 0 ? (
            <p className="text-base text-warmGray-dark mb-12">
              {hasSearch
                ? 'No Catholicate entries match your search.'
                : 'No Catholicate entries are available at this time. Please check back later.'}
            </p>
          ) : (
            <>
              <div className="catholicate-card-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-4">
                {cardEntries.map((entry) => {
                  const href = `/mosc-redesign/catholicate-cms/${entry.slug}`;
                  const imageSrc = entry.imageUrl ?? PLACEHOLDER_IMAGE;
                  const cardTitle = entry.subtitle
                    ? `${entry.name}, ${entry.subtitle}`
                    : entry.name;

                  return (
                    <article
                      key={entry.documentId || entry.slug}
                      className="group flex flex-col h-full rounded-xl border border-burgundy/20 bg-parchment-light p-6 shadow-[0_2px_8px_rgba(61,13,13,0.08)] transition-all duration-300 hover:border-burgundy/50 hover:shadow-[0_8px_24px_rgba(192,40,74,0.16)] hover:-translate-y-1"
                    >
                      <MoscHubCardMedia
                        src={imageSrc}
                        alt={entry.imageAlt ?? entry.name}
                        objectPosition="top"
                        unoptimized={Boolean(entry.imageUrl?.startsWith('http'))}
                        padded={false}
                        outerClassName="-mx-1"
                        frameClassName="bg-parchment-light ring-0"
                      />
                      <h3 className="text-lg font-semibold mb-3 leading-snug transition-colors">
                        {cardTitle}
                      </h3>
                      {entry.excerpt ? (
                        <p className="text-sm md:text-base text-warmGray-dark flex-1 mb-5 leading-relaxed">
                          {entry.excerpt}
                        </p>
                      ) : null}
                      <Link href={href} className={`${MOSC_REDESIGN_PRIMARY_BUTTON} mt-auto w-fit`}>
                        <span>Read more</span>
                        <ReadMoreIcon />
                      </Link>
                    </article>
                  );
                })}
              </div>
              <DirectoryPagination
                page={pagination.page}
                pageCount={pagination.pageCount}
                total={pagination.total}
                pageSize={DIRECTORY_PAGE_SIZE}
                itemsOnPage={cardEntries.length}
                buildPageHref={(p) => buildCmsListUrl(BASE_PATH, p, nameSearch)}
                itemLabel="entries"
                emptyLabel="No entries found"
              />
            </>
          )}

          <div className="mt-16">
            <QuickLinks />
          </div>
        </div>
      </section>
    </div>
  );
}

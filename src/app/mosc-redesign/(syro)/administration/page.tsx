import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';
import LiveUrlSearch from '../components/LiveUrlSearch';
import { MoscHubCardMedia } from '../components/MoscHubCardMedia';
import DirectoryPagination from '../directory/components/DirectoryPagination';
import { DIRECTORY_PAGE_SIZE } from '../directory/types/listPagination';
import { buildCmsListUrl } from '../lib/cmsListUrl';
import { ADMINISTRATION_PAGE_CARDS } from '@/components/mosc-redesign/administrationCards';

export const metadata = {
  title: 'Administration',
  description:
    'Administration of the Malankara Orthodox Church — Constitution, Canon Law, Holy Episcopal Synod, Malankara Association, Managing Committee, and parish-level structures.',
};

const BASE_PATH = '/mosc-redesign/administration';

export default async function AdministrationPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const nameSearch = typeof params.q === 'string' ? params.q : undefined;
  const searchTerm = nameSearch?.trim() ?? '';
  const hasSearch = searchTerm.length > 0;

  const filtered = hasSearch
    ? ADMINISTRATION_PAGE_CARDS.filter((card) =>
        card.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : ADMINISTRATION_PAGE_CARDS;

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / DIRECTORY_PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * DIRECTORY_PAGE_SIZE;
  const adminCards = filtered.slice(start, start + DIRECTORY_PAGE_SIZE);

  const subtitle = hasSearch
    ? `${total} topic${total !== 1 ? 's' : ''} matching "${searchTerm}".`
    : `${total} topic${total !== 1 ? 's' : ''}.`;

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="Administration" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-syro-red/5 p-10 rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] mb-16 border-l-4 border-syro-red">
            <p className="font-syro-primary text-xl text-syro-dark-gray leading-relaxed">
              The Malankara Orthodox Syrian Church is administered according to its Constitution,
              Canon Law, and the structures of the Holy Episcopal Synod, Malankara Association,
              Managing Committee, Working Committee, and bodies at diocesan and parish levels.
            </p>
          </div>

          <h3 className="text-2xl font-light text-[#798daf] mb-4 pl-8 border-l-[7px] border-syro-red">
            Constitution & Structure
          </h3>
          <p className="font-syro-primary text-syro-dark-gray mb-6">{subtitle}</p>

          <div className="mb-8">
            <LiveUrlSearch
              id="administration-name-search"
              ariaLabel="Search administration topics by name"
              placeholder="Search by name..."
              inputClassName="font-syro-primary w-full px-4 py-2 border border-syro-table-border rounded-lg bg-white text-syro-blue placeholder:text-syro-dark-gray focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2"
            />
          </div>

          {adminCards.length === 0 ? (
            <p className="font-syro-primary text-syro-dark-gray mb-12">
              {hasSearch
                ? 'No administration topics match your search.'
                : 'No administration topics are available at this time.'}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                {adminCards.map((card, index) => {
                  const absoluteIndex = start + index;
                  return (
                    <div
                      key={card.title}
                      className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] hover:shadow-[rgba(0,0,0,0.35)_0px_5px_15px] transition-shadow duration-300 p-8 flex flex-col h-full"
                    >
                      {absoluteIndex === 0 && !hasSearch ? (
                        <div className="mb-5 flex justify-center">
                          <Image
                            src="/images/logos/Current_Edits/MOSC-Logo-only.png"
                            alt="MOSC Logo"
                            width={120}
                            height={120}
                            className="object-contain"
                          />
                        </div>
                      ) : card.image ? (
                        <MoscHubCardMedia
                          src={card.image}
                          alt={card.imageAlt ?? card.title}
                          objectPosition="top"
                        />
                      ) : null}
                      <h3 className="font-syro-display text-xl font-semibold text-syro-blue mb-4 leading-snug">
                        {card.title}
                      </h3>
                      <p className="font-syro-primary text-base text-syro-dark-gray flex-1 mb-5 leading-relaxed">
                        {card.excerpt}
                      </p>
                      <Link
                        href={card.href}
                        className="syro-primary-button inline-flex items-center gap-2 mt-auto w-fit"
                      >
                        <span>Read More</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </Link>
                    </div>
                  );
                })}
              </div>
              <DirectoryPagination
                page={safePage}
                pageCount={pageCount}
                total={total}
                pageSize={DIRECTORY_PAGE_SIZE}
                itemsOnPage={adminCards.length}
                buildPageHref={(p) => buildCmsListUrl(BASE_PATH, p, nameSearch)}
                itemLabel="topics"
                emptyLabel="No topics found"
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

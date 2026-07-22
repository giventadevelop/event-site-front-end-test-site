import React from 'react';
import Link from 'next/link';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';
import LiveUrlSearch from '../components/LiveUrlSearch';
import { MoscHubCardMedia } from '../components/MoscHubCardMedia';
import DirectoryPagination from '../directory/components/DirectoryPagination';
import { DIRECTORY_PAGE_SIZE } from '../directory/types/listPagination';
import { getSpiritualOrganisationsData } from './getSpiritualOrganisationData';
import type { SpiritualOrganisationEntry } from './types';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Spiritual Organizations | MOSC',
  description:
    'Discover the various spiritual organizations and ministries of the Malankara Orthodox Syrian Church.',
};

const BANNER_DESCRIPTION =
  'Each organization plays a vital role in nurturing faith, providing education, and serving the community through various ministries and programs.';

const PLACEHOLDER_LOGO = '/images/logos/Current_Edits/MOSC-Logo-only.png';
const BASE_PATH = '/mosc-redesign/spiritual-organizations-cms';

function buildUrl(page: number, q?: string): string {
  const params = new URLSearchParams();
  if (page > 1) params.set('page', String(page));
  if (q?.trim()) params.set('q', q.trim());
  const query = params.toString();
  return query ? `${BASE_PATH}?${query}` : BASE_PATH;
}

function cardExcerpt(description: string | null): string {
  if (!description?.trim()) return '';
  const firstBlock = description.split('\n\n')[0]?.trim() ?? description.trim();
  return firstBlock.length > 280 ? `${firstBlock.slice(0, 277)}...` : firstBlock;
}

export default async function SpiritualOrganizationsCmsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const nameSearch = typeof params.q === 'string' ? params.q : undefined;
  const searchTerm = nameSearch?.trim() ?? '';
  const hasSearch = searchTerm.length > 0;

  const { entries, pagination } = await getSpiritualOrganisationsData({
    nameSearch: searchTerm || undefined,
    page,
    pageSize: DIRECTORY_PAGE_SIZE,
  });

  const subtitle = hasSearch
    ? `${pagination.total} organizatio${pagination.total !== 1 ? 'ns' : 'n'} matching "${searchTerm}".`
    : `${pagination.total} organizatio${pagination.total !== 1 ? 'ns' : 'n'}.`;

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Spiritual Organizations"
        breadcrumbFrom="spiritual-organizations-cms"
        description={BANNER_DESCRIPTION}
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-light text-[#798daf] mb-4 pl-8 border-l-[7px] border-syro-red">
            Spiritual Organizations &amp; Ministries
          </h3>
          <p className="font-syro-primary text-syro-dark-gray mb-6">{subtitle}</p>

          <div className="mb-8">
            <LiveUrlSearch
              id="cms-spiritual-name-search"
              ariaLabel="Search spiritual organizations by name"
              placeholder="Search by name..."
              inputClassName="font-syro-primary w-full px-4 py-2 border border-syro-table-border rounded-lg bg-white text-syro-blue placeholder:text-syro-dark-gray focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2"
            />
          </div>

          {entries.length === 0 ? (
            <p className="font-syro-primary text-syro-dark-gray mb-12">
              {hasSearch
                ? 'No spiritual organizations match your search.'
                : 'No spiritual organizations are available at this time. Please check back later.'}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                {entries.map((org) => (
                  <OrgCard key={org.documentId || org.slug} org={org} />
                ))}
              </div>
              <DirectoryPagination
                page={pagination.page}
                pageCount={pagination.pageCount}
                total={pagination.total}
                pageSize={DIRECTORY_PAGE_SIZE}
                itemsOnPage={entries.length}
                buildPageHref={(p) => buildUrl(p, nameSearch)}
                itemLabel="organisations"
                emptyLabel="No organisations found"
              />
            </>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12 mt-16">
            <div>
              <h2 className="font-syro-display font-semibold text-3xl text-syro-blue mb-6">
                The Role of Spiritual Organizations
              </h2>
              <div className="space-y-4 font-syro-primary text-syro-dark-gray leading-relaxed">
                <p>
                  Spiritual organizations within the Malankara Orthodox Syrian Church serve as vital
                  instruments of faith, education, and community service. Each organization is dedicated
                  to specific aspects of spiritual growth and social welfare.
                </p>
                <p>
                  These organizations provide structured programs for different age groups and interests,
                  from children&apos;s ministries to adult education, from charitable work to theological
                  training. They help maintain the rich traditions of our Orthodox faith while adapting
                  to contemporary needs.
                </p>
                <p>
                  Through their various activities, these organizations strengthen the bonds within
                  our community and extend the love of Christ to those in need, both within and
                  outside our church family.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-6">
              <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-4">
                Key Areas of Ministry
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-syro-red text-xl" role="img" aria-label="Education">
                    📚
                  </span>
                  <div>
                    <h4 className="font-syro-display font-medium text-syro-blue">Education & Formation</h4>
                    <p className="font-syro-primary text-syro-dark-gray text-sm">
                      Sunday schools, theological training, and spiritual education
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-syro-red text-xl" role="img" aria-label="Youth">
                    🌟
                  </span>
                  <div>
                    <h4 className="font-syro-display font-medium text-syro-blue">Youth & Student Ministries</h4>
                    <p className="font-syro-primary text-syro-dark-gray text-sm">
                      Programs for young people and students
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-syro-red text-xl" role="img" aria-label="Women">
                    👩
                  </span>
                  <div>
                    <h4 className="font-syro-display font-medium text-syro-blue">Women&apos;s Ministries</h4>
                    <p className="font-syro-primary text-syro-dark-gray text-sm">
                      Organizations supporting women&apos;s spiritual growth
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-syro-red text-xl" role="img" aria-label="Charity">
                    🤝
                  </span>
                  <div>
                    <h4 className="font-syro-display font-medium text-syro-blue">Charitable Work</h4>
                    <p className="font-syro-primary text-syro-dark-gray text-sm">
                      Serving the community and those in need
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-syro-red text-xl" role="img" aria-label="Mission">
                    🌍
                  </span>
                  <div>
                    <h4 className="font-syro-display font-medium text-syro-blue">Mission & Outreach</h4>
                    <p className="font-syro-primary text-syro-dark-gray text-sm">
                      Spreading the Gospel and serving globally
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <QuickLinks />
        </div>
      </section>
    </div>
  );
}

function OrgCard({ org }: { org: SpiritualOrganisationEntry }) {
  const href = `${BASE_PATH}/${org.slug}`;
  const excerpt = cardExcerpt(org.description);
  const imageSrc = org.imageUrl ?? PLACEHOLDER_LOGO;
  return (
    <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] hover:shadow-[rgba(0,0,0,0.35)_0px_5px_15px] transition-shadow duration-300 overflow-hidden flex flex-col h-full">
      <MoscHubCardMedia
        src={imageSrc}
        alt={org.imageAlt ?? org.name}
        unoptimized={Boolean(org.imageUrl?.startsWith('http'))}
      />
      <div className="p-8 pt-0 flex flex-col flex-1">
        <h3 className="font-syro-display text-xl font-semibold text-syro-blue mb-4 leading-snug">
          {org.name}
        </h3>
        {excerpt ? (
          <p className="font-syro-primary text-base text-syro-dark-gray flex-1 mb-5 leading-relaxed line-clamp-4">
            {excerpt}
          </p>
        ) : (
          <div className="flex-1 mb-5" />
        )}
        <Link href={href} className="syro-primary-button inline-flex items-center gap-2 mt-auto w-fit">
          <span>Read More</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

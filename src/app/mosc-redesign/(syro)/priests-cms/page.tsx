import React from 'react';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';
import LiveUrlSearch from '../components/LiveUrlSearch';
import { MoscCmsHubCard, cardExcerpt } from '../components/MoscCmsHubCard';
import DirectoryPagination from '../directory/components/DirectoryPagination';
import { DIRECTORY_PAGE_SIZE } from '../directory/types/listPagination';
import { getPriestsData } from '../directory/priests/getPriestsData';
import { formatPriestDisplayName } from '../directory/priests/types';
import { buildCmsListUrl } from '../lib/cmsListUrl';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Priests | MOSC',
  description: 'Directory of priests of the Malankara Orthodox Syrian Church.',
};

const BASE_PATH = '/mosc-redesign/priests-cms';
const DETAIL_BASE = '/mosc-redesign/directory/priests';

export default async function PriestsCmsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const nameSearch = typeof params.q === 'string' ? params.q : undefined;
  const searchTerm = nameSearch?.trim() ?? '';
  const hasSearch = searchTerm.length > 0;

  const { priests, pagination } = await getPriestsData({
    nameSearch: searchTerm || undefined,
    page,
    pageSize: DIRECTORY_PAGE_SIZE,
  });

  const subtitle = hasSearch
    ? `${pagination.total} priest${pagination.total !== 1 ? 's' : ''} matching "${searchTerm}".`
    : `${pagination.total} priest${pagination.total !== 1 ? 's' : ''}.`;

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Priests"
        breadcrumbFrom="directory"
        description="Priests of the Malankara Orthodox Syrian Church serving parishes and dioceses."
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-light text-[#798daf] mb-4 pl-8 border-l-[7px] border-syro-red">
            Our Priests
          </h3>
          <p className="font-syro-primary text-syro-dark-gray mb-6">{subtitle}</p>

          <div className="mb-8">
            <LiveUrlSearch
              id="cms-priests-name-search"
              ariaLabel="Search priests by name"
              placeholder="Search by name..."
              inputClassName="font-syro-primary w-full px-4 py-2 border border-syro-table-border rounded-lg bg-white text-syro-blue placeholder:text-syro-dark-gray focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2"
            />
          </div>

          {priests.length === 0 ? (
            <p className="font-syro-primary text-syro-dark-gray mb-12">
              {hasSearch ? 'No priests match your search.' : 'No priests are available at this time.'}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                {priests.map((priest) => {
                  const bits = [
                    priest.dioceseName,
                    priest.parishName ? `Vicar, ${priest.parishName}` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ');
                  return (
                    <MoscCmsHubCard
                      key={priest.documentId}
                      href={`${DETAIL_BASE}/${priest.documentId}`}
                      title={formatPriestDisplayName(priest.title, priest.name)}
                      excerpt={cardExcerpt(bits || null)}
                      imageUrl={priest.imageUrl}
                      imageAlt={priest.imageAlt}
                    />
                  );
                })}
              </div>
              <DirectoryPagination
                page={pagination.page}
                pageCount={pagination.pageCount}
                total={pagination.total}
                pageSize={DIRECTORY_PAGE_SIZE}
                itemsOnPage={priests.length}
                buildPageHref={(p) => buildCmsListUrl(BASE_PATH, p, nameSearch)}
                itemLabel="priests"
                emptyLabel="No priests found"
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

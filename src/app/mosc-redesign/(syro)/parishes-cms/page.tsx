import React from 'react';
import Link from 'next/link';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';
import LiveUrlSearch from '../components/LiveUrlSearch';
import { MoscCmsHubCard, cardExcerpt } from '../components/MoscCmsHubCard';
import DirectoryPagination from '../directory/components/DirectoryPagination';
import { DIRECTORY_PAGE_SIZE } from '../directory/types/listPagination';
import { getParishesData } from '../directory/parishes/getParishesData';
import { getDioceseByDocumentId } from '../directory/dioceses/getDiocesesData';
import { buildCmsListUrl } from '../lib/cmsListUrl';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Parishes | MOSC',
  description: 'Directory of parishes of the Malankara Orthodox Syrian Church.',
};

const BASE_PATH = '/mosc-redesign/parishes-cms';
const DETAIL_BASE = '/mosc-redesign/directory/parishes';

export default async function ParishesCmsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; diocese?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const nameSearch = typeof params.q === 'string' ? params.q : undefined;
  const dioceseParam = typeof params.diocese === 'string' ? params.diocese.trim() : '';
  const dioceseForFilter = dioceseParam.length > 0 ? dioceseParam : undefined;
  const dioceseRecord = dioceseForFilter ? await getDioceseByDocumentId(dioceseForFilter) : null;
  const searchTerm = nameSearch?.trim() ?? '';
  const hasParishSearch = searchTerm.length > 0;
  const hasDioceseScope = Boolean(dioceseForFilter);

  const { parishes, pagination } = await getParishesData({
    nameSearch: searchTerm || undefined,
    dioceseDocumentId: dioceseForFilter,
    page,
    pageSize: DIRECTORY_PAGE_SIZE,
  });

  const n = pagination.total;
  const parishWord = n === 1 ? 'parish' : 'parishes';
  let subtitle = `${n} ${parishWord}.`;
  if (hasParishSearch && hasDioceseScope && dioceseRecord) {
    subtitle = `${n} ${parishWord} matching "${searchTerm}" under ${dioceseRecord.name}.`;
  } else if (hasParishSearch) {
    subtitle = `${n} ${parishWord} matching "${searchTerm}".`;
  } else if (hasDioceseScope && dioceseRecord) {
    subtitle = `${n} ${parishWord} under ${dioceseRecord.name}.`;
  }

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Parishes"
        breadcrumbFrom="directory"
        hideBreadcrumbNav={hasDioceseScope}
        description="Local parish communities of the Malankara Orthodox Syrian Church."
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-light text-[#798daf] mb-4 pl-8 border-l-[7px] border-syro-red">
            Our Parishes
          </h3>
          <p className="font-syro-primary text-syro-dark-gray mb-6">{subtitle}</p>

          <div className="mb-8 space-y-3" role="search" aria-label="Search parishes">
            <LiveUrlSearch
              id="cms-parishes-name-search"
              ariaLabel="Search parishes by name"
              placeholder="Search by name..."
              preserveParams={dioceseForFilter ? ['diocese'] : []}
              inputClassName="font-syro-primary w-full px-4 py-2 border border-syro-table-border rounded-lg bg-white text-syro-blue placeholder:text-syro-dark-gray focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2"
            />
            {hasDioceseScope && dioceseForFilter && !hasParishSearch ? (
              <Link
                href={BASE_PATH}
                className="font-syro-primary text-sm text-syro-dark-gray hover:text-syro-red hover:underline inline-block"
              >
                Clear diocese filter
              </Link>
            ) : null}
          </div>

          {parishes.length === 0 ? (
            <p className="font-syro-primary text-syro-dark-gray mb-12">
              {hasDioceseScope && dioceseRecord
                ? `No parishes match your search in ${dioceseRecord.name}.`
                : hasParishSearch
                  ? 'No parishes match your search.'
                  : 'No parishes are available at this time.'}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                {parishes.map((parish) => {
                  const locationParts = [parish.addressLine1, parish.city, parish.state].filter(Boolean);
                  const locationLine = locationParts.length
                    ? locationParts.join(', ')
                    : parish.address ?? null;
                  const bits = [parish.dioceseName, parish.vicarName ? `Vicar: ${parish.vicarName}` : null, locationLine]
                    .filter(Boolean)
                    .join(' · ');
                  return (
                    <MoscCmsHubCard
                      key={parish.documentId}
                      href={`${DETAIL_BASE}/${parish.documentId}`}
                      title={parish.name}
                      excerpt={cardExcerpt(bits || null)}
                      imageUrl={parish.imageUrl}
                      imageAlt={parish.imageAlt}
                    />
                  );
                })}
              </div>
              <DirectoryPagination
                page={pagination.page}
                pageCount={pagination.pageCount}
                total={pagination.total}
                pageSize={DIRECTORY_PAGE_SIZE}
                itemsOnPage={parishes.length}
                buildPageHref={(p) =>
                  buildCmsListUrl(BASE_PATH, p, nameSearch, {
                    diocese: dioceseForFilter,
                  })
                }
                itemLabel="parishes"
                emptyLabel="No parishes found"
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

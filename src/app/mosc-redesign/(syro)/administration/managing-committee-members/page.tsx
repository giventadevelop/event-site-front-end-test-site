import React from 'react';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';
import { MoscHubCardMedia } from '../../components/MoscHubCardMedia';
import DirectoryPagination from '../../directory/components/DirectoryPagination';
import AdministrationSidebar from '../components/AdministrationSidebar';
import { DIRECTORY_PAGE_SIZE } from '../../directory/types/listPagination';
import { buildCmsListUrl } from '../../lib/cmsListUrl';
import ManagingCommitteeMembersFilters from './ManagingCommitteeMembersFilters';
import {
  filterManagingCommitteeMembers,
  getManagingCommitteeMemberFilterOptions,
  getManagingCommitteeMembersData,
} from './getManagingCommitteeMembersData';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Managing Committee Members',
  description:
    'Current Managing Committee members of the Malankara Orthodox Syrian Church — roster with photos, roles, and dioceses.',
};

const BANNER_DESCRIPTION =
  'Members of the Malankara Association Managing Committee for the current term, including office bearers, metropolitans, and elected representatives.';

const BASE_PATH = '/mosc-redesign/administration/managing-committee-members';
const TERM_YEAR = 2026;

export default async function ManagingCommitteeMembersPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    q?: string;
    diocese?: string;
    role?: string;
    region?: string;
  }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const searchTerm = typeof params.q === 'string' ? params.q.trim() : '';
  const dioceseFilter = typeof params.diocese === 'string' ? params.diocese.trim() : '';
  const roleFilter = typeof params.role === 'string' ? params.role.trim() : '';
  const regionFilter = typeof params.region === 'string' ? params.region.trim() : '';

  const hasSearch = searchTerm.length > 0;
  const hasSelectFilter = Boolean(dioceseFilter || roleFilter || regionFilter);
  const hasAnyFilter = hasSearch || hasSelectFilter;

  // Load full roster so search can match diocese / role / region / address (not only name).
  const { members: allMembers } = await getManagingCommitteeMembersData({
    termYear: TERM_YEAR,
    isCurrent: true,
    loadAll: true,
  });

  const filterOptions = getManagingCommitteeMemberFilterOptions(allMembers);
  const filtered = filterManagingCommitteeMembers(allMembers, {
    searchTerm: searchTerm || undefined,
    diocese: dioceseFilter || undefined,
    role: roleFilter || undefined,
    region: regionFilter || undefined,
  });

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / DIRECTORY_PAGE_SIZE) || 1);
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * DIRECTORY_PAGE_SIZE;
  const members = filtered.slice(start, start + DIRECTORY_PAGE_SIZE);

  const filterBits: string[] = [];
  if (hasSearch) filterBits.push(`"${searchTerm}"`);
  if (dioceseFilter) filterBits.push(`diocese ${dioceseFilter}`);
  if (roleFilter) filterBits.push(`role ${roleFilter}`);
  if (regionFilter) filterBits.push(`region ${regionFilter}`);

  const subtitle = hasAnyFilter
    ? `${total} member${total !== 1 ? 's' : ''} matching ${filterBits.join(', ')}.`
    : `Term ${TERM_YEAR}. ${total} member${total !== 1 ? 's' : ''}.`;

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner
        title="Managing Committee Members"
        breadcrumbFrom="administration"
        description={BANNER_DESCRIPTION}
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <AdministrationSidebar currentSlug="managing-committee-members" />
            </div>

            <div className="lg:col-span-3">
              <h3 className="text-2xl font-light text-[#798daf] mb-4 pl-8 border-l-[7px] border-syro-red">
                Current Roster
              </h3>
              <p className="font-syro-primary text-syro-dark-gray mb-6">{subtitle}</p>

              <ManagingCommitteeMembersFilters
                dioceses={filterOptions.dioceses}
                roles={filterOptions.roles}
                regions={filterOptions.regions}
              />

              {members.length === 0 ? (
                <p className="font-syro-primary text-syro-dark-gray mb-12">
                  {hasAnyFilter
                    ? 'No members match your search.'
                    : 'Managing Committee member roster is not available yet.'}
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                    {members.map((member) => {
                      const hasPhoto = Boolean(member.photoUrl);
                      return (
                        <div
                          key={member.documentId || member.slug}
                          className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] hover:shadow-[rgba(0,0,0,0.35)_0px_5px_15px] transition-shadow duration-300 overflow-hidden flex flex-col h-full"
                        >
                          {hasPhoto && member.photoUrl ? (
                            <MoscHubCardMedia
                              src={member.photoUrl}
                              alt={member.photoAlt ?? member.name}
                              frame="portraitUniform"
                              objectPosition="top"
                              frameClassName="bg-white"
                              unoptimized={member.photoUrl.startsWith('http')}
                            />
                          ) : null}
                          <div
                            className={`px-4 py-8 md:p-8 flex flex-col flex-1 ${hasPhoto ? 'pt-0 md:pt-0' : ''}`}
                          >
                            <h3 className="font-syro-display text-xl font-semibold text-syro-blue mb-2 leading-snug">
                              {member.name}
                            </h3>
                            {member.role ? (
                              <p className="font-syro-primary text-sm font-medium text-syro-red mb-2">
                                {member.role}
                              </p>
                            ) : null}
                            {member.diocese ? (
                              <p className="font-syro-primary text-sm text-syro-dark-gray mb-2">
                                <span className="font-semibold text-syro-blue">Diocese:</span>{' '}
                                {member.diocese}
                              </p>
                            ) : null}
                            {member.electedRegion ? (
                              <p className="font-syro-primary text-sm text-syro-dark-gray mb-2">
                                <span className="font-semibold text-syro-blue">Elected region:</span>{' '}
                                {member.electedRegion}
                              </p>
                            ) : null}
                            {member.parish ? (
                              <p className="font-syro-primary text-sm text-syro-dark-gray mb-2">
                                <span className="font-semibold text-syro-blue">Parish:</span>{' '}
                                {member.parish}
                              </p>
                            ) : null}
                            {member.address ? (
                              <p className="font-syro-primary text-sm text-syro-dark-gray leading-relaxed whitespace-pre-line flex-1">
                                {member.address}
                              </p>
                            ) : (
                              <div className="flex-1" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <DirectoryPagination
                    page={safePage}
                    pageCount={pageCount}
                    total={total}
                    pageSize={DIRECTORY_PAGE_SIZE}
                    itemsOnPage={members.length}
                    buildPageHref={(p) =>
                      buildCmsListUrl(BASE_PATH, p, searchTerm || undefined, {
                        diocese: dioceseFilter || undefined,
                        role: roleFilter || undefined,
                        region: regionFilter || undefined,
                      })
                    }
                    itemLabel="members"
                    emptyLabel="No members found"
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <QuickLinks />
    </div>
  );
}

import React from 'react';
import Image from 'next/image';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';
import LiveUrlSearch from '../../components/LiveUrlSearch';
import AdministrationSidebar from '../components/AdministrationSidebar';
import DirectoryPagination from '../../directory/components/DirectoryPagination';
import { DIRECTORY_PAGE_SIZE } from '../../directory/types/listPagination';
import { buildCmsListUrl } from '../../lib/cmsListUrl';
import {
  filterManagingCommitteeEntries,
  getManagingCommitteesData,
  groupManagingCommitteeEntriesByDiocese,
} from './getManagingCommitteesData';
import type { ManagingCommitteeEntry } from './types';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'The Managing Committee',
  description:
    'The managing committee of the Malankara Orthodox Syrian Church — elected and nominated members from CMS.',
};

const BASE_PATH = '/mosc-redesign/administration/the-managing-committee-cms';

function MemberCard({ member }: { member: ManagingCommitteeEntry }) {
  const contactParts = [member.phones, member.email].filter(Boolean);
  return (
    <div className="font-syro-primary text-syro-dark-gray text-sm leading-relaxed">
      <p className="font-semibold text-syro-dark-gray">{member.name}</p>
      {member.address ? (
        <p className="mt-1 font-normal text-syro-dark-gray/90">{member.address}</p>
      ) : null}
      {contactParts.length > 0 ? (
        <p className="mt-1 font-normal text-syro-dark-gray/90">
          {member.phones ? <span>{member.phones}</span> : null}
          {member.phones && member.email ? <span> </span> : null}
          {member.email ? (
            <a href={`mailto:${member.email}`} className="text-syro-blue hover:underline">
              {member.email}
            </a>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}

export default async function ManagingCommitteeCmsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const nameSearch = typeof params.q === 'string' ? params.q : undefined;
  const searchTerm = nameSearch?.trim() ?? '';
  const hasSearch = searchTerm.length > 0;

  const { entries: allEntries } = await getManagingCommitteesData({ loadAll: true });
  const filtered = filterManagingCommitteeEntries(allEntries, searchTerm);
  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / DIRECTORY_PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * DIRECTORY_PAGE_SIZE;
  const pageMembers = filtered.slice(start, start + DIRECTORY_PAGE_SIZE);
  const groups = groupManagingCommitteeEntriesByDiocese(pageMembers);

  const electedGroups = groups.filter((g) => g.section === 'elected');
  const nominatedGroups = groups.filter((g) => g.section === 'nominated');
  const showElectedHeading = electedGroups.length > 0;
  const showNominatedHeading = nominatedGroups.length > 0;
  const termLabel =
    allEntries.find((e) => e.term)?.term ??
    pageMembers.find((e) => e.term)?.term ??
    '2022-2027';

  const subtitle = hasSearch
    ? `${total} member${total !== 1 ? 's' : ''} matching "${searchTerm}".`
    : `${total} member${total !== 1 ? 's' : ''}.`;

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title="The Managing Committee" breadcrumbFrom="administration" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] px-4 py-8 md:p-8">
                <div className="mb-8 flex justify-center">
                  <Image
                    src="/images/administration/managing-committee.jpg"
                    alt="The Managing Committee"
                    width={600}
                    height={360}
                    className="rounded-lg w-full max-w-md h-auto object-contain"
                    sizes="(min-width: 1024px) 37.5vw, 50vw"
                  />
                </div>

                <div className="prose prose-lg max-w-none">
                  <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-8">
                    In the Mulamthuruthy synod which formulated the Malankara association had laid
                    down the provision for the managing committee, a smaller body to look into the
                    financial and other administrative matters. The members are elected by the
                    association, two priests and four lay people representing each Diocese are
                    elected for a period of five years. Other than the elected members, a
                    proportionate number of members are nominated to the Managing Committee by the
                    Malankara Metropolitan. The members of the Working Committee are also members of
                    the Managing Committee.
                  </p>

                  <div className="bg-syro-bg-gray rounded-lg p-6 mb-8">
                    <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-2 text-center">
                      PRESENT MEMBERS OF THE COMMITTEE
                    </h2>
                    <p className="font-syro-primary text-syro-dark-gray text-center font-semibold mb-1">
                      {termLabel}
                    </p>
                    <p className="font-syro-primary text-syro-dark-gray text-center text-sm mb-4">
                      {subtitle}
                    </p>

                    <div className="mb-6 not-prose">
                      <LiveUrlSearch
                        id="managing-committee-member-search"
                        ariaLabel="Search managing committee members by name or diocese"
                        placeholder="Search by name or diocese..."
                        inputClassName="font-syro-primary w-full px-4 py-2 border border-syro-table-border rounded-lg bg-white text-syro-blue placeholder:text-syro-dark-gray focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2"
                      />
                    </div>

                    {pageMembers.length === 0 ? (
                      <p className="font-syro-primary text-syro-dark-gray text-center">
                        {hasSearch
                          ? 'No members match your search.'
                          : 'No members are available at this time.'}
                      </p>
                    ) : (
                      <>
                        {showElectedHeading ? (
                          <p className="font-syro-primary text-syro-red font-semibold text-center mb-8">
                            (ELECTED MEMBERS)
                          </p>
                        ) : null}

                        <div className="space-y-8 not-prose">
                          {electedGroups.map(({ diocese, members }) => (
                            <div key={diocese}>
                              <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-4 border-b border-syro-dark-gray/20 pb-2">
                                {diocese}
                              </h3>
                              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none pl-0 m-0">
                                {members.map((member) => (
                                  <li
                                    key={member.documentId}
                                    className="bg-white rounded-lg p-4 border border-syro-dark-gray/10 h-full"
                                  >
                                    <MemberCard member={member} />
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>

                        {showNominatedHeading
                          ? nominatedGroups.map(({ members }) => (
                              <div key="nominated" className="not-prose">
                                <h3 className="font-syro-display font-semibold text-xl text-syro-blue mt-10 mb-4 border-b border-syro-dark-gray/20 pb-2">
                                  (NOMINATED MEMBERS)
                                </h3>
                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 list-none pl-0 m-0">
                                  {members.map((member) => (
                                    <li
                                      key={member.documentId}
                                      className="bg-white rounded-lg p-4 border border-syro-dark-gray/10 h-full"
                                    >
                                      <MemberCard member={member} />
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))
                          : null}

                        <div className="mt-8 not-prose">
                          <DirectoryPagination
                            page={safePage}
                            pageCount={pageCount}
                            total={total}
                            pageSize={DIRECTORY_PAGE_SIZE}
                            itemsOnPage={pageMembers.length}
                            buildPageHref={(p) => buildCmsListUrl(BASE_PATH, p, nameSearch)}
                            itemLabel="members"
                            emptyLabel="No members found"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            <div className="space-y-6 lg:col-span-1">
              <AdministrationSidebar currentSlug="the-managing-committee-cms" />
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

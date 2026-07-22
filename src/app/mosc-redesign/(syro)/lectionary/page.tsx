import React from 'react';
import { Metadata } from 'next';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';
import LiveUrlSearch from '../components/LiveUrlSearch';
import DirectoryPagination from '../directory/components/DirectoryPagination';
import { DIRECTORY_PAGE_SIZE } from '../directory/types/listPagination';
import { buildCmsListUrl } from '../lib/cmsListUrl';
import LectionaryPeriodsGrid, { type LectionaryPeriod } from './LectionaryPeriodsGrid';

export const metadata: Metadata = {
  title: 'Lectionary | Malankara Orthodox Syrian Church',
  description:
    'The liturgical lectionary of the Malankara Orthodox Syrian Church, including scripture readings for the church year from Koodosh Eetho to Special Occasions.',
  keywords: [
    'Lectionary',
    'Scripture Readings',
    'Liturgical Calendar',
    'Orthodox Liturgy',
    'Bible Readings',
  ],
};

const BASE_PATH = '/mosc-redesign/lectionary';

const LECTIONARY_PERIODS: LectionaryPeriod[] = [
  {
    id: 'koodosh-eetho-to-kothne',
    title: 'Koodosh Eetho to Kothne',
    description:
      'Koodhosh Eetho (Sanctification) Sunday - The Sunday that comes on or after October 30th is called Koodhosh Eetho (Sanctification of Church) Sunday. It is the beginning of the church calendar. Evening...',
    image: '/images/lectionary/lent2.jpg',
    link: '/mosc-redesign/lectionary/koodosh-eetho-to-kothne',
  },
  {
    id: 'great-lent',
    title: 'Great Lent',
    description:
      'First Monday of Great Lent Morning Genesis 1: 1 - 12, Great Wisdom 7: 7 -24, Isaiah 29: 15-24, St. James 1: 2-12, Romans 1:18-25, St. Matthew 4: 1-11, Shub-khono I John 4: 11-20, I...',
    image: '/images/lectionary/lent.jpg',
    link: '/mosc-redesign/lectionary/great-lent',
  },
  {
    id: 'kyomtho-easter-to-koodosh-edtho',
    title: 'Kyomtho (Easter) to Koodosh Edtho',
    description:
      'Easter Sunday Evening St. Mark 16: 1- 8, Midnight St. Luke 24: 1-12, Morning St. John 20: 1-18, Celebration of the Holy Cross Isaiah 60: 17-22, I Peter 5: 5-14, Romans 16: 1-16, St. John 14:...',
    image: '/images/lectionary/lent1.jpg',
    link: '/mosc-redesign/lectionary/kyomtho-easter-to-koodosh-edtho',
  },
  {
    id: 'special-occasions',
    title: 'Special Occasions',
    description:
      'Memory of St. Mary for Special Feasts - Evening St. Luke 8: 16 - 21, Morning St. Mark 3: 31 -35, Before Holy Qurbana Judges 13: 2-1, Zechariah 2: 10 - 13, 4: 1-...',
    image: '/images/lectionary/sp.jpg',
    link: '/mosc-redesign/lectionary/special-occasions',
  },
];

export default async function LectionaryPage({
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
    ? LECTIONARY_PERIODS.filter((period) =>
        period.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : LECTIONARY_PERIODS;

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / DIRECTORY_PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * DIRECTORY_PAGE_SIZE;
  const periods = filtered.slice(start, start + DIRECTORY_PAGE_SIZE);

  const subtitle = hasSearch
    ? `${total} period${total !== 1 ? 's' : ''} matching "${searchTerm}".`
    : `${total} period${total !== 1 ? 's' : ''}.`;

  return (
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner
        title="Lectionary"
        breadcrumbFrom="home"
        description="The liturgical lectionary of the Malankara Orthodox Syrian Church, including scripture readings for the church year from Koodosh Eetho to Special Occasions."
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-light text-[#798daf] mb-4 pl-8 border-l-[7px] border-syro-red">
            Lectionary Periods
          </h3>
          <p className="font-syro-primary text-syro-dark-gray mb-6">{subtitle}</p>

          <div className="mb-8">
            <LiveUrlSearch
              id="lectionary-name-search"
              ariaLabel="Search lectionary periods by name"
              placeholder="Search by name..."
              inputClassName="font-syro-primary w-full px-4 py-2 border border-syro-table-border rounded-lg bg-white text-syro-blue placeholder:text-syro-dark-gray focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2"
            />
          </div>

          {periods.length === 0 ? (
            <p className="font-syro-primary text-syro-dark-gray mb-12">
              {hasSearch
                ? 'No lectionary periods match your search.'
                : 'No lectionary periods are available at this time.'}
            </p>
          ) : (
            <>
              <LectionaryPeriodsGrid periods={periods} />
              <DirectoryPagination
                page={safePage}
                pageCount={pageCount}
                total={total}
                pageSize={DIRECTORY_PAGE_SIZE}
                itemsOnPage={periods.length}
                buildPageHref={(p) => buildCmsListUrl(BASE_PATH, p, nameSearch)}
                itemLabel="periods"
                emptyLabel="No periods found"
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

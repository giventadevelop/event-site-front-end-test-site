import React from 'react';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';
import LiveUrlSearch from '../components/LiveUrlSearch';
import { MoscCmsHubCard } from '../components/MoscCmsHubCard';
import DirectoryPagination from '../directory/components/DirectoryPagination';
import { DIRECTORY_PAGE_SIZE } from '../directory/types/listPagination';
import { buildCmsListUrl } from '../lib/cmsListUrl';
import { DEFAULT_IMAGE_BY_SLUG, getTrainingProgramsData } from './getTrainingProgramsData';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Training | Malankara Orthodox Syrian Church',
  description:
    'Training programs of the Malankara Orthodox Syrian Church including Sruti School of Liturgical Music, Divyabodhanam theological education, and St. Basil Bible School.',
  keywords: [
    'MOSC Training',
    'Liturgical Music',
    'Theological Education',
    'Bible School',
    'Divyabodhanam',
    'Sruti',
  ],
};

const BANNER_DESCRIPTION =
  'Equipping the faithful with theological knowledge, liturgical understanding, and biblical wisdom through comprehensive training programs.';

const BASE_PATH = '/mosc-redesign/training-cms';

export default async function TrainingCmsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page ?? '1', 10) || 1);
  const nameSearch = typeof params.q === 'string' ? params.q : undefined;
  const searchTerm = nameSearch?.trim() ?? '';
  const hasSearch = searchTerm.length > 0;

  const { entries, pagination } = await getTrainingProgramsData({
    nameSearch: searchTerm || undefined,
    page,
    pageSize: DIRECTORY_PAGE_SIZE,
  });

  const subtitle = hasSearch
    ? `${pagination.total} program${pagination.total !== 1 ? 's' : ''} matching "${searchTerm}".`
    : `${pagination.total} program${pagination.total !== 1 ? 's' : ''}.`;

  return (
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner title="Training" breadcrumbFrom="home" description={BANNER_DESCRIPTION} />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-light text-[#798daf] mb-4 pl-8 border-l-[7px] border-syro-red">
            Training Programs
          </h3>
          <p className="font-syro-primary text-syro-dark-gray mb-6">{subtitle}</p>

          <div className="mb-8">
            <LiveUrlSearch
              id="cms-training-name-search"
              ariaLabel="Search training programs by name"
              placeholder="Search by name..."
              inputClassName="font-syro-primary w-full px-4 py-2 border border-syro-table-border rounded-lg bg-white text-syro-blue placeholder:text-syro-dark-gray focus:outline-none focus:ring-2 focus:ring-syro-red focus:ring-offset-2"
            />
          </div>

          {entries.length === 0 ? (
            <p className="font-syro-primary text-syro-dark-gray mb-12">
              {hasSearch
                ? 'No training programs match your search.'
                : 'No training programs are available at this time.'}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
                {entries.map((program) => {
                  const imageSrc =
                    program.imageUrl ??
                    DEFAULT_IMAGE_BY_SLUG[program.slug] ??
                    '/images/training/sruti.jpg';
                  return (
                    <MoscCmsHubCard
                      key={program.documentId || program.slug}
                      href={`/mosc-redesign/training-cms/${program.slug}`}
                      title={program.name}
                      excerpt={program.excerpt}
                      imageUrl={imageSrc}
                      imageAlt={program.imageAlt}
                      ctaLabel="Learn More"
                    />
                  );
                })}
              </div>
              <DirectoryPagination
                page={pagination.page}
                pageCount={pagination.pageCount}
                total={pagination.total}
                pageSize={DIRECTORY_PAGE_SIZE}
                itemsOnPage={entries.length}
                buildPageHref={(p) => buildCmsListUrl(BASE_PATH, p, nameSearch)}
                itemLabel="programs"
                emptyLabel="No programs found"
              />
            </>
          )}

          <div className="max-w-3xl mx-auto text-center mb-12 mt-16">
            <h2 className="font-syro-display font-semibold text-3xl text-syro-blue mb-6">
              Empowering the Faithful
            </h2>
            <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed mb-6">
              Our training programs are designed to deepen understanding of Orthodox theology, enhance
              liturgical participation, and strengthen biblical knowledge among clergy and laity alike.
            </p>
            <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed">
              Through systematic education and practical training, we equip members of our church to
              serve more effectively and to share their faith with confidence and wisdom.
            </p>
          </div>

          <div className="text-center mb-12">
            <h2 className="font-syro-display font-semibold text-3xl text-syro-blue mb-4">
              Why Participate in Training
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-syro-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-syro-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5.002 5.002 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h3 className="font-syro-display font-medium text-xl text-syro-blue mb-3">Deepen Faith</h3>
              <p className="font-syro-primary text-syro-dark-gray leading-relaxed">
                Gain deeper understanding of Orthodox theology and tradition
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-syro-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-syro-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <h3 className="font-syro-display font-medium text-xl text-syro-blue mb-3">Serve Better</h3>
              <p className="font-syro-primary text-syro-dark-gray leading-relaxed">
                Develop skills to serve the church and community more effectively
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-syro-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-syro-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              <h3 className="font-syro-display font-medium text-xl text-syro-blue mb-3">Grow Spiritually</h3>
              <p className="font-syro-primary text-syro-dark-gray leading-relaxed">
                Enhance personal spiritual growth through structured learning
              </p>
            </div>
          </div>

          <QuickLinks />
        </div>
      </section>
    </div>
  );
}

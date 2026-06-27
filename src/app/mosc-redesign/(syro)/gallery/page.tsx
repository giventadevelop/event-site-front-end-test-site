import React, { Suspense } from 'react';
import { Metadata } from 'next';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';
import { MoscGalleryContent } from './components/MoscGalleryContent';

export const metadata: Metadata = {
  title: 'Photo Gallery | Malankara Orthodox Syrian Church',
  description:
    'Photo gallery of significant events, ecumenical visits, and ceremonies of the Malankara Orthodox Syrian Church.',
  keywords: ['MOSC Gallery', 'Photo Gallery', 'Church Events', 'Ecumenical Visits', 'Orthodox Church'],
};

const BANNER_DESCRIPTION =
  'Photo gallery of significant events, ecumenical visits, and ceremonies of the Malankara Orthodox Syrian Church.';

type GalleryPageProps = {
  searchParams: Promise<{ page?: string; tab?: string }>;
};

function GallerySkeleton() {
  return (
    <div className="bg-white rounded-xl border border-syro-table-border shadow-sm p-6 sm:p-8 animate-pulse">
      <div className="h-10 bg-gray-100 rounded w-2/3 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-100 overflow-hidden">
            <div className="aspect-[4/3] bg-gray-100" />
            <div className="p-5 space-y-3">
              <div className="h-3 bg-gray-100 rounded w-1/3" />
              <div className="h-4 bg-gray-100 rounded w-4/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const params = await searchParams;
  const rawPage = parseInt(params.page ?? '1', 10);
  const currentPage = Number.isFinite(rawPage) && rawPage > 0 ? rawPage - 1 : 0;
  const initialTab = params.tab === 'events' ? 'events' : 'albums';

  return (
    <div className="bg-syro-bg-gray" data-testid="mosc-gallery-page" id="mainContent">
      <SyroPageBanner
        title="Photo Gallery"
        breadcrumbFrom="home"
        description={BANNER_DESCRIPTION}
      />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<GallerySkeleton />}>
            <MoscGalleryContent initialPage={currentPage} initialTab={initialTab} />
          </Suspense>

          <div className="mt-10">
            <QuickLinks />
          </div>
        </div>
      </section>
    </div>
  );
}

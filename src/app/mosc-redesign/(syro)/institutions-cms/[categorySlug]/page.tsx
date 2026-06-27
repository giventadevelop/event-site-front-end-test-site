import React from 'react';
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';
import InstitutionsCmsSidebar from '../../components/InstitutionsCmsSidebar';
import InstitutionCategoryList from '../components/InstitutionCategoryList';
import {
  filterInstitutionsByCategory,
  getInstitutionsData,
  pickCategoryCardImage,
} from '../getInstitutionsData';
import {
  getInstitutionHubCategory,
} from '../institutionHubCategories';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ categorySlug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = getInstitutionHubCategory(categorySlug);
  if (!category) {
    return { title: 'Institution Not Found | Institutions | MOSC' };
  }
  return {
    title: `${category.title} | Institutions | MOSC`,
    description: `${category.title} of the Malankara Orthodox Syrian Church.`,
  };
}

export default async function InstitutionCategoryCmsPage({ params }: PageProps) {
  const { categorySlug } = await params;
  const category = getInstitutionHubCategory(categorySlug);
  if (!category) {
    notFound();
  }

  const { entries } = await getInstitutionsData();
  const categoryEntries = filterInstitutionsByCategory(entries, categorySlug);
  const imageSrc = pickCategoryCardImage(categoryEntries, category);

  return (
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner title={category.title} breadcrumbFrom="institutions-cms" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="overflow-hidden rounded-lg bg-white p-4 shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] sm:p-6">
                <div className="flex justify-center">
                  <div className="relative flex h-auto w-full items-center justify-center overflow-hidden rounded-lg bg-syro-bg-gray/20">
                    <Image
                      src={imageSrc}
                      alt={category.title}
                      width={800}
                      height={600}
                      className="h-auto w-full object-contain"
                      style={{ backgroundColor: 'transparent', borderRadius: '0.5rem' }}
                      priority
                      unoptimized={Boolean(imageSrc.startsWith('http'))}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <InstitutionCategoryList
                  entries={categoryEntries}
                  categoryTitle={category.title}
                  singleColumn={
                    categorySlug === 'medical-college' || categorySlug === 'engineering-colleges'
                  }
                />
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            <div className="space-y-6 lg:col-span-1">
              <InstitutionsCmsSidebar currentSlug={categorySlug} />
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
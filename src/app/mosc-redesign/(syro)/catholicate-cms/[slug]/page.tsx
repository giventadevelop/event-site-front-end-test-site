import React from 'react';
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CatholicateCmsSidebar from '../../components/CatholicateCmsSidebar';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';
import { getCatholicateEntryBySlug, getCatholicateEntriesData } from '../getCatholicateEntriesData';
import { isCatholicateIntroEntry } from '../types';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getCatholicateEntryBySlug(slug);
  if (!entry) {
    return { title: 'Entry Not Found | The Catholicate | MOSC' };
  }
  return {
    title: `${entry.name} | The Catholicate | Malankara Orthodox Syrian Church`,
    description: entry.excerpt ?? `Catholicate entry: ${entry.name}.`,
  };
}

export default async function CatholicateCmsEntryPage({ params }: PageProps) {
  const { slug } = await params;
  const [entry, { entries }] = await Promise.all([
    getCatholicateEntryBySlug(slug),
    getCatholicateEntriesData(),
  ]);

  if (!entry) {
    notFound();
  }

  const sidebarEntries = entries.map((item) => ({
    name: item.name,
    href: `/mosc-redesign/catholicate-cms/${item.slug}`,
    period: item.subtitle,
    description: isCatholicateIntroEntry(item) ? null : item.excerpt,
  }));

  const bannerTitle = isCatholicateIntroEntry(entry) ? 'The Catholicate' : entry.name;

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title={bannerTitle} breadcrumbFrom="catholicate-cms" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8 mb-8">
                {!isCatholicateIntroEntry(entry) && entry.subtitle ? (
                  <p className="font-syro-display text-xl font-semibold text-syro-blue mb-2">
                    {entry.subtitle}
                  </p>
                ) : null}

                {!isCatholicateIntroEntry(entry) && entry.imageUrl ? (
                  <div className="mb-8 flex justify-center">
                    <Image
                      src={entry.imageUrl}
                      alt={entry.imageAlt ?? entry.name}
                      width={175}
                      height={175}
                      className="rounded-lg object-contain"
                      style={{ width: '175px', height: '175px' }}
                      priority
                      unoptimized
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                ) : null}

                {isCatholicateIntroEntry(entry) ? (
                  <h2 className="font-syro-display text-2xl font-semibold text-syro-blue mb-6">
                    {entry.name}
                  </h2>
                ) : null}

                <div className="space-y-6 font-syro-primary text-syro-dark-gray leading-relaxed">
                  {entry.body ? (
                    <div
                      className="prose prose-lg max-w-none [&_p]:mb-4 [&_p]:leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: entry.body }}
                    />
                  ) : entry.excerpt ? (
                    <p>{entry.excerpt}</p>
                  ) : null}
                </div>
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            <div className="space-y-6">
              <CatholicateCmsSidebar entries={sidebarEntries} />
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

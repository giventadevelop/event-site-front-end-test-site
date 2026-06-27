import React from 'react';
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import SaintsCmsSidebar from '../../components/SaintsCmsSidebar';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';
import { getSaintEntryBySlug, getSaintEntriesData } from '../getSaintEntriesData';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getSaintEntryBySlug(slug);
  if (!entry) {
    return { title: 'Saint Not Found | Saints | MOSC' };
  }
  return {
    title: `${entry.name} | Saints | Malankara Orthodox Syrian Church`,
    description: entry.excerpt ?? `Saint entry: ${entry.name}.`,
  };
}

export default async function SaintsCmsEntryPage({ params }: PageProps) {
  const { slug } = await params;
  const [entry, { entries }] = await Promise.all([
    getSaintEntryBySlug(slug),
    getSaintEntriesData(),
  ]);

  if (!entry) {
    notFound();
  }

  const sidebarEntries = entries.map((item) => ({
    name: item.name,
    href: `/mosc-redesign/saints-cms/${item.slug}`,
  }));

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title={entry.name} breadcrumbFrom="saints-cms" centerText />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                {entry.imageUrl ? (
                  <div className="mb-8 flex justify-center">
                    <Image
                      src={entry.imageUrl}
                      alt={entry.imageAlt ?? entry.name}
                      width={175}
                      height={175}
                      className="rounded-lg object-contain"
                      style={{ width: '175px', height: '175px' }}
                      priority
                      unoptimized={Boolean(entry.imageUrl.startsWith('http'))}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                ) : null}

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    {entry.name}
                  </h2>

                  {entry.body ? (
                    <div
                      className="font-syro-primary text-syro-dark-gray leading-relaxed [&_p]:mb-4 [&_p]:leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: entry.body }}
                    />
                  ) : entry.excerpt ? (
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      {entry.excerpt}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            <div className="space-y-6 lg:col-span-1">
              <SaintsCmsSidebar entries={sidebarEntries} />
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

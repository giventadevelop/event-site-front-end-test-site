import React from 'react';
import Image from 'next/image';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';
import KalpanaEditionCard from './KalpanaEditionCard';
import { DEFAULT_CARD_IMAGE, getKalpanaCmsData } from './getKalpanaData';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Kalpana | Malankara Orthodox Syrian Church',
  description:
    'The official annual calendar and directory of the Malankara Orthodox Syrian Church.',
};

export default async function KalpanaCmsPage() {
  const { page, editions } = await getKalpanaCmsData();

  return (
    <div className="min-h-screen bg-syro-bg-gray">
      <SyroPageBanner title="Kalpana" breadcrumbFrom="downloads" />

      <section className="relative bg-gradient-to-br from-syro-bg-gray to-syro-bg-gray py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="relative w-full h-auto rounded-lg overflow-hidden flex items-center justify-center bg-syro-bg-gray/20">
              <Image
                src={page.heroImageUrl}
                alt={page.heroImageAlt ?? 'Kalpana'}
                width={800}
                height={600}
                className="w-full h-auto object-contain"
                style={{
                  backgroundColor: 'transparent',
                  borderRadius: '0.5rem',
                }}
                priority
                unoptimized={Boolean(page.heroImageUrl.startsWith('http'))}
              />
            </div>
            <div>
              <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed mb-4">
                {page.introParagraph1}
              </p>
              <p className="font-syro-primary text-lg text-syro-dark-gray leading-relaxed">
                {page.introParagraph2}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-syro-display font-semibold text-3xl text-syro-blue mb-4">
              Available Editions
            </h2>
            <p className="font-syro-primary text-lg text-syro-dark-gray">
              Select a year to view or download the Kalpana edition
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {editions.map((edition) => (
              <KalpanaEditionCard
                key={edition.documentId || edition.slug || edition.year}
                edition={edition}
                defaultCardImage={DEFAULT_CARD_IMAGE}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-syro-card p-8">
            <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-4">
              {page.aboutTitle}
            </h2>
            <div className="space-y-4 font-syro-primary text-lg text-syro-dark-gray leading-relaxed">
              <p>{page.aboutDescription}</p>
              <p>Each edition includes:</p>
              <ul className="space-y-2 ml-6">
                {page.aboutFeatures.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <span className="w-2 h-2 bg-syro-red rounded-full mt-2 mr-3 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <QuickLinks />
    </div>
  );
}

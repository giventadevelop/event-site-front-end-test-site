import React from 'react';
import Image from 'next/image';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import EcumenicalCmsSidebar from '../../components/EcumenicalCmsSidebar';
import QuickLinks from '../../components/QuickLinks';
import SyroPageBanner from '../../components/SyroPageBanner';
import { getEcumenicalArticleBySlug, getEcumenicalArticlesData } from '../getEcumenicalArticlesData';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getEcumenicalArticleBySlug(slug);
  if (!article) {
    return { title: 'Article Not Found | Ecumenical | MOSC' };
  }
  return {
    title: `${article.name} | Ecumenical | Malankara Orthodox Syrian Church`,
    description: article.excerpt ?? `Ecumenical article: ${article.name}.`,
  };
}

export default async function EcumenicalCmsArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const [article, { articles }] = await Promise.all([
    getEcumenicalArticleBySlug(slug),
    getEcumenicalArticlesData(),
  ]);

  if (!article) {
    notFound();
  }

  const sidebarArticles = articles.map((item) => ({
    name: item.name,
    href: `/mosc-redesign/ecumenical-cms/${item.slug}`,
  }));

  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title={article.name} breadcrumbFrom="ecumenical-cms" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
                {article.imageUrl ? (
                  <div className="mb-8 flex justify-center">
                    <Image
                      src={article.imageUrl}
                      alt={article.imageAlt ?? article.name}
                      width={175}
                      height={175}
                      className="rounded-lg object-contain"
                      style={{ width: '175px', height: '175px' }}
                      priority
                      unoptimized={Boolean(article.imageUrl.startsWith('http'))}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                ) : null}

                <div className="prose prose-lg max-w-none">
                  <h2 className="font-syro-display font-semibold text-2xl text-syro-blue mb-6">
                    {article.name}
                  </h2>

                  {article.body ? (
                    <div
                      className="font-syro-primary text-syro-dark-gray leading-relaxed [&_p]:mb-4 [&_p]:leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: article.body }}
                    />
                  ) : article.excerpt ? (
                    <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6">
                      {article.excerpt}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            <div className="space-y-6 lg:col-span-1">
              <EcumenicalCmsSidebar articles={sidebarArticles} />
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

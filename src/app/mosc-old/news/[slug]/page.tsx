import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getArticleBySlug, getFlashNewsForNewsPages } from '../getNewsHomePageData';
import { NewsPageHeader } from '../components/NewsPageHeader';
import { FlashNewsCarousel } from '../components/FlashNewsCarousel';
import { FlashBar } from '../components/FlashBar';
import { ArticleContent } from '@/components/news/ArticleContent';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return { title: 'News' };
  return {
    title: article.title,
    description: article.excerpt ?? undefined,
  };
}

export default async function NewsArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const [article, flashData] = await Promise.all([
    getArticleBySlug(slug),
    getFlashNewsForNewsPages(),
  ]);
  if (!article) notFound();

  return (
    <div className="bg-background">
      {/* Same header as news index: title, description, section + external links */}
      <NewsPageHeader />

      {/* Flash news: carousel or legacy bar (same as news index) */}
      {flashData.flashNewsItems?.length > 0 ? (
        <FlashNewsCarousel items={flashData.flashNewsItems} />
      ) : flashData.flash?.active && flashData.flash.message ? (
        <FlashBar message={flashData.flash.message} />
      ) : null}

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/mosc-old/news"
          className="inline-flex items-center gap-2 font-body text-sm text-primary hover:underline mb-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span aria-hidden="true">←</span> Back to News
        </Link>

        <header className="mb-8">
          {article.coverUrl && (
            <div className="relative w-full h-auto rounded-xl overflow-hidden bg-muted mb-6 p-4">
              <Image
                src={article.coverUrl}
                alt={article.coverAlt || article.title}
                width={896}
                height={504}
                className="w-full h-auto object-contain"
                style={{ borderRadius: '0.75rem', backgroundColor: 'transparent' }}
                sizes="(max-width: 896px) 100vw, 896px"
                unoptimized
              />
            </div>
          )}
          <h1 className="font-heading font-semibold text-3xl md:text-4xl text-foreground">
            {article.title}
          </h1>
          <div className="flex flex-wrap gap-4 mt-4 font-caption text-sm text-muted-foreground">
            {article.publishedAt && (
              <time dateTime={article.publishedAt}>
                {new Date(article.publishedAt).toLocaleDateString('en-IN', {
                  dateStyle: 'long',
                })}
              </time>
            )}
            {article.categoryName && <span>{article.categoryName}</span>}
            {article.authorName && <span>By {article.authorName}</span>}
          </div>
        </header>

        <div className="prose prose-lg font-body text-foreground max-w-none min-w-0 break-words overflow-x-hidden prose-headings:font-heading prose-a:text-primary prose-p:break-words [&>*]:min-w-0 [&>*]:break-words">
          <ArticleContent
            description={article.description}
            body={article.body}
            excerpt={article.excerpt}
            emptyMessage="No additional content for this article."
          />
          {article.excerpt && !(Array.isArray(article.description) && article.description.length > 0) && !(typeof article.body === 'string' && article.body.trim()) && (
            <p className="text-muted-foreground mt-4">{article.excerpt}</p>
          )}
        </div>
      </article>
    </div>
  );
}

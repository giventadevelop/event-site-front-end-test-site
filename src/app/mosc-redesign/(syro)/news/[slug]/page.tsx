import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  getArticleBySlug,
  getFlashNewsForNewsPages,
  getRecentArticles,
  getPreviousArticle,
} from '../getNewsHomePageData';
import SyroPageBanner from '../../components/SyroPageBanner';
import { FlashNewsCarousel } from '../components/FlashNewsCarousel';
import { FlashBar } from '../components/FlashBar';
import { ArticleShareButtons } from '../components/ArticleShareButtons';
import { FollowUsFacebook } from '../components/FollowUsFacebook';
import { ArticleContent } from '@/components/news/ArticleContent';
import { getAppUrl } from '@/lib/env';

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
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const [flashData, recentArticles, previousArticle] = await Promise.all([
    getFlashNewsForNewsPages(),
    getRecentArticles(5),
    article.publishedAt ? getPreviousArticle(article.publishedAt) : Promise.resolve(null),
  ]);

  const articleUrl = `${getAppUrl()}/mosc-redesign/news/${article.slug}`;
  const postedDate =
    article.publishedAt &&
    new Date(article.publishedAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

  return (
    <div className="bg-syro-bg-gray font-syro-primary text-[#0b2848] min-h-screen">
      <SyroPageBanner title={article.title} breadcrumbFrom="news" />

      {flashData.flashNewsItems?.length > 0 ? (
        <FlashNewsCarousel items={flashData.flashNewsItems} />
      ) : flashData.flash?.active && flashData.flash.message ? (
        <FlashBar message={flashData.flash.message} />
      ) : null}

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-[1200px] mx-auto px-[15px] overflow-x-hidden">
          <Link
            href="/mosc-redesign/news"
            className="syro-primary-button inline-flex items-center gap-2 mb-8 w-fit focus:outline-none focus-visible:ring-2 focus-visible:ring-syro-red focus-visible:ring-offset-2"
          >
            <span aria-hidden="true">←</span>
            <span>Back to News</span>
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-syro-xl min-w-0">
            {/* Main content - white card like other MOSC content pages */}
            <article className="lg:col-span-2 min-w-0 overflow-x-hidden max-w-full bg-white rounded-xl shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8">
              <header className="mb-6">
              <h1 className="font-syro-display text-[2.2rem] font-bold text-black leading-tight">
                {article.title}
              </h1>
              <p className="syro-article-detail-meta mt-3 tracking-wide">
                {postedDate && article.authorName && (
                  <>Posted on {postedDate} by {article.authorName}</>
                )}
                {postedDate && !article.authorName && <>Posted on {postedDate}</>}
                {!postedDate && article.authorName && <>By {article.authorName}</>}
              </p>
              </header>

              {article.coverUrl && (
              <div className="relative w-full h-auto rounded-xl overflow-hidden bg-syro-bg-gray mb-8">
                <Image
                  src={article.coverUrl}
                  alt={article.coverAlt || article.title}
                  width={896}
                  height={504}
                  className="w-full h-auto object-contain"
                  style={{ borderRadius: '0.75rem', backgroundColor: 'transparent' }}
                  sizes="(max-width: 896px) 100vw, 66vw"
                  unoptimized
                />
              </div>
              )}

              {article.excerpt && !(Array.isArray(article.description) && article.description.length > 0) && !(typeof article.body === 'string' && article.body.trim()) && (
              <p className="syro-article-detail-lead mb-6 border-l-4 border-syro-red/30 pl-4">
                {article.excerpt}
              </p>
              )}

              <div className="syro-article-detail-body prose prose-lg max-w-full min-w-0 break-words overflow-x-clip prose-headings:font-heading prose-headings:text-syro-blue prose-headings:font-semibold prose-p:leading-relaxed prose-p:text-base prose-p:break-words prose-a:no-underline prose-pre:overflow-x-hidden prose-pre:max-w-full prose-pre:whitespace-pre-wrap prose-pre:break-words [&>*]:min-w-0 [&>*]:max-w-full [&>*]:break-words [&_p]:break-words [&_li]:break-words">
              <ArticleContent
                description={article.description}
                body={article.body}
                excerpt={article.excerpt}
                emptyMessage="No additional content for this article."
              />
              </div>

              <div className="mt-8 pt-6 border-t border-syro-table-border">
              <ArticleShareButtons url={articleUrl} title={article.title} />
              </div>

              {article.categoryName && (
              <p className="syro-article-detail-meta mt-6">
                <span className="font-semibold uppercase tracking-wide">Posted in</span>{' '}
                <span className="inline-flex flex-wrap gap-2 mt-2">
                  <span className="inline-block px-3 py-1 rounded-full bg-syro-bg-gray text-syro-blue border border-syro-table-border">
                    {article.categoryName}
                  </span>
                </span>
              </p>
              )}

              {previousArticle && (
              <div className="mt-8 pt-6 border-t border-syro-table-border">
                <Link
                  href={`/mosc-redesign/news/${previousArticle.slug}`}
                  className="syro-primary-button inline-flex items-center gap-2 w-fit focus:outline-none focus-visible:ring-2 focus-visible:ring-syro-red focus-visible:ring-offset-2"
                >
                  <span aria-hidden="true">←</span>
                  <span>Previous Post</span>
                </Link>
                <p className="syro-article-detail-body font-body text-base mt-3 line-clamp-2 text-syro-dark-gray">
                  {previousArticle.title}
                </p>
              </div>
              )}
            </article>

            {/* Sidebar - same Facebook Follow Us widget as news list page */}
            <aside className="lg:col-span-1 space-y-8">
              <FollowUsFacebook />

              {/* Recent Posts */}
              <div className="bg-white rounded-xl border border-syro-table-border p-6 sacred-shadow shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px]">
                <h3 className="font-syro-display font-semibold text-lg text-black border-l-[7px] border-l-syro-red pl-4 mb-4">
                  Recent Posts
                </h3>
                <ul className="space-y-3">
                  {recentArticles.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/mosc-redesign/news/${item.slug}`}
                        className={`font-body text-sm leading-snug focus:outline-none focus-visible:ring-2 focus-visible:ring-syro-red block text-syro-blue hover:text-syro-red transition-colors duration-300 ${
                          item.slug === article.slug ? 'font-semibold' : ''
                        }`}
                      >
                        <span className="line-clamp-2">{item.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}

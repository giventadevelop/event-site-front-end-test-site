'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { NewsArticle } from '../types';

interface ArticleListProps {
  title: string;
  articles: NewsArticle[];
  baseHref: string;
  compact?: boolean;
  /** Section ID for anchor links (e.g. featured-news, main-news) */
  id?: string;
}

/** Calendar icon for date display */
function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

/**
 * Renders a section of news articles: image on top, title/date/description below.
 * Uniform card size (fixed 4:3 media frame + equal body) for Press Release / Most Read / etc.
 * Click navigates to detail page with hero image.
 */
export function ArticleList({ title, articles, baseHref, compact, id }: ArticleListProps) {
  return (
    <section id={id} className="syro-news-article-section scroll-mt-24 rounded-[5px] bg-white overflow-hidden shadow-syro-card transition-shadow duration-500 hover:shadow-syro-card-hover">
      {/* Design system section title: h3 1.8rem/600 #0b2848, red accent bar ::after → use border-l */}
      <h2 className="syro-news-section-title text-syro-h3 font-semibold text-syro-blue pl-5 pt-syro-lg pb-2 border-b border-syro-table-border bg-white border-l-[7px] border-l-[#c0284a]">
        {title}
      </h2>
      {articles.length > 0 ? (
        <ul className={`grid gap-4 px-syro-lg pt-1.5 pb-1.5 items-stretch ${compact ? 'grid-cols-1 max-w-2xl' : 'grid-cols-1 md:grid-cols-2'}`}>
          {articles.map((article) => {
            const listKey = article.documentId || article.slug || String(article.id);
            const publishedLabel = article.publishedAt
              ? new Date(article.publishedAt).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
              : null;
            const cardDescription = article.excerpt?.trim() || '';
            return (
            <li key={listKey} className="min-h-0 h-full">
              <Link
                href={`${baseHref}/${article.documentId || article.slug || String(article.id)}`}
                className="flex flex-col h-full group rounded-[5px] overflow-hidden border border-syro-table-border hover:shadow-syro-card-hover transition-shadow duration-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-syro-red focus-visible:ring-offset-2 bg-white"
              >
                {/* Fixed 4:3 media frame — same size across Press Release / Most Read cards */}
                <div className="px-4 pt-4">
                  <div className="relative w-full aspect-[4/3] overflow-hidden rounded-xl bg-syro-bg-gray/40 shadow-sm ring-1 ring-black/5">
                    {article.coverUrl ? (
                      <Image
                        src={article.coverUrl}
                        alt={article.coverAlt || article.title}
                        fill
                        className="object-cover object-center !rounded-xl group-hover:scale-105 transition-transform duration-300"
                        sizes={compact ? '(max-width: 768px) 100vw, 672px' : '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px'}
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-syro-dark-gray/50" aria-hidden>
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
                {/* Title, date, description — reserved description height for uniform cards */}
                <div className="flex flex-col flex-1 min-h-0 pt-1.5 px-syro-lg pb-syro-lg">
                  <h3 className="syro-article-card-title line-clamp-2 min-h-[2.7em] reverent-transition">
                    {article.title}
                  </h3>
                  {publishedLabel && article.publishedAt ? (
                    <time
                      className="syro-article-card-meta mt-2 flex items-center gap-1.5 flex-shrink-0"
                      dateTime={article.publishedAt}
                    >
                      <CalendarIcon className="w-4 h-4 flex-shrink-0" />
                      <span>{publishedLabel}</span>
                    </time>
                  ) : (
                    <div className="mt-2 h-5 flex-shrink-0" aria-hidden />
                  )}
                  {!compact && (
                    <p className="syro-article-card-desc mt-2 line-clamp-3 min-h-[4.2em] flex-1">
                      {cardDescription || '\u00A0'}
                    </p>
                  )}
                </div>
              </Link>
            </li>
            );
          })}
        </ul>
      ) : (
        <div className="px-syro-xxl py-8 text-center">
          <p className="font-syro-primary text-syro-small text-syro-dark-gray">
            No articles at the moment. Check back later.
          </p>
        </div>
      )}
    </section>
  );
}

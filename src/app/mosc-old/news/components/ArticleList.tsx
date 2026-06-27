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
 * Grid layout (2 cols) for non-compact; compact uses 1 col. Click navigates to detail page with hero image.
 * Image aspect 4:3 for list cards; detail page uses 16:9 hero.
 */
export function ArticleList({ title, articles, baseHref, compact, id }: ArticleListProps) {
  return (
    <section id={id} className="scroll-mt-24 rounded-xl bg-card border border-border sacred-shadow-sm overflow-hidden">
      <h2 className="font-heading font-semibold text-xl text-foreground border-b border-border px-6 py-4 bg-muted/30">
        {title}
      </h2>
      {articles.length > 0 ? (
        <ul className={`grid gap-6 p-6 ${compact ? 'grid-cols-1 max-w-2xl' : 'grid-cols-1 md:grid-cols-2'}`}>
          {articles.map((article) => (
            <li key={article.id}>
              <Link
                href={`${baseHref}/${article.slug || article.documentId || article.id}`}
                className="block group rounded-lg overflow-hidden border border-border hover:border-primary/30 hover:shadow-md reverent-transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-card"
              >
                {/* Image on top - object-contain so header/top is not cropped (image_containment_prevention) */}
                {article.coverUrl && (
                  <div className="relative w-full h-auto rounded-t-lg overflow-hidden bg-muted p-3">
                    <Image
                      src={article.coverUrl}
                      alt={article.coverAlt || article.title}
                      width={800}
                      height={600}
                      className="w-full h-auto object-contain group-hover:scale-105 transition-transform duration-300"
                      style={{ borderRadius: '0.5rem 0.5rem 0 0', backgroundColor: 'transparent' }}
                      sizes={compact ? '(max-width: 768px) 100vw, 672px' : '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px'}
                      unoptimized
                    />
                  </div>
                )}
                {/* Title, date, description below */}
                <div className="p-4">
                  <h3 className="font-body font-semibold text-foreground line-clamp-2 group-hover:text-primary reverent-transition">
                    {article.title}
                  </h3>
                  {article.publishedAt && (
                    <time
                      className="font-caption text-sm text-muted-foreground mt-2 flex items-center gap-1.5"
                      dateTime={article.publishedAt}
                    >
                      <CalendarIcon className="w-4 h-4 flex-shrink-0" />
                      {new Date(article.publishedAt).toLocaleDateString('en-IN', {
                        dateStyle: 'long',
                      })}
                    </time>
                  )}
                  {!compact && article.excerpt && (
                    <p className="font-body text-sm text-muted-foreground mt-2 line-clamp-3">
                      {article.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="px-6 py-8 text-center">
          <p className="font-body text-sm text-muted-foreground">
            No articles at the moment. Check back later.
          </p>
        </div>
      )}
    </section>
  );
}

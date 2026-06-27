import React from 'react';
import { getNewsHomePageData } from './getNewsHomePageData';
import { FlashBar } from './components/FlashBar';
import { FlashNewsCarousel } from './components/FlashNewsCarousel';
import { ArticleList } from './components/ArticleList';
import { SidebarPromo } from './components/SidebarPromo';
import { FollowUsFacebook } from './components/FollowUsFacebook';
import { AdSlots } from './components/AdSlots';

export const metadata = {
  title: 'News',
  description: 'News and updates from the Malankara Orthodox Syrian Church.',
};

/** Section anchors (same page) */
const SECTION_LINKS = [
  { label: 'Main News', href: '#main-news' },
  { label: 'Featured News', href: '#featured-news' },
  { label: 'Press Release', href: '#press-release' },
  { label: 'Most Read', href: '#most-read' },
] as const;

/** External nav links from legacy index.html - no Strapi, URL forwarding */
const EXTERNAL_LINKS = [
  { label: 'LIVE', href: 'https://www.youtube.com/@DevalokamAramana/streams' },
] as const;

export default async function NewsPage() {
  const data = await getNewsHomePageData();

  return (
    <div className="bg-background">
      {/* Hero / Page title */}
      <section className="py-12 bg-gradient-to-br from-background to-muted border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading font-semibold text-3xl md:text-4xl text-foreground">
            News
          </h1>
          <p className="font-body text-muted-foreground mt-2">
            Latest news, featured stories, and press releases from the Church.
          </p>
          {/* Navigation links per layout (catholicatenews_strapi_content_mapping, index.html) */}
          <nav className="mt-6 flex flex-wrap gap-3" aria-label="News sections">
            {SECTION_LINKS.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className="font-body text-sm font-medium text-primary hover:text-accent hover:underline reverent-transition px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted"
              >
                {label}
              </a>
            ))}
            {EXTERNAL_LINKS.map(({ label, href, external }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-body text-sm font-medium text-primary hover:text-accent hover:underline reverent-transition px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </section>

      {/* Flash news: carousel from Strapi flash-news-items, or legacy single-message bar */}
      {data.flashNewsItems?.length > 0 ? (
        <FlashNewsCarousel items={data.flashNewsItems} />
      ) : data.flash?.active && data.flash.message ? (
        <FlashBar message={data.flash.message} />
      ) : null}

      {/* Top banner ads (position=top) */}
      {data.topAdSlots.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <AdSlots slots={data.topAdSlots} />
        </div>
      )}

      {/* Main content: one column + sidebar - all sections always visible with empty placeholders */}
      <section className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-10">
            {/* Main column - order per PRD: Main News, Featured News, Press Release, Most Read */}
            <div className="space-y-12">
              <ArticleList
                id="main-news"
                title="Main News"
                articles={data.mainNews}
                baseHref="/mosc-old/news"
              />
              <ArticleList
                id="featured-news"
                title="Featured News"
                articles={data.featured}
                baseHref="/mosc-old/news"
              />
              <ArticleList
                id="press-release"
                title="Press Release"
                articles={data.pressRelease}
                baseHref="/mosc-old/news"
              />
              <ArticleList
                id="most-read"
                title="Most Read"
                articles={data.mostRead}
                baseHref="/mosc-old/news"
                compact
              />
            </div>

            {/* Sidebar - always visible: Strapi promo or default Facebook Follow Us (from legacy index.html) */}
            <aside className="space-y-8">
              {data.sidebarPromo ? (
                <SidebarPromo block={data.sidebarPromo} />
              ) : (
                <FollowUsFacebook />
              )}
              <AdSlots slots={data.adSlots} />
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}

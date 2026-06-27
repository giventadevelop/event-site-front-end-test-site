import React from 'react';
import { getNewsHomePageData } from './getNewsHomePageData';
import { FlashBar } from './components/FlashBar';
import { FlashNewsCarousel } from './components/FlashNewsCarousel';
import { ArticleList } from './components/ArticleList';
import { SidebarPromo } from './components/SidebarPromo';
import { FollowUsFacebook } from './components/FollowUsFacebook';
import { AdSlots } from './components/AdSlots';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';

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
    <div className="bg-syro-bg-gray font-syro-primary text-[#0b2848] min-h-screen">
      <SyroPageBanner title="News" breadcrumbFrom="home" />

      {/* Section nav */}
      <section className="mt-8 py-syro-lg bg-syro-bg-gray border-b border-syro-table-border">
        <div className="max-w-[1200px] mx-auto px-[15px]">
          <nav className="flex flex-wrap gap-syro-lg" aria-label="News sections">
            {SECTION_LINKS.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                className="syro-primary-button inline-flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-syro-red focus-visible:ring-offset-2"
              >
                {label}
              </a>
            ))}
            {EXTERNAL_LINKS.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="syro-primary-button inline-flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-syro-red focus-visible:ring-offset-2"
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
        <div className="max-w-[1200px] mx-auto px-[15px] py-syro-lg">
          <AdSlots slots={data.topAdSlots} />
        </div>
      )}

      {/* Main content - no top padding so Main News title aligns at top like Featured News */}
      <section className="pt-0 pb-syro-lg bg-syro-bg-gray">
        <div className="max-w-[1200px] mx-auto px-[15px]">
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] gap-syro-xl">
            {/* Main column - tighter vertical spacing between sections */}
            <div className="space-y-syro-xl">
              <ArticleList
                id="main-news"
                title="Main News"
                articles={data.mainNews}
                baseHref="/mosc-redesign/news"
              />
              <ArticleList
                id="featured-news"
                title="Featured News"
                articles={data.featured}
                baseHref="/mosc-redesign/news"
              />
              {/* Between-sections ad slots (position=between_sections) */}
              {data.betweenSectionsAdSlots.length > 0 && (
                <div className="py-syro-lg">
                  <AdSlots slots={data.betweenSectionsAdSlots} />
                </div>
              )}
              <ArticleList
                id="press-release"
                title="Press Release"
                articles={data.pressRelease}
                baseHref="/mosc-redesign/news"
              />
              <ArticleList
                id="most-read"
                title="Most Read"
                articles={data.mostRead}
                baseHref="/mosc-redesign/news"
                compact
              />
            </div>

            {/* Sidebar - design system component spacing */}
            <aside className="space-y-syro-xl">
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

      {/* Quick Links - same as catholicate / his-holiness-baselios-geevarghese-i page */}
      <QuickLinks />
    </div>
  );
}

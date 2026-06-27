import React from 'react';

/** Section anchors (same page) - used on news index and article detail. */
const SECTION_LINKS = [
  { label: 'Main News', href: '/mosc-old/news#main-news' },
  { label: 'Featured News', href: '/mosc-old/news#featured-news' },
  { label: 'Press Release', href: '/mosc-old/news#press-release' },
  { label: 'Most Read', href: '/mosc-old/news#most-read' },
] as const;

/** External nav links from legacy index.html. */
const EXTERNAL_LINKS = [
  { label: 'LIVE', href: 'https://www.youtube.com/@DevalokamAramana/streams' },
] as const;

/**
 * Shared hero/header for News index and article detail pages.
 * Matches the news home layout: title, description, section + external links.
 */
export function NewsPageHeader() {
  return (
    <section className="py-12 bg-gradient-to-br from-background to-muted border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-heading font-semibold text-3xl md:text-4xl text-foreground">
          News
        </h1>
        <p className="font-body text-muted-foreground mt-2">
          Latest news, featured stories, and press releases from the Church.
        </p>
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
          {EXTERNAL_LINKS.map(({ label, href }) => (
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
  );
}

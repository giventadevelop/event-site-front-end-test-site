'use client';

import React from 'react';
import Link from 'next/link';

export interface SyroPageBannerProps {
  /** Page title shown in uppercase (e.g. "Holy Synod") */
  title: string;
  /** Optional description shown in the banner below the breadcrumb */
  description?: string;
  /** When true, center the title and breadcrumb text (e.g. on saints subpages) */
  centerText?: boolean;
  /** Breadcrumb path: 'home' = Home / Title, 'gallery' = Gallery / Title, 'news' = News / Title, 'directory' = Directory / Title, etc. */
  breadcrumbFrom?: 'home' | 'gallery' | 'downloads' | 'calendar' | 'liturgical-calendar' | 'mosc-calendar' | 'kalpana-cms' | 'holy-synod' | 'holy-synod-cms' | 'catholicate' | 'catholicate-cms' | 'saints' | 'saints-cms' | 'the-church' | 'administration' | 'ecumenical' | 'ecumenical-cms' | 'dioceses' | 'spiritual-organizations' | 'spiritual-organizations-cms' | 'publications' | 'publications-cms' | 'institutions' | 'institutions-cms' | 'training' | 'training-cms' | 'theological-seminaries' | 'theological-seminaries-cms' | 'lectionary' | 'news' | 'directory';
  /** Optional middle segment for 3-level breadcrumb (e.g. The Church / Theology / Christology). Used on the-church subpages under Theology, Spirituality, History, Liturgy. */
  breadcrumbParent?: { label: string; href: string };
  /** When true, omit the breadcrumb nav. Title stays in the heading. */
  hideBreadcrumbNav?: boolean;
  /**
   * Optional atmospheric wash image — embedded full-bleed at very low opacity (not a featured photo).
   * Omit to use pattern-only ribbon.
   */
  heroImageSrc?: string;
  /** @deprecated Wash images are decorative; alt is not shown. Kept for API compatibility. */
  heroImageAlt?: string;
  /** @deprecated Unified atmospheric ribbon is always used. */
  bannerVisual?: 'shepherd' | 'featured-image' | 'blended-image' | 'ribbon';
}

const BREADCRUMB_CONFIG = {
  home: { href: '/mosc-redesign', label: 'Home' },
  gallery: { href: '/mosc-redesign/gallery', label: 'Gallery' },
  downloads: { href: '/mosc-redesign/downloads', label: 'Downloads' },
  calendar: { href: '/mosc-redesign/liturgical-calendar', label: 'Calendar' },
  'liturgical-calendar': { href: '/mosc-redesign/liturgical-calendar', label: 'Liturgical Calendar' },
  'mosc-calendar': { href: '/mosc-redesign/mosc-calendar', label: 'MOSC Calendar' },
  'kalpana-cms': { href: '/mosc-redesign/kalpana-cms', label: 'Kalpana' },
  'holy-synod': { href: '/mosc-redesign/holy-synod', label: 'Holy Synod' },
  'holy-synod-cms': { href: '/mosc-redesign/holy-synod-cms', label: 'Holy Synod' },
  saints: { href: '/mosc-redesign/saints', label: 'Saints' },
  'saints-cms': { href: '/mosc-redesign/saints-cms', label: 'Saints' },
  'the-church': { href: '/mosc-redesign/the-church', label: 'The Church' },
  catholicate: { href: '/mosc-redesign/catholicate', label: 'The Catholicate' },
  'catholicate-cms': { href: '/mosc-redesign/catholicate-cms', label: 'The Catholicate' },
  administration: { href: '/mosc-redesign/administration', label: 'Administration' },
  ecumenical: { href: '/mosc-redesign/ecumenical', label: 'Ecumenical' },
  'ecumenical-cms': { href: '/mosc-redesign/ecumenical-cms', label: 'Ecumenical' },
  dioceses: { href: '/mosc-redesign/dioceses', label: 'Dioceses' },
  'spiritual-organizations': { href: '/mosc-redesign/spiritual-organizations-cms', label: 'Spiritual Organizations' },
  'spiritual-organizations-cms': { href: '/mosc-redesign/spiritual-organizations-cms', label: 'Spiritual Organizations' },
  publications: { href: '/mosc-redesign/publications', label: 'Publications' },
  'publications-cms': { href: '/mosc-redesign/publications-cms', label: 'Publications' },
  institutions: { href: '/mosc-redesign/institutions', label: 'Institutions' },
  'institutions-cms': { href: '/mosc-redesign/institutions-cms', label: 'Institutions' },
  training: { href: '/mosc-redesign/training', label: 'Training' },
  'training-cms': { href: '/mosc-redesign/training-cms', label: 'Training' },
  'theological-seminaries': { href: '/mosc-redesign/theological-seminaries', label: 'Theological Seminaries' },
  'theological-seminaries-cms': { href: '/mosc-redesign/theological-seminaries-cms', label: 'Theological Seminaries' },
  lectionary: { href: '/mosc-redesign/lectionary', label: 'Lectionary' },
  news: { href: '/mosc-redesign/news', label: 'News' },
  directory: { href: '/mosc-redesign/directory', label: 'Directory' },
} as const;

export type SyroBreadcrumbFrom = keyof typeof BREADCRUMB_CONFIG;

export interface SyroBreadcrumbProps {
  breadcrumbFrom: SyroBreadcrumbFrom;
  currentTitle: string;
}

/**
 * Standalone breadcrumb nav for hero sections (ecumenical, dioceses subpages).
 */
export function SyroBreadcrumb({ breadcrumbFrom, currentTitle }: SyroBreadcrumbProps) {
  const config = BREADCRUMB_CONFIG[breadcrumbFrom];
  return (
    <nav aria-label="Breadcrumb" className="mb-4 font-dm-sans">
      <ol className="flex flex-wrap items-center gap-x-1.5 text-sm font-medium uppercase tracking-wide text-parchment-light/90">
        <li>
          <Link
            href={config.href}
            className="text-parchment-light/90 hover:text-warmGold transition-colors duration-300"
          >
            {config.label}
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li className="text-warmGold" aria-current="page">
          {currentTitle}
        </li>
      </ol>
    </nav>
  );
}

export default function SyroPageBanner({
  title,
  description,
  centerText: _centerText,
  breadcrumbFrom = 'home',
  breadcrumbParent,
  hideBreadcrumbNav = false,
  heroImageSrc,
}: SyroPageBannerProps) {
  const config = BREADCRUMB_CONFIG[breadcrumbFrom];
  const breadcrumbLinkClass =
    'text-amber-200/90 hover:text-amber-50 transition-colors duration-300 [text-shadow:0_1px_2px_rgba(0,0,0,0.25)]';
  const breadcrumbSeparatorClass = 'text-amber-300/50';
  const breadcrumbCurrentClass = 'text-parchment font-semibold [text-shadow:0_1px_2px_rgba(0,0,0,0.3)]';

  return (
    <section
      className="mosc-subpage-ribbon relative overflow-hidden font-dm-sans border-b border-burgundy/30"
      aria-label={`${title} page header`}
    >
      {/* Decorative layers — atmospheric, not focal */}
      <div className="mosc-subpage-ribbon__filigree" aria-hidden />
      <div className="mosc-subpage-ribbon__cross-field" aria-hidden />
      {heroImageSrc ? (
        <div
          className="mosc-subpage-ribbon__photo-wash"
          style={{ backgroundImage: `url(${heroImageSrc})` }}
          aria-hidden
        />
      ) : null}
      <div className="mosc-subpage-ribbon__veil" aria-hidden />
      <div className="mosc-subpage-ribbon__readability" aria-hidden />
      <div className="mosc-subpage-ribbon__watermark" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/mosc/assets/images/resources/cross_white.svg"
          alt=""
          className="mosc-subpage-ribbon__watermark-icon"
          width={200}
          height={200}
        />
      </div>

      <div className="mosc-subpage-ribbon__rule mosc-subpage-ribbon__rule--top" aria-hidden />

      <div className="mosc-subpage-ribbon__inner relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="syro-banner-content mosc-subpage-ribbon__content flex flex-col justify-center min-w-0 w-full text-left items-start self-start">
          <p className="mosc-subpage-ribbon__eyebrow" aria-hidden="true">
            Malankara Orthodox Syrian Church
          </p>
          <h2 className="syro-banner-title mosc-subpage-ribbon__title text-lg sm:text-xl lg:text-2xl font-bold uppercase tracking-wide break-words w-full text-left">
            {title}
          </h2>

          <div className="mosc-subpage-ribbon__breadcrumb-slot w-full">
          {!hideBreadcrumbNav && (
            <nav aria-label="Breadcrumb" className="syro-banner-breadcrumb mosc-subpage-ribbon__breadcrumb mt-1.5 w-full">
              <ol className="flex flex-wrap items-center justify-start gap-x-1.5 text-xs sm:text-sm font-medium uppercase tracking-wide text-left">
                <li>
                  <Link href={config.href} className={breadcrumbLinkClass}>
                    {config.label}
                  </Link>
                </li>
                <li className={breadcrumbSeparatorClass} aria-hidden="true">
                  /
                </li>
                {breadcrumbParent ? (
                  <>
                    <li>
                      <Link href={breadcrumbParent.href} className={breadcrumbLinkClass}>
                        {breadcrumbParent.label}
                      </Link>
                    </li>
                    <li className={breadcrumbSeparatorClass} aria-hidden="true">
                      /
                    </li>
                    <li className={breadcrumbCurrentClass} aria-current="page">
                      {title}
                    </li>
                  </>
                ) : (
                  <li className={breadcrumbCurrentClass} aria-current="page">
                    {title}
                  </li>
                )}
              </ol>
            </nav>
          )}
          </div>

          <div className="mosc-subpage-ribbon__description-slot w-full">
            {description ? (
              <p className="syro-banner-description mosc-subpage-ribbon__description text-sm sm:text-base leading-relaxed mt-3 normal-case font-normal text-left">
                {description}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mosc-subpage-ribbon__rule mosc-subpage-ribbon__rule--bottom" aria-hidden />
    </section>
  );
}

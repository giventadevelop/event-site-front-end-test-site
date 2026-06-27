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
  breadcrumbFrom?: 'home' | 'gallery' | 'downloads' | 'calendar' | 'holy-synod' | 'saints' | 'the-church' | 'catholicate' | 'administration' | 'ecumenical' | 'dioceses' | 'spiritual-organizations' | 'publications' | 'institutions' | 'training' | 'theological-seminaries' | 'lectionary' | 'news' | 'directory';
  /** Optional middle segment for 3-level breadcrumb (e.g. The Church / Theology / Christology). Used on the-church subpages under Theology, Spirituality, History, Liturgy. */
  breadcrumbParent?: { label: string; href: string };
}

/**
 * Page banner matching static HTML (holy-synod.html): gradient background,
 * uppercase title, breadcrumb HOME / SYRO / Title in red, shepherd silhouette on right.
 * Replaces the centered hero for consistent header across administration, catholicate, etc.
 */
const SHEPHERD_IMAGE_SRC = 'https://www.syromalabarchurch.in/assets/images/background/shepared.png';

const BREADCRUMB_CONFIG = {
  home: { href: '/mosc', label: 'Home' },
  gallery: { href: '/mosc/gallery', label: 'Gallery' },
  downloads: { href: '/mosc/downloads', label: 'Downloads' },
  calendar: { href: '/mosc/calendar', label: 'Calendar' },
  'holy-synod': { href: '/mosc/holy-synod', label: 'Holy Synod' },
  saints: { href: '/mosc/saints', label: 'Saints' },
  'the-church': { href: '/mosc/the-church', label: 'The Church' },
  catholicate: { href: '/mosc/catholicate', label: 'The Catholicate' },
  administration: { href: '/mosc/administration', label: 'Administration' },
  ecumenical: { href: '/mosc/ecumenical', label: 'Ecumenical' },
  dioceses: { href: '/mosc/dioceses', label: 'Dioceses' },
  'spiritual-organizations': { href: '/mosc/spiritual-organizations', label: 'Spiritual Organizations' },
  publications: { href: '/mosc/publications', label: 'Publications' },
  institutions: { href: '/mosc/institutions', label: 'Institutions' },
  training: { href: '/mosc/training', label: 'Training' },
  'theological-seminaries': { href: '/mosc/theological-seminaries', label: 'Theological Seminaries' },
  lectionary: { href: '/mosc/lectionary', label: 'Lectionary' },
  news: { href: '/mosc/news', label: 'News' },
  directory: { href: '/mosc/directory', label: 'Directory' },
} as const;

export type SyroBreadcrumbFrom = keyof typeof BREADCRUMB_CONFIG;

export interface SyroBreadcrumbProps {
  /** Same as SyroPageBanner breadcrumbFrom (e.g. 'ecumenical', 'dioceses') */
  breadcrumbFrom: SyroBreadcrumbFrom;
  /** Current page title (last segment of breadcrumb) */
  currentTitle: string;
}

/**
 * Standalone breadcrumb nav for use inside hero sections (ecumenical, dioceses subpages).
 * Renders: Parent / Current Title in the same style as SyroPageBanner.
 */
export function SyroBreadcrumb({ breadcrumbFrom, currentTitle }: SyroBreadcrumbProps) {
  const config = BREADCRUMB_CONFIG[breadcrumbFrom];
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-x-1.5 text-sm font-medium uppercase tracking-wide text-[#990b3f]">
        <li>
          <Link
            href={config.href}
            className="text-[#990b3f] hover:text-syro-red transition-colors duration-300"
          >
            {config.label}
          </Link>
        </li>
        <li aria-hidden="true">/</li>
        <li className="text-syro-red" aria-current="page">
          {currentTitle}
        </li>
      </ol>
    </nav>
  );
}

export default function SyroPageBanner({ title, description, centerText, breadcrumbFrom = 'home', breadcrumbParent }: SyroPageBannerProps) {
  const config = BREADCRUMB_CONFIG[breadcrumbFrom];
  return (
    <section
      className="relative flex min-h-[150px] h-auto items-center overflow-hidden uppercase py-4 md:py-0 md:min-h-[150px]"
      style={{
        background: 'linear-gradient(-90deg, #dc354662, #ff790348)',
      }}
    >
      <div className="relative z-10 flex h-full min-h-full w-full items-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
        <div className={`flex h-full min-h-full w-full items-center ${centerText ? 'justify-center' : 'justify-between'}`}>
          <div className={`syro-banner-content flex flex-col justify-center min-w-0 flex-1 ${centerText ? 'text-center' : description ? 'pr-24 md:pr-64' : 'pr-24 md:pr-40'}`}>
            <h2 className="font-syro-display text-base sm:text-xl lg:text-2xl font-semibold text-syro-blue uppercase tracking-wide break-words">
              {title}
            </h2>
            <nav aria-label="Breadcrumb" className="mt-1">
              <ol className={`flex flex-wrap items-center gap-x-1.5 text-xs sm:text-sm font-medium uppercase tracking-wide ${centerText ? 'justify-center' : ''}`}>
                <li>
                  <Link
                    href={config.href}
                    className="text-[#990b3f] hover:text-syro-red transition-colors duration-300"
                  >
                    {config.label}
                  </Link>
                </li>
                <li className="text-[#990b3f]" aria-hidden="true">
                  /
                </li>
                {breadcrumbParent ? (
                  <>
                    <li>
                      <Link
                        href={breadcrumbParent.href}
                        className="text-[#990b3f] hover:text-syro-red transition-colors duration-300"
                      >
                        {breadcrumbParent.label}
                      </Link>
                    </li>
                    <li className="text-[#990b3f]" aria-hidden="true">
                      /
                    </li>
                    <li className="text-syro-red" aria-current="page">
                      {title}
                    </li>
                  </>
                ) : (
                  <li className="text-syro-red" aria-current="page">
                    {title}
                  </li>
                )}
              </ol>
            </nav>
            {description && (
              <p className="font-syro-primary text-base sm:text-lg text-syro-dark-gray leading-relaxed mt-3 normal-case">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Shepherd silhouette - right side, absolute (hidden on small screens to avoid overlap) */}
      <div className="absolute bottom-0 right-0 hidden md:block pointer-events-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={SHEPHERD_IMAGE_SRC}
          alt=""
          className="h-[140px] w-auto object-contain object-bottom opacity-90"
          width={280}
          height={140}
        />
      </div>
    </section>
  );
}

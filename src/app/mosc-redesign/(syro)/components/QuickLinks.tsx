import React from 'react';
import Link from 'next/link';

interface QuickLink {
  name: string;
  href: string;
  icon: React.ReactNode;
  external?: boolean;
}

const iconClass = 'w-5 h-5 text-burgundy';

const DocumentIcon = () => (
  <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const DownloadIcon = () => (
  <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const BuildingIcon = () => (
  <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const AcademicIcon = () => (
  <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.747 5.754 18 7.5 18s3.332.747 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.747 18.247 18 16.5 18c-1.746 0-3.332.747-4.5 1.253" />
  </svg>
);

const BookIcon = () => (
  <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.747 5.754 18 7.5 18s3.332.747 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.747 18.247 18 16.5 18c-1.746 0-3.332.747-4.5 1.253" />
  </svg>
);

const HeartIcon = () => (
  <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const ChurchIcon = () => (
  <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const CalendarIcon = () => (
  <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const BookOpenIcon = () => (
  <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.747 5.754 18 7.5 18s3.332.747 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.747 18.247 18 16.5 18c-1.746 0-3.332.747-4.5 1.253" />
  </svg>
);

const NewspaperIcon = () => (
  <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
  </svg>
);

const GlobeIcon = () => (
  <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
);

const PhotoIcon = () => (
  <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const MailIcon = () => (
  <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const QuestionIcon = () => (
  <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const quickLinks: QuickLink[] = [
  { name: 'Kalpana', href: '/mosc-redesign/kalpana-cms', icon: <DocumentIcon /> },
  { name: 'Downloads', href: '/mosc-redesign/downloads', icon: <DownloadIcon /> },
  { name: 'Institutions', href: '/mosc-redesign/institutions', icon: <BuildingIcon /> },
  { name: 'Training', href: '/mosc-redesign/training-cms', icon: <AcademicIcon /> },
  { name: 'Publications', href: '/mosc-redesign/publications', icon: <BookIcon /> },
  { name: 'Spiritual Organisations', href: '/mosc-redesign/spiritual-organizations-cms', icon: <HeartIcon /> },
  { name: 'Theological Seminaries', href: '/mosc-redesign/theological-seminaries', icon: <ChurchIcon /> },
  { name: 'Calendar', href: '/mosc-redesign/liturgical-calendar', icon: <CalendarIcon /> },
  { name: 'Lectionary', href: '/mosc-redesign/lectionary', icon: <BookOpenIcon /> },
  { name: 'News & Events', href: 'https://www.facebook.com/catholicatenews.in', icon: <NewspaperIcon />, external: true },
  { name: 'Online Resources', href: '/mosc-redesign/online-resources', icon: <GlobeIcon /> },
  { name: 'Gallery', href: '/mosc-redesign/gallery', icon: <PhotoIcon /> },
  { name: 'Contact Info', href: '/mosc-redesign/contact-info', icon: <MailIcon /> },
  { name: 'FAQs', href: '/mosc-redesign/faqs', icon: <QuestionIcon /> },
];

const chipClass =
  'group flex items-center gap-2 rounded-xl border border-burgundy/20 bg-parchment-light px-4 py-2.5 shadow-[0_2px_8px_rgba(61,13,13,0.08)] font-dm-sans transition-all duration-300 hover:border-burgundy/50 hover:shadow-[0_8px_24px_rgba(192,40,74,0.16)] hover:-translate-y-0.5 [&_svg]:!text-burgundy';

const labelClass =
  'text-xs font-medium text-warmBrown-dark group-hover:text-burgundy transition-colors';

interface QuickLinksProps {
  /** `sidebar` — compact nav for two-column layouts; default = full-width footer strip (design system) */
  variant?: 'default' | 'sidebar' | 'designSystem';
}

export default function QuickLinks({ variant = 'default' }: QuickLinksProps) {
  if (variant === 'sidebar') {
    return (
      <div className="bg-parchment-light rounded-xl border border-burgundy/20 shadow-[0_2px_8px_rgba(61,13,13,0.08)] p-6">
        <nav className="flex flex-wrap gap-2">
          {quickLinks.map((link) => {
            const linkContent = (
              <>
                <span className="mr-1.5 flex-shrink-0">{link.icon}</span>
                <span className="font-dm-sans text-xs text-warmBrown-dark hover:text-burgundy transition-colors whitespace-nowrap">
                  {link.name}
                </span>
              </>
            );
            const chip =
              'flex items-center px-2 py-1.5 rounded-lg border border-burgundy/15 bg-parchment hover:bg-burgundy/5 hover:border-burgundy/30 transition-all duration-300';
            if (link.external) {
              return (
                <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className={chip}>
                  {linkContent}
                </a>
              );
            }
            return (
              <Link key={link.href} href={link.href} className={chip}>
                {linkContent}
              </Link>
            );
          })}
        </nav>
      </div>
    );
  }

  /* default + designSystem: same MOSC footer quick-links strip */
  const strip = (
    <section className="py-12 md:py-16 bg-parchment-deep border-t-2 border-burgundy/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
        <nav className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
          {quickLinks.map((link) => {
            const linkContent = (
              <>
                <span className="flex-shrink-0">{link.icon}</span>
                <span className={labelClass}>{link.name}</span>
              </>
            );
            if (link.external) {
              return (
                <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer" className={chipClass}>
                  {linkContent}
                </a>
              );
            }
            return (
              <Link key={link.href} href={link.href} className={chipClass}>
                {linkContent}
              </Link>
            );
          })}
        </nav>
      </div>
    </section>
  );

  return strip;
}

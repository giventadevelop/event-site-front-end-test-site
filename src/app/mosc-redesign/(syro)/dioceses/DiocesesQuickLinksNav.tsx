import React from 'react';
import Link from 'next/link';

/**
 * Shared Quick Links nav for diocese pages.
 * Styled and aligned like the Quick Links section on /mosc/catholicate-intro.
 */

const ChurchIcon = () => (
  <svg className="w-5 h-5 text-syro-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const GlobeIcon = () => (
  <svg className="w-5 h-5 text-syro-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
);

const BuildingIcon = () => (
  <svg className="w-5 h-5 text-syro-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const AcademicIcon = () => (
  <svg className="w-5 h-5 text-syro-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.747 5.754 18 7.5 18s3.332.747 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.747 18.247 18 16.5 18c-1.746 0-3.332.747-4.5 1.253" />
  </svg>
);

const BookIcon = () => (
  <svg className="w-5 h-5 text-syro-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.747 5.754 18 7.5 18s3.332.747 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.747 18.247 18 16.5 18c-1.746 0-3.332.747-4.5 1.253" />
  </svg>
);

const HeartIcon = () => (
  <svg className="w-5 h-5 text-syro-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const BookOpenIcon = () => (
  <svg className="w-5 h-5 text-syro-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.747 5.754 18 7.5 18s3.332.747 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.747 18.247 18 16.5 18c-1.746 0-3.332.747-4.5 1.253" />
  </svg>
);

const PhotoIcon = () => (
  <svg className="w-5 h-5 text-syro-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const MailIcon = () => (
  <svg className="w-5 h-5 text-syro-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const QuestionIcon = () => (
  <svg className="w-5 h-5 text-syro-red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const links = [
  { href: '/mosc-redesign/holy-synod', label: 'Holy Synod', icon: <ChurchIcon /> },
  { href: '/mosc-redesign/ecumenical', label: 'Ecumenical Relations', icon: <GlobeIcon /> },
  { href: '/mosc-redesign/institutions', label: 'Institutions', icon: <BuildingIcon /> },
  { href: '/mosc-redesign/training', label: 'Training', icon: <AcademicIcon /> },
  { href: '/mosc-redesign/publications', label: 'Publications', icon: <BookIcon /> },
  { href: '/mosc-redesign/spiritual-organizations-cms', label: 'Spiritual Organisations', icon: <HeartIcon /> },
  { href: '/mosc-redesign/theological-seminaries', label: 'Theological Seminaries', icon: <ChurchIcon /> },
  { href: '/mosc-redesign/lectionary', label: 'Lectionary', icon: <BookOpenIcon /> },
  { href: '/mosc-redesign/gallery', label: 'Gallery', icon: <PhotoIcon /> },
  { href: '/mosc-redesign/contact-info', label: 'Contact Info', icon: <MailIcon /> },
  { href: '/mosc-redesign/faqs', label: 'FAQs', icon: <QuestionIcon /> },
];

export default function DiocesesQuickLinksNav() {
  return (
    <section className="py-12 bg-syro-bg-gray border-t border-syro-table-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          {links.map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center px-4 py-2 bg-white rounded-lg shadow-syro-card hover:bg-syro-red/5 hover:scale-105 transition-all duration-300 border border-syro-table-border"
            >
              <span className="mr-2 flex-shrink-0">{icon}</span>
              <span className="font-syro-primary text-sm text-syro-blue hover:text-syro-red transition-all duration-300">
                {label}
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import Icon from './ui/Icon';

/**
 * Orthodox Cross SVG Component
 * A decorative element inspired by traditional Orthodox iconography
 */
const OrthodoxCross = ({ className = '' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 32"
    className={className}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M10 0h4v4h6v4h-6v4h-4V8H4V4h6V0zm0 12h4v20h-4V12z" />
    <path d="M6 22l3 2-3 2v-4zm12 0v4l-3-2 3-2z" opacity="0.7" />
  </svg>
);

/**
 * Decorative Border Pattern
 * Inspired by Byzantine manuscript illumination
 */
const OrnamentalDivider = () => (
  <div className="flex items-center justify-center gap-3 py-0.5">
    <div className="h-px w-8 bg-gradient-to-r from-transparent via-primary/40 to-primary/60" />
    <div className="w-1.5 h-1.5 rotate-45 bg-primary/50" />
    <div className="h-px w-16 bg-primary/40" />
    <OrthodoxCross className="w-3 h-4 text-primary/60" />
    <div className="h-px w-16 bg-primary/40" />
    <div className="w-1.5 h-1.5 rotate-45 bg-primary/50" />
    <div className="h-px w-8 bg-gradient-to-l from-transparent via-primary/40 to-primary/60" />
  </div>
);

const MOSCHeader = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // Track scroll position for header shadow effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const navigationItems = [
    { name: 'The Catholicate', href: '/mosc-old/catholicate' },
    { name: 'Administration', href: '/mosc-old/administration' },
    { name: 'The Church', href: '/mosc-old/the-church' },
    { name: 'Holy Synod', href: '/mosc-old/holy-synod' },
    { name: 'Ecumenical', href: '/mosc-old/ecumenical' },
    { name: 'Dioceses', href: '/mosc-old/dioceses' },
    { name: 'News', href: '/mosc-old/news' },
    { name: 'Directory', href: '/mosc-old/directory' },
    { name: 'Saints', href: '/mosc-old/saints' },
  ];

  const quickLinks: Array<{ name: string; href: string; external?: boolean }> = [
    { name: 'Spiritual Organisations', href: '/mosc-old/spiritual-organizations' },
    { name: 'Publications', href: '/mosc-old/publications' },
    { name: 'Institutions', href: '/mosc-old/institutions' },
    { name: 'Directory', href: '/mosc-old/directory' },
    { name: 'Training', href: '/mosc-old/training' },
    { name: 'Theological Seminaries', href: '/mosc-old/theological-seminaries' },
    { name: 'Lectionary', href: '/mosc-old/lectionary' },
    { name: 'Downloads', href: '/mosc-old/downloads' },
    { name: 'Calendar', href: '/mosc-old/calendar' },
    { name: 'Gallery', href: '/mosc-old/gallery' },
  ];

  const isActive = (href: string) => {
    return pathname?.startsWith(href) ?? false;
  };

  return (
    <header
      className={`
        bg-card border-b border-border overflow-hidden sticky top-0 z-50
        reverent-transition
        ${isScrolled ? 'sacred-shadow-lg' : ''}
      `}
    >
      {/* Ornamental Top Border - Thin gold accent line */}
      <div className="h-1 bg-gradient-to-r from-primary/20 via-accent to-primary/20" />

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">

          {/* Logo Section */}
          <Link
            href="/mosc-old"
            className="flex items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
            aria-label="Malankara Orthodox Syrian Church - Home"
          >
            <div className="relative">
              {/* Logo Container with subtle glow on hover */}
              <div className="
                w-40 h-[90px] sm:w-48 sm:h-[110px] md:w-56 md:h-[130px] lg:w-72 lg:h-[180px]
                rounded-lg flex items-center justify-center
                reverent-transition overflow-hidden
                group-hover:scale-[1.02]
              ">
                <Image
                  src="/images/logos/MOSC-logo-Brand-part.png"
                  alt="Malankara Orthodox Syrian Church"
                  width={256}
                  height={160}
                  className="w-full h-full object-contain drop-shadow-sm"
                  priority
                />
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav
            className="hidden lg:flex items-center"
            role="navigation"
            aria-label="Primary navigation"
          >
            <ul className="flex items-center gap-1">
              {navigationItems.map((item, index) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`
                      relative px-4 py-2.5 text-sm font-body font-medium tracking-wide
                      rounded-lg reverent-transition
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1
                      ${isActive(item.href)
                        ? 'bg-primary text-white sacred-shadow-sm'
                        : 'text-black hover:bg-muted hover:text-accent'
                      }
                    `}
                    aria-current={isActive(item.href) ? 'page' : undefined}
                  >
                    <span className="relative z-10">{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`
              lg:hidden p-3 rounded-lg reverent-transition
              focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
              ${isMobileMenuOpen
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted/50 text-foreground hover:bg-muted'
              }
            `}
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-navigation"
          >
            {isMobileMenuOpen ? (
              <Icon name="close" size={22} className="reverent-transition" />
            ) : (
              <Icon name="menu" size={22} className="reverent-transition" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Panel */}
        <div
          id="mobile-navigation"
          className={`
            lg:hidden overflow-y-auto reverent-transition
            ${isMobileMenuOpen ? 'max-h-[calc(100vh-120px)] opacity-100 pb-6' : 'max-h-0 opacity-0 overflow-hidden'}
          `}
          aria-hidden={!isMobileMenuOpen}
        >
          <div className="border-t border-border/50 pt-4">
            <OrnamentalDivider />
            <nav className="mt-4 space-y-1" role="navigation" aria-label="Mobile navigation">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg reverent-transition
                    font-body text-base font-medium
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-ring
                    ${isActive(item.href)
                      ? 'bg-primary text-white sacred-shadow-sm'
                      : 'text-black hover:bg-muted active:bg-muted/80'
                    }
                  `}
                  onClick={() => setIsMobileMenuOpen(false)}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                >
                  {isActive(item.href) && (
                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                  )}
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>

            {/* Mobile Quick Links - All links visible */}
            <div className="mt-6 pt-4 border-t border-border/30">
              <p className="px-4 text-xs font-caption font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Quick Links
              </p>
              <div className="grid grid-cols-2 gap-2 px-2">
                {quickLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="
                      px-3 py-2.5 text-sm font-body text-muted-foreground
                      rounded-lg hover:bg-muted hover:text-foreground
                      reverent-transition text-center
                      focus:outline-none focus-visible:ring-2 focus-visible:ring-ring
                    "
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links Bar - Desktop Only */}
      <div className="hidden lg:block bg-gradient-to-b from-muted/30 to-muted/60 border-t border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Decorative divider - hidden */}
          <div className="hidden" aria-hidden="true">
            <OrnamentalDivider />
          </div>

          {/* Quick Links */}
          <div className="py-2">
            <nav aria-label="Quick links">
              <ul className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2">
                <li className="flex items-center">
                  <span className="text-xs font-caption font-semibold text-accent uppercase tracking-wider mr-3">
                    Quick Links
                  </span>
                  <span className="text-muted-foreground/40 mr-2">│</span>
                </li>
                {quickLinks.map((link, index) => (
                  <li key={link.name} className="flex items-center">
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                          text-xs font-body text-muted-foreground
                          hover:text-primary hover:underline underline-offset-2
                          reverent-transition px-2 py-1 rounded
                          focus:outline-none focus-visible:ring-2 focus-visible:ring-ring
                        "
                      >
                        {link.name}
                        <span className="sr-only">(opens in new tab)</span>
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className={`
                          text-xs font-body px-2 py-1 rounded reverent-transition
                          focus:outline-none focus-visible:ring-2 focus-visible:ring-ring
                          ${isActive(link.href)
                            ? 'text-primary font-medium'
                            : 'text-muted-foreground hover:text-primary hover:underline underline-offset-2'
                          }
                        `}
                      >
                        {link.name}
                      </Link>
                    )}
                    {index < quickLinks.length - 1 && (
                      <span className="text-muted-foreground/30 mx-1" aria-hidden="true">•</span>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom ornamental border */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
    </header>
  );
};

export default MOSCHeader;

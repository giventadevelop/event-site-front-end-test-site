import React from 'react';
import Link from 'next/link';
import QuickLinks from '../components/QuickLinks';
import SyroPageBanner from '../components/SyroPageBanner';
import { MOSC_REDESIGN_SITEMAP, type SitemapLink } from './sitemapData';

export const metadata = {
  title: 'Sitemap',
  description: 'Complete sitemap of the Malankara Orthodox Syrian Church website.',
};

function ExternalLinkIcon() {
  return (
    <svg
      className="inline-block w-3.5 h-3.5 ml-1 opacity-70"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  );
}

function SitemapLinkItem({ link }: { link: SitemapLink }) {
  const className =
    'group flex items-start gap-2 text-sm text-warmGray-dark hover:text-burgundy transition-colors duration-200 leading-snug';

  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noopener noreferrer" className={className}>
        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-burgundy/35 group-hover:bg-burgundy transition-colors" />
        <span>
          {link.name}
          <ExternalLinkIcon />
        </span>
      </a>
    );
  }

  return (
    <Link href={link.href} className={className}>
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-burgundy/35 group-hover:bg-burgundy transition-colors" />
      <span>{link.name}</span>
    </Link>
  );
}

const SitemapPage = () => {
  return (
    <div className="min-h-screen bg-parchment">
      <SyroPageBanner
        title="Website Sitemap"
        breadcrumbFrom="home"
        description="Navigate all sections and pages of the Malankara Orthodox Syrian Church website — faith, history, administration, directory, and spiritual resources."
      />

      <section className="py-14 md:py-20 bg-parchment border-b border-burgundy/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
            {MOSC_REDESIGN_SITEMAP.map((section) => (
              <article
                key={section.title}
                className="rounded-2xl border border-burgundy/15 bg-white/80 shadow-sm hover:shadow-md hover:border-burgundy/30 transition-all duration-300 overflow-hidden"
              >
                <div className="h-1 bg-gradient-to-r from-burgundy via-burgundy-light to-warmGold" />
                <div className="p-6">
                  <h2 className="text-lg font-semibold text-warmBrown-dark mb-2">{section.title}</h2>
                  <p className="text-xs text-warmGray-dark/90 mb-5 leading-relaxed">{section.description}</p>
                  <nav className="space-y-2.5" aria-label={`${section.title} links`}>
                    {section.links.map((link) => (
                      <div key={`${section.title}-${link.href}`}>
                        <SitemapLinkItem link={link} />
                      </div>
                    ))}
                  </nav>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 bg-parchment-deep border-b border-burgundy/10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-semibold text-warmBrown-dark mb-3">Can&apos;t find what you need?</h2>
          <p className="text-warmGray-dark mb-8 leading-relaxed">
            Use the church directory to search parishes and priests, or contact us for help locating specific
            information.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/mosc-redesign/directory"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-burgundy text-white font-semibold text-sm hover:bg-burgundy-light transition-all duration-300 hover:shadow-lg hover:shadow-burgundy/30"
            >
              Search Directory
            </Link>
            <Link
              href="/mosc-redesign/contact-info"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border-2 border-burgundy text-burgundy font-semibold text-sm hover:bg-burgundy hover:text-white transition-all duration-300"
            >
              Contact Us
            </Link>
            <Link
              href="/mosc-redesign"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg border border-burgundy/30 text-warmBrown-dark font-semibold text-sm hover:border-burgundy/50 hover:bg-white transition-all duration-300"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>

      <QuickLinks />
    </div>
  );
};

export default SitemapPage;

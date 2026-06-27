import React from 'react';
import QuickLinks from '@/app/mosc/components/QuickLinks';
import SyroPageBanner from '@/app/mosc/components/SyroPageBanner';
import SpiritualOrganizationsSidebar from './SpiritualOrganizationsSidebar';

interface SpiritualOrgSubpageLayoutProps {
  /** Page title for the banner (e.g. "The Servants of the Cross") */
  title: string;
  /** Current path for sidebar highlight (e.g. /mosc/spiritual-organizations/the-servants-of-the-cross) */
  currentHref: string;
  /** Main content — will be wrapped in the white card like catholicate-intro */
  children: React.ReactNode;
}

/**
 * Layout for spiritual organizations subpages — matches catholicate-intro:
 * SyroPageBanner, section with grid (main 2 cols + sidebar 1 col), main in white card,
 * QuickLinks below main (desktop) and at bottom (mobile).
 */
export default function SpiritualOrgSubpageLayout({ title, currentHref, children }: SpiritualOrgSubpageLayoutProps) {
  return (
    <div className="bg-syro-bg-gray">
      <SyroPageBanner title={title} breadcrumbFrom="spiritual-organizations" />

      <section className="py-16 bg-syro-bg-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content — same card style as catholicate-intro */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-8 mb-8">
                {children}
              </div>

              <div className="mt-8 hidden lg:block">
                <QuickLinks />
              </div>
            </div>

            {/* Sidebar — matches catholicate-intro sidebar */}
            <SpiritualOrganizationsSidebar currentHref={currentHref} />
          </div>

          <div className="mt-8 lg:hidden">
            <QuickLinks />
          </div>
        </div>
      </section>
    </div>
  );
}

'use client';

import React from 'react';
import { HomeSectionEyebrow } from '@/components/HomeSectionEyebrow';

type HomeSectionRailProps = {
  eyebrow: string;
  children: React.ReactNode;
  /** Extra classes on the rail row (inside max-width container) */
  className?: string;
  /** Max-width container classes (default matches most sections) */
  containerClassName?: string;
};

/**
 * Left vertical section label + main content. Eyebrow uses shared pill styling.
 */
export function HomeSectionRail({
  eyebrow,
  children,
  className = '',
  containerClassName = 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8',
}: HomeSectionRailProps) {
  return (
    <div className={`home-section-rail ${containerClassName} ${className}`.trim()}>
      <aside className="home-section-rail__aside">
        <HomeSectionEyebrow label={eyebrow} />
      </aside>
      <div className="home-section-rail__content min-w-0 flex-1">{children}</div>
    </div>
  );
}

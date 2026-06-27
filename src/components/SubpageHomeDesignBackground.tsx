'use client';

import { useLayoutEffect } from 'react';
import HomeParticleBackground from '@/components/HomeParticleBackground';

type SubpageHomeDesignBackgroundProps = {
  /** Body class for page-specific header + text overrides (e.g. `gallery-page-background`) */
  bodyClass: string;
};

/**
 * Applies the homepage design system to public subpages (see design.md).
 */
export default function SubpageHomeDesignBackground({ bodyClass }: SubpageHomeDesignBackgroundProps) {
  useLayoutEffect(() => {
    document.body.classList.add('home-page-background');
    document.body.classList.add(bodyClass);
    return () => {
      document.body.classList.remove('home-page-background');
      document.body.classList.remove(bodyClass);
    };
  }, [bodyClass]);

  return <HomeParticleBackground />;
}

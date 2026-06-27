'use client';

import { useLayoutEffect } from 'react';
import HomeParticleBackground from '@/components/HomeParticleBackground';

/**
 * Applies the homepage design system to the Gallery page (see design.md).
 */
export default function GalleryPageBackground() {
  useLayoutEffect(() => {
    document.body.classList.add('home-page-background');
    document.body.classList.add('gallery-page-background');
    return () => {
      document.body.classList.remove('home-page-background');
      document.body.classList.remove('gallery-page-background');
    };
  }, []);

  return <HomeParticleBackground />;
}

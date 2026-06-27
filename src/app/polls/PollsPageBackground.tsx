'use client';

import { useLayoutEffect } from 'react';
import HomeParticleBackground from '@/components/HomeParticleBackground';

/**
 * Applies the homepage design system to the Polls page:
 * - `home-page-background`: particle-field tokens, purple-glass cards
 *   (`.home-page-layout .bg-white`), transparent footer, cleared section shells.
 * - `polls-page-background`: gives the header homepage behavior on this subpage
 *   (transparent at top, dark frosted on scroll) since `header-glass--home`
 *   only applies on `/`. See src/components/home-particle-background.css.
 *
 * Rendered from the (server) polls page; the body-class toggle needs a client
 * component, so this also renders the fixed particle canvas.
 */
export default function PollsPageBackground() {
  useLayoutEffect(() => {
    document.body.classList.add('home-page-background');
    document.body.classList.add('polls-page-background');
    return () => {
      document.body.classList.remove('home-page-background');
      document.body.classList.remove('polls-page-background');
    };
  }, []);

  return <HomeParticleBackground />;
}

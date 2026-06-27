import React from 'react';

/** Default building icon - design system: syro primary red, 40px icon in 80px circle */
const DefaultIcon = () => (
  <svg className="w-10 h-10 text-syro-red" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

export interface SyroPageHeroProps {
  title: string;
  description: string;
  /** Optional custom icon (default: building). Use w-10 h-10 and text-syro-red. */
  icon?: React.ReactNode;
}

/**
 * Syro subpage hero — matches catholicate.html / design system.
 * Background #f5f6f7 (syro-bg-gray), centered icon circle (border-syro-red/20, bg-syro-red/10),
 * h1 2.8rem/700 #0b2848, body 20px #506276.
 */
export default function SyroPageHero({ title, description, icon }: SyroPageHeroProps) {
  return (
    <section className="relative bg-gradient-to-br from-syro-bg-gray to-syro-bg-gray min-h-[280px] flex items-center py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full border-2 border-syro-red/20 bg-syro-red/10 flex items-center justify-center mx-auto mb-6">
            {icon ?? <DefaultIcon />}
          </div>
          <h1 className="font-syro-display font-semibold text-4xl text-syro-blue mb-4">
            {title}
          </h1>
          <p className="font-syro-primary text-lg text-syro-dark-gray max-w-3xl mx-auto leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}

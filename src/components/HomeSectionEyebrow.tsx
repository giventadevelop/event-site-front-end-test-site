'use client';

import React from 'react';

type HomeSectionEyebrowProps = {
  label: string;
  className?: string;
};

/** Pill label with yellow mark — styled via globals.css on home-page-background */
export function HomeSectionEyebrow({ label, className = '' }: HomeSectionEyebrowProps) {
  return (
    <div
      className={`home-section-eyebrow ${className}`.trim()}
      role="doc-subtitle"
      aria-label={label}
    >
      <div className="home-section-eyebrow-stack">
        <div className="home-section-eyebrow-mark" aria-hidden />
        <p className="home-section-eyebrow-label">{label}</p>
      </div>
    </div>
  );
}

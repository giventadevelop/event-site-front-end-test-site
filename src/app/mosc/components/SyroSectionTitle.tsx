import React from 'react';

/**
 * Section title with left red accent bar — design system.
 * 24px, font-weight 300, color #798daf, 7px left border #dc3545 (syro-red).
 */
/** Section title — matches catholicate intro heading style (font-syro-display, 2.2rem, bold, black). */
export default function SyroSectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-syro-display text-[2.2rem] font-bold text-black mb-5">
      {children}
    </h2>
  );
}

import React from 'react';

/**
 * White intro card — design system shadow.
 * padding 40px, border-radius 5px, box-shadow: rgba(50,50,93,0.25) 0px 6px 12px -2px, rgba(0,0,0,0.3) 0px 3px 7px -3px.
 */
export default function SyroIntroCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`bg-white p-10 rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] mb-16 ${className}`}
    >
      {children}
    </div>
  );
}

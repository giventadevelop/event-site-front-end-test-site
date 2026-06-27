'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

interface ConditionalLayoutProps {
  children: React.ReactNode;
  header: React.ReactNode;
  footer: React.ReactNode;
}

export default function ConditionalLayout({ children, header, footer }: ConditionalLayoutProps) {
  const pathname = usePathname();

  // Legacy MOSC app at /mosc-old (app/mosc-old)
  const isMoscOldRoute = pathname?.startsWith("/mosc-old") ?? false;
  // Syro apps: /mosc (app/mosc), /mosc-redesign (app/mosc-redesign — rocket home + (syro) subpages)
  const isMoscRoute = (pathname?.startsWith("/mosc") && !pathname?.startsWith("/mosc-old")) ?? false;

  // For /mosc-old and /mosc, render children without main app header/footer
  if (isMoscOldRoute || isMoscRoute) {
    return <>{children}</>;
  }

  // For all other routes, render the full layout with header and footer
  return (
    <>
      {header}
      <div className="flex-1 flex flex-col">
        {children}
      </div>
      {footer}
    </>
  );
}
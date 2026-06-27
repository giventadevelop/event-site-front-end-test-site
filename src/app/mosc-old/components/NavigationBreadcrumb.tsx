'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NavigationBreadcrumb = () => {
  const pathname = usePathname();

  // Don't show breadcrumb on homepage
  if (pathname === '/mosc-old') return null;

  const generateBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Home', href: '/mosc-old' }];

    let currentPath = '/mosc-old';

    segments.forEach((segment, index) => {
      if (segment !== 'mosc') {
        currentPath += `/${segment}`;

        // Convert segment to readable name
        const name = segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        breadcrumbs.push({
          name: name,
          href: currentPath
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav
      className="bg-muted/30 border-b border-border"
      aria-label="Breadcrumb navigation"
      role="navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <ol className="flex items-center space-x-2 text-sm" role="list">
          {breadcrumbs.map((breadcrumb, index) => (
            <li key={breadcrumb.href} className="flex items-center" role="listitem">
              {index > 0 && (
                <span className="text-muted-foreground/50 mx-2" role="img" aria-label="Separator">
                  '
                </span>
              )}
              {index === breadcrumbs.length - 1 ? (
                <span
                  className="font-medium text-foreground"
                  aria-current="page"
                >
                  {breadcrumb.name}
                </span>
              ) : (
                <Link
                  href={breadcrumb.href}
                  className="text-muted-foreground hover:text-primary reverent-transition"
                >
                  {breadcrumb.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
};

export default NavigationBreadcrumb;















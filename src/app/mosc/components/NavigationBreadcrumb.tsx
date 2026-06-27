'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NavigationBreadcrumb = () => {
  const pathname = usePathname();

  if (pathname === '/mosc') return null;

  const generateBreadcrumbs = () => {
    const segments = pathname?.split('/').filter(Boolean) || [];
    const breadcrumbs = [{ name: 'Home', href: '/mosc' }];
    let currentPath = '/mosc';
    segments.forEach((segment) => {
      if (segment !== 'syro') {
        currentPath += `/${segment}`;
        const name = segment.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        breadcrumbs.push({ name, href: currentPath });
      }
    });
    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <nav className="bg-syro-bg-gray border-b border-syro-table-border py-3" aria-label="Breadcrumb navigation" role="navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ol className="flex items-center space-x-2 text-syro-small" role="list">
          {breadcrumbs.map((breadcrumb, index) => (
            <li key={breadcrumb.href} className="flex items-center" role="listitem">
              {index > 0 && (
                <span className="text-syro-medium-gray/50 mx-2" role="img" aria-label="Separator">/</span>
              )}
              {index === breadcrumbs.length - 1 ? (
                <span className="font-medium text-syro-blue" aria-current="page">{breadcrumb.name}</span>
              ) : (
                <Link href={breadcrumb.href} className="text-syro-dark-gray hover:text-syro-red transition-all duration-300">
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

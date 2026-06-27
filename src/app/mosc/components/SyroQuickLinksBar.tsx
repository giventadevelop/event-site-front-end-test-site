'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const QUICK_LINKS = [
  { name: 'Spiritual Organisations', href: '/mosc/spiritual-organizations' },
  { name: 'Publications', href: '/mosc/publications' },
  { name: 'Institutions', href: '/mosc/institutions' },
  { name: 'Training', href: '/mosc/training' },
  { name: 'Theological Seminaries', href: '/mosc/theological-seminaries' },
  { name: 'Lectionary', href: '/mosc/lectionary' },
  { name: 'Downloads', href: '/mosc/downloads' },
  { name: 'Calendar', href: '/mosc/calendar' },
  { name: 'Gallery', href: '/mosc/gallery' },
];

export default function SyroQuickLinksBar() {
  const pathname = usePathname();
  const isActive = (href: string) => pathname?.startsWith(href) ?? false;

  return (
    <div className="syro-quicklinks-bar" role="navigation" aria-label="Quick links">
      <div className="container">
        <div className="syro-quicklinks-inner d-flex flex-nowrap align-items-center justify-content-center py-2">
          <ul className="list-unstyled d-flex flex-nowrap align-items-center mb-0 flex-shrink-0">
            {QUICK_LINKS.map((link, index) => (
              <li key={link.href} className="d-flex align-items-center">
                <Link
                  href={link.href}
                  className={`syro-quicklink ${isActive(link.href) ? 'active' : ''}`}
                >
                  {link.name}
                </Link>
                {index < QUICK_LINKS.length - 1 && (
                  <span className="syro-quicklinks-bullet mx-1" aria-hidden="true">
                    •
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

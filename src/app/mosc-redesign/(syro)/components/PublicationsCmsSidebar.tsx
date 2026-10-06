'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MOSC_CMS_SIDEBAR_CLASS, moscCmsSidebarLinkClass } from './MoscCmsHubCard';

export interface PublicationsCmsSidebarEntry {
  name: string;
  href: string;
  slug: string;
}

interface PublicationsCmsSidebarProps {
  entries: PublicationsCmsSidebarEntry[];
  currentSlug: string;
}

export default function PublicationsCmsSidebar({ entries, currentSlug }: PublicationsCmsSidebarProps) {
  const pathname = usePathname();

  return (
    <div className={MOSC_CMS_SIDEBAR_CLASS}>
      <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-4">
        Publications
      </h3>
      <nav className="space-y-1">
        {entries.map((entry) => {
          const isActive = currentSlug === entry.slug || pathname === entry.href;
          return (
            <Link
              key={entry.slug}
              href={entry.href}
              className={moscCmsSidebarLinkClass(isActive)}
            >
              {entry.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

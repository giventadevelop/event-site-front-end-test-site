'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MOSC_CMS_SIDEBAR_CLASS, moscCmsSidebarLinkClass } from './MoscCmsHubCard';

export interface SpiritualOrganizationsCmsSidebarEntry {
  name: string;
  href: string;
  slug: string;
}

interface SpiritualOrganizationsCmsSidebarProps {
  entries: SpiritualOrganizationsCmsSidebarEntry[];
  currentSlug: string;
}

export default function SpiritualOrganizationsCmsSidebar({
  entries,
  currentSlug,
}: SpiritualOrganizationsCmsSidebarProps) {
  const pathname = usePathname();

  return (
    <div className={MOSC_CMS_SIDEBAR_CLASS}>
      <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-4">
        Spiritual Organizations
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

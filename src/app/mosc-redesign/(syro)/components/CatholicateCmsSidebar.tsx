'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MOSC_CMS_SIDEBAR_CLASS, moscCmsSidebarLinkClass } from './MoscCmsHubCard';

export interface CatholicateCmsSidebarEntry {
  name: string;
  href: string;
}

interface CatholicateCmsSidebarProps {
  entries: CatholicateCmsSidebarEntry[];
}

export default function CatholicateCmsSidebar({ entries }: CatholicateCmsSidebarProps) {
  const pathname = usePathname();

  return (
    <div className={MOSC_CMS_SIDEBAR_CLASS}>
      <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-4">
        The Catholicate
      </h3>
      <nav className="space-y-1">
        {entries.map((entry) => {
          const isActive = pathname === entry.href;
          return (
            <Link
              key={entry.href}
              href={entry.href}
              className={moscCmsSidebarLinkClass(isActive)}
            >
              <span className={`font-syro-display font-medium ${isActive ? 'text-white' : ''}`}>
                {entry.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

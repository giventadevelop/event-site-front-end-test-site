'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
    <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-6">
      <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-4 pl-4 border-l-4 border-syro-red">
        Spiritual Organizations
      </h3>
      <div className="space-y-1.5">
        {entries.map((entry) => {
          const isActive = currentSlug === entry.slug || pathname === entry.href;
          return (
            <Link
              key={entry.slug}
              href={entry.href}
              className={`block px-3 py-2 rounded-lg transition-colors font-syro-primary text-sm leading-tight outline-none focus:outline-none ${
                isActive
                  ? 'bg-syro-red text-white'
                  : 'text-syro-dark-gray hover:text-syro-blue hover:bg-syro-bg-gray/50'
              }`}
            >
              {entry.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

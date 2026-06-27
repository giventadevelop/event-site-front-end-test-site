'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface TheologicalSeminariesCmsSidebarEntry {
  name: string;
  slug: string;
  href: string;
}

interface TheologicalSeminariesCmsSidebarProps {
  entries: TheologicalSeminariesCmsSidebarEntry[];
  currentSlug: string;
}

export default function TheologicalSeminariesCmsSidebar({
  entries,
  currentSlug,
}: TheologicalSeminariesCmsSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-6 border border-syro-red">
        <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-4">
          Theological Seminaries
        </h3>
        <nav className="space-y-2">
          {entries.map((entry) => {
            const isActive = currentSlug === entry.slug || pathname === entry.href;
            return (
              <Link
                key={entry.slug}
                href={entry.href}
                className={`block px-3 py-2 rounded-md font-syro-primary text-sm transition-colors outline-none focus:outline-none ${
                  isActive
                    ? 'bg-syro-red text-white'
                    : 'text-syro-dark-gray hover:text-syro-blue hover:bg-syro-bg-gray'
                }`}
              >
                {entry.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

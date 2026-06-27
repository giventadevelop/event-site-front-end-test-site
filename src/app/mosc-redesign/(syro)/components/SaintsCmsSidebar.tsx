'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface SaintsCmsSidebarEntry {
  name: string;
  href: string;
}

interface SaintsCmsSidebarProps {
  entries: SaintsCmsSidebarEntry[];
}

export default function SaintsCmsSidebar({ entries }: SaintsCmsSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-6 mb-6">
      <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-4">
        Saints Categories
      </h3>
      <nav className="space-y-2">
        {entries.map((entry) => {
          const isActive = pathname === entry.href;
          return (
            <Link
              key={entry.href}
              href={entry.href}
              className={`block px-3 py-2 rounded-md font-syro-primary text-sm transition-all duration-300 outline-none focus:outline-none ${
                isActive
                  ? 'bg-syro-red text-white'
                  : 'text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray'
              }`}
            >
              {entry.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

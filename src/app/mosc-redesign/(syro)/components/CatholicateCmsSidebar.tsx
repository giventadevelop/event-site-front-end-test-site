'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface CatholicateCmsSidebarEntry {
  name: string;
  href: string;
  period?: string | null;
  description?: string | null;
}

interface CatholicateCmsSidebarProps {
  entries: CatholicateCmsSidebarEntry[];
}

export default function CatholicateCmsSidebar({ entries }: CatholicateCmsSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-6">
      <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-4 pl-4 border-l-4 border-syro-red">
        The Catholicate
      </h3>
      <nav className="space-y-1.5">
        {entries.map((entry) => {
          const isActive = pathname === entry.href;
          return (
            <Link
              key={entry.href}
              href={entry.href}
              className={`block px-3 py-2 rounded-lg font-syro-primary text-sm leading-tight outline-none focus:outline-none transition-colors ${
                isActive
                  ? 'bg-syro-red text-white'
                  : 'text-syro-dark-gray hover:text-syro-blue hover:bg-syro-bg-gray/50'
              }`}
            >
              <span className={`font-syro-display font-medium ${isActive ? 'text-white' : ''}`}>
                {entry.name}
              </span>
              {entry.period ? (
                <p
                  className={`font-syro-primary text-xs font-medium mt-0 mb-0 ${
                    isActive ? '!text-white' : 'text-syro-blue'
                  }`}
                >
                  {entry.period}
                </p>
              ) : null}
              {entry.description ? (
                <p
                  className={`font-syro-primary text-xs leading-tight mt-0 mb-0 ${
                    isActive ? '!text-white' : 'text-[#798daf]'
                  }`}
                >
                  {entry.description}
                </p>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

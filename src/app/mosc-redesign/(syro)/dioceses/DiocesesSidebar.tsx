'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DIOCESES_LIST } from './diocesesList';

/**
 * Sidebar nav for diocese subpages: lists all dioceses from /mosc/dioceses
 * with no category headings (Kerala / India / International).
 */
export default function DiocesesSidebar() {
  const pathname = usePathname();
  return (
    <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-6 mb-6">
      <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-4">
        Dioceses
      </h3>
      <nav className="space-y-2">
        {DIOCESES_LIST.map(({ name, href }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={
                isActive
                  ? 'block px-3 py-2 bg-syro-red text-white rounded-md font-syro-primary text-sm transition-all duration-300'
                  : 'block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300'
              }
            >
              {name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface HolySynodCmsSidebarMember {
  name: string;
  href: string;
}

interface HolySynodCmsSidebarProps {
  members: HolySynodCmsSidebarMember[];
}

export default function HolySynodCmsSidebar({ members }: HolySynodCmsSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-6">
      <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-4">Holy Synod</h3>
      <nav className="space-y-1">
        {members.map((member) => {
          const isActive = pathname === member.href;
          return (
            <Link
              key={member.href}
              href={member.href}
              className={`block px-3 py-2 rounded-md font-syro-primary text-sm transition-all duration-300 outline-none focus:outline-none ${
                isActive
                  ? 'bg-syro-red text-white'
                  : 'text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray'
              }`}
            >
              {member.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

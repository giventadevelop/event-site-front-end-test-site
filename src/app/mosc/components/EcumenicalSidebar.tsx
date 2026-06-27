'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface EcumenicalItem {
  name: string;
  href: string;
}

const ecumenicalItems: EcumenicalItem[] = [
  { name: 'Ecumenical Overview', href: '/mosc/ecumenical' },
  { name: 'Department of Ecumenical Relations', href: '/mosc/ecumenical/world-council-of-churches' },
  { name: 'The Relation between Orthodox Churches', href: '/mosc/ecumenical/orthodox-churches' },
  { name: 'Relationship with the Catholic Churches', href: '/mosc/ecumenical/catholic-church' },
  { name: 'In Egypt with the Message of Fraternity', href: '/mosc/ecumenical/in-egypt-with-the-message-of-fraternity' },
  { name: 'The Shepherd of the Indian Church in Ethiopia', href: '/mosc/ecumenical/the-shepherd-of-the-indian-church-in-ethiopia' },
  { name: 'The Confluence of Love in Vatican', href: '/mosc/ecumenical/the-confluence-of-love-in-vatican' },
  { name: 'The Fraternity at Vienna', href: '/mosc/ecumenical/the-fraternity-at-vienna' },
  { name: 'The relevant portions of the speech of His Holiness Baselios Marthoma Paulose II at the meeting with His Holiness Pope Francis at Vatican', href: '/mosc/ecumenical/catholicos-speech-vatican' },
  { name: 'Relevant portions of the speech by His Holiness Pope Francis at the meeting with His Holiness Baselios Marthoma Paulose II at Vatican', href: '/mosc/ecumenical/pope-francis-speech-vatican' },
  { name: 'The Successor of St. Thomas in Europe', href: '/mosc/ecumenical/the-successor-of-st-thomas-in-europe' },
  { name: 'Co-operation with the Protestant Churches', href: '/mosc/ecumenical/co-operation-with-the-protestant-churches' },
  { name: 'Ecumenical ventures in modern times', href: '/mosc/ecumenical/ecumenical-ventures-in-modern-times' },
];

export default function EcumenicalSidebar() {
  const pathname = usePathname();
  const isSubpage = pathname !== '/mosc/ecumenical';

  return (
    <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-6 mb-6">
      <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-4">
        Ecumenical Relations
      </h3>
      <nav className="space-y-1">
        {ecumenicalItems.map((item) => {
          const isActive = pathname === item.href;
          const isOverviewLink = item.href === '/mosc/ecumenical';
          const isHidden = isSubpage && isOverviewLink;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-md font-syro-primary text-sm transition-all duration-300 outline-none focus:outline-none ${
                isActive
                  ? 'bg-syro-red text-white'
                  : 'text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray'
              } ${isHidden ? 'hidden' : ''}`}
            >
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

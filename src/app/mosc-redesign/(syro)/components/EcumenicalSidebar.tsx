'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface EcumenicalItem {
  name: string;
  href: string;
}

const ecumenicalItems: EcumenicalItem[] = [
  { name: 'Ecumenical Overview', href: '/mosc-redesign/ecumenical' },
  { name: 'Department of Ecumenical Relations', href: '/mosc-redesign/ecumenical/world-council-of-churches' },
  { name: 'The Relation between Orthodox Churches', href: '/mosc-redesign/ecumenical/orthodox-churches' },
  { name: 'Relationship with the Catholic Churches', href: '/mosc-redesign/ecumenical/catholic-church' },
  { name: 'In Egypt with the Message of Fraternity', href: '/mosc-redesign/ecumenical/in-egypt-with-the-message-of-fraternity' },
  { name: 'The Shepherd of the Indian Church in Ethiopia', href: '/mosc-redesign/ecumenical/the-shepherd-of-the-indian-church-in-ethiopia' },
  { name: 'The Confluence of Love in Vatican', href: '/mosc-redesign/ecumenical/the-confluence-of-love-in-vatican' },
  { name: 'The Fraternity at Vienna', href: '/mosc-redesign/ecumenical/the-fraternity-at-vienna' },
  { name: 'The relevant portions of the speech of His Holiness Baselios Marthoma Paulose II at the meeting with His Holiness Pope Francis at Vatican', href: '/mosc-redesign/ecumenical/catholicos-speech-vatican' },
  { name: 'Relevant portions of the speech by His Holiness Pope Francis at the meeting with His Holiness Baselios Marthoma Paulose II at Vatican', href: '/mosc-redesign/ecumenical/pope-francis-speech-vatican' },
  { name: 'The Successor of St. Thomas in Europe', href: '/mosc-redesign/ecumenical/the-successor-of-st-thomas-in-europe' },
  { name: 'Co-operation with the Protestant Churches', href: '/mosc-redesign/ecumenical/co-operation-with-the-protestant-churches' },
  { name: 'Ecumenical ventures in modern times', href: '/mosc-redesign/ecumenical/ecumenical-ventures-in-modern-times' },
];

export default function EcumenicalSidebar() {
  const pathname = usePathname();
  const isSubpage = pathname !== '/mosc-redesign/ecumenical';

  return (
    <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-6 mb-6">
      <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-4">
        Ecumenical Relations
      </h3>
      <nav className="space-y-1">
        {ecumenicalItems.map((item) => {
          const isActive = pathname === item.href;
          const isOverviewLink = item.href === '/mosc-redesign/ecumenical';
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

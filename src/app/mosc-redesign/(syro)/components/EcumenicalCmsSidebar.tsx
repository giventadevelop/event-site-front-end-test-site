'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface EcumenicalCmsSidebarArticle {
  name: string;
  href: string;
}

interface EcumenicalCmsSidebarProps {
  articles: EcumenicalCmsSidebarArticle[];
}

export default function EcumenicalCmsSidebar({ articles }: EcumenicalCmsSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-6 mb-6">
      <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-4">
        Ecumenical Relations
      </h3>
      <nav className="space-y-1">
        {articles.map((article) => {
          const isActive = pathname === article.href;
          return (
            <Link
              key={article.href}
              href={article.href}
              className={`block px-3 py-2 rounded-md font-syro-primary text-sm transition-all duration-300 outline-none focus:outline-none ${
                isActive
                  ? 'bg-syro-red text-white'
                  : 'text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray'
              }`}
            >
              {article.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

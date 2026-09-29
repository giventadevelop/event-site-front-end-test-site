import Link from 'next/link';
import type { ReactNode } from 'react';

interface Props {
  href: string;
  children: ReactNode;
}

export default function CompetitionBackLink({ href, children }: Props) {
  return (
    <div>
      <Link
        href={href}
        className="inline-flex items-center gap-2 px-4 py-2 border-2 border-border rounded-xl text-sm font-semibold text-foreground hover:border-primary hover:text-primary reverent-transition"
      >
        {children}
      </Link>
    </div>
  );
}

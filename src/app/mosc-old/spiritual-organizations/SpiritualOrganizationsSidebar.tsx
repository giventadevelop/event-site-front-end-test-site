import Link from 'next/link';
import { SPIRITUAL_ORGANIZATIONS_NAV } from './organizations-data';

interface SpiritualOrganizationsSidebarProps {
  /** Current page href (e.g. /mosc/spiritual-organizations/ecological-commission) to highlight in nav */
  currentHref: string;
}

/**
 * Sidebar nav listing all spiritual organizations, matching the style of
 * "The Church" sidebar on /mosc/the-church/the-holy-myron.
 */
export default function SpiritualOrganizationsSidebar({ currentHref }: SpiritualOrganizationsSidebarProps) {
  return (
    <div className="bg-background rounded-lg sacred-shadow p-6 sticky top-8">
      <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
        Spiritual Organizations
      </h3>
      <nav className="space-y-2">
        <Link
          href="/mosc-old/spiritual-organizations"
          className={`block px-3 py-2 rounded-md font-body text-sm reverent-transition ${
            currentHref === '/mosc-old/spiritual-organizations'
              ? 'bg-primary text-white'
              : 'text-muted-foreground hover:text-primary hover:bg-muted'
          }`}
        >
          All Spiritual Organizations
        </Link>
        {SPIRITUAL_ORGANIZATIONS_NAV.map((org) => (
          <Link
            key={org.href}
            href={org.href}
            className={`block px-3 py-2 rounded-md font-body text-sm reverent-transition ${
              currentHref === org.href
                ? 'bg-primary text-white'
                : 'text-muted-foreground hover:text-primary hover:bg-muted'
            }`}
          >
            {org.title}
          </Link>
        ))}
      </nav>
    </div>
  );
}

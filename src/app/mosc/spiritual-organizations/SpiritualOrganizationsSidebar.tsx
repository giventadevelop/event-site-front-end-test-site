import Link from 'next/link';
import { SPIRITUAL_ORGANIZATIONS_NAV } from './organizations-data';

interface SpiritualOrganizationsSidebarProps {
  /** Current page href (e.g. /mosc/spiritual-organizations/ecological-commission) to highlight in nav */
  currentHref: string;
}

/**
 * Sidebar nav for spiritual organizations subpages — matches catholicate-intro layout:
 * white card, same shadow, "Spiritual Organizations" heading with red left border,
 * org links with block style (active: bg-syro-red text-white, same as administration).
 */
export default function SpiritualOrganizationsSidebar({ currentHref }: SpiritualOrganizationsSidebarProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-6">
        <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-4 pl-4 border-l-4 border-syro-red">
          Spiritual Organizations
        </h3>
        <div className="space-y-1.5">
          {SPIRITUAL_ORGANIZATIONS_NAV.map((org) => {
            const isActive = currentHref === org.href;
            return (
              <Link
                key={org.href}
                href={org.href}
                className={`block px-3 py-2 rounded-lg transition-colors font-syro-primary text-sm leading-tight outline-none focus:outline-none ${
                  isActive
                    ? 'bg-syro-red text-white'
                    : 'text-syro-dark-gray hover:text-syro-blue hover:bg-syro-bg-gray/50'
                }`}
              >
                {org.title}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

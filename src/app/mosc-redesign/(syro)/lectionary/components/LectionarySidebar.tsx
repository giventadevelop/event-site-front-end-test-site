import Link from 'next/link';
import { MOSC_CMS_SIDEBAR_CLASS, moscCmsSidebarLinkClass } from '../../components/MoscCmsHubCard';

const LECTIONARY_LINKS: { slug: string; label: string }[] = [
  { slug: 'koodosh-eetho-to-kothne', label: 'Koodosh Eetho to Kothne' },
  { slug: 'great-lent', label: 'Great Lent' },
  { slug: 'kyomtho-easter-to-koodosh-edtho', label: 'Kyomtho (Easter) to Koodosh Edtho' },
  { slug: 'special-occasions', label: 'Special Occasions' },
];

export default function LectionarySidebar({ currentSlug }: { currentSlug: string }) {
  return (
    <div className={MOSC_CMS_SIDEBAR_CLASS}>
      <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-4">
        Lectionary
      </h3>
      <nav className="space-y-1">
        {LECTIONARY_LINKS.map(({ slug, label }) => {
          const isActive = currentSlug === slug;
          return (
            <Link
              key={slug}
              href={`/mosc-redesign/lectionary/${slug}`}
              className={moscCmsSidebarLinkClass(isActive)}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

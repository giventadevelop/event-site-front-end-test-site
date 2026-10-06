import Link from 'next/link';
import { MOSC_CMS_SIDEBAR_CLASS, moscCmsSidebarLinkClass } from './MoscCmsHubCard';
import { INSTITUTION_HUB_CATEGORIES } from '../institutions-cms/institutionHubCategories';

export default function InstitutionsCmsSidebar({ currentSlug }: { currentSlug: string }) {
  return (
    <div className={MOSC_CMS_SIDEBAR_CLASS}>
      <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-4">
        Our Institutions
      </h3>
      <nav className="space-y-1">
        {INSTITUTION_HUB_CATEGORIES.map(({ slug, title }) => {
          const isActive = currentSlug === slug;
          return (
            <Link
              key={slug}
              href={`/mosc-redesign/institutions-cms/${slug}`}
              className={moscCmsSidebarLinkClass(isActive)}
            >
              {title}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

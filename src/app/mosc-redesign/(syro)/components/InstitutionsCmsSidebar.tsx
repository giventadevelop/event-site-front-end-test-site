import Link from 'next/link';
import { INSTITUTION_HUB_CATEGORIES } from '../institutions-cms/institutionHubCategories';

export default function InstitutionsCmsSidebar({ currentSlug }: { currentSlug: string }) {
  return (
    <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-6 mb-6 lg:sticky lg:top-4">
      <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-4">
        Our Institutions
      </h3>
      <nav className="space-y-2">
        {INSTITUTION_HUB_CATEGORIES.map(({ slug, title }) => {
          const isActive = currentSlug === slug;
          return (
            <Link
              key={slug}
              href={`/mosc-redesign/institutions-cms/${slug}`}
              className={`block px-3 py-2 rounded-md font-syro-primary text-sm transition-colors outline-none focus:outline-none ${
                isActive
                  ? 'bg-syro-red text-white'
                  : 'text-syro-dark-gray hover:text-syro-blue hover:bg-syro-bg-gray'
              }`}
            >
              {title}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

import Link from 'next/link';

const PUBLICATIONS_LINKS: { slug: string; label: string }[] = [
  { slug: 'malankara-sabha-magazine-masika', label: 'Malankara Sabha Magazine (Masika)' },
];

export default function PublicationsSidebar({ currentSlug }: { currentSlug: string }) {
  return (
    <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-6 mb-6 lg:sticky lg:top-4">
      <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-4">
        Publications
      </h3>
      <nav className="space-y-2">
        {PUBLICATIONS_LINKS.map(({ slug, label }) => {
          const href = slug ? `/mosc/publications/${slug}` : '/mosc/publications';
          const isActive = currentSlug === slug;
          return (
            <Link
              key={slug || 'index'}
              href={href}
              className={`block px-3 py-2 rounded-md font-syro-primary text-sm transition-colors outline-none focus:outline-none ${
                isActive
                  ? 'bg-syro-red text-white'
                  : 'text-syro-dark-gray hover:text-syro-blue hover:bg-syro-bg-gray'
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

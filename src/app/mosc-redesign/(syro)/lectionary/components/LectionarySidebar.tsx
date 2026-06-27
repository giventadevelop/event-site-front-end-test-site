import Link from 'next/link';

const LECTIONARY_LINKS: { slug: string; label: string }[] = [
  { slug: 'koodosh-eetho-to-kothne', label: 'Koodosh Eetho to Kothne' },
  { slug: 'great-lent', label: 'Great Lent' },
  { slug: 'kyomtho-easter-to-koodosh-edtho', label: 'Kyomtho (Easter) to Koodosh Edtho' },
  { slug: 'special-occasions', label: 'Special Occasions' },
];

export default function LectionarySidebar({ currentSlug }: { currentSlug: string }) {
  return (
    <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-6 mb-6 lg:sticky lg:top-4">
      <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-4">
        Lectionary
      </h3>
      <nav className="space-y-2">
        {LECTIONARY_LINKS.map(({ slug, label }) => {
          const isActive = currentSlug === slug;
          return (
            <Link
              key={slug}
              href={`/mosc-redesign/lectionary/${slug}`}
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

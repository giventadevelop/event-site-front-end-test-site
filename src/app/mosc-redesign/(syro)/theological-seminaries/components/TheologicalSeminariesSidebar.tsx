import Link from 'next/link';

const SEMINARY_LINKS: { slug: string; label: string }[] = [
  { slug: 'the-orthodox-theological-seminary', label: 'The Orthodox Theological Seminary' },
  { slug: 'st-thomas-orthodox-theological-seminary-nagpur', label: 'St. Thomas Orthodox Theological Seminary, Nagpur' },
];

export default function TheologicalSeminariesSidebar({ currentSlug }: { currentSlug: string }) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-6 border border-syro-red">
        <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-4">
          Theological Seminaries
        </h3>
        <nav className="space-y-2">
          {SEMINARY_LINKS.map(({ slug, label }) => {
            const isActive = currentSlug === slug;
            return (
              <Link
                key={slug}
                href={`/mosc-redesign/theological-seminaries/${slug}`}
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
      <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-6 hidden" aria-hidden="true">
        <h3 className="font-syro-display font-semibold text-xl text-syro-blue mb-4">
          Related Pages
        </h3>
        <div className="space-y-3">
          <Link
            href="/mosc-redesign/theological-seminaries"
            className="block text-syro-red hover:text-syro-red/80 font-syro-primary font-medium transition-all duration-300"
          >
            All Theological Seminaries
          </Link>
          <Link
            href="/mosc-redesign/institutions"
            className="block text-syro-red hover:text-syro-red/80 font-syro-primary font-medium transition-all duration-300"
          >
            Church Institutions
          </Link>
          <Link
            href="/mosc-redesign/training"
            className="block text-syro-red hover:text-syro-red/80 font-syro-primary font-medium transition-all duration-300"
          >
            Training Programs
          </Link>
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';

const TRAINING_LINKS: { slug: string; label: string }[] = [
  { slug: 'sruti-school-of-liturgical-music', label: 'Sruti School of Liturgical Music' },
  { slug: 'divyabodhanam', label: 'Divyabodhanam' },
  { slug: 'st-basil-bible-school', label: 'St. Basil Bible School' },
];

export default function TrainingSidebar({ currentSlug }: { currentSlug: string }) {
  return (
    <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-6 mb-6 lg:sticky lg:top-4 border border-syro-red">
      <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-4">
        Training Programs
      </h3>
      <nav className="space-y-2">
        {TRAINING_LINKS.map(({ slug, label }) => {
          const isActive = currentSlug === slug;
          return (
            <Link
              key={slug}
              href={`/mosc-redesign/training/${slug}`}
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

import Link from 'next/link';

const INSTITUTION_LINKS: { slug: string; label: string }[] = [
  { slug: 'major-centres', label: 'Major Centres' },
  { slug: 'monasteries', label: 'Monasteries' },
  { slug: 'convents', label: 'Convents' },
  { slug: 'orphanages', label: 'Orphanages' },
  { slug: 'hospitals', label: 'Hospitals' },
  { slug: 'medical-college', label: 'Medical College' },
  { slug: 'engineering-colleges', label: 'Engineering Colleges' },
  { slug: 'moc-colleges', label: 'MOC Colleges' },
  { slug: 'schools', label: 'Schools' },
];

export default function InstitutionsSidebar({ currentSlug }: { currentSlug: string }) {
  return (
    <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-6 mb-6 lg:sticky lg:top-4">
      <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-4">
        Our Institutions
      </h3>
      <nav className="space-y-2">
        {INSTITUTION_LINKS.map(({ slug, label }) => {
          const isActive = currentSlug === slug;
          return (
            <Link
              key={slug}
              href={`/mosc-redesign/institutions/${slug}`}
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

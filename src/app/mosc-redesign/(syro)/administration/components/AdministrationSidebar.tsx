import Link from 'next/link';

const ADMIN_LINKS: { slug: string; label: string }[] = [
  { slug: 'administration', label: 'The Constitution of the Malankara Orthodox Church' },
  { slug: 'he-canon-law-of-the-malankara-orthodox-church', label: 'The Canon Law of the Malankara Orthodox Church' },
  { slug: 'the-holy-episcopal-synod', label: 'The Holy Episcopal Synod' },
  { slug: 'malankara-association', label: 'Malankara Association' },
  { slug: 'the-managing-committee', label: 'The Managing Committee' },
  { slug: 'the-working-committee', label: 'The Working Committee' },
  { slug: 'the-diocesan-general-body', label: 'The Diocesan General Body' },
  { slug: 'the-parish-managing-committee', label: 'The Parish Managing Committee' },
  { slug: 'the-parish-general-body', label: 'The Parish General Body' },
];

export default function AdministrationSidebar({ currentSlug }: { currentSlug: string }) {
  return (
    <div className="bg-white rounded-lg shadow-[rgba(50,50,93,0.25)_0px_6px_12px_-2px,rgba(0,0,0,0.3)_0px_3px_7px_-3px] p-6 mb-6 lg:sticky lg:top-4">
      <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-4">
        Administration Structure
      </h3>
      <nav className="space-y-2">
        {ADMIN_LINKS.map(({ slug, label }) => {
          const isActive = currentSlug === slug;
          return (
            <Link
              key={slug}
              href={`/mosc-redesign/administration/${slug}`}
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

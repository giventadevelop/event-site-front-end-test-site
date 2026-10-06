import Link from 'next/link';
import { MOSC_CMS_SIDEBAR_CLASS, moscCmsSidebarLinkClass } from '../../components/MoscCmsHubCard';

const ADMIN_LINKS: { slug: string; label: string }[] = [
  { slug: 'administration', label: 'The Constitution of the Malankara Orthodox Church' },
  { slug: 'he-canon-law-of-the-malankara-orthodox-church', label: 'The Canon Law of the Malankara Orthodox Church' },
  { slug: 'the-holy-episcopal-synod', label: 'The Holy Episcopal Synod' },
  { slug: 'malankara-association', label: 'Malankara Association' },
  { slug: 'the-managing-committee-cms', label: 'The Managing Committee' },
  { slug: 'the-working-committee', label: 'The Working Committee' },
  { slug: 'the-diocesan-general-body', label: 'The Diocesan General Body' },
  { slug: 'the-parish-managing-committee', label: 'The Parish Managing Committee' },
  { slug: 'the-parish-general-body', label: 'The Parish General Body' },
];

export default function AdministrationSidebar({ currentSlug }: { currentSlug: string }) {
  return (
    <div className={MOSC_CMS_SIDEBAR_CLASS}>
      <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-4">
        Administration Structure
      </h3>
      <nav className="space-y-1">
        {ADMIN_LINKS.map(({ slug, label }) => {
          const isActive = currentSlug === slug;
          return (
            <Link
              key={slug}
              href={`/mosc-redesign/administration/${slug}`}
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

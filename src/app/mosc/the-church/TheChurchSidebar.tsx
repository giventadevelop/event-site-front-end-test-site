'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * Sidebar nav for The Church section — matches mosc.in structure with main links
 * and subpage links under Theology, Spirituality, History, and Liturgy.
 */
type SidebarItem =
  | { href: string; label: string }
  | { href: string; label: string; children: { href: string; label: string }[] };

const THE_CHURCH_LINKS: SidebarItem[] = [
  { href: '/mosc/the-church/the-malankara-orthodox-syrian-church', label: 'The Malankara Orthodox Syrian Church' },
  { href: '/mosc/the-church/the-throne-of-st-thomas', label: 'The Throne of St. Thomas' },
  { href: '/mosc/the-church/what-do-we-believe', label: 'What do we believe?' },
  { href: '/mosc/the-church/the-creed', label: 'The Creed' },
  {
    href: '/mosc/the-church/theology',
    label: 'Theology',
    children: [
      { href: '/mosc/the-church/theology/christology', label: 'Christology' },
      { href: '/mosc/the-church/theology/ecclesiology', label: 'Ecclesiology' },
      { href: '/mosc/the-church/theology/missiology', label: 'Missiology' },
      { href: '/mosc/the-church/theology/pneumatology', label: 'Pneumatology' },
      { href: '/mosc/the-church/theology/st-mary-the-mother-of-god', label: 'St. Mary the Mother of God' },
      { href: '/mosc/the-church/theology/the-ministry-of-an-episcopos', label: 'The Ministry of an Episcopos' },
      { href: '/mosc/the-church/theology/theology-of-dialogue', label: 'Theology of Dialogue' },
    ],
  },
  { href: '/mosc/the-church/orthodox-faith', label: 'Orthodox Faith' },
  {
    href: '/mosc/the-church/spirituality',
    label: 'Spirituality',
    children: [
      { href: '/mosc/the-church/spirituality/the-christian-life', label: 'The Christian Life' },
      { href: '/mosc/the-church/spirituality/deification', label: 'Deification' },
      { href: '/mosc/the-church/spirituality/fasting-and-abstinence', label: 'Fasting and abstinence' },
      { href: '/mosc/the-church/spirituality/lent', label: 'Lent' },
      { href: '/mosc/the-church/spirituality/the-great-lent', label: 'The Great Lent' },
      { href: '/mosc/the-church/spirituality/what-is-prayer', label: 'What is Prayer?' },
      { href: '/mosc/the-church/spirituality/shubqono-let-us-be-reconciled-with-one-another', label: 'Shubqono' },
    ],
  },
  { href: '/mosc/the-church/syrian-heritage', label: 'Syrian Heritage' },
  { href: '/mosc/the-church/oriental-and-eastern-orthodox-churches', label: 'Oriental and Eastern Orthodox churches' },
  {
    href: '/mosc/the-church/church-history',
    label: 'History',
    children: [
      { href: '/mosc/the-church/church-history/before-1653', label: 'Before 1653' },
      { href: '/mosc/the-church/church-history/before-the-portuguese-arrival', label: 'Before the Portuguese arrival' },
      { href: '/mosc/the-church/church-history/apostolic-origin', label: 'Apostolic origin' },
      { href: '/mosc/the-church/church-history/after-1653-as-an-independent-church', label: 'As an independent Church' },
      { href: '/mosc/the-church/church-history/the-orthodox-from-the-19th-century', label: '19th Century' },
      { href: '/mosc/the-church/church-history/connection-with-the-syrian-churches', label: 'The Syrian Connections' },
      { href: '/mosc/the-church/church-history/20th-century', label: '20th Century' },
    ],
  },
  { href: '/mosc/the-church/the-holy-myron', label: 'The Holy Myron' },
  {
    href: '/mosc/the-church/liturgy-worship',
    label: 'Liturgy',
    children: [
      { href: '/mosc/the-church/liturgy/liturgy-and-spiritual-practices', label: 'Liturgy and Spiritual Practices' },
      { href: '/mosc/the-church/liturgy/west-syrian-worship', label: 'West Syrian Worship' },
      { href: '/mosc/the-church/liturgy/feast-and-festivals', label: 'Feast and Festivals' },
      { href: '/mosc/the-church/liturgy/holy-qurbana', label: 'Holy Qurbana' },
      { href: '/mosc/the-church/liturgy/liturgical-music', label: 'Liturgical Music' },
      { href: '/mosc/the-church/liturgy/liturgical-year-seasons', label: 'Liturgical Year & Seasons' },
      { href: '/mosc/the-church/liturgy/sacraments', label: 'Sacraments' },
    ],
  },
  { href: '/mosc/the-church/church-calendar', label: 'Church Calendar' },
  { href: '/mosc/the-church/sacraments', label: 'Sacraments' },
];

function isItemWithChildren(item: SidebarItem): item is SidebarItem & { children: { href: string; label: string }[] } {
  return 'children' in item && Array.isArray((item as { children?: unknown }).children);
}

export default function TheChurchSidebar() {
  const pathname = usePathname() ?? '';

  return (
    <div className="bg-syro-bg-gray rounded-lg shadow-syro-card p-6 mb-6 sticky top-8">
      <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-4">
        The Church
      </h3>
      <nav className="space-y-1">
        {THE_CHURCH_LINKS.map((item) => {
          const href = item.href;
          const isActive = pathname === href || pathname === href.replace(/\/$/, '');
          const linkClass = isActive
            ? 'block px-3 py-2 bg-syro-red text-white rounded-md font-syro-primary text-sm transition-all duration-300'
            : 'block px-3 py-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300';
          const linkHref = href === '/mosc/the-church' ? href : `${href}?from=the-church`;

          const isHidden = href === '/mosc/the-church/orthodox-faith';
          return (
            <div key={href} className={isHidden ? 'hidden' : undefined}>
              <Link href={linkHref} className={linkClass}>
                {item.label}
              </Link>
              {isItemWithChildren(item) && (
                <ul className="ml-3 mt-1 space-y-0.5 border-l-2 border-syro-table-border pl-3">
                  {item.children.map((sub) => {
                    const subPath = sub.href.split('#')[0];
                    const isFullPage = !sub.href.includes('#');
                    const subActive = isFullPage && (pathname === subPath || pathname === subPath.replace(/\/$/, ''));
                    const subClass = subActive
                      ? 'block py-1.5 px-2 bg-syro-red text-white font-syro-primary text-sm transition-all duration-300 rounded-md'
                      : 'block py-1.5 px-2 text-syro-dark-gray hover:text-syro-red hover:bg-syro-bg-gray rounded-md font-syro-primary text-sm transition-all duration-300';
                    const subHref = sub.href.includes('#') ? sub.href : `${sub.href}?from=the-church`;
                    return (
                      <li key={sub.href}>
                        <Link href={subHref} className={subClass}>
                          {sub.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}

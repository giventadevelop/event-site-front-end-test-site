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
  { href: '/mosc-old/the-church/the-malankara-orthodox-syrian-church', label: 'The Malankara Orthodox Syrian Church' },
  { href: '/mosc-old/the-church/the-throne-of-st-thomas', label: 'The Throne of St. Thomas' },
  { href: '/mosc-old/the-church/what-do-we-believe', label: 'What do we believe?' },
  { href: '/mosc-old/the-church/the-creed', label: 'The Creed' },
  {
    href: '/mosc-old/the-church/theology',
    label: 'Theology',
    children: [
      { href: '/mosc-old/the-church/theology/christology', label: 'Christology' },
      { href: '/mosc-old/the-church/theology#ecclesiology', label: 'Ecclesiology' },
      { href: '/mosc-old/the-church/theology#missiology', label: 'Missiology' },
      { href: '/mosc-old/the-church/theology#pneumatology', label: 'Pneumatology' },
      { href: '/mosc-old/the-church/theology#st-mary-the-mother-of-god', label: 'St. Mary the Mother of God' },
      { href: '/mosc-old/the-church/theology#the-ministry-of-an-episcopos', label: 'The Ministry of an Episcopos' },
      { href: '/mosc-old/the-church/theology#theology-of-dialogue', label: 'Theology of Dialogue' },
    ],
  },
  { href: '/mosc-old/the-church/orthodox-faith', label: 'Orthodox Faith' },
  {
    href: '/mosc-old/the-church/spirituality',
    label: 'Spirituality',
    children: [
      { href: '/mosc-old/the-church/spirituality#the-christian-life', label: 'The Christian Life' },
      { href: '/mosc-old/the-church/spirituality#deification', label: 'Deification' },
      { href: '/mosc-old/the-church/spirituality#fasting-and-abstinence', label: 'Fasting and abstinence' },
      { href: '/mosc-old/the-church/spirituality#lent', label: 'Lent' },
      { href: '/mosc-old/the-church/spirituality#the-great-lent', label: 'The Great Lent' },
      { href: '/mosc-old/the-church/spirituality#what-is-prayer', label: 'What is Prayer?' },
      { href: '/mosc-old/the-church/spirituality#shubqono', label: 'Shubqono' },
    ],
  },
  { href: '/mosc-old/the-church/syrian-heritage', label: 'Syrian Heritage' },
  { href: '/mosc-old/the-church/oriental-and-eastern-orthodox-churches', label: 'Oriental and Eastern Orthodox churches' },
  {
    href: '/mosc-old/the-church/church-history',
    label: 'History',
    children: [
      { href: '/mosc-old/the-church/church-history#before-1653', label: 'Before 1653' },
      { href: '/mosc-old/the-church/church-history#before-the-portuguese-arrival', label: 'Before the Portuguese arrival' },
      { href: '/mosc-old/the-church/church-history#apostolic-origin', label: 'Apostolic origin' },
      { href: '/mosc-old/the-church/church-history#as-an-independent-church', label: 'As an independent Church' },
      { href: '/mosc-old/the-church/church-history#19th-century', label: '19th Century' },
      { href: '/mosc-old/the-church/church-history#the-syrian-connections', label: 'The Syrian Connections' },
      { href: '/mosc-old/the-church/church-history#20th-century', label: '20th Century' },
    ],
  },
  { href: '/mosc-old/the-church/the-holy-myron', label: 'The Holy Myron' },
  {
    href: '/mosc-old/the-church/liturgy-worship',
    label: 'Liturgy',
    children: [
      { href: '/mosc-old/the-church/liturgy-worship#liturgy-and-spiritual-practices', label: 'Liturgy and Spiritual Practices' },
      { href: '/mosc-old/the-church/liturgy-worship#west-syrian-worship', label: 'West Syrian Worship' },
      { href: '/mosc-old/the-church/liturgy-worship#feast-and-festivals', label: 'Feast and Festivals' },
      { href: '/mosc-old/the-church/liturgy-worship#holy-qurbana', label: 'Holy Qurbana' },
      { href: '/mosc-old/the-church/liturgy-worship#liturgical-music', label: 'Liturgical Music' },
      { href: '/mosc-old/the-church/liturgy-worship#liturgical-year-seasons', label: 'Liturgical Year & Seasons' },
      { href: '/mosc-old/the-church/sacraments', label: 'Sacraments' },
    ],
  },
  { href: '/mosc-old/the-church/church-calendar', label: 'Church Calendar' },
  { href: '/mosc-old/the-church/sacraments', label: 'Sacraments' },
];

function isItemWithChildren(item: SidebarItem): item is SidebarItem & { children: { href: string; label: string }[] } {
  return 'children' in item && Array.isArray((item as { children?: unknown }).children);
}

export default function TheChurchSidebar() {
  const pathname = usePathname() ?? '';

  return (
    <div className="bg-background rounded-lg sacred-shadow p-6 mb-6 sticky top-8">
      <h3 className="font-heading font-semibold text-lg text-foreground mb-4">
        The Church
      </h3>
      <nav className="space-y-1">
        {THE_CHURCH_LINKS.map((item) => {
          const href = item.href;
          const isActive = pathname === href || pathname === href.replace(/\/$/, '');
          const linkClass = isActive
            ? 'block px-3 py-2 bg-primary text-white rounded-md font-body text-sm reverent-transition'
            : 'block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition';

          return (
            <div key={href}>
              <Link href={href} className={linkClass}>
                {item.label}
              </Link>
              {isItemWithChildren(item) && (
                <ul className="ml-3 mt-1 space-y-0.5 border-l-2 border-muted/50 pl-3">
                  {item.children.map((sub) => {
                    const subPath = sub.href.split('#')[0];
                    const isFullPage = !sub.href.includes('#');
                    const subActive = isFullPage && (pathname === subPath || pathname === subPath.replace(/\/$/, ''));
                    const subClass = subActive
                      ? 'block py-1.5 px-2 text-primary font-body text-sm reverent-transition rounded-md bg-primary/10'
                      : 'block py-1.5 px-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition';
                    return (
                      <li key={sub.href}>
                        <Link href={sub.href} className={subClass}>
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

import Link from 'next/link';

/**
 * Shared Quick Links nav for diocese pages.
 * Used in sidebar (desktop) and below content (mobile) so the section appears just above the footer on mobile.
 */
export default function DiocesesQuickLinksNav() {
  const linkClass =
    'block px-3 py-2 text-muted-foreground hover:text-primary hover:bg-muted rounded-md font-body text-sm reverent-transition';
  const links = [
    { href: '/mosc-old/holy-synod', label: 'Holy Synod' },
    { href: '/mosc-old/ecumenical', label: 'Ecumenical Relations' },
    { href: '/mosc-old/institutions', label: 'Institutions' },
    { href: '/mosc-old/training', label: 'Training' },
    { href: '/mosc-old/publications', label: 'Publications' },
    { href: '/mosc-old/spiritual', label: 'Spiritual Organisations' },
    { href: '/mosc-old/theological', label: 'Theological Seminaries' },
    { href: '/mosc-old/lectionary', label: 'Lectionary' },
    { href: '/mosc-old/gallery', label: 'Gallery' },
    { href: '/mosc-old/contact-info', label: 'Contact Info' },
    { href: '/mosc-old/faqs', label: 'FAQs' },
  ];
  return (
    <div className="bg-background rounded-lg sacred-shadow p-6">
      <h3 className="font-heading font-semibold text-lg text-foreground mb-4">Quick Links</h3>
      <nav className="space-y-2">
        {links.map(({ href, label }) => (
          <Link key={href} href={href} className={linkClass}>
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

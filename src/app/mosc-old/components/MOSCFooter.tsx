import React from 'react';
import Link from 'next/link';
import Icon from './ui/Icon';
import AppImage from './AppImage';

const MOSCFooter = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { name: 'CATHOLICATE NEWS', href: 'https://www.facebook.com/catholicatenews.in', external: true },
    { name: 'DOWNLOADS', href: '/mosc-old/downloads' },
    { name: 'E-MAIL', href: '/mosc-old/contact-form-email' },
    { name: 'GALLERY', href: '/mosc-old/gallery' },
    { name: 'CONTACT INFO', href: '/mosc-old/contact-info' },
  ];

  const siteToolsLinks = [
    { name: 'SITEMAP', href: '/mosc-old/sitemap' },
    { name: 'APPS', href: '/mosc-old/app' },
  ];

  return (
    <footer className="bg-card border-t border-border mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 items-start">
          {/* Church Info */}
          <div className="justify-items-center">
            {/* Logo - Larger and Centered */}
            <div className="flex justify-center justify-items-center md:justify-start">
              <div className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 bg-transparent rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0" style={{ background: 'transparent' }}>
                <AppImage
                  src="/images/logos/Current_Edits/Mosc_logo_jan2026.png"
                  alt="Malankara Orthodox Syrian Church emblem"
                  className="w-full h-full object-contain"
                  style={{ background: 'transparent' }}
                />
              </div>
            </div>
            {/* Historical Text */}
            <p className="text-sm text-muted-foreground leading-relaxed text-justify">
              The Malankara Orthodox Syrian Church traces its origins to the apostolic mission of St. Thomas,
              one of the twelve apostles of Jesus Christ, who established Christianity in India in 52 AD.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-lg text-foreground">Quick Links</h3>
            <nav className="space-y-2" role="navigation" aria-label="Footer navigation">
              {footerLinks.map((link) => (
                <div key={link.name}>
                  {link.external ? (
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-primary reverent-transition"
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary reverent-transition"
                    >
                      {link.name}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Site Tools (Sitemap / Apps) */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-lg text-foreground">Site Tools</h3>
            <nav className="space-y-2" aria-label="Site tools navigation">
              {siteToolsLinks.map((link) => (
                <div key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary reverent-transition"
                  >
                    {link.name}
                  </Link>
                </div>
              ))}
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-lg text-foreground">Contact Information</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <span className="font-medium">Headquarters:</span><br />
                Catholicate Palace<br />
                Devalokam, Kottayam<br />
                Kerala, India
              </p>
              <p>
                <span className="font-medium">Phone:</span> +91-481-2300-700<br />
                <span className="font-medium">Email:</span> info@mosc.in
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border mt-8 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © {currentYear} The Malankara Orthodox Church. All rights reserved.
            </div>
            <div className="text-sm text-muted-foreground">
              Giventa Inc. USA
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default MOSCFooter;

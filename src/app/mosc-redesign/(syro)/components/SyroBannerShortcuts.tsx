import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const SHORTCUTS = [
  { title: 'CATHOLICATE NEWS', href: '/mosc-redesign/news', icon: '/mosc/assets/images/icons/PRESS-icon.svg', odd: true },
  { title: 'DOWNLOADS', href: '/mosc-redesign/downloads', icon: '/mosc/assets/images/icons/CIRCULAR-icon.svg', odd: false },
  { title: 'E-MAIL', href: '/mosc-redesign/contact-form-email', icon: '/mosc/assets/images/icons/PRESS-icon.svg', odd: true },
  { title: 'GALLERY', href: '/mosc-redesign/gallery', icon: '/mosc/assets/images/icons/GALLERY-icon.svg', odd: false },
  { title: 'CONTACT INFO', href: '/mosc-redesign/contact-info', icon: '/mosc/assets/images/icons/cal.png', odd: true },
];

export default function SyroBannerShortcuts() {
  return (
    <section className="quicklink" id="banner-shortcuts-section">
      <div className="container">
        <div id="banner-shortcuts" className="row">
          {SHORTCUTS.map((item) => (
            <div key={item.title} className="col">
              <Link
                href={item.href}
                className={`quick-link-card ${item.odd ? 'odd' : 'even'} d-flex align-items-center be-1 mb-sm-30`}
              >
                <div className="quick-icon">
                  <Image
                    src={item.icon}
                    alt=""
                    width={40}
                    height={40}
                    className="me-3 lozad object-contain"
                  />
                </div>
                <div className="quick-title">
                  <h6 className="mb-0">
                    {item.title === 'CATHOLICATE NEWS' ? (
                      <>
                        CATHOLICATE
                        <br />
                        NEWS
                      </>
                    ) : (
                      item.title
                    )}
                  </h6>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

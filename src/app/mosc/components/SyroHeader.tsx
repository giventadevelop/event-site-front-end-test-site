'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const navigationItems = [
  { name: 'THE CATHOLICATE', href: '/mosc/catholicate' },
  { name: 'ADMINISTRATION', href: '/mosc/administration' },
  { name: 'THE CHURCH', href: '/mosc/the-church' },
  { name: 'HOLY SYNOD', href: '/mosc/holy-synod' },
  { name: 'ECUMENICAL', href: '/mosc/ecumenical' },
  { name: 'DIOCESES', href: '/mosc/dioceses' },
  { name: 'NEWS', href: '/mosc/news' },
  { name: 'DIRECTORY', href: '/mosc/directory' },
  { name: 'SAINTS', href: '/mosc/saints' },
];

const quickLinks = [
  { name: 'Spiritual Organisations', href: '/mosc/spiritual-organizations' },
  { name: 'Publications', href: '/mosc/publications' },
  { name: 'Institutions', href: '/mosc/institutions' },
  { name: 'Training', href: '/mosc/training' },
  { name: 'Theological Seminaries', href: '/mosc/theological-seminaries' },
  { name: 'Lectionary', href: '/mosc/lectionary' },
  { name: 'Downloads', href: '/mosc/downloads' },
  { name: 'Calendar', href: '/mosc/calendar' },
  { name: 'Gallery', href: '/mosc/gallery' },
];

export default function SyroHeader() {
  const [offcanvasOpen, setOffcanvasOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOffcanvasOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (offcanvasOpen) {
      document.body.classList.add('offcanvas-backdrop');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('offcanvas-backdrop');
      document.body.style.overflow = '';
    }
    return () => {
      document.body.classList.remove('offcanvas-backdrop');
      document.body.style.overflow = '';
    };
  }, [offcanvasOpen]);

  const isActive = (href: string) => pathname?.startsWith(href) ?? false;
  const isHomeActive = pathname === '/mosc' || pathname === '/mosc/';

  return (
    <>
      <div className="syro-sticky-header-wrapper">
      <header>
        <div id="syro-header-bar" className="logo-container d-flex align-items-center bg-transparent justify-content-between">
          <Link href="/mosc" className="unset-link">
            <div className="logo-box d-flex align-items-center bg-transparent pe-3">
              <div className="logo-box-img bg-transparent">
                <div className="logo-img-div">
                  <Image
                    src="/images/logos/Current_Edits/New%20Edit/Mosc_Header_Logo9.png"
                    alt="Syro-Malabar Church"
                    width={200}
                    height={100}
                    className="lozad"
                    style={{ width: '200px', height: 'auto' }}
                    priority
                  />
                </div>
              </div>
            </div>
          </Link>
          <div className="main-menu d-flex align-items-center justify-content-between">
            <div className="left-top-menu d-none d-lg-block">
              <nav className="navbar navbar-expand-lg bg-transparent">
                <div className="container-fluid">
                  <div className="collapse navbar-collapse show d-flex align-items-center">
                    <ul className="list-unstyled mb-0">
                      <li>
                        <Link
                          href="/mosc"
                          className={`dropdown-item ${isHomeActive ? 'active' : ''}`}
                          aria-label="Home"
                        >
                          <i className="fa-solid fa-house" />
                        </Link>
                      </li>
                    </ul>
                    <span className="d-none d-lg-inline">&nbsp;&nbsp;</span>
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0" id="topmenus">
                      {navigationItems.map((item) => (
                        <li key={item.href} className="nav-item">
                          <Link
                            href={item.href}
                            className={`nav-link ${isActive(item.href) ? 'active' : ''}`}
                          >
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <ul className="navbar-nav mb-2 mb-lg-0 list-unstyled">
                      <li className="nav-item">
                        <button
                          type="button"
                          onClick={() => setOffcanvasOpen(true)}
                          className="btn btn-link border-0 p-2"
                          aria-label="Menu"
                        >
                          <i className="fas fa-bars" />
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </nav>
            </div>
            <div className="d-block d-lg-none">
              <button
                type="button"
                onClick={() => setOffcanvasOpen(true)}
                className="btn btn-link border-0 p-2"
                aria-label="Menu"
              >
                <i className="fas fa-bars" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Links bar below header - desktop only; same links also in menu */}
      <div className="syro-quicklinks-bar d-none d-lg-block" aria-label="Quick Links">
        <div className="container">
          <div className="syro-quicklinks-inner d-flex align-items-center flex-wrap py-2 justify-content-center">
            <span className="syro-quicklinks-label fw-semibold me-2">Quick Links</span>
            <span className="syro-quicklinks-sep d-none d-xl-inline-block me-2" aria-hidden="true" />
            <ul className="list-unstyled mb-0 d-flex align-items-center flex-wrap gap-1 justify-content-center">
              {quickLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`syro-quicklink ${isActive(item.href) ? 'fw-bold' : ''}`}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      </div>

      {/* Detailed Menu Offcanvas (match static #detailedmenu) */}
      <div
        className={`offcanvas offcanvas-start ${offcanvasOpen ? 'show' : ''}`}
        tabIndex={-1}
        id="detailedmenu"
        aria-labelledby="detailedmenuLabel"
        style={offcanvasOpen ? { visibility: 'visible' } : undefined}
      >
        <div className="offcanvas-header pe-5 ps-5">
          <h5 className="offcanvas-title" id="detailedmenuLabel">Detailed Menu</h5>
          <button
            type="button"
            className="btn-close"
            onClick={() => setOffcanvasOpen(false)}
            aria-label="Close"
          />
        </div>
        <div className="offcanvas-body">
          <div className="container mt-5 menu-overlay">
            <div className="row">
              <div className="col-12">
                <nav className="d-flex flex-column gap-1">
                  <Link
                    href="/mosc"
                    onClick={() => setOffcanvasOpen(false)}
                    className={`nav-link ${isHomeActive ? 'active fw-bold' : ''}`}
                  >
                    Home
                  </Link>
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOffcanvasOpen(false)}
                      className={`nav-link ${isActive(item.href) ? 'active fw-bold' : ''}`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
            <div className="row mt-4">
              <div className="col-12">
                <h6 className="text-uppercase fw-semibold mb-2 menu-overlay">Quick Links</h6>
                <nav className="d-flex flex-column gap-1">
                  {quickLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOffcanvasOpen(false)}
                      className={`nav-link ${isActive(item.href) ? 'active fw-bold' : ''}`}
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
      {offcanvasOpen && (
        <div
          className="offcanvas-backdrop fade show"
          style={{ backgroundColor: 'rgba(0,0,0,.5)' }}
          onClick={() => setOffcanvasOpen(false)}
          onKeyDown={(e) => e.key === 'Escape' && setOffcanvasOpen(false)}
          role="button"
          tabIndex={0}
          aria-label="Close menu"
        />
      )}
    </>
  );
}

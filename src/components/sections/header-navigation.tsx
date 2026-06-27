"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Grid, Search, ChevronDown, X, Menu } from 'lucide-react';

const navItems = [
  {
    name: 'Home',
    href: '/charity-theme',
    active: true
  },
  {
    name: 'About',
    href: '#about',
    dropdown: [
      { name: 'Our Story', href: '#story' },
      { name: 'Mission & Vision', href: '#mission' },
      { name: 'Team', href: '#team' }
    ]
  },
  {
    name: 'Causes',
    href: '#causes',
    dropdown: [
      { name: 'Education', href: '#education' },
      { name: 'Healthcare', href: '#healthcare' },
      { name: 'Environment', href: '#environment' },
      { name: 'Poverty', href: '#poverty' }
    ]
  },
  {
    name: 'Events',
    href: '#events'
  },
  {
    name: 'Gallery',
    href: '#gallery'
  },
  {
    name: 'Contact',
    href: '#contact'
  }
];

export default function HeaderNavigation() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdowns, setOpenDropdowns] = useState<Set<string>>(new Set());

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (isMobileMenuOpen) {
      setOpenDropdowns(new Set());
    }
  };

  const toggleDropdown = (itemName: string) => {
    const newOpenDropdowns = new Set(openDropdowns);
    if (newOpenDropdowns.has(itemName)) {
      newOpenDropdowns.delete(itemName);
    } else {
      newOpenDropdowns.add(itemName);
    }
    setOpenDropdowns(newOpenDropdowns);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setOpenDropdowns(new Set());
  };

  return (
    <>
      <header className="header-navigation">
        <div className="container header-container">
          <div className="header-left">
            <button aria-label="Open side panel" className="hidden text-gray-700 hover:text-primary lg:block">
              <Grid size={24} />
            </button>
            <Link href="/charity-theme">
              <Image
                src="/images/charity-theme/logo_black.png"
                alt="Philantrop Logo"
                width={140}
                height={25}
                priority
                className="header-logo"
              />
            </Link>
          </div>

          <nav className="header-nav">
            <ul className="header-nav-list">
              {navItems.map((item) => (
                <li key={item.name} className="header-nav-item">
                  <Link
                    href={item.href}
                    className={`header-nav-link ${item.active ? 'active' : ''}`}
                  >
                    {item.name}
                    {item.dropdown && <ChevronDown size={16} className="text-gray-400 transition-transform duration-200 group-hover:rotate-180" />}
                  </Link>
                  {item.active && (
                    <div className="absolute bottom-0 left-1/2 h-[3px] w-8 -translate-x-1/2 transform bg-primary" />
                  )}
                  {item.dropdown && (
                    <ul className="header-nav-dropdown">
                      {item.dropdown.map(subItem => (
                        <li key={subItem.name}>
                          <Link href={subItem.href} className="header-nav-dropdown-item">
                            {subItem.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          <div className="header-right">
            <button aria-label="Search" className="text-gray-700 hover:text-primary">
              <Search size={22} />
            </button>
            <Link href="#donate" className="header-button">
              Donate
            </Link>
          </div>

          <div className="header-mobile-menu">
            <button
              aria-label="Open menu"
              onClick={toggleMobileMenu}
              className="mobile-menu-button"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <Image
            src="/images/charity-theme/logo_black.png"
            alt="Philantrop Logo"
            width={120}
            height={20}
            priority
          />
          <button
            onClick={closeMobileMenu}
            className="mobile-menu-close"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="mobile-menu-nav">
          <ul className="mobile-menu-nav-list">
            {navItems.map((item) => (
              <li key={item.name} className="mobile-menu-nav-item">
                {item.dropdown ? (
                  <>
                    <button
                      onClick={() => toggleDropdown(item.name)}
                      className="mobile-menu-nav-link w-full text-left flex justify-between items-center"
                    >
                      {item.name}
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${
                          openDropdowns.has(item.name) ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    <div className={`mobile-menu-dropdown ${openDropdowns.has(item.name) ? 'open' : ''}`}>
                      {item.dropdown.map(subItem => (
                        <Link
                          key={subItem.name}
                          href={subItem.href}
                          className="mobile-menu-dropdown-item"
                          onClick={closeMobileMenu}
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className="mobile-menu-nav-link"
                    onClick={closeMobileMenu}
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-6 space-y-3">
            <button className="w-full text-center py-3 px-4 bg-primary text-white rounded-md font-medium hover:bg-primary/90 transition-colors">
              Donate
            </button>
            <button className="w-full text-center py-3 px-4 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors">
              Search
            </button>
          </div>
        </nav>
      </div>
    </>
  );
}


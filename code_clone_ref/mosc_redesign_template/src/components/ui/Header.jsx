import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    { label: 'Home', path: '/homepage', icon: 'Home' },
    { label: 'About', path: '/about-church', icon: 'Church' },
    { label: 'Services', path: '/services-and-worship', icon: 'Calendar' },
    { label: 'Clergy', path: '/clergy-and-leadership', icon: 'Users' },
    { label: 'Spiritual', path: '/spiritual-organizations', icon: 'Cross' },
    { label: 'News', path: '/news-and-announcements', icon: 'Newspaper' },
    { label: 'Contact', path: '/contact-and-locations', icon: 'MapPin' }
  ];

  const isActivePath = (path) => {
    return location?.pathname === path;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-card border-b border-border sacred-shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto">
        {/* Main Header Content */}
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            to="/homepage"
            className="flex items-center space-x-3 reverent-transition reverent-hover"
          >
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Icon name="Cross" size={24} color="white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-heading font-semibold text-xl text-foreground">
                MOSC
              </h1>
              <p className="font-caption text-xs text-muted-foreground -mt-1">
                Orthodox Church
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems?.map((item) => (
              <Link
                key={item?.path}
                to={item?.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-sacred text-sm font-body font-medium reverent-transition reverent-hover ${isActivePath(item?.path)
                    ? 'text-primary bg-muted' : 'text-foreground hover:text-primary hover:bg-muted/50'
                  }`}
              >
                <Icon name={item?.icon} size={16} />
                <span>{item?.label}</span>
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 rounded-sacred text-foreground hover:text-primary hover:bg-muted/50 reverent-transition"
            aria-label="Toggle mobile menu"
          >
            <Icon name={isMobileMenuOpen ? 'X' : 'Menu'} size={24} />
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-border bg-card">
            <nav className="px-4 py-4 space-y-2">
              {navigationItems?.map((item) => (
                <Link
                  key={item?.path}
                  to={item?.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-sacred text-base font-body font-medium reverent-transition ${isActivePath(item?.path)
                      ? 'text-primary bg-muted' : 'text-foreground hover:text-primary hover:bg-muted/50'
                    }`}
                >
                  <Icon name={item?.icon} size={20} />
                  <span>{item?.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
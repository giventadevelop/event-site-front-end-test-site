import React from 'react';
import Icon from '../AppIcon';

const Header = () => {
  const navigationItems = [
    { label: 'Events', path: '/events', icon: 'Calendar' },
    { label: 'Sponsors', path: '/sponsor-display-section', icon: 'Building2' },
    { label: 'Attendees', path: '/attendees', icon: 'Users' },
    { label: 'Analytics', path: '/analytics', icon: 'BarChart3' },
  ];

  const secondaryItems = [
    { label: 'Settings', path: '/settings', icon: 'Settings' },
    { label: 'Help', path: '/help', icon: 'HelpCircle' },
    { label: 'Profile', path: '/profile', icon: 'User' },
  ];

  return (
    <header className="w-full bg-card border-b border-border shadow-elevation-1 sticky top-0 z-50">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Logo Section */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
            <Icon name="Building2" size={24} color="white" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-semibold text-foreground">EventHub</h1>
            <span className="text-xs text-muted-foreground">Event Management</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navigationItems?.map((item) => (
            <a
              key={item?.path}
              href={item?.path}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors duration-200"
            >
              <Icon name={item?.icon} size={18} />
              <span>{item?.label}</span>
            </a>
          ))}
        </nav>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {/* Notifications */}
          <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors duration-200">
            <Icon name="Bell" size={20} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-error rounded-full"></span>
          </button>

          {/* More Menu */}
          <div className="relative group">
            <button className="flex items-center space-x-1 p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors duration-200">
              <Icon name="MoreHorizontal" size={20} />
            </button>
            
            {/* Dropdown Menu */}
            <div className="absolute right-0 top-full mt-2 w-48 bg-popover border border-border rounded-md shadow-elevation-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-2">
                {secondaryItems?.map((item) => (
                  <a
                    key={item?.path}
                    href={item?.path}
                    className="flex items-center space-x-3 px-4 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors duration-200"
                  >
                    <Icon name={item?.icon} size={16} />
                    <span>{item?.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors duration-200">
            <Icon name="Menu" size={20} />
          </button>
        </div>
      </div>
      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-border bg-card">
        <nav className="flex overflow-x-auto py-2 px-4 space-x-1">
          {navigationItems?.map((item) => (
            <a
              key={item?.path}
              href={item?.path}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors duration-200 whitespace-nowrap"
            >
              <Icon name={item?.icon} size={16} />
              <span>{item?.label}</span>
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
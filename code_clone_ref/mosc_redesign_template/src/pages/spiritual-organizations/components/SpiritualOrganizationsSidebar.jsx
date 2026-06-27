import React from 'react';
import Icon from '../../../components/AppIcon';

const SpiritualOrganizationsSidebar = () => {
  const sidebarLinks = [
    { label: 'Kalpana', href: 'http://mosc.in/downloads/kalpana/', icon: 'FileText' },
    { label: 'Downloads', href: 'http://mosc.in/downloads/', icon: 'Download' },
    { label: 'Institutions', href: 'http://mosc.in/institutions/', icon: 'Building' },
    { label: 'Training', href: 'http://mosc.in/training/', icon: 'GraduationCap' },
    { label: 'Publications', href: 'http://mosc.in/publications/', icon: 'BookOpen' },
    { label: 'Directory', href: 'http://directory.mosc.in/', icon: 'Users', external: true },
    { label: 'Spiritual Organisations', href: 'http://mosc.in/spiritual/', icon: 'Church', current: true },
    { label: 'Theological Seminaries', href: 'http://mosc.in/theological/', icon: 'BookOpen' },
    { label: 'Calendar', href: 'http://calendar.mosc.in/', icon: 'Calendar', external: true },
    { label: 'Lectionary', href: 'http://mosc.in/lectionary/', icon: 'BookOpen' },
    { label: 'News & Events', href: 'https://www.facebook.com/catholicatenews.in', icon: 'Newspaper', external: true },
    { label: 'Online Resources', href: 'https://mosc.in/online-resources/', icon: 'Globe', external: true },
    { label: 'Gallery', href: 'http://mosc.in/photo-gallery/', icon: 'Image' },
    { label: 'Contact Info', href: 'https://mosc.in/contact-info/', icon: 'Phone', external: true },
    { label: 'FAQs', href: 'https://mosc.in/faqs/', icon: 'HelpCircle', external: true }
  ];

  const handleLinkClick = (link) => {
    if (link.external) {
      window.open(link.href, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = link.href;
    }
  };

  return (
    <div className="space-y-6">
      {/* Sidebar Header */}
      <div className="bg-card rounded-lg sacred-shadow p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
            <Icon name="Menu" size={16} color="white" />
          </div>
          <h3 className="font-heading font-semibold text-lg text-foreground">
            Quick Links
          </h3>
        </div>
        <p className="font-body text-sm text-muted-foreground">
          Access important resources and information related to the Church.
        </p>
      </div>

      {/* Navigation Links */}
      <div className="bg-card rounded-lg sacred-shadow p-6">
        <div className="space-y-2">
          {sidebarLinks.map((link, index) => (
            <button
              key={index}
              onClick={() => handleLinkClick(link)}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-md text-sm font-body font-medium reverent-transition text-left ${link.current
                  ? 'text-primary bg-muted'
                  : 'text-foreground hover:text-primary hover:bg-muted/50'
                }`}
            >
              <Icon
                name={link.icon}
                size={16}
                className={link.current ? 'text-primary' : 'text-muted-foreground'}
              />
              <span className="flex-1">{link.label}</span>
              {link.external && (
                <Icon name="ExternalLink" size={12} className="text-muted-foreground" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-card rounded-lg sacred-shadow p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
            <Icon name="Info" size={16} color="white" />
          </div>
          <h3 className="font-heading font-semibold text-lg text-foreground">
            About This Page
          </h3>
        </div>
        <div className="space-y-3">
          <p className="font-body text-sm text-muted-foreground">
            This directory showcases the various spiritual organizations and ministries
            within the Malankara Orthodox Syrian Church.
          </p>
          <div className="pt-3 border-t border-border">
            <p className="font-caption text-xs text-muted-foreground">
              Each organization plays a vital role in serving our community and
              spreading the Gospel through different avenues of ministry.
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-card rounded-lg sacred-shadow p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
            <Icon name="Phone" size={16} color="white" />
          </div>
          <h3 className="font-heading font-semibold text-lg text-foreground">
            Need Help?
          </h3>
        </div>
        <div className="space-y-3">
          <p className="font-body text-sm text-muted-foreground">
            For more information about these organizations or to get involved,
            contact your local parish or visit the official MOSC website.
          </p>
          <button
            onClick={() => window.open('https://mosc.in/contact-info/', '_blank')}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-body font-medium hover:bg-primary/90 reverent-transition"
          >
            <Icon name="ExternalLink" size={14} />
            <span>Contact Info</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpiritualOrganizationsSidebar;

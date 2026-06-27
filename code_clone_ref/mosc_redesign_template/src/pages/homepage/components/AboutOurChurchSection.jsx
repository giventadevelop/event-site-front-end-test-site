import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const AboutOurChurchSection = () => {
  const navigate = useNavigate();

  const mainNavigationLinks = [
    { label: 'THE CATHOLICATE', href: '/catholicate', icon: 'Crown' },
    { label: 'ADMINISTRATION', href: '/administration', icon: 'Building' },
    { label: 'THE CHURCH', href: '/the-church', icon: 'Church' },
    { label: 'HOLY SYNOD', href: '/holy-synod', icon: 'Users' },
    { label: 'ECUMENICAL', href: '/ecumenical', icon: 'Globe' },
    { label: 'DIOCESES', href: '/dioceses', icon: 'MapPin' },
    { label: 'SAINTS', href: '/saints', icon: 'Star' }
  ];

  const quickLinks = [
    { label: 'Spiritual Organisations', href: '/spiritual-organizations', icon: 'Cross', isInternal: true },
    { label: 'Theological Seminaries', href: '/theological-seminaries', icon: 'GraduationCap' },
    { label: 'Publications', href: '/publications', icon: 'BookOpen' },
    { label: 'Lectionary', href: '/lectionary', icon: 'BookOpen' },
    { label: 'Institutions', href: '/institutions', icon: 'Building' },
    { label: 'Downloads', href: '/downloads', icon: 'Download' },
    { label: 'Directory', href: '/directory', icon: 'Users' },
    { label: 'Calendar', href: '/calendar', icon: 'Calendar' },
    { label: 'Training', href: '/training', icon: 'GraduationCap' },
    { label: 'Gallery', href: '/gallery', icon: 'Image' }
  ];

  const specialLinks = [
    { label: 'SITEMAP', href: '/sitemap', icon: 'Map' },
    { label: 'APPS', href: '/apps', icon: 'Smartphone', external: true }
  ];

  const handleLinkClick = (link) => {
    if (link.external) {
      window.open(link.href, '_blank', 'noopener,noreferrer');
    } else if (link.isInternal) {
      navigate(link.href);
    } else {
      // For now, just show an alert since these are dummy links
      alert(`This will navigate to: ${link.href}`);
    }
  };

  return (
    <section className="py-16 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center sacred-shadow">
              <Icon name="Church" size={24} color="white" />
            </div>
            <h2 className="font-heading font-semibold text-3xl text-foreground">
              About Our Church
            </h2>
          </div>
          <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto">
            Explore the rich heritage, administration, and spiritual resources of the Malankara Orthodox Syrian Church.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Navigation Links */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg sacred-shadow p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                  <Icon name="Menu" size={16} color="white" />
                </div>
                <h3 className="font-heading font-semibold text-xl text-foreground">
                  Church Administration & Structure
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mainNavigationLinks.map((link, index) => (
                  <button
                    key={index}
                    onClick={() => handleLinkClick(link)}
                    className="flex items-center space-x-3 p-4 rounded-lg border border-border hover:border-primary hover:bg-muted/20 reverent-transition group"
                  >
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 reverent-transition">
                      <Icon name={link.icon} size={18} className="text-primary" />
                    </div>
                    <div className="text-left">
                      <span className="font-body font-medium text-foreground group-hover:text-primary reverent-transition">
                        {link.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Special Links */}
              <div className="bg-card rounded-lg sacred-shadow p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                    <Icon name="ExternalLink" size={16} color="white" />
                  </div>
                  <h3 className="font-heading font-semibold text-lg text-foreground">
                    Quick Access
                  </h3>
                </div>
                <div className="space-y-2">
                  {specialLinks.map((link, index) => (
                    <button
                      key={index}
                      onClick={() => handleLinkClick(link)}
                      className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-body font-medium text-foreground hover:text-primary hover:bg-muted/50 reverent-transition"
                    >
                      <Icon name={link.icon} size={16} className="text-muted-foreground" />
                      <span>{link.label}</span>
                      {link.external && (
                        <Icon name="ExternalLink" size={12} className="text-muted-foreground ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Kalpana Section */}
              <div className="bg-card rounded-lg sacred-shadow p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-success rounded-full flex items-center justify-center">
                    <Icon name="FileText" size={16} color="white" />
                  </div>
                  <h3 className="font-heading font-semibold text-lg text-foreground">
                    KALPANA
                  </h3>
                </div>
                <p className="font-body text-sm text-muted-foreground mb-4">
                  Read latest Kalpana.
                </p>
                <button
                  onClick={() => handleLinkClick({ href: '/kalpana', label: 'DOWNLOAD' })}
                  className="w-full bg-primary text-primary-foreground rounded-md py-2 px-4 text-sm font-body font-medium hover:bg-primary/90 reverent-transition"
                >
                  DOWNLOAD
                </button>
              </div>

              {/* Additional Resources */}
              <div className="bg-card rounded-lg sacred-shadow p-6">
                <div className="space-y-3">
                  <button
                    onClick={() => handleLinkClick({ href: '/pilgrim-centres', label: 'PILGRIM CENTRES' })}
                    className="w-full bg-warning text-warning-foreground rounded-md py-2 px-4 text-sm font-body font-medium hover:bg-warning/90 reverent-transition"
                  >
                    PILGRIM CENTRES
                  </button>
                  <button
                    onClick={() => handleLinkClick({ href: '/malankara-sabha-magazine', label: 'MALANKARA SABHA MAGAZINE' })}
                    className="w-full bg-warning text-warning-foreground rounded-md py-2 px-4 text-sm font-body font-medium hover:bg-warning/90 reverent-transition"
                  >
                    MALANKARA SABHA MAGAZINE
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links Grid */}
        <div className="mt-12">
          <div className="bg-card rounded-lg sacred-shadow p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Icon name="Link" size={16} color="white" />
              </div>
              <h3 className="font-heading font-semibold text-xl text-foreground">
                Resources & Services
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {quickLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={() => handleLinkClick(link)}
                  className="flex flex-col items-center space-y-2 p-4 rounded-lg border border-border hover:border-primary hover:bg-muted/20 reverent-transition group"
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 reverent-transition">
                    <Icon name={link.icon} size={20} className="text-primary" />
                  </div>
                  <span className="font-body text-xs font-medium text-foreground group-hover:text-primary reverent-transition text-center leading-tight">
                    {link.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-12">
          <div className="bg-muted/20 rounded-lg p-6">
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-body text-muted-foreground">
              <button
                onClick={() => handleLinkClick({ href: '/catholicate-news', label: 'CATHOLICATE NEWS' })}
                className="hover:text-primary reverent-transition"
              >
                CATHOLICATE NEWS
              </button>
              <span>•</span>
              <button
                onClick={() => handleLinkClick({ href: '/downloads', label: 'DOWNLOADS' })}
                className="hover:text-primary reverent-transition"
              >
                DOWNLOADS
              </button>
              <span>•</span>
              <button
                onClick={() => handleLinkClick({ href: '/email', label: 'E-MAIL' })}
                className="hover:text-primary reverent-transition"
              >
                E-MAIL
              </button>
              <span>•</span>
              <button
                onClick={() => handleLinkClick({ href: '/gallery', label: 'GALLERY' })}
                className="hover:text-primary reverent-transition"
              >
                GALLERY
              </button>
              <span>•</span>
              <button
                onClick={() => handleLinkClick({ href: '/contact-info', label: 'CONTACT INFO' })}
                className="hover:text-primary reverent-transition"
              >
                CONTACT INFO
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutOurChurchSection;

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AppIcon from './AppIcon';

const AboutOurChurchSection = () => {
  const router = useRouter();

  const mainNavigationLinks = [
    { label: 'THE CATHOLICATE', href: '/mosc-redesign/catholicate', icon: 'Crown', isInternal: true },
    { label: 'ADMINISTRATION', href: '/mosc-redesign/administration', icon: 'Building', isInternal: true },
    { label: 'THE CHURCH', href: '/mosc-redesign/the-church', icon: 'Church', isInternal: true },
    { label: 'HOLY SYNOD', href: '/mosc-redesign/holy-synod', icon: 'Users', isInternal: true },
    { label: 'ECUMENICAL', href: '/mosc-redesign/ecumenical', icon: 'Globe', isInternal: true },
    { label: 'DIOCESES', href: '/mosc-redesign/dioceses', icon: 'MapPin', isInternal: true },
    { label: 'SAINTS', href: '/mosc-redesign/saints', icon: 'Star', isInternal: true }
  ];

  const quickLinks = [
    { label: 'Spiritual Organisations', href: '/mosc-redesign/spiritual-organizations-cms', icon: 'Cross', isInternal: true },
    { label: 'Theological Seminaries', href: '/mosc-redesign/theological-seminaries', icon: 'GraduationCap', isInternal: true },
    { label: 'Publications', href: '/mosc-redesign/publications', icon: 'BookOpen', isInternal: true },
    { label: 'Lectionary', href: '/mosc-redesign/lectionary', icon: 'BookOpen', isInternal: true },
    { label: 'Institutions', href: '/mosc-redesign/institutions', icon: 'Building', isInternal: true },
    { label: 'Downloads', href: '/mosc-redesign/downloads', icon: 'Download', isInternal: true },
    { label: 'Directory', href: '/mosc-redesign/directory', icon: 'Users', isInternal: true },
    { label: 'Calendar', href: '/mosc-redesign/liturgical-calendar', icon: 'Calendar', isInternal: true },
    { label: 'Training', href: '/mosc-redesign/training', icon: 'GraduationCap', isInternal: true },
    { label: 'Gallery', href: '/mosc-redesign/gallery', icon: 'Image', isInternal: true }
  ];

  const specialLinks = [
    { label: 'SITEMAP', href: '/mosc-redesign/sitemap', icon: 'Map' },
    { label: 'APPS', href: '/mosc-redesign/apps', icon: 'Smartphone', external: true }
  ];

  const handleLinkClick = (link: { href: string; label?: string; external?: boolean; isInternal?: boolean }) => {
    if (link.external) {
      window.open(link.href, '_blank', 'noopener,noreferrer');
    } else if (link.isInternal) {
      router.push(link.href);
    } else {
      alert(`This will navigate to: ${link.href}`);
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-syro-red rounded-full flex items-center justify-center shadow-syro-card">
              <AppIcon name="Church" size={24} color="white" />
            </div>
            <h2 className="font-syro-display font-semibold text-syro-h3 text-syro-blue">
              About Our Church
            </h2>
          </div>
          <p className="font-syro-primary text-syro-body text-syro-dark-gray max-w-3xl mx-auto">
            Explore the rich heritage, administration, and spiritual resources of the Malankara Orthodox Syrian Church.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-syro-card p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-syro-blue rounded-full flex items-center justify-center">
                  <AppIcon name="Menu" size={16} color="white" />
                </div>
                <h3 className="font-syro-display font-semibold text-xl text-syro-blue">
                  Church Administration & Structure
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mainNavigationLinks.map((link, index) => (
                  <button
                    key={index}
                    onClick={() => handleLinkClick(link)}
                    className="flex items-center space-x-3 p-4 rounded-lg border border-syro-table-border hover:border-syro-red hover:bg-syro-bg-gray/20 transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 bg-syro-red/10 rounded-full flex items-center justify-center group-hover:bg-syro-red/20 transition-all duration-300">
                      <AppIcon name={link.icon} size={18} className="text-syro-red" />
                    </div>
                    <div className="text-left">
                      <span className="font-syro-primary font-medium text-syro-blue group-hover:text-syro-red transition-all duration-300">
                        {link.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-syro-card p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-syro-maroon rounded-full flex items-center justify-center">
                    <AppIcon name="ExternalLink" size={16} color="white" />
                  </div>
                  <h3 className="font-syro-display font-semibold text-lg text-syro-blue">Quick Access</h3>
                </div>
                <div className="space-y-2">
                  {specialLinks.map((link, index) => (
                    <button
                      key={index}
                      onClick={() => handleLinkClick(link)}
                      className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-syro-primary font-medium text-syro-blue hover:text-syro-red hover:bg-syro-bg-gray/50 transition-all duration-300"
                    >
                      <AppIcon name={link.icon} size={16} className="text-syro-medium-gray" />
                      <span>{link.label}</span>
                      {link.external && (
                        <AppIcon name="ExternalLink" size={12} className="text-syro-medium-gray ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-syro-card p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-syro-success rounded-full flex items-center justify-center">
                    <AppIcon name="FileText" size={16} color="white" />
                  </div>
                  <h3 className="font-syro-display font-semibold text-lg text-syro-blue">KALPANA</h3>
                </div>
                <p className="font-syro-primary text-syro-small text-syro-dark-gray mb-4">Read latest Kalpana.</p>
                <button
                  onClick={() => handleLinkClick({ href: '/mosc-redesign/downloads/kalpana', label: 'DOWNLOAD', isInternal: true })}
                  className="w-full syro-primary-button"
                >
                  DOWNLOAD
                </button>
              </div>

              <div className="bg-white rounded-lg shadow-syro-card p-6">
                <div className="space-y-3">
                  <button
                    onClick={() => handleLinkClick({ href: '/mosc-redesign/pilgrim-centres', label: 'PILGRIM CENTRES', isInternal: true })}
                    className="w-full bg-syro-warning text-white rounded-md py-2 px-4 text-sm font-syro-primary font-medium hover:opacity-90 transition-all duration-300"
                  >
                    PILGRIM CENTRES
                  </button>
                  <button
                    onClick={() => handleLinkClick({ href: '/mosc-redesign/publications/malankara-sabha-magazine-masika', label: 'MALANKARA SABHA MAGAZINE', isInternal: true })}
                    className="w-full bg-syro-warning text-white rounded-md py-2 px-4 text-sm font-syro-primary font-medium hover:opacity-90 transition-all duration-300"
                  >
                    MALANKARA SABHA MAGAZINE
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <div className="bg-white rounded-lg shadow-syro-card p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-syro-red rounded-full flex items-center justify-center">
                <AppIcon name="Link" size={16} color="white" />
              </div>
              <h3 className="font-syro-display font-semibold text-xl text-syro-blue">Resources & Services</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {quickLinks.map((link, index) => (
                <button
                  key={index}
                  onClick={() => handleLinkClick(link)}
                  className="flex flex-col items-center space-y-2 p-4 rounded-lg border border-syro-table-border hover:border-syro-red hover:bg-syro-bg-gray/20 transition-all duration-300 group cursor-pointer"
                >
                  <div className="w-12 h-12 bg-syro-red/10 rounded-full flex items-center justify-center group-hover:bg-syro-red/20 transition-all duration-300">
                    <AppIcon name={link.icon} size={20} className="text-syro-red" />
                  </div>
                  <span className="font-syro-primary text-xs font-medium text-syro-blue group-hover:text-syro-red transition-all duration-300 text-center leading-tight">
                    {link.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12">
          <div className="bg-syro-bg-gray/20 rounded-lg p-6">
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-syro-primary text-syro-dark-gray">
              <button onClick={() => handleLinkClick({ href: 'https://catholicatenews.in/', label: 'CATHOLICATE NEWS', external: true })} className="hover:text-syro-red transition-all duration-300">
                CATHOLICATE NEWS
              </button>
              <span>•</span>
              <button onClick={() => handleLinkClick({ href: '/mosc-redesign/downloads', label: 'DOWNLOADS', isInternal: true })} className="hover:text-syro-red transition-all duration-300">
                DOWNLOADS
              </button>
              <span>•</span>
              <button onClick={() => handleLinkClick({ href: '/mosc-redesign/contact-form-email', label: 'E-MAIL', isInternal: true })} className="hover:text-syro-red transition-all duration-300">
                E-MAIL
              </button>
              <span>•</span>
              <button onClick={() => handleLinkClick({ href: '/mosc-redesign/gallery', label: 'GALLERY', isInternal: true })} className="hover:text-syro-red transition-all duration-300">
                GALLERY
              </button>
              <span>•</span>
              <button onClick={() => handleLinkClick({ href: '/mosc-redesign/contact-info', label: 'CONTACT INFO', isInternal: true })} className="hover:text-syro-red transition-all duration-300">
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

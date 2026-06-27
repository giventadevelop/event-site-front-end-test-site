import React from 'react';
import Link from 'next/link';
import Icon from './ui/Icon';

const ResourcesServicesSection = () => {
  const resourceCards = [
    { name: 'Liturgical Calendar', icon: 'calendar', href: '/mosc-redesign/liturgical-calendar' },
    { name: 'Lectionary', icon: 'book', href: '/mosc-redesign/lectionary' },
    { name: 'Parish Directory', icon: 'map', href: '/mosc-redesign/directory' },
    { name: 'Prayer Requests', icon: 'prayer', href: '/mosc-redesign/contact-form-email' },
    { name: 'Publications', icon: 'document', href: '/mosc-redesign/publications' },
    { name: 'Youth Ministry', icon: 'people', href: '/mosc-redesign/training' },
    { name: 'Media Gallery', icon: 'gallery', href: '/mosc-redesign/gallery' },
    { name: 'Contact Us', icon: 'phone', href: '/mosc-redesign/contact-info' },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-syro-display font-semibold text-syro-h3 text-syro-blue mb-4">
            Resources & Services
          </h2>
          <p className="font-syro-primary text-syro-body text-syro-dark-gray max-w-3xl mx-auto">
            Discover our comprehensive collection of spiritual resources, liturgical materials, educational content,
            and community services designed to support your faith journey and spiritual growth.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-12">
          {resourceCards.map((resource) => (
            <Link
              key={resource.name}
              href={resource.href}
              className="group bg-syro-bg-gray rounded-lg p-6 text-center hover:bg-syro-bg-gray/80 transition-all duration-300 shadow-syro-card hover:shadow-syro-card-hover cursor-pointer"
            >
              <div className="w-12 h-12 bg-syro-red/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-syro-red/20 transition-all duration-300">
                <Icon name={resource.icon} size={24} className="text-syro-red" />
              </div>
              <h3 className="font-syro-primary font-medium text-syro-small text-syro-blue group-hover:text-syro-red transition-all duration-300">
                {resource.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ResourcesServicesSection;

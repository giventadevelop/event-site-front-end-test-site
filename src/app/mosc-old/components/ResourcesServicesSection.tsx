import React from 'react';
import Link from 'next/link';
import Icon from './ui/Icon';

const ResourcesServicesSection = () => {
  const resourceCards = [
    { name: 'Liturgical Calendar', icon: 'calendar', href: '/mosc-old/calendar' },
    { name: 'Lectionary', icon: 'book', href: '/mosc-old/lectionary' },
    { name: 'Parish Directory', icon: 'map', href: '/mosc-old/directory' },
    { name: 'Prayer Requests', icon: 'prayer', href: '/mosc-old/prayers' },
    { name: 'Sermons', icon: 'message', href: '/mosc-old/sermons' },
    { name: 'Publications', icon: 'document', href: '/mosc-old/publications' },
    { name: 'Youth Ministry', icon: 'people', href: '/mosc-old/youth-ministry' },
    { name: 'Sunday School', icon: 'book', href: '/mosc-old/sunday-school' },
    { name: 'Women\'s Fellowship', icon: 'people', href: '/mosc-old/womens-fellowship' },
    { name: 'Charity & Outreach', icon: 'heart', href: '/mosc-old/charity' },
    { name: 'Media Gallery', icon: 'gallery', href: '/mosc-old/gallery' },
    { name: 'Contact Us', icon: 'phone', href: '/mosc-old/contact-info' },
  ];


  return (
    <section className="py-16 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-heading font-semibold text-3xl text-foreground mb-4">
            Resources & Services
          </h2>
          <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto">
            Discover our comprehensive collection of spiritual resources, liturgical materials, educational content,
            and community services designed to support your faith journey and spiritual growth.
          </p>
        </div>

        {/* Resource Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          {resourceCards.map((resource) => (
            <a
              key={resource.name}
              href={resource.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-background rounded-lg p-6 text-center hover:bg-muted reverent-transition sacred-shadow-sm hover:sacred-shadow cursor-pointer"
            >
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-primary/20 reverent-transition">
                <Icon name={resource.icon} size={24} className="text-primary" />
              </div>
              <h3 className="font-body font-medium text-sm text-foreground group-hover:text-primary reverent-transition">
                {resource.name}
              </h3>
            </a>
          ))}
        </div>

      </div>
    </section>
  );
};

export default ResourcesServicesSection;

import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';

const QuickLinksSection = () => {
  const quickLinks = [
    {
      title: 'About Our Church',
      description: 'Learn about our history, beliefs, and the apostolic tradition of St. Thomas',
      icon: 'Church',
      path: '/about-church',
      color: 'bg-primary'
    },
    {
      title: 'Services & Worship',
      description: 'Join us for Holy Qurbana, prayers, and special liturgical celebrations',
      icon: 'Calendar',
      path: '/services-and-worship',
      color: 'bg-secondary'
    },
    {
      title: 'Clergy & Leadership',
      description: 'Meet our spiritual leaders and learn about church governance',
      icon: 'Users',
      path: '/clergy-and-leadership',
      color: 'bg-accent'
    },
    {
      title: 'Contact & Locations',
      description: 'Find our church locations, contact information, and directions',
      icon: 'MapPin',
      path: '/contact-and-locations',
      color: 'bg-success'
    }
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-heading font-semibold text-3xl text-foreground mb-4">
            Explore Our Church
          </h2>
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover more about our faith community, services, and how you can be part of our spiritual journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickLinks?.map((link, index) => (
            <Link
              key={index}
              to={link?.path}
              className="group bg-card rounded-lg sacred-shadow p-6 hover:sacred-shadow-lg reverent-transition hover:scale-105"
            >
              <div className={`w-12 h-12 ${link?.color} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 reverent-transition`}>
                <Icon name={link?.icon} size={24} color="white" />
              </div>
              
              <h3 className="font-heading font-medium text-lg text-foreground mb-3 group-hover:text-primary reverent-transition">
                {link?.title}
              </h3>
              
              <p className="font-body text-muted-foreground leading-relaxed mb-4">
                {link?.description}
              </p>
              
              <div className="flex items-center text-primary group-hover:translate-x-1 reverent-transition">
                <span className="font-body text-sm font-medium mr-2">Learn More</span>
                <Icon name="ArrowRight" size={16} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickLinksSection;
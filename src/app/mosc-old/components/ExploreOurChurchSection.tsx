import React from 'react';
import Link from 'next/link';
import Icon from './ui/Icon';

const ExploreOurChurchSection = () => {
  const exploreCards = [
    {
      title: 'About Our Church',
      icon: 'church',
      description: 'Discover the rich history, beliefs, and spiritual life of the Malankara Orthodox Syrian Church, tracing back to St. Thomas the Apostle.',
      href: '/mosc-old/about-church'
    },
    {
      title: 'Services & Worship',
      icon: 'calendar',
      description: 'Learn about our Holy Qurbana, daily prayers, and spiritual liturgical services that form the heart of our worship.',
      href: '/mosc-old/services-and-worship'
    },
    {
      title: 'Clergy & Leadership',
      icon: 'people',
      description: 'Meet our spiritual leaders, bishops, and clergy who guide our diocesan governance and pastoral care.',
      href: '/mosc-old/clergy-and-leadership'
    },
    {
      title: 'Contact & Location',
      icon: 'map',
      description: 'Find church locations, contact information, and directions to connect with our local parishes and communities.',
      href: '/mosc-old/contact-and-locations'
    }
  ];

  return (
    <section className="py-16 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-heading font-semibold text-3xl text-foreground mb-4">
            Explore Our Church
          </h2>
          <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto">
            Discover more about our rich community services, and how you can be part of our spiritual journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {exploreCards.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group bg-background rounded-lg sacred-shadow p-6 hover:sacred-shadow-lg reverent-transition"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 reverent-transition">
                <Icon name={card.icon} size={32} className="text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-xl text-foreground mb-3 text-center">
                {card.title}
              </h3>
              <p className="font-body text-muted-foreground leading-relaxed mb-4 text-center">
                {card.description}
              </p>
              <div className="text-center">
                <span className="inline-flex items-center text-primary hover:text-primary/80 font-medium reverent-transition">
                  Learn More
                  <Icon name="arrow-right" size={16} className="ml-1 group-hover:translate-x-1 reverent-transition" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExploreOurChurchSection;

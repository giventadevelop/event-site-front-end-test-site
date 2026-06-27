import React from 'react';
import Link from 'next/link';
import Icon from './ui/Icon';

const RecentAnnouncementsSection = () => {
  const announcements = [
    {
      id: 1,
      title: 'Christmas Season Services',
      date: '10 Dec 2023',
      icon: 'star',
      excerpt: 'Join us for our special Advent prayer services, Christmas Eve celebrations, Christmas Day Holy Qurbana, and New Year services as we celebrate the birth of our Lord and Savior Jesus Christ.',
      link: '/mosc-old/announcements/christmas-season-services'
    },
    {
      id: 2,
      title: 'Parish Council Meeting',
      date: '10 Dec 2023',
      icon: 'calendar',
      excerpt: 'The monthly parish council meeting will discuss upcoming events, community outreach programs, and review the progress of various parish initiatives.',
      link: '/mosc-old/announcements/parish-council-meeting'
    },
    {
      id: 3,
      title: 'Youth Fellowship Retreat',
      date: '10 Dec 2023',
      icon: 'people',
      excerpt: 'Annual youth fellowship retreat with the theme "Walking in Faith" - a spiritual journey for young adults to deepen their relationship with God and build lasting friendships.',
      link: '/mosc-old/announcements/youth-fellowship-retreat'
    }
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="font-heading font-semibold text-3xl text-foreground mb-2">
              Recent Announcements
            </h2>
            <p className="font-body text-muted-foreground">
              Stay updated with the latest news and events from our church community.
            </p>
          </div>
          <Link
            href="/mosc-old/announcements"
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 reverent-transition"
          >
            View All
            <Icon name="arrow-right" size={16} className="ml-2" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="bg-card rounded-lg sacred-shadow p-6 hover:sacred-shadow-lg reverent-transition"
            >
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon name={announcement.icon} size={24} className="text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-semibold text-lg text-foreground mb-1">
                    {announcement.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{announcement.date}</p>
                </div>
              </div>

              <p className="font-body text-muted-foreground leading-relaxed mb-4">
                {announcement.excerpt}
              </p>

              <Link
                href={announcement.link}
                className="inline-flex items-center text-primary hover:text-primary/80 font-medium reverent-transition"
              >
                Read More
                <Icon name="arrow-right" size={16} className="ml-1" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentAnnouncementsSection;

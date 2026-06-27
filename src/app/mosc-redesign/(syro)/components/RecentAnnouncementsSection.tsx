import React from 'react';
import Link from 'next/link';
import Icon from './ui/Icon';

const RecentAnnouncementsSection = () => {
  const announcements = [
    { id: 1, title: 'Christmas Season Services', date: '10 Dec 2023', icon: 'star', excerpt: 'Join us for our special Advent prayer services, Christmas Eve celebrations, Christmas Day Holy Qurbana, and New Year services as we celebrate the birth of our Lord and Savior Jesus Christ.', link: '/mosc-redesign/news' },
    { id: 2, title: 'Parish Council Meeting', date: '10 Dec 2023', icon: 'calendar', excerpt: 'The monthly parish council meeting will discuss upcoming events, community outreach programs, and review the progress of various parish initiatives.', link: '/mosc-redesign/news' },
    { id: 3, title: 'Youth Fellowship Retreat', date: '10 Dec 2023', icon: 'people', excerpt: 'Annual youth fellowship retreat with the theme "Walking in Faith" - a spiritual journey for young adults to deepen their relationship with God and build lasting friendships.', link: '/mosc-redesign/news' }
  ];

  return (
    <section className="py-16 bg-syro-bg-gray/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="font-syro-display font-semibold text-syro-h3 text-syro-blue mb-2">
              Recent Announcements
            </h2>
            <p className="font-syro-primary text-syro-dark-gray">
              Stay updated with the latest news and events from our church community.
            </p>
          </div>
          <Link
            href="/mosc-redesign/news"
            className="inline-flex items-center px-4 py-2 syro-primary-button"
          >
            View All
            <Icon name="arrow-right" size={16} className="ml-2" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="bg-white rounded-lg shadow-syro-card p-6 hover:shadow-syro-card-hover transition-all duration-300"
            >
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-12 h-12 bg-syro-red/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon name={announcement.icon} size={24} className="text-syro-red" />
                </div>
                <div className="flex-1">
                  <h3 className="font-syro-display font-semibold text-lg text-syro-blue mb-1">
                    {announcement.title}
                  </h3>
                  <p className="text-syro-small text-syro-dark-gray">{announcement.date}</p>
                </div>
              </div>
              <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-4">
                {announcement.excerpt}
              </p>
              <Link
                href={announcement.link}
                className="syro-primary-button inline-flex items-center gap-2 font-syro-primary w-fit"
              >
                <span>Read More</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentAnnouncementsSection;

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AppIcon from './AppIcon';
import Button from './ui/Button';

const AnnouncementsSection = () => {
  const [showIframe, setShowIframe] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showIframe) setShowIframe(false);
    };
    if (showIframe) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [showIframe]);

  const announcements = [
    { id: 1, title: 'Christmas Season Services', date: '2025-12-15', category: 'Liturgical', excerpt: `Join us for the sacred Christmas season celebrations beginning December 15th. Special services include Advent prayers, Christmas Eve Holy Qurbana, and New Year blessings.\n\nAll are welcome to participate in these joyous celebrations of our Lord's nativity.`, isUrgent: false },
    { id: 2, title: 'Parish Council Meeting', date: '2025-10-05', category: 'Administrative', excerpt: `Monthly parish council meeting scheduled for October 5th at 7:00 PM in the church hall. Agenda includes budget review, upcoming events planning, and community outreach programs.\n\nAll parish members are encouraged to attend.`, isUrgent: true },
    { id: 3, title: 'Youth Fellowship Retreat', date: '2025-10-20', category: 'Youth Ministry', excerpt: `Annual youth retreat at St. Mary's Retreat Center from October 20-22. Theme: "Walking in Faith" with spiritual talks, group activities, and fellowship.\n\nRegistration deadline: October 10th. Contact youth ministry for details.`, isUrgent: false }
  ];

  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${monthNames[month - 1]} ${day}, ${year}`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Liturgical': return 'Cross';
      case 'Administrative': return 'FileText';
      case 'Youth Ministry': return 'Users';
      default: return 'Bell';
    }
  };

  return (
    <section className="py-16 bg-syro-bg-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="font-syro-display font-semibold text-syro-h3 text-syro-blue mb-2">
              Recent Announcements
            </h2>
            <p className="font-syro-primary text-syro-body text-syro-dark-gray">
              Stay updated with the latest news and events from our church community
            </p>
          </div>
          <Button variant="outline" iconName="ArrowRight" iconPosition="right" onClick={() => setShowIframe(true)}>
            View All News
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {announcements?.map((announcement) => (
            <div key={announcement?.id} className="bg-white rounded-lg shadow-syro-card p-6 hover:shadow-syro-card-hover transition-all duration-300">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-syro-red/10 rounded-full flex items-center justify-center">
                    <AppIcon name={getCategoryIcon(announcement?.category)} size={16} className="text-syro-red" />
                  </div>
                  <span className="font-syro-primary text-syro-small text-syro-dark-gray">{announcement?.category}</span>
                </div>
                {announcement?.isUrgent && (
                  <span className="bg-syro-red/10 text-syro-red px-2 py-1 rounded-full text-xs font-medium">Urgent</span>
                )}
              </div>
              <h3 className="font-syro-display font-medium text-xl text-syro-blue mb-3">{announcement?.title}</h3>
              <div className="flex items-center space-x-2 mb-4">
                <AppIcon name="Calendar" size={16} className="text-syro-medium-gray" />
                <span className="font-syro-primary text-sm text-syro-dark-gray">{formatDate(announcement?.date)}</span>
              </div>
              <p className="font-syro-primary text-syro-dark-gray leading-relaxed mb-6 whitespace-pre-line">{announcement?.excerpt}</p>
              <Link
                href="/mosc/news"
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

      {showIframe && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowIframe(false)}>
          <div className="relative w-full h-full max-w-7xl mx-auto p-4 md:p-8" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowIframe(false)}
              className="absolute top-6 right-6 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-syro-bg-gray transition-colors shadow-lg"
              aria-label="Close"
            >
              <AppIcon name="X" size={20} className="text-syro-blue" />
            </button>
            <div className="w-full h-full bg-white rounded-lg shadow-2xl overflow-hidden">
              <iframe src="https://catholicatenews.in" className="w-full h-full border-0" title="Catholicate News" allow="fullscreen" loading="lazy" />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default AnnouncementsSection;

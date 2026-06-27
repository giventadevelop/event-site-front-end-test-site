import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AnnouncementsSection = () => {
  const announcements = [
    {
      id: 1,
      title: 'Christmas Season Services',
      date: '2025-12-15',
      category: 'Liturgical',
      excerpt: `Join us for the sacred Christmas season celebrations beginning December 15th. Special services include Advent prayers, Christmas Eve Holy Qurbana, and New Year blessings.\n\nAll are welcome to participate in these joyous celebrations of our Lord's nativity.`,
      isUrgent: false
    },
    {
      id: 2,
      title: 'Parish Council Meeting',date: '2025-10-05',category: 'Administrative',
      excerpt: `Monthly parish council meeting scheduled for October 5th at 7:00 PM in the church hall. Agenda includes budget review, upcoming events planning, and community outreach programs.\n\nAll parish members are encouraged to attend.`,
      isUrgent: true
    },
    {
      id: 3,
      title: 'Youth Fellowship Retreat',date: '2025-10-20',category: 'Youth Ministry',excerpt: `Annual youth retreat at St. Mary's Retreat Center from October 20-22. Theme: "Walking in Faith" with spiritual talks, group activities, and fellowship.\n\nRegistration deadline: October 10th. Contact youth ministry for details.`,
      isUrgent: false
    }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Liturgical': return 'Cross';
      case 'Administrative': return 'FileText';
      case 'Youth Ministry': return 'Users';
      default: return 'Bell';
    }
  };

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="font-heading font-semibold text-3xl text-foreground mb-2">
              Recent Announcements
            </h2>
            <p className="font-body text-lg text-muted-foreground">
              Stay updated with the latest news and events from our church community
            </p>
          </div>
          <Link to="/news-and-announcements">
            <Button variant="outline" iconName="ArrowRight" iconPosition="right">
              View All News
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {announcements?.map((announcement) => (
            <div key={announcement?.id} className="bg-card rounded-lg sacred-shadow p-6 hover:sacred-shadow-lg reverent-transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon name={getCategoryIcon(announcement?.category)} size={16} className="text-primary" />
                  </div>
                  <span className="font-caption text-sm text-muted-foreground">
                    {announcement?.category}
                  </span>
                </div>
                {announcement?.isUrgent && (
                  <span className="bg-error/10 text-error px-2 py-1 rounded-full text-xs font-medium">
                    Urgent
                  </span>
                )}
              </div>

              <h3 className="font-heading font-medium text-xl text-foreground mb-3">
                {announcement?.title}
              </h3>

              <div className="flex items-center space-x-2 mb-4">
                <Icon name="Calendar" size={16} className="text-muted-foreground" />
                <span className="font-body text-sm text-muted-foreground">
                  {formatDate(announcement?.date)}
                </span>
              </div>

              <p className="font-body text-muted-foreground leading-relaxed mb-6 whitespace-pre-line">
                {announcement?.excerpt}
              </p>

              <Button variant="ghost" size="sm" iconName="ArrowRight" iconPosition="right">
                Read More
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AnnouncementsSection;
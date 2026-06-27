import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FeaturedAnnouncement = ({ announcement, onShare, onAddToCalendar }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg sacred-shadow-lg p-8 mb-8">
      <div className="flex items-center space-x-2 mb-4">
        <Icon name="Star" size={20} className="text-primary fill-current" />
        <span className="text-primary font-medium text-sm">Featured Announcement</span>
      </div>
      <div className="grid lg:grid-cols-2 gap-8 items-center">
        {/* Content */}
        <div className="space-y-4">
          <h2 className="font-heading font-semibold text-3xl text-foreground">
            {announcement?.title}
          </h2>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Icon name="Calendar" size={14} />
              <span>{formatDate(announcement?.publishDate)}</span>
            </div>
            {announcement?.eventDate && (
              <div className="flex items-center space-x-1">
                <Icon name="Clock" size={14} />
                <span>Event: {formatDate(announcement?.eventDate)}</span>
              </div>
            )}
          </div>

          <p className="text-foreground font-body text-lg leading-relaxed">
            {announcement?.summary}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-4">
            <Button variant="default" size="lg">
              Read Full Announcement
            </Button>
            
            <Button
              variant="outline"
              size="lg"
              iconName="Share2"
              iconPosition="left"
              onClick={() => onShare(announcement)}
            >
              Share
            </Button>
            
            {announcement?.eventDate && (
              <Button
                variant="outline"
                size="lg"
                iconName="CalendarPlus"
                iconPosition="left"
                onClick={() => onAddToCalendar(announcement)}
              >
                Add to Calendar
              </Button>
            )}
          </div>
        </div>

        {/* Image */}
        {announcement?.image && (
          <div className="w-full h-80 overflow-hidden rounded-lg">
            <Image
              src={announcement?.image}
              alt={announcement?.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FeaturedAnnouncement;
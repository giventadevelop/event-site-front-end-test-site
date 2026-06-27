import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const AnnouncementCard = ({ announcement, onShare, onAddToCalendar }) => {
  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'events':
        return 'bg-accent text-accent-foreground';
      case 'diocesan news':
        return 'bg-primary text-primary-foreground';
      case 'community updates':
        return 'bg-secondary text-secondary-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-card rounded-lg sacred-shadow p-6 reverent-transition reverent-hover">
      {/* Category Tag */}
      <div className="flex items-center justify-between mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(announcement?.category)}`}>
          {announcement?.category}
        </span>
        {announcement?.isUrgent && (
          <div className="flex items-center space-x-1 text-error">
            <Icon name="AlertTriangle" size={16} />
            <span className="text-xs font-medium">Urgent</span>
          </div>
        )}
      </div>
      {/* Image */}
      {announcement?.image && (
        <div className="w-full h-48 mb-4 overflow-hidden rounded-lg">
          <Image
            src={announcement?.image}
            alt={announcement?.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      {/* Content */}
      <div className="space-y-3">
        <h3 className="font-heading font-semibold text-xl text-foreground line-clamp-2">
          {announcement?.title}
        </h3>
        
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

        <p className="text-muted-foreground line-clamp-3 font-body">
          {announcement?.summary}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              iconName="Share2"
              iconPosition="left"
              onClick={() => onShare(announcement)}
            >
              Share
            </Button>
            {announcement?.eventDate && (
              <Button
                variant="ghost"
                size="sm"
                iconName="CalendarPlus"
                iconPosition="left"
                onClick={() => onAddToCalendar(announcement)}
              >
                Add to Calendar
              </Button>
            )}
          </div>
          <Button variant="outline" size="sm">
            Read More
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementCard;
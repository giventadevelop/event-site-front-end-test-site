import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const OrganizationCard = ({ organization }) => {
  const handleReadMore = () => {
    // Open external link in new tab
    window.open(organization.link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-card rounded-lg sacred-shadow p-6 hover:shadow-lg reverent-transition group">
      {/* Card Header with Icon */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 reverent-transition">
          <Icon
            name={organization.icon}
            size={20}
            className="text-primary"
          />
        </div>
        <div className="flex-1">
          <h3 className="font-heading font-semibold text-lg text-foreground leading-tight">
            {organization.title}
          </h3>
        </div>
      </div>

      {/* Organization Image */}
      {organization.image && (
        <div className="mb-4">
          <div className="relative overflow-hidden rounded-lg sacred-shadow-sm">
            <Image
              src={organization.image}
              alt={organization.title}
              className="w-full h-48 object-cover group-hover:scale-105 reverent-transition"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 reverent-transition" />
          </div>
        </div>
      )}

      {/* Description */}
      <div className="mb-6">
        <p className="font-body text-muted-foreground leading-relaxed text-sm">
          {organization.description}
        </p>
      </div>

      {/* Read More Button */}
      <div className="flex justify-end">
        <button
          onClick={handleReadMore}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-body font-medium hover:bg-primary/90 reverent-transition focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <span>Read More</span>
          <Icon name="ExternalLink" size={14} />
        </button>
      </div>

      {/* External Link Indicator */}
      <div className="mt-3 flex items-center justify-end">
        <span className="text-xs font-caption text-muted-foreground flex items-center space-x-1">
          <Icon name="Globe" size={12} />
          <span>External Link</span>
        </span>
      </div>
    </div>
  );
};

export default OrganizationCard;

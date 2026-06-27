import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SponsorCard = ({ sponsor }) => {
  return (
    <div className="bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-all duration-300 h-80 flex flex-col">
      {/* Sponsor Badge */}
      <div className="relative">
        <div className="absolute top-3 right-3 z-10">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            sponsor?.level === 'Title Sponsor' ?'bg-yellow-100 text-yellow-800 border border-yellow-200' :'bg-gray-100 text-gray-800 border border-gray-200'
          }`}>
            {sponsor?.level}
          </span>
        </div>
        
        {/* Sponsor Logo */}
        <div className="p-6 pb-4">
          <div className="w-full h-20 flex items-center justify-center bg-muted rounded-lg mb-4">
            <Image 
              src={sponsor?.logo} 
              alt={sponsor?.logoAlt}
              className="max-w-full max-h-full object-contain"
            />
          </div>
          
          {/* Sponsor Name */}
          <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
            {sponsor?.name}
          </h3>
          
          {/* Tagline */}
          <p className="text-sm text-muted-foreground mb-3 italic">
            "{sponsor?.tagline}"
          </p>
        </div>
      </div>
      {/* Contact Information */}
      <div className="px-6 flex-1 space-y-2">
        <div className="flex items-center space-x-2 text-sm">
          <Icon name="Phone" size={14} className="text-muted-foreground flex-shrink-0" />
          <span className="text-foreground">{sponsor?.phone}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm">
          <Icon name="Mail" size={14} className="text-muted-foreground flex-shrink-0" />
          <span className="text-foreground truncate">{sponsor?.email}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm">
          <Icon name="Globe" size={14} className="text-muted-foreground flex-shrink-0" />
          <a 
            href={`https://${sponsor?.website}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline truncate"
          >
            {sponsor?.website}
          </a>
        </div>
      </div>
      {/* Action Button */}
      <div className="p-6 pt-4">
        <Button 
          variant="outline" 
          fullWidth
          iconName="ExternalLink" 
          iconPosition="right"
          iconSize={16}
          className="text-sm"
        >
          View Sponsor Details
        </Button>
      </div>
    </div>
  );
};

export default SponsorCard;
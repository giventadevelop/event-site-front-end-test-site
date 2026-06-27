import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

const StageShowBanner = ({ event }) => {
  return (
    <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-border rounded-lg p-6 mb-8">
      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Event Image */}
        <div className="w-full lg:w-1/3">
          <div className="relative overflow-hidden rounded-lg">
            <Image 
              src={event?.image} 
              alt={event?.imageAlt}
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>
        </div>
        
        {/* Event Details */}
        <div className="w-full lg:w-2/3 text-center lg:text-left">
          <div className="flex items-center justify-center lg:justify-start space-x-2 mb-3">
            <Icon name="Calendar" size={20} className="text-primary" />
            <span className="text-sm font-medium text-primary uppercase tracking-wide">
              {event?.type}
            </span>
          </div>
          
          <h2 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
            {event?.title}
          </h2>
          
          <div className="space-y-2 text-muted-foreground">
            <div className="flex items-center justify-center lg:justify-start space-x-2">
              <Icon name="Calendar" size={16} />
              <span>{event?.date}</span>
            </div>
            
            <div className="flex items-center justify-center lg:justify-start space-x-2">
              <Icon name="MapPin" size={16} />
              <span>{event?.venue}</span>
            </div>
            
            <div className="flex items-center justify-center lg:justify-start space-x-2">
              <Icon name="Navigation" size={16} />
              <span className="text-sm">{event?.address}</span>
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap justify-center lg:justify-start gap-2">
            {event?.performers?.map((performer, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
              >
                {performer}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StageShowBanner;
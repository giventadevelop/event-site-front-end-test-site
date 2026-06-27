import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SpecialServicesCard = ({ specialServices }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date?.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-card rounded-lg sacred-shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading font-semibold text-xl text-foreground">Upcoming Special Services</h2>
        <Icon name="Calendar" size={24} className="text-primary" />
      </div>
      <div className="space-y-6">
        {specialServices?.map((service) => (
          <div key={service?.id} className="border border-border rounded-lg p-4 hover:bg-muted/30 reverent-transition">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-muted">
                <Image
                  src={service?.image}
                  alt={service?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-body font-semibold text-foreground mb-1">{service?.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{service?.description}</p>
                
                <div className="space-y-1">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Icon name="Calendar" size={14} className="mr-2 flex-shrink-0" />
                    <span>{formatDate(service?.date)}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Icon name="Clock" size={14} className="mr-2 flex-shrink-0" />
                    <span>{service?.time}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Icon name="MapPin" size={14} className="mr-2 flex-shrink-0" />
                    <span>{service?.location}</span>
                  </div>
                </div>

                {service?.isHighlighted && (
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                      <Icon name="Star" size={12} className="mr-1" />
                      Featured Event
                    </span>
                  </div>
                )}
              </div>
            </div>

            {service?.registrationRequired && (
              <div className="mt-4 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  iconName="UserPlus"
                  fullWidth
                >
                  Register for Event
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-6 pt-6 border-t border-border">
        <Button
          variant="ghost"
          iconName="Calendar"
          iconPosition="right"
          fullWidth
        >
          View Full Calendar
        </Button>
      </div>
    </div>
  );
};

export default SpecialServicesCard;
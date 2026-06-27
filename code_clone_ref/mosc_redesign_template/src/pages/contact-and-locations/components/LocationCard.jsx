import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const LocationCard = ({ location }) => {
  const handleDirections = () => {
    const query = encodeURIComponent(`${location?.address}, ${location?.city}, ${location?.state} ${location?.zipCode}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  const handleCall = () => {
    window.open(`tel:${location?.phone}`, '_self');
  };

  const handleEmail = () => {
    window.open(`mailto:${location?.email}`, '_self');
  };

  return (
    <div className="bg-card rounded-lg sacred-shadow p-6 reverent-transition reverent-hover">
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Church Image */}
        <div className="flex-shrink-0">
          <div className="w-24 h-24 sm:w-32 sm:h-32 circular-frame overflow-hidden bg-muted">
            <Image
              src={location?.image}
              alt={location?.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Location Details */}
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="font-heading font-semibold text-xl text-foreground mb-2">
              {location?.name}
            </h3>
            <div className="flex items-start space-x-2 text-muted-foreground">
              <Icon name="MapPin" size={16} className="mt-1 flex-shrink-0" />
              <div className="font-body text-sm">
                <p>{location?.address}</p>
                <p>{location?.city}, {location?.state} {location?.zipCode}</p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Icon name="Phone" size={16} className="text-primary" />
              <span className="font-body text-sm text-foreground">{location?.phone}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Icon name="Mail" size={16} className="text-primary" />
              <span className="font-body text-sm text-foreground">{location?.email}</span>
            </div>
            {location?.pastor && (
              <div className="flex items-center space-x-2">
                <Icon name="User" size={16} className="text-primary" />
                <span className="font-body text-sm text-foreground">Pastor: {location?.pastor}</span>
              </div>
            )}
          </div>

          {/* Service Times */}
          <div className="bg-muted/50 rounded-lg p-3">
            <h4 className="font-body font-medium text-sm text-foreground mb-2">Service Times</h4>
            <div className="space-y-1">
              {location?.serviceTimes?.map((service, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{service?.day}</span>
                  <span className="text-foreground font-medium">{service?.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              iconName="Navigation"
              iconPosition="left"
              onClick={handleDirections}
            >
              Directions
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconName="Phone"
              iconPosition="left"
              onClick={handleCall}
            >
              Call
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconName="Mail"
              iconPosition="left"
              onClick={handleEmail}
            >
              Email
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationCard;
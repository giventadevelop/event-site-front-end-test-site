import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const InteractiveMap = ({ locations }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Center coordinates for the map (using first location as center)
  const centerLat = locations?.length > 0 ? locations?.[0]?.coordinates?.lat : 40.7128;
  const centerLng = locations?.length > 0 ? locations?.[0]?.coordinates?.lng : -74.0060;

  const handleMarkerClick = (location) => {
    setSelectedLocation(location);
  };

  const closePopup = () => {
    setSelectedLocation(null);
  };

  return (
    <div className="bg-card rounded-lg sacred-shadow overflow-hidden">
      <div className="p-4 border-b border-border">
        <h2 className="font-heading font-semibold text-xl text-foreground">
          Church Locations
        </h2>
        <p className="font-body text-sm text-muted-foreground mt-1">
          Click on markers to view location details
        </p>
      </div>
      <div className="relative h-96 bg-muted">
        {/* Google Maps Iframe */}
        <iframe
          width="100%"
          height="100%"
          loading="lazy"
          title="MOSC Church Locations"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps?q=${centerLat},${centerLng}&z=10&output=embed`}
          className="w-full h-full"
        />

        {/* Location Markers Overlay */}
        <div className="absolute inset-0 pointer-events-none">
          {locations?.map((location, index) => (
            <div
              key={index}
              className="absolute pointer-events-auto cursor-pointer"
              style={{
                left: `${20 + (index * 15)}%`,
                top: `${30 + (index * 10)}%`,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={() => handleMarkerClick(location)}
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center sacred-shadow-sm reverent-transition hover:scale-110">
                <Icon name="MapPin" size={16} color="white" />
              </div>
            </div>
          ))}
        </div>

        {/* Location Popup */}
        {selectedLocation && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center p-4 z-10">
            <div className="bg-card rounded-lg sacred-shadow-lg max-w-sm w-full p-6 relative">
              <button
                onClick={closePopup}
                className="absolute top-4 right-4 p-1 hover:bg-muted rounded-full reverent-transition"
              >
                <Icon name="X" size={16} />
              </button>

              <div className="space-y-4">
                <h3 className="font-heading font-semibold text-lg text-foreground pr-8">
                  {selectedLocation?.name}
                </h3>

                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <Icon name="MapPin" size={16} className="text-primary mt-1 flex-shrink-0" />
                    <div className="font-body text-sm text-foreground">
                      <p>{selectedLocation?.address}</p>
                      <p>{selectedLocation?.city}, {selectedLocation?.state} {selectedLocation?.zipCode}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Icon name="Phone" size={16} className="text-primary" />
                    <span className="font-body text-sm text-foreground">{selectedLocation?.phone}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Icon name="Mail" size={16} className="text-primary" />
                    <span className="font-body text-sm text-foreground">{selectedLocation?.email}</span>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-lg p-3">
                  <h4 className="font-body font-medium text-sm text-foreground mb-2">Next Service</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{selectedLocation?.serviceTimes?.[0]?.day}</span>
                    <span className="text-foreground font-medium">{selectedLocation?.serviceTimes?.[0]?.time}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Map Legend */}
      <div className="p-4 bg-muted/30">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-primary rounded-full"></div>
            <span className="font-body text-muted-foreground">Church Location</span>
          </div>
          <span className="font-body text-muted-foreground">
            {locations?.length} location{locations?.length !== 1 ? 's' : ''} found
          </span>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap;
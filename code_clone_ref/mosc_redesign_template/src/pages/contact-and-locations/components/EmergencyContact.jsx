import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const EmergencyContact = ({ emergencyContacts }) => {
  const handleCall = (phone) => {
    window.open(`tel:${phone}`, '_self');
  };

  return (
    <div className="bg-error/5 border border-error/20 rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-error/10 rounded-full flex items-center justify-center">
          <Icon name="AlertTriangle" size={20} className="text-error" />
        </div>
        <div>
          <h2 className="font-heading font-semibold text-xl text-foreground">
            Emergency Contacts
          </h2>
          <p className="font-body text-sm text-muted-foreground">
            For urgent spiritual needs or crisis situations
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {emergencyContacts?.map((contact, index) => (
          <div key={index} className="bg-card rounded-lg p-4 space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Icon name={contact?.icon} size={16} className="text-primary" />
              </div>
              <div>
                <h3 className="font-body font-semibold text-base text-foreground">
                  {contact?.title}
                </h3>
                <p className="font-body text-sm text-muted-foreground">
                  {contact?.name}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-body text-sm text-muted-foreground">Phone:</span>
                <span className="font-body text-sm text-foreground font-medium">
                  {contact?.phone}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-body text-sm text-muted-foreground">Available:</span>
                <span className="font-body text-sm text-foreground font-medium">
                  {contact?.availability}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              iconName="Phone"
              iconPosition="left"
              onClick={() => handleCall(contact?.phone)}
              fullWidth
              className="border-error/30 text-error hover:bg-error/5"
            >
              Call Now
            </Button>
          </div>
        ))}
      </div>
      <div className="mt-4 p-4 bg-warning/5 border border-warning/20 rounded-lg">
        <div className="flex items-start space-x-2">
          <Icon name="Info" size={16} className="text-warning mt-1 flex-shrink-0" />
          <div className="font-body text-sm text-foreground">
            <p className="font-medium mb-1">Important Notice:</p>
            <p>For life-threatening emergencies, please call 911 immediately. These contacts are for spiritual emergencies and pastoral care needs.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyContact;
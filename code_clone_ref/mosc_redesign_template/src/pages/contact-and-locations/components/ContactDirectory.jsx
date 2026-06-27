import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ContactDirectory = ({ contacts }) => {
  const handleCall = (phone) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleEmail = (email) => {
    window.open(`mailto:${email}`, '_self');
  };

  return (
    <div className="bg-card rounded-lg sacred-shadow p-6">
      <h2 className="font-heading font-semibold text-2xl text-foreground mb-6">
        Contact Directory
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contacts?.map((contact, index) => (
          <div key={index} className="border border-border rounded-lg p-4 space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon name={contact?.icon} size={20} className="text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-body font-semibold text-lg text-foreground">
                  {contact?.department}
                </h3>
                <p className="font-body text-sm text-muted-foreground">
                  {contact?.description}
                </p>
              </div>
            </div>

            <div className="space-y-2 pl-13">
              {contact?.contacts?.map((person, personIndex) => (
                <div key={personIndex} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-body font-medium text-sm text-foreground">
                        {person?.name}
                      </p>
                      <p className="font-body text-xs text-muted-foreground">
                        {person?.title}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {person?.phone && (
                      <Button
                        variant="ghost"
                        size="xs"
                        iconName="Phone"
                        iconPosition="left"
                        onClick={() => handleCall(person?.phone)}
                        className="text-xs"
                      >
                        {person?.phone}
                      </Button>
                    )}
                    {person?.email && (
                      <Button
                        variant="ghost"
                        size="xs"
                        iconName="Mail"
                        iconPosition="left"
                        onClick={() => handleEmail(person?.email)}
                        className="text-xs"
                      >
                        Email
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContactDirectory;
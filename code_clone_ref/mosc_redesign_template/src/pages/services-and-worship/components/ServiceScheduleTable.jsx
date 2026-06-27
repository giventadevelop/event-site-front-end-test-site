import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ServiceScheduleTable = ({ services, filters }) => {
  const [expandedService, setExpandedService] = useState(null);

  const filteredServices = services?.filter(service => {
    if (filters?.location && service?.location !== filters?.location) return false;
    if (filters?.language && service?.language !== filters?.language) return false;
    if (filters?.serviceType && service?.type !== filters?.serviceType) return false;
    return true;
  });

  const toggleExpanded = (serviceId) => {
    setExpandedService(expandedService === serviceId ? null : serviceId);
  };

  const addToCalendar = (service) => {
    const startDate = new Date(`2025-01-01T${service.time}`);
    const endDate = new Date(startDate.getTime() + 90 * 60000); // 90 minutes later
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(service?.name)}&dates=${startDate?.toISOString()?.replace(/[-:]/g, '')?.split('.')?.[0]}Z/${endDate?.toISOString()?.replace(/[-:]/g, '')?.split('.')?.[0]}Z&details=${encodeURIComponent(service?.description)}&location=${encodeURIComponent(service?.location)}`;
    
    window.open(calendarUrl, '_blank');
  };

  return (
    <div className="bg-card rounded-lg sacred-shadow overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left py-4 px-6 font-heading font-semibold text-foreground">Service</th>
                <th className="text-left py-4 px-6 font-heading font-semibold text-foreground">Time</th>
                <th className="text-left py-4 px-6 font-heading font-semibold text-foreground">Language</th>
                <th className="text-left py-4 px-6 font-heading font-semibold text-foreground">Location</th>
                <th className="text-left py-4 px-6 font-heading font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices?.map((service) => (
                <tr key={service?.id} className="border-b border-border hover:bg-muted/30 reverent-transition">
                  <td className="py-4 px-6">
                    <div>
                      <h3 className="font-body font-medium text-foreground">{service?.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{service?.description}</p>
                      {service?.isSpecial && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent mt-2">
                          <Icon name="Star" size={12} className="mr-1" />
                          Special Service
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-body font-medium text-foreground">{service?.time}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-body text-foreground">{service?.language}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-body text-foreground">{service?.location}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        iconName="Calendar"
                        onClick={() => addToCalendar(service)}
                      >
                        Add to Calendar
                      </Button>
                      {service?.bulletin && (
                        <Button
                          variant="ghost"
                          size="sm"
                          iconName="Download"
                          onClick={() => window.open(service?.bulletin, '_blank')}
                        >
                          Bulletin
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Mobile Card View */}
      <div className="md:hidden">
        <div className="divide-y divide-border">
          {filteredServices?.map((service) => (
            <div key={service?.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-body font-medium text-foreground">{service?.name}</h3>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Icon name="Clock" size={14} className="mr-2" />
                      {service?.time}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Icon name="MapPin" size={14} className="mr-2" />
                      {service?.location}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Icon name="Globe" size={14} className="mr-2" />
                      {service?.language}
                    </div>
                  </div>
                  {service?.isSpecial && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent mt-2">
                      <Icon name="Star" size={12} className="mr-1" />
                      Special Service
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  iconName={expandedService === service?.id ? "ChevronUp" : "ChevronDown"}
                  onClick={() => toggleExpanded(service?.id)}
                />
              </div>
              
              {expandedService === service?.id && (
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-4">{service?.description}</p>
                  <div className="flex flex-col space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      iconName="Calendar"
                      onClick={() => addToCalendar(service)}
                      fullWidth
                    >
                      Add to Calendar
                    </Button>
                    {service?.bulletin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        iconName="Download"
                        onClick={() => window.open(service?.bulletin, '_blank')}
                        fullWidth
                      >
                        Download Bulletin
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {filteredServices?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Calendar" size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="font-heading font-semibold text-lg text-foreground mb-2">No Services Found</h3>
          <p className="text-muted-foreground">Try adjusting your filters to see more services.</p>
        </div>
      )}
    </div>
  );
};

export default ServiceScheduleTable;
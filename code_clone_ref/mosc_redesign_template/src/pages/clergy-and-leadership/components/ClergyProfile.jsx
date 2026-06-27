import React, { useState } from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ClergyProfile = ({ clergy }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-card rounded-lg p-6 sacred-shadow reverent-transition reverent-hover">
      <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
        {/* Profile Image */}
        <div className="flex-shrink-0">
          <div className="w-24 h-24 circular-frame overflow-hidden bg-muted">
            <Image
              src={clergy?.image}
              alt={clergy?.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Profile Information */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3">
            <div>
              <h3 className="text-xl font-heading font-semibold text-foreground mb-1">
                {clergy?.name}
              </h3>
              <p className="text-primary font-medium mb-2">
                {clergy?.title}
              </p>
              {clergy?.diocese && (
                <p className="text-sm text-muted-foreground mb-2">
                  {clergy?.diocese}
                </p>
              )}
            </div>
            
            {/* Contact Actions */}
            <div className="flex space-x-2 mt-2 sm:mt-0">
              {clergy?.email && (
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Mail"
                  iconPosition="left"
                  onClick={() => window.location.href = `mailto:${clergy?.email}`}
                >
                  Email
                </Button>
              )}
              {clergy?.phone && (
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Phone"
                  iconPosition="left"
                  onClick={() => window.location.href = `tel:${clergy?.phone}`}
                >
                  Call
                </Button>
              )}
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {clergy?.ordination && (
              <div className="flex items-center space-x-2 text-sm">
                <Icon name="Calendar" size={16} className="text-muted-foreground" />
                <span className="text-muted-foreground">Ordained:</span>
                <span className="text-foreground">{clergy?.ordination}</span>
              </div>
            )}
            {clergy?.education && (
              <div className="flex items-center space-x-2 text-sm">
                <Icon name="GraduationCap" size={16} className="text-muted-foreground" />
                <span className="text-muted-foreground">Education:</span>
                <span className="text-foreground">{clergy?.education}</span>
              </div>
            )}
            {clergy?.specialization && (
              <div className="flex items-center space-x-2 text-sm">
                <Icon name="Star" size={16} className="text-muted-foreground" />
                <span className="text-muted-foreground">Specialization:</span>
                <span className="text-foreground">{clergy?.specialization}</span>
              </div>
            )}
            {clergy?.languages && (
              <div className="flex items-center space-x-2 text-sm">
                <Icon name="Languages" size={16} className="text-muted-foreground" />
                <span className="text-muted-foreground">Languages:</span>
                <span className="text-foreground">{clergy?.languages?.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Short Description */}
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {clergy?.shortDescription}
          </p>

          {/* Expand/Collapse Button */}
          {clergy?.fullBiography && (
            <Button
              variant="ghost"
              size="sm"
              iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
              iconPosition="right"
              onClick={toggleExpanded}
              className="p-0 h-auto text-primary hover:text-primary/80"
            >
              {isExpanded ? 'Show Less' : 'Read Full Biography'}
            </Button>
          )}

          {/* Expanded Content */}
          {isExpanded && clergy?.fullBiography && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="prose prose-sm max-w-none">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                  {clergy?.fullBiography}
                </p>
              </div>
              
              {/* Ministry Areas */}
              {clergy?.ministryAreas && clergy?.ministryAreas?.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-foreground mb-2">
                    Areas of Ministry:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {clergy?.ministryAreas?.map((area, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Achievements */}
              {clergy?.achievements && clergy?.achievements?.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-foreground mb-2">
                    Notable Achievements:
                  </h4>
                  <ul className="list-disc list-inside space-y-1">
                    {clergy?.achievements?.map((achievement, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        {achievement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClergyProfile;
import React from 'react';
import Icon from '../../../components/AppIcon';

const SectionHeader = ({ title, subtitle, iconName = "Building2" }) => {
  return (
    <div className="text-center mb-12">
      <div className="flex items-center justify-center space-x-3 mb-4">
        <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg">
          <Icon name={iconName} size={24} className="text-primary" />
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
          {title}
        </h1>
      </div>
      
      {subtitle && (
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionHeader;
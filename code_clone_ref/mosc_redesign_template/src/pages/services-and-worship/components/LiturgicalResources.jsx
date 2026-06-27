import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const LiturgicalResources = ({ resources }) => {
  const [activeCategory, setActiveCategory] = useState('prayers');

  const categories = [
    { id: 'prayers', label: 'Prayers', icon: 'BookOpen' },
    { id: 'hymns', label: 'Hymns', icon: 'Music' },
    { id: 'readings', label: 'Scripture Readings', icon: 'Book' },
    { id: 'explanations', label: 'Service Explanations', icon: 'HelpCircle' }
  ];

  const filteredResources = resources?.filter(resource => resource?.category === activeCategory);

  const handleDownload = (resource) => {
    // Mock download functionality
    console.log(`Downloading ${resource?.title}`);
  };

  const handlePlay = (resource) => {
    // Mock audio play functionality
    console.log(`Playing ${resource?.title}`);
  };

  return (
    <div className="bg-card rounded-lg sacred-shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading font-semibold text-xl text-foreground">Liturgical Resources</h2>
        <Icon name="BookOpen" size={24} className="text-primary" />
      </div>
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-border">
        {categories?.map((category) => (
          <button
            key={category?.id}
            onClick={() => setActiveCategory(category?.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-t-lg font-body font-medium reverent-transition ${
              activeCategory === category?.id
                ? 'bg-primary text-primary-foreground border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Icon name={category?.icon} size={16} />
            <span className="hidden sm:inline">{category?.label}</span>
          </button>
        ))}
      </div>
      {/* Resources List */}
      <div className="space-y-4">
        {filteredResources?.map((resource) => (
          <div key={resource?.id} className="border border-border rounded-lg p-4 hover:bg-muted/30 reverent-transition">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-body font-semibold text-foreground mb-1">{resource?.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{resource?.description}</p>
                
                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                  {resource?.language && (
                    <div className="flex items-center">
                      <Icon name="Globe" size={12} className="mr-1" />
                      {resource?.language}
                    </div>
                  )}
                  {resource?.duration && (
                    <div className="flex items-center">
                      <Icon name="Clock" size={12} className="mr-1" />
                      {resource?.duration}
                    </div>
                  )}
                  {resource?.fileSize && (
                    <div className="flex items-center">
                      <Icon name="File" size={12} className="mr-1" />
                      {resource?.fileSize}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2 ml-4">
                {resource?.hasAudio && (
                  <Button
                    variant="ghost"
                    size="sm"
                    iconName="Play"
                    onClick={() => handlePlay(resource)}
                  />
                )}
                <Button
                  variant="outline"
                  size="sm"
                  iconName="Download"
                  onClick={() => handleDownload(resource)}
                />
              </div>
            </div>

            {resource?.tags && resource?.tags?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1">
                {resource?.tags?.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {filteredResources?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="BookOpen" size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="font-heading font-semibold text-lg text-foreground mb-2">No Resources Available</h3>
          <p className="text-muted-foreground">Resources for this category are being prepared.</p>
        </div>
      )}
    </div>
  );
};

export default LiturgicalResources;
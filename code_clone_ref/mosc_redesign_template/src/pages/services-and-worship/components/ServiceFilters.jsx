import React from 'react';
import Select from '../../../components/ui/Select';

const ServiceFilters = ({ filters, onFilterChange }) => {
  const locationOptions = [
    { value: '', label: 'All Locations' },
    { value: 'Main Cathedral', label: 'Main Cathedral' },
    { value: 'St. Thomas Chapel', label: 'St. Thomas Chapel' },
    { value: 'Community Center', label: 'Community Center' },
    { value: 'Online', label: 'Online Service' }
  ];

  const languageOptions = [
    { value: '', label: 'All Languages' },
    { value: 'English', label: 'English' },
    { value: 'Malayalam', label: 'Malayalam' },
    { value: 'Syriac', label: 'Syriac' },
    { value: 'Bilingual', label: 'Bilingual' }
  ];

  const serviceTypeOptions = [
    { value: '', label: 'All Service Types' },
    { value: 'Holy Qurbana', label: 'Holy Qurbana' },
    { value: 'Evening Prayer', label: 'Evening Prayer' },
    { value: 'Morning Prayer', label: 'Morning Prayer' },
    { value: 'Special Service', label: 'Special Service' },
    { value: 'Bible Study', label: 'Bible Study' }
  ];

  return (
    <div className="bg-card rounded-lg sacred-shadow p-6 mb-6">
      <h2 className="font-heading font-semibold text-lg text-foreground mb-4">Filter Services</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          label="Location"
          options={locationOptions}
          value={filters?.location}
          onChange={(value) => onFilterChange('location', value)}
          placeholder="Select location"
        />
        
        <Select
          label="Language"
          options={languageOptions}
          value={filters?.language}
          onChange={(value) => onFilterChange('language', value)}
          placeholder="Select language"
        />
        
        <Select
          label="Service Type"
          options={serviceTypeOptions}
          value={filters?.serviceType}
          onChange={(value) => onFilterChange('serviceType', value)}
          placeholder="Select service type"
        />
      </div>
    </div>
  );
};

export default ServiceFilters;
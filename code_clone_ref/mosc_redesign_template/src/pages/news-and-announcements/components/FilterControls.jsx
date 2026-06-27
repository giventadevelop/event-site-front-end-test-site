import React from 'react';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';


const FilterControls = ({ 
  selectedCategory, 
  onCategoryChange, 
  selectedDateRange, 
  onDateRangeChange,
  selectedImportance,
  onImportanceChange,
  onClearFilters,
  totalResults 
}) => {
  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'events', label: 'Events' },
    { value: 'diocesan news', label: 'Diocesan News' },
    { value: 'community updates', label: 'Community Updates' }
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'Last 3 Months' }
  ];

  const importanceOptions = [
    { value: 'all', label: 'All Announcements' },
    { value: 'urgent', label: 'Urgent Only' },
    { value: 'featured', label: 'Featured Only' }
  ];

  const hasActiveFilters = selectedCategory !== 'all' || selectedDateRange !== 'all' || selectedImportance !== 'all';

  return (
    <div className="bg-card rounded-lg sacred-shadow p-6 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-6">
        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 flex-1">
          <div className="flex-1">
            <Select
              label="Category"
              options={categoryOptions}
              value={selectedCategory}
              onChange={onCategoryChange}
              className="w-full"
            />
          </div>
          
          <div className="flex-1">
            <Select
              label="Date Range"
              options={dateRangeOptions}
              value={selectedDateRange}
              onChange={onDateRangeChange}
              className="w-full"
            />
          </div>
          
          <div className="flex-1">
            <Select
              label="Importance"
              options={importanceOptions}
              value={selectedImportance}
              onChange={onImportanceChange}
              className="w-full"
            />
          </div>
        </div>

        {/* Results and Clear Filters */}
        <div className="flex items-center justify-between sm:justify-end space-x-4">
          <span className="text-sm text-muted-foreground font-body">
            {totalResults} {totalResults === 1 ? 'announcement' : 'announcements'}
          </span>
          
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              iconName="X"
              iconPosition="left"
              onClick={onClearFilters}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterControls;
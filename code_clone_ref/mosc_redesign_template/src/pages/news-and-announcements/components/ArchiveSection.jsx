import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const ArchiveSection = ({ onSearchArchive }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [isExpanded, setIsExpanded] = useState(false);

  const yearOptions = [
    { value: '2024', label: '2024' },
    { value: '2023', label: '2023' },
    { value: '2022', label: '2022' },
    { value: '2021', label: '2021' },
    { value: '2020', label: '2020' }
  ];

  const monthOptions = [
    { value: 'all', label: 'All Months' },
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const handleSearch = (e) => {
    e?.preventDefault();
    onSearchArchive({
      searchTerm,
      year: selectedYear,
      month: selectedMonth
    });
  };

  return (
    <div className="bg-card rounded-lg sacred-shadow">
      {/* Header */}
      <div 
        className="flex items-center justify-between p-6 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <Icon name="Archive" size={20} className="text-primary" />
          <h3 className="font-heading font-semibold text-lg text-foreground">
            Search Archives
          </h3>
        </div>
        <Icon 
          name={isExpanded ? "ChevronUp" : "ChevronDown"} 
          size={20} 
          className="text-muted-foreground" 
        />
      </div>
      {/* Expandable Content */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-border">
          <p className="text-muted-foreground font-body mb-6 pt-4">
            Search through our historical announcements and church news archives.
          </p>

          <form onSubmit={handleSearch} className="space-y-4">
            <Input
              type="search"
              label="Search Term"
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <Select
                label="Year"
                options={yearOptions}
                value={selectedYear}
                onChange={setSelectedYear}
              />
              
              <Select
                label="Month"
                options={monthOptions}
                value={selectedMonth}
                onChange={setSelectedMonth}
              />
            </div>

            <Button
              type="submit"
              variant="default"
              fullWidth
              iconName="Search"
              iconPosition="left"
            >
              Search Archives
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-start space-x-2">
              <Icon name="Info" size={16} className="text-primary mt-0.5" />
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Archive Information</p>
                <p>Our digital archives contain announcements dating back to 2020. For older records, please contact the church office.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArchiveSection;
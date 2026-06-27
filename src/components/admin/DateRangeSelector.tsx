"use client";

import { useState, useEffect } from 'react';

export interface DateRange {
  startDate: string | null;
  endDate: string | null;
}

interface DateRangeSelectorProps {
  onRangeChange: (range: DateRange) => void;
  defaultRange?: DateRange;
  className?: string;
}

const PRESETS = [
  { label: 'Last 7 Days', days: 7, color: 'blue' },
  { label: 'Last 30 Days', days: 30, color: 'green' },
  { label: 'Last 90 Days', days: 90, color: 'purple' },
  { label: 'Last 6 Months', days: 180, color: 'teal' },
  { label: 'Last Year', days: 365, color: 'orange' },
  { label: 'All Time', days: null, color: 'pink' },
];

export default function DateRangeSelector({
  onRangeChange,
  defaultRange,
  className = '',
}: DateRangeSelectorProps) {
  const [startDate, setStartDate] = useState<string>(
    defaultRange?.startDate || ''
  );
  const [endDate, setEndDate] = useState<string>(
    defaultRange?.endDate || ''
  );
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  useEffect(() => {
    // Initialize with "Last 30 Days" if no default range provided
    if (!defaultRange && !startDate && !endDate) {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const start = thirtyDaysAgo.toISOString().split('T')[0];
      const end = today.toISOString().split('T')[0];

      setStartDate(start);
      setEndDate(end);
      onRangeChange({ startDate: start, endDate: end });
      setSelectedPreset('Last 30 Days');
    } else if (defaultRange) {
      onRangeChange(defaultRange);
    }
  }, []);

  const handlePresetClick = (preset: typeof PRESETS[0]) => {
    setSelectedPreset(preset.label);

    if (preset.days === null) {
      // All Time - clear dates
      setStartDate('');
      setEndDate('');
      onRangeChange({ startDate: null, endDate: null });
    } else {
      const today = new Date();
      const start = new Date(today);
      start.setDate(today.getDate() - preset.days);

      const startStr = start.toISOString().split('T')[0];
      const endStr = today.toISOString().split('T')[0];

      setStartDate(startStr);
      setEndDate(endStr);
      onRangeChange({ startDate: startStr, endDate: endStr });
    }
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStartDate(value);
    setSelectedPreset(null); // Clear preset when manually changing dates
    onRangeChange({ startDate: value || null, endDate: endDate || null });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEndDate(value);
    setSelectedPreset(null); // Clear preset when manually changing dates
    onRangeChange({ startDate: startDate || null, endDate: value || null });
  };

  const getColorClasses = (color: string, isSelected: boolean) => {
    const colorMap: Record<string, { bg: string; border: string; text: string; icon: string; hover: string }> = {
      blue: {
        bg: isSelected ? 'bg-blue-100' : 'bg-blue-50',
        border: isSelected ? 'border-blue-300' : 'border-blue-200',
        text: isSelected ? 'text-blue-800' : 'text-blue-700',
        icon: isSelected ? 'text-blue-600' : 'text-blue-500',
        hover: 'hover:bg-blue-100',
      },
      green: {
        bg: isSelected ? 'bg-green-100' : 'bg-green-50',
        border: isSelected ? 'border-green-300' : 'border-green-200',
        text: isSelected ? 'text-green-800' : 'text-green-700',
        icon: isSelected ? 'text-green-600' : 'text-green-500',
        hover: 'hover:bg-green-100',
      },
      purple: {
        bg: isSelected ? 'bg-purple-100' : 'bg-purple-50',
        border: isSelected ? 'border-purple-300' : 'border-purple-200',
        text: isSelected ? 'text-purple-800' : 'text-purple-700',
        icon: isSelected ? 'text-purple-600' : 'text-purple-500',
        hover: 'hover:bg-purple-100',
      },
      teal: {
        bg: isSelected ? 'bg-teal-100' : 'bg-teal-50',
        border: isSelected ? 'border-teal-300' : 'border-teal-200',
        text: isSelected ? 'text-teal-800' : 'text-teal-700',
        icon: isSelected ? 'text-teal-600' : 'text-teal-500',
        hover: 'hover:bg-teal-100',
      },
      orange: {
        bg: isSelected ? 'bg-orange-100' : 'bg-orange-50',
        border: isSelected ? 'border-orange-300' : 'border-orange-200',
        text: isSelected ? 'text-orange-800' : 'text-orange-700',
        icon: isSelected ? 'text-orange-600' : 'text-orange-500',
        hover: 'hover:bg-orange-100',
      },
      pink: {
        bg: isSelected ? 'bg-pink-100' : 'bg-pink-50',
        border: isSelected ? 'border-pink-300' : 'border-pink-200',
        text: isSelected ? 'text-pink-800' : 'text-pink-700',
        icon: isSelected ? 'text-pink-600' : 'text-pink-500',
        hover: 'hover:bg-pink-100',
      },
    };
    return colorMap[color] || colorMap.blue;
  };

  return (
    <div className={`bg-white rounded-xl shadow-md p-6 ${className}`}>
      <div className="flex flex-col gap-6">
        {/* Preset Duration Buttons - Responsive Grid (2 cols mobile, 3 cols tablet, 6 cols desktop) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {PRESETS.map((preset) => {
            const isSelected = selectedPreset === preset.label;
            const colors = getColorClasses(preset.color, isSelected);
            return (
              <button
                key={preset.label}
                onClick={() => handlePresetClick(preset)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-all duration-300 hover:scale-105 ${colors.bg} ${colors.border} ${colors.text} ${colors.hover}`}
                title={preset.label}
                aria-label={preset.label}
                type="button"
              >
                <svg className={`w-5 h-5 flex-shrink-0 ${colors.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-semibold text-sm">{preset.label}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Date Range */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 flex-1">
            <label className="text-sm font-medium text-gray-800 whitespace-nowrap">From:</label>
            <div className="relative flex-1">
              <input
                type="date"
                value={startDate}
                onChange={handleStartDateChange}
                max={endDate || undefined}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm focus:border-blue-500 focus:ring-blue-500 transition-all"
                placeholder="mm/dd/yyyy"
              />
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-1">
            <label className="text-sm font-medium text-gray-800 whitespace-nowrap">To:</label>
            <div className="relative flex-1">
              <input
                type="date"
                value={endDate}
                onChange={handleEndDateChange}
                min={startDate || undefined}
                max={new Date().toISOString().split('T')[0]}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm focus:border-blue-500 focus:ring-blue-500 transition-all"
                placeholder="mm/dd/yyyy"
              />
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

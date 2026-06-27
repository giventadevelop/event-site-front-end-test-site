'use client';

import React from 'react';
import type { RecurrencePattern, RecurrenceEndType } from '@/lib/recurrenceUtils';

interface RecurrenceConfigSectionProps {
  isRecurring: boolean;
  onRecurringChange: (value: boolean) => void;
  pattern: RecurrencePattern | '';
  onPatternChange: (pattern: RecurrencePattern) => void;
  interval: number;
  onIntervalChange: (interval: number) => void;
  endType: RecurrenceEndType;
  onEndTypeChange: (endType: RecurrenceEndType) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
  occurrences: number;
  onOccurrencesChange: (count: number) => void;
  weeklyDays: number[];
  onWeeklyDaysChange: (days: number[]) => void;
  monthlyDay: number | 'LAST' | null;
  onMonthlyDayChange: (day: number | 'LAST' | null) => void;
  monthlyDayType: 'DAY_NUMBER' | 'LAST_DAY';
  onMonthlyDayTypeChange: (type: 'DAY_NUMBER' | 'LAST_DAY') => void;
  errors: Record<string, string>;
  startDate: string;
  startTime: string;
  timezone: string;
}

const WEEKDAYS = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export default function RecurrenceConfigSection({
  isRecurring,
  onRecurringChange,
  pattern,
  onPatternChange,
  interval,
  onIntervalChange,
  endType,
  onEndTypeChange,
  endDate,
  onEndDateChange,
  occurrences,
  onOccurrencesChange,
  weeklyDays,
  onWeeklyDaysChange,
  monthlyDay,
  onMonthlyDayChange,
  monthlyDayType,
  onMonthlyDayTypeChange,
  errors,
  startDate,
  startTime,
  timezone,
}: RecurrenceConfigSectionProps) {
  const handleWeeklyDayToggle = (day: number) => {
    if (weeklyDays.includes(day)) {
      onWeeklyDaysChange(weeklyDays.filter(d => d !== day));
    } else {
      onWeeklyDaysChange([...weeklyDays, day].sort((a, b) => a - b));
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Date input returns YYYY-MM-DD format, store it directly
    onEndDateChange(value);
  };

  if (!isRecurring) {
    return (
      <div className="border-t border-gray-200 pt-6 mt-6">
        <div className="flex justify-start">
          <div className="custom-grid-cell" style={{ minWidth: '120px' }}>
            <label className="flex flex-col items-center" htmlFor="isRecurring">
              <span className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={isRecurring}
                  onChange={(e) => onRecurringChange(e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  className="custom-checkbox"
                />
                <span className="custom-checkbox-tick">
                  {isRecurring && (
                    <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l5 5L19 7" />
                    </svg>
                  )}
                </span>
              </span>
              <span className="mt-2 text-xs text-center select-none break-words max-w-[6rem]">Make this event recurring</span>
            </label>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 pt-6 mt-6">
      <div className="flex justify-start mb-4">
        <div className="custom-grid-cell" style={{ minWidth: '120px' }}>
          <label className="flex flex-col items-center" htmlFor="isRecurring">
            <span className="relative flex items-center justify-center">
              <input
                type="checkbox"
                id="isRecurring"
                checked={isRecurring}
                onChange={(e) => onRecurringChange(e.target.checked)}
                onClick={(e) => e.stopPropagation()}
                className="custom-checkbox"
              />
              <span className="custom-checkbox-tick">
                {isRecurring && (
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l5 5L19 7" />
                  </svg>
                )}
              </span>
            </span>
            <span className="mt-2 text-xs text-center select-none break-words max-w-[6rem]">Make this event recurring</span>
          </label>
        </div>
      </div>

      {isRecurring && (
        <div className="space-y-4 pl-6 border-l-2 border-blue-200">
          {/* Pattern Selection */}
          <div>
            <label className="block font-medium mb-2">Recurrence Pattern *</label>
            <div className="space-y-2">
              {(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY'] as RecurrencePattern[]).map((p) => (
                <label key={p} className="flex items-center">
                  <input
                    type="radio"
                    name="recurrencePattern"
                    value={p}
                    checked={pattern === p}
                    onChange={() => onPatternChange(p)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-gray-700">
                    {p === 'BIWEEKLY' ? 'Biweekly (Every 2 weeks)' : p.charAt(0) + p.slice(1).toLowerCase()}
                  </span>
                </label>
              ))}
            </div>
            {errors.recurrencePattern && (
              <div className="text-red-500 text-sm mt-1">{errors.recurrencePattern}</div>
            )}
          </div>

          {/* Pattern-Specific Fields */}
          {pattern === 'DAILY' && (
            <div>
              <label className="block font-medium mb-2">
                Repeat every{' '}
                <input
                  type="number"
                  min={1}
                  value={interval}
                  onChange={(e) => onIntervalChange(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 border border-gray-300 rounded p-1 text-center inline-block"
                />{' '}
                day{interval !== 1 ? 's' : ''}
              </label>
            </div>
          )}

          {pattern === 'WEEKLY' && (
            <div className="space-y-3">
              <div>
                <label className="block font-medium mb-2">
                  Repeat every{' '}
                  <input
                    type="number"
                    min={1}
                    value={interval}
                    onChange={(e) => onIntervalChange(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 border border-gray-300 rounded p-1 text-center inline-block"
                  />{' '}
                  week{interval !== 1 ? 's' : ''}
                </label>
              </div>
              <div>
                <label className="block font-medium mb-2">On days of week *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {WEEKDAYS.map((day) => (
                    <label key={day.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={weeklyDays.includes(day.value)}
                        onChange={() => handleWeeklyDayToggle(day.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{day.label}</span>
                    </label>
                  ))}
                </div>
                {errors.recurrenceWeeklyDays && (
                  <div className="text-red-500 text-sm mt-1">{errors.recurrenceWeeklyDays}</div>
                )}
              </div>
            </div>
          )}

          {pattern === 'BIWEEKLY' && (
            <div className="space-y-3">
              <div>
                <p className="text-gray-700 font-medium">Every 2 weeks</p>
              </div>
              <div>
                <label className="block font-medium mb-2">On days of week *</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {WEEKDAYS.map((day) => (
                    <label key={day.value} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={weeklyDays.includes(day.value)}
                        onChange={() => handleWeeklyDayToggle(day.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{day.label}</span>
                    </label>
                  ))}
                </div>
                {errors.recurrenceWeeklyDays && (
                  <div className="text-red-500 text-sm mt-1">{errors.recurrenceWeeklyDays}</div>
                )}
              </div>
            </div>
          )}

          {pattern === 'MONTHLY' && (
            <div className="space-y-3">
              <div>
                <label className="block font-medium mb-2">
                  Repeat every{' '}
                  <input
                    type="number"
                    min={1}
                    value={interval}
                    onChange={(e) => onIntervalChange(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 border border-gray-300 rounded p-1 text-center inline-block"
                  />{' '}
                  month{interval !== 1 ? 's' : ''}
                </label>
              </div>
              <div>
                <label className="block font-medium mb-2">On day of month *</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="monthlyDayType"
                      value="DAY_NUMBER"
                      checked={monthlyDayType === 'DAY_NUMBER'}
                      onChange={() => {
                        onMonthlyDayTypeChange('DAY_NUMBER');
                        if (monthlyDay === 'LAST') {
                          onMonthlyDayChange(1);
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-gray-700">Day</span>
                    {monthlyDayType === 'DAY_NUMBER' && (
                      <input
                        type="number"
                        min={1}
                        max={31}
                        value={typeof monthlyDay === 'number' ? monthlyDay : 1}
                        onChange={(e) => onMonthlyDayChange(Math.max(1, Math.min(31, parseInt(e.target.value) || 1)))}
                        className="ml-2 w-20 border border-gray-300 rounded p-1 text-center"
                      />
                    )}
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="monthlyDayType"
                      value="LAST_DAY"
                      checked={monthlyDayType === 'LAST_DAY'}
                      onChange={() => {
                        onMonthlyDayTypeChange('LAST_DAY');
                        onMonthlyDayChange('LAST');
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-gray-700">Last day of month</span>
                  </label>
                </div>
                {errors.recurrenceMonthlyDay && (
                  <div className="text-red-500 text-sm mt-1">{errors.recurrenceMonthlyDay}</div>
                )}
              </div>
            </div>
          )}

          {/* End Condition */}
          <div>
            <label className="block font-medium mb-2">End Condition *</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="recurrenceEndType"
                  value="END_DATE"
                  checked={endType === 'END_DATE'}
                  onChange={() => onEndTypeChange('END_DATE')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-gray-700">End on date</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="recurrenceEndType"
                  value="OCCURRENCES"
                  checked={endType === 'OCCURRENCES'}
                  onChange={() => onEndTypeChange('OCCURRENCES')}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                />
                <span className="ml-2 text-gray-700">End after occurrences</span>
              </label>
            </div>
            {errors.recurrenceEndType && (
              <div className="text-red-500 text-sm mt-1">{errors.recurrenceEndType}</div>
            )}
          </div>

          {/* End Date Input */}
          {endType === 'END_DATE' && (
            <div>
              <label className="block font-medium mb-2">End Date *</label>
              <input
                type="date"
                value={endDate || ''}
                onChange={handleEndDateChange}
                min={startDate || undefined}
                className={`w-full border rounded p-2 ${
                  errors.recurrenceEndDate
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
              />
              {errors.recurrenceEndDate && (
                <div className="text-red-500 text-sm mt-1">{errors.recurrenceEndDate}</div>
              )}
              <p className="text-xs text-gray-500 mt-1">Maximum: 5 years from start date</p>
            </div>
          )}

          {/* Occurrences Input */}
          {endType === 'OCCURRENCES' && (
            <div>
              <label className="block font-medium mb-2">
                End after{' '}
                <input
                  type="number"
                  min={1}
                  max={1000}
                  value={occurrences}
                  onChange={(e) => onOccurrencesChange(Math.max(1, Math.min(1000, parseInt(e.target.value) || 1)))}
                  className="w-24 border border-gray-300 rounded p-1 text-center inline-block"
                />{' '}
                occurrence{occurrences !== 1 ? 's' : ''}
              </label>
              {errors.recurrenceOccurrences && (
                <div className="text-red-500 text-sm mt-1">{errors.recurrenceOccurrences}</div>
              )}
              <p className="text-xs text-gray-500 mt-1">Maximum: 1000 occurrences</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


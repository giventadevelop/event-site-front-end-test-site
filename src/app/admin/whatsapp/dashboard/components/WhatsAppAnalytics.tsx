'use client';

import React from 'react';
// import { FaChartLine, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import { WhatsAppAnalytics as WhatsAppAnalyticsType } from '@/types';

interface DateRange {
  start: string;
  end: string;
}

interface WhatsAppAnalyticsProps {
  data: WhatsAppAnalyticsType | null;
  loading: boolean;
  error: string | null;
  dateRange: DateRange;
  onDateRangeChange: (dateRange: DateRange) => void;
}

export default function WhatsAppAnalytics({
  data,
  loading,
  error,
  dateRange,
  onDateRangeChange
}: WhatsAppAnalyticsProps) {
  if (loading) {
    return (
      <div className="p-8 text-center">
        <span className="text-4xl animate-spin">⏳</span>
        <p className="text-gray-600">Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <span className="text-4xl text-red-500 mb-4">⚠️</span>
        <p className="text-red-600 mb-2">Failed to load analytics</p>
        <p className="text-gray-600 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Analytics Overview</h2>
        <p className="text-gray-600">
          Performance metrics for {dateRange.start} to {dateRange.end}
        </p>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Messages */}
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-600">Total Messages</p>
              <p className="text-2xl font-bold text-blue-900">
                {data?.totalMessages || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Sent Messages */}
        <div className="bg-green-50 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <span className="text-2xl">📤</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">Sent Messages</p>
              <p className="text-2xl font-bold text-green-900">
                {data?.sentMessages || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Delivered Messages */}
        <div className="bg-purple-50 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-purple-600">Delivered Messages</p>
              <p className="text-2xl font-bold text-purple-900">
                {data?.deliveredMessages || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Failed Messages */}
        <div className="bg-red-50 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <span className="text-2xl">❌</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-red-600">Failed Messages</p>
              <p className="text-2xl font-bold text-red-900">
                {data?.failedMessages || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delivery Rate */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Rate</h3>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Success Rate</span>
                <span className="font-medium">{data?.deliveryRate || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${data?.deliveryRate || 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Read Rate */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Read Rate</h3>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Read Rate</span>
                <span className="font-medium">{data?.readRate || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${data?.readRate || 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Trends */}
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Message Trends</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Message Volume */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
              <span className="mr-2">📅</span>
              Daily Volume
            </h4>
            <div className="space-y-3">
              {data?.dailyVolume?.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{day.date}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(day.count / (data?.maxDailyVolume || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium w-12 text-right">{day.count}</span>
                  </div>
                </div>
              )) || (
                  <div className="text-center py-8 text-gray-500">
                    <span className="text-2xl mb-2 block">📊</span>
                    No data available for selected period
                  </div>
                )}
            </div>
          </div>

          {/* Delivery Status Distribution */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center">
              <span className="mr-2">🥧</span>
              Delivery Status
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  <span className="text-sm text-gray-600">Delivered</span>
                </div>
                <span className="text-sm font-medium">{data?.deliveredMessages || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
                  <span className="text-sm text-gray-600">Sent</span>
                </div>
                <span className="text-sm font-medium">{(data?.sentMessages || 0) - (data?.deliveredMessages || 0)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                  <span className="text-sm text-gray-600">Failed</span>
                </div>
                <span className="text-sm font-medium">{data?.failedMessages || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export and Actions */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Data Export</h3>
            <p className="text-gray-600 text-sm">
              Export analytics data for further analysis or reporting
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                // Simulate CSV export
                const csvData = `Date,Total Messages,Sent,Delivered,Failed,Delivery Rate
${dateRange.start} to ${dateRange.end},${data?.totalMessages || 0},${data?.sentMessages || 0},${data?.deliveredMessages || 0},${data?.failedMessages || 0},${data?.deliveryRate || 0}%`;
                const blob = new Blob([csvData], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `whatsapp-analytics-${dateRange.start}-to-${dateRange.end}.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
              }}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center"
            >
              <span className="mr-2">📊</span>
              Export CSV
            </button>
            <button
              onClick={() => {
                // Simulate PDF export
                alert('PDF export functionality will be implemented');
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
            >
              <span className="mr-2">📄</span>
              Export PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

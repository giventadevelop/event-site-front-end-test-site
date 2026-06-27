'use client';

import React, { useState, useEffect } from 'react';
// import { FaChartLine, FaHistory, FaExclamationTriangle, FaCog, FaFilter } from 'react-icons/fa';

// Import dashboard components
import WhatsAppAnalytics from './components/WhatsAppAnalytics';
import MessageHistory from './components/MessageHistory';
import DeliveryStatusGrid from './components/DeliveryStatusGrid';
import UsageAlerts from './components/UsageAlerts';

// Import server actions
import {
  getWhatsAppAnalyticsServer,
  getWhatsAppDashboardSummaryServer
} from './ApiServerActions';
import { WhatsAppAnalytics as WhatsAppAnalyticsType } from '@/types';

type DashboardTab = 'analytics' | 'history' | 'status' | 'alerts';

const TABS = [
  { id: 'analytics' as DashboardTab, name: 'Analytics', icon: '📊', description: 'Performance metrics and insights' },
  { id: 'history' as DashboardTab, name: 'Message History', icon: '📜', description: 'View all sent messages' },
  { id: 'status' as DashboardTab, name: 'Delivery Status', icon: '⚠️', description: 'Real-time delivery tracking' },
  { id: 'alerts' as DashboardTab, name: 'Usage Alerts', icon: '⚙️', description: 'Monitor costs and limits' },
];

interface DateRange {
  start: string;
  end: string;
}

export default function WhatsAppDashboard() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('analytics');
  const [dateRange, setDateRange] = useState<DateRange>(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 7); // Default to last 7 days

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    };
  });
  const [analyticsData, setAnalyticsData] = useState<WhatsAppAnalyticsType | null>(null);
  const [dashboardSummary, setDashboardSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load both analytics and summary data
        const [analyticsResult, summaryResult] = await Promise.all([
          getWhatsAppAnalyticsServer('7d', dateRange.start, dateRange.end),
          getWhatsAppDashboardSummaryServer()
        ]);

        if (analyticsResult) {
          setAnalyticsData(analyticsResult);
        }

        if (summaryResult) {
          setDashboardSummary(summaryResult);
        }
      } catch (err) {
        console.error('Error loading analytics:', err);
        setError(err instanceof Error ? err.message : 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [dateRange]);

  const handleDateRangeChange = (newDateRange: DateRange) => {
    setDateRange(newDateRange);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'analytics':
        return (
          <WhatsAppAnalytics
            data={analyticsData}
            loading={loading}
            error={error}
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
          />
        );

      case 'history':
        return (
          <MessageHistory
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
          />
        );

      case 'status':
        return (
          <DeliveryStatusGrid
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
          />
        );

      case 'alerts':
        return (
          <UsageAlerts
            analyticsData={analyticsData}
            dateRange={dateRange}
            onDateRangeChange={handleDateRangeChange}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Summary */}
      {dashboardSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">📊</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Messages
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {dashboardSummary.totalMessages || 0}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">✅</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Delivery Rate
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {dashboardSummary.deliveryRate || 0}%
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">🚀</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Campaigns
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {dashboardSummary.activeCampaigns || 0}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">❌</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Failed Messages
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {dashboardSummary.failedMessages || 0}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Dashboard sections" role="tablist">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${isActive
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.id}`}
                  id={`tab-${tab.id}`}
                  tabIndex={isActive ? 0 : -1}
                >
                  <span className={`mr-2 ${isActive ? 'text-green-500' : 'text-gray-400 group-hover:text-gray-500'}`} role="img" aria-label={`${tab.name} icon`}>
                    {tab.icon}
                  </span>
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Description */}
        <div className="px-6 py-3 bg-gray-50">
          <p className="text-sm text-gray-600">
            {TABS.find(tab => tab.id === activeTab)?.description}
          </p>
        </div>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white shadow rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-gray-400" role="img" aria-label="Filter">🔍</span>
            <label htmlFor="start-date" className="text-sm font-medium text-gray-700">Date Range:</label>
            <div className="flex items-center space-x-2">
              <label htmlFor="start-date" className="sr-only">Start date</label>
              <input
                id="start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                aria-describedby="date-range-help"
              />
              <span className="text-gray-500" aria-hidden="true">to</span>
              <label htmlFor="end-date" className="sr-only">End date</label>
              <input
                id="end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                aria-describedby="date-range-help"
              />
              <span id="date-range-help" className="sr-only">
                Select the date range for dashboard data
              </span>
            </div>
          </div>

          <div className="flex space-x-2" role="group" aria-label="Quick date range selection">
            <button
              onClick={() => {
                const end = new Date();
                const start = new Date();
                start.setDate(start.getDate() - 7);
                setDateRange({
                  start: start.toISOString().split('T')[0],
                  end: end.toISOString().split('T')[0],
                });
              }}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded"
              aria-label="Set date range to last 7 days"
            >
              Last 7 days
            </button>
            <button
              onClick={() => {
                const end = new Date();
                const start = new Date();
                start.setDate(start.getDate() - 30);
                setDateRange({
                  start: start.toISOString().split('T')[0],
                  end: end.toISOString().split('T')[0],
                });
              }}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded"
              aria-label="Set date range to last 30 days"
            >
              Last 30 days
            </button>
            <button
              onClick={() => {
                const end = new Date();
                const start = new Date();
                start.setMonth(start.getMonth() - 3);
                setDateRange({
                  start: start.toISOString().split('T')[0],
                  end: end.toISOString().split('T')[0],
                });
              }}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 rounded"
              aria-label="Set date range to last 3 months"
            >
              Last 3 months
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow rounded-lg">
        <div role="tabpanel" aria-labelledby={`tab-${activeTab}`} id={`panel-${activeTab}`}>
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}

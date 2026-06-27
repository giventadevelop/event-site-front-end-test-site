'use client';

import React, { useState, useEffect } from 'react';
// import { FaCog, FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaBell } from 'react-icons/fa';
import { WhatsAppAnalytics as WhatsAppAnalyticsType } from '@/types';

interface DateRange {
  start: string;
  end: string;
}

interface UsageAlertsProps {
  analyticsData: WhatsAppAnalyticsType | null;
  dateRange: DateRange;
  onDateRangeChange: (dateRange: DateRange) => void;
}

interface Alert {
  id: string;
  type: 'warning' | 'error' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  isActive: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'usage' | 'cost' | 'performance' | 'quota' | 'delivery';
  actionRequired?: boolean;
  resolvedAt?: string;
}

interface UsageMetrics {
  totalMessages: number;
  monthlyLimit: number;
  estimatedCost: number;
  monthlyBudget: number;
  failureRate: number;
  failureThreshold: number;
  deliveryRate: number;
  readRate: number;
  averageCostPerMessage: number;
  projectedMonthlyCost: number;
}

interface AlertSettings {
  usageThreshold: number;
  costThreshold: number;
  failureRateThreshold: number;
  enableEmailNotifications: boolean;
  enableSmsNotifications: boolean;
  notificationFrequency: 'immediate' | 'daily' | 'weekly';
}

export default function UsageAlerts({
  analyticsData,
  dateRange,
  onDateRangeChange
}: UsageAlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [usageMetrics, setUsageMetrics] = useState<UsageMetrics>({
    totalMessages: 0,
    monthlyLimit: 1000,
    estimatedCost: 0,
    monthlyBudget: 100,
    failureRate: 0,
    failureThreshold: 5,
    deliveryRate: 0,
    readRate: 0,
    averageCostPerMessage: 0.025,
    projectedMonthlyCost: 0,
  });
  const [alertSettings, setAlertSettings] = useState<AlertSettings>({
    usageThreshold: 80,
    costThreshold: 80,
    failureRateThreshold: 5,
    enableEmailNotifications: true,
    enableSmsNotifications: false,
    notificationFrequency: 'immediate',
  });
  const [showSettings, setShowSettings] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  // Enhanced mock data with more realistic alerts
  useEffect(() => {
    const mockAlerts: Alert[] = [
      {
        id: '1',
        type: 'warning',
        title: 'High Message Volume',
        message: 'You have sent 90% of your monthly message limit (900/1000 messages)',
        timestamp: '2024-01-15 09:30:00',
        isActive: true,
        severity: 'high',
        category: 'quota',
        actionRequired: true,
      },
      {
        id: '2',
        type: 'error',
        title: 'Failed Message Rate High',
        message: 'Message failure rate is 7.2%, above the 5% threshold',
        timestamp: '2024-01-15 08:45:00',
        isActive: true,
        severity: 'critical',
        category: 'performance',
        actionRequired: true,
      },
      {
        id: '3',
        type: 'info',
        title: 'Weekly Usage Report',
        message: 'Your weekly usage report is ready for review',
        timestamp: '2024-01-14 16:20:00',
        isActive: true,
        severity: 'low',
        category: 'usage',
        actionRequired: false,
      },
      {
        id: '4',
        type: 'success',
        title: 'Cost Optimization Achievement',
        message: 'You saved 15% on messaging costs this month compared to last month',
        timestamp: '2024-01-14 14:10:00',
        isActive: false,
        severity: 'low',
        category: 'cost',
        actionRequired: false,
        resolvedAt: '2024-01-14 14:15:00',
      },
      {
        id: '5',
        type: 'warning',
        title: 'Budget Alert',
        message: 'You have used 85% of your monthly budget ($85/$100)',
        timestamp: '2024-01-13 11:20:00',
        isActive: true,
        severity: 'medium',
        category: 'cost',
        actionRequired: true,
      },
      {
        id: '6',
        type: 'info',
        title: 'Delivery Rate Improvement',
        message: 'Your delivery rate has improved to 96.5% this week',
        timestamp: '2024-01-12 15:30:00',
        isActive: true,
        severity: 'low',
        category: 'delivery',
        actionRequired: false,
      },
    ];

    const mockMetrics: UsageMetrics = {
      totalMessages: analyticsData?.totalMessages || 900,
      monthlyLimit: 1000,
      estimatedCost: 22.50,
      monthlyBudget: 100,
      failureRate: analyticsData?.failedMessages ?
        ((analyticsData.failedMessages / analyticsData.totalMessages) * 100) : 7.2,
      failureThreshold: 5,
      deliveryRate: analyticsData?.deliveryRate || 96.5,
      readRate: analyticsData?.readRate || 78.3,
      averageCostPerMessage: 0.025,
      projectedMonthlyCost: 22.50,
    };

    setAlerts(mockAlerts);
    setUsageMetrics(mockMetrics);
  }, [analyticsData]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      case 'info':
        return 'ℹ️';
      case 'success':
        return '✅';
      default:
        return 'ℹ️';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '🚨';
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '🔵';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'usage':
        return '📊';
      case 'cost':
        return '💰';
      case 'performance':
        return '⚡';
      case 'quota':
        return '📈';
      case 'delivery':
        return '📬';
      default:
        return '📋';
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'info':
        return 'border-blue-200 bg-blue-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(alerts.map(alert =>
      alert.id === alertId ? { ...alert, isActive: false, resolvedAt: new Date().toISOString() } : alert
    ));
  };

  const resolveAlert = (alertId: string) => {
    setAlerts(alerts.map(alert =>
      alert.id === alertId ? { ...alert, isActive: false, resolvedAt: new Date().toISOString() } : alert
    ));
  };

  const getUsagePercentage = (current: number, limit: number) => {
    return Math.min((current / limit) * 100, 100);
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    if (percentage >= 60) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getTimeDifference = (dateString: string) => {
    const now = new Date();
    const messageTime = new Date(dateString);
    const diffMs = now.getTime() - messageTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  // Filter alerts based on category and severity
  const filteredAlerts = alerts.filter(alert => {
    const matchesCategory = filterCategory === 'all' || alert.category === filterCategory;
    const matchesSeverity = filterSeverity === 'all' || alert.severity === filterSeverity;
    return matchesCategory && matchesSeverity;
  });

  const activeAlerts = filteredAlerts.filter(alert => alert.isActive);
  const dismissedAlerts = filteredAlerts.filter(alert => !alert.isActive);

  // Calculate alert statistics
  const alertStats = {
    total: filteredAlerts.length,
    active: activeAlerts.length,
    critical: filteredAlerts.filter(a => a.severity === 'critical').length,
    high: filteredAlerts.filter(a => a.severity === 'high').length,
    medium: filteredAlerts.filter(a => a.severity === 'medium').length,
    low: filteredAlerts.filter(a => a.severity === 'low').length,
    actionRequired: filteredAlerts.filter(a => a.actionRequired).length,
  };

  return (
    <div className="p-6">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Usage Alerts & Monitoring</h2>
            <p className="text-gray-600">
              Monitor your WhatsApp usage, costs, and performance thresholds from {dateRange.start} to {dateRange.end}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              aria-describedby="settings-description"
            >
              <span role="img" aria-label="Settings">⚙️</span>
              Alert Settings
            </button>
            <span id="settings-description" className="sr-only">
              Configure alert thresholds and notification preferences
            </span>
          </div>
        </div>
      </header>

      {/* Alert Statistics */}
      <section aria-labelledby="alert-stats-heading" className="mb-6">
        <h3 id="alert-stats-heading" className="sr-only">Alert Statistics Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3" role="img" aria-label="Total alerts">📊</span>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Alerts</p>
                <p className="text-2xl font-bold text-gray-900" aria-label={`${alertStats.total} total alerts`}>
                  {alertStats.total}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3" role="img" aria-label="Active alerts">🔔</span>
              <div>
                <p className="text-sm font-medium text-gray-600">Active Alerts</p>
                <p className="text-2xl font-bold text-gray-900" aria-label={`${alertStats.active} active alerts`}>
                  {alertStats.active}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3" role="img" aria-label="Critical alerts">🚨</span>
              <div>
                <p className="text-sm font-medium text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600" aria-label={`${alertStats.critical} critical alerts`}>
                  {alertStats.critical}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3" role="img" aria-label="Action required">⚠️</span>
              <div>
                <p className="text-sm font-medium text-gray-600">Action Required</p>
                <p className="text-2xl font-bold text-yellow-600" aria-label={`${alertStats.actionRequired} alerts requiring action`}>
                  {alertStats.actionRequired}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Usage Statistics */}
      <section aria-labelledby="usage-stats-heading" className="mb-8">
        <h3 id="usage-stats-heading" className="sr-only">Usage Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Message Count */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900" aria-label={`${usageMetrics.totalMessages} messages sent`}>
                  {usageMetrics.totalMessages}
                </p>
              </div>
              <div className="p-3 rounded-full bg-blue-100">
                <span className="text-2xl" role="img" aria-label="Messages">📊</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Monthly Limit</span>
                <span className="font-medium" aria-label={`${usageMetrics.monthlyLimit} messages`}>{usageMetrics.monthlyLimit}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1" role="progressbar" aria-valuenow={getUsagePercentage(usageMetrics.totalMessages, usageMetrics.monthlyLimit)} aria-valuemin={0} aria-valuemax={100} aria-label="Message usage progress">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(getUsagePercentage(usageMetrics.totalMessages, usageMetrics.monthlyLimit))}`}
                  style={{ width: `${getUsagePercentage(usageMetrics.totalMessages, usageMetrics.monthlyLimit)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1" aria-live="polite">
                {getUsagePercentage(usageMetrics.totalMessages, usageMetrics.monthlyLimit).toFixed(1)}% of monthly limit used
              </p>
            </div>
          </div>

          {/* Cost */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Estimated Cost</p>
                <p className="text-2xl font-bold text-gray-900" aria-label={`${formatCurrency(usageMetrics.estimatedCost)} estimated cost`}>
                  {formatCurrency(usageMetrics.estimatedCost)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-green-100">
                <span className="text-2xl" role="img" aria-label="Cost">💰</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Monthly Budget</span>
                <span className="font-medium" aria-label={`${formatCurrency(usageMetrics.monthlyBudget)} budget`}>{formatCurrency(usageMetrics.monthlyBudget)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1" role="progressbar" aria-valuenow={getUsagePercentage(usageMetrics.estimatedCost, usageMetrics.monthlyBudget)} aria-valuemin={0} aria-valuemax={100} aria-label="Budget usage progress">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(getUsagePercentage(usageMetrics.estimatedCost, usageMetrics.monthlyBudget))}`}
                  style={{ width: `${getUsagePercentage(usageMetrics.estimatedCost, usageMetrics.monthlyBudget)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1" aria-live="polite">
                {getUsagePercentage(usageMetrics.estimatedCost, usageMetrics.monthlyBudget).toFixed(1)}% of monthly budget used
              </p>
            </div>
          </div>

          {/* Failure Rate */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failure Rate</p>
                <p className="text-2xl font-bold text-gray-900" aria-label={`${usageMetrics.failureRate.toFixed(1)}% failure rate`}>
                  {usageMetrics.failureRate.toFixed(1)}%
                </p>
              </div>
              <div className="p-3 rounded-full bg-red-100">
                <span className="text-2xl" role="img" aria-label="Failure rate">⚠️</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Threshold</span>
                <span className="font-medium" aria-label={`${usageMetrics.failureThreshold}% threshold`}>{usageMetrics.failureThreshold}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1" role="progressbar" aria-valuenow={usageMetrics.failureRate} aria-valuemin={0} aria-valuemax={usageMetrics.failureThreshold * 2} aria-label="Failure rate progress">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${usageMetrics.failureRate > usageMetrics.failureThreshold ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min((usageMetrics.failureRate / (usageMetrics.failureThreshold * 2)) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1" aria-live="polite">
                {usageMetrics.failureRate > usageMetrics.failureThreshold ? 'Above threshold' : 'Within acceptable range'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section aria-labelledby="filters-heading" className="mb-6">
        <h3 id="filters-heading" className="sr-only">Alert Filters</h3>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Category
              </label>
              <select
                id="category-filter"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                aria-describedby="category-filter-help"
              >
                <option value="all">All Categories</option>
                <option value="usage">Usage</option>
                <option value="cost">Cost</option>
                <option value="performance">Performance</option>
                <option value="quota">Quota</option>
                <option value="delivery">Delivery</option>
              </select>
              <span id="category-filter-help" className="sr-only">
                Filter alerts by their category type
              </span>
            </div>
            <div className="flex-1">
              <label htmlFor="severity-filter" className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Severity
              </label>
              <select
                id="severity-filter"
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                aria-describedby="severity-filter-help"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <span id="severity-filter-help" className="sr-only">
                Filter alerts by their severity level
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <section aria-labelledby="active-alerts-heading" className="mb-8">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-2" role="img" aria-label="Active alerts">🔔</span>
            <h3 id="active-alerts-heading" className="text-lg font-medium text-gray-900">Active Alerts</h3>
            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800" aria-label={`${activeAlerts.length} active alerts`}>
              {activeAlerts.length}
            </span>
          </div>
          <div className="space-y-3">
            {activeAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`border rounded-lg p-4 ${getAlertColor(alert.type)}`}
                role="alert"
                aria-labelledby={`alert-title-${alert.id}`}
                aria-describedby={`alert-message-${alert.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="flex items-center gap-2">
                      <span className="text-lg" role="img" aria-label={`Alert type: ${alert.type}`}>
                        {getAlertIcon(alert.type)}
                      </span>
                      <span className="text-sm" role="img" aria-label={`Severity: ${alert.severity}`}>
                        {getSeverityIcon(alert.severity)}
                      </span>
                      <span className="text-sm" role="img" aria-label={`Category: ${alert.category}`}>
                        {getCategoryIcon(alert.category)}
                      </span>
                    </div>
                    <div className="ml-3">
                      <h4 id={`alert-title-${alert.id}`} className="text-sm font-medium text-gray-900">{alert.title}</h4>
                      <p id={`alert-message-${alert.id}`} className="text-sm text-gray-600 mt-1">{alert.message}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <p className="text-xs text-gray-500">{formatDateTime(alert.timestamp)}</p>
                        <p className="text-xs text-gray-500">({getTimeDifference(alert.timestamp)})</p>
                        {alert.actionRequired && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800" aria-label="Action required">
                            Action Required
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {alert.actionRequired && (
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="text-blue-600 hover:text-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 p-1 rounded"
                        aria-label={`Resolve alert: ${alert.title}`}
                      >
                        <span role="img" aria-label="Resolve">✅</span>
                      </button>
                    )}
                    <button
                      onClick={() => dismissAlert(alert.id)}
                      className="text-gray-400 hover:text-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 p-1 rounded"
                      aria-label={`Dismiss alert: ${alert.title}`}
                    >
                      <span role="img" aria-label="Dismiss">✕</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Dismissed Alerts */}
      {dismissedAlerts.length > 0 && (
        <section aria-labelledby="dismissed-alerts-heading" className="mb-8">
          <h3 id="dismissed-alerts-heading" className="text-lg font-medium text-gray-900 mb-4">Dismissed Alerts</h3>
          <div className="space-y-3">
            {dismissedAlerts.map((alert) => (
              <div
                key={alert.id}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50 opacity-60"
                role="region"
                aria-labelledby={`dismissed-alert-title-${alert.id}`}
              >
                <div className="flex items-start">
                  <div className="flex items-center gap-2">
                    <span className="text-lg" role="img" aria-label={`Alert type: ${alert.type}`}>
                      {getAlertIcon(alert.type)}
                    </span>
                    <span className="text-sm" role="img" aria-label={`Severity: ${alert.severity}`}>
                      {getSeverityIcon(alert.severity)}
                    </span>
                    <span className="text-sm" role="img" aria-label={`Category: ${alert.category}`}>
                      {getCategoryIcon(alert.category)}
                    </span>
                  </div>
                  <div className="ml-3">
                    <h4 id={`dismissed-alert-title-${alert.id}`} className="text-sm font-medium text-gray-900">{alert.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <p className="text-xs text-gray-500">{formatDateTime(alert.timestamp)}</p>
                      {alert.resolvedAt && (
                        <p className="text-xs text-gray-500">Resolved: {formatDateTime(alert.resolvedAt)}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Alert Settings Configuration */}
      {showSettings && (
        <section aria-labelledby="alert-settings-heading" className="mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 id="alert-settings-heading" className="text-lg font-medium text-gray-900">Alert Settings Configuration</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded p-1"
                aria-label="Close alert settings"
              >
                <span className="text-xl">✕</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Threshold Settings */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-4">Threshold Settings</h4>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="usage-threshold" className="block text-sm font-medium text-gray-600 mb-2">
                      Usage Threshold (%)
                    </label>
                    <input
                      id="usage-threshold"
                      type="number"
                      min="0"
                      max="100"
                      value={alertSettings.usageThreshold}
                      onChange={(e) => setAlertSettings(prev => ({ ...prev, usageThreshold: parseInt(e.target.value) }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      aria-describedby="usage-threshold-help"
                    />
                    <span id="usage-threshold-help" className="sr-only">
                      Set the percentage threshold for usage alerts
                    </span>
                  </div>
                  <div>
                    <label htmlFor="cost-threshold" className="block text-sm font-medium text-gray-600 mb-2">
                      Cost Threshold (%)
                    </label>
                    <input
                      id="cost-threshold"
                      type="number"
                      min="0"
                      max="100"
                      value={alertSettings.costThreshold}
                      onChange={(e) => setAlertSettings(prev => ({ ...prev, costThreshold: parseInt(e.target.value) }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      aria-describedby="cost-threshold-help"
                    />
                    <span id="cost-threshold-help" className="sr-only">
                      Set the percentage threshold for cost alerts
                    </span>
                  </div>
                  <div>
                    <label htmlFor="failure-threshold" className="block text-sm font-medium text-gray-600 mb-2">
                      Failure Rate Threshold (%)
                    </label>
                    <input
                      id="failure-threshold"
                      type="number"
                      min="0"
                      max="50"
                      step="0.1"
                      value={alertSettings.failureRateThreshold}
                      onChange={(e) => setAlertSettings(prev => ({ ...prev, failureRateThreshold: parseFloat(e.target.value) }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      aria-describedby="failure-threshold-help"
                    />
                    <span id="failure-threshold-help" className="sr-only">
                      Set the percentage threshold for failure rate alerts
                    </span>
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-4">Notification Settings</h4>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      id="email-notifications"
                      type="checkbox"
                      checked={alertSettings.enableEmailNotifications}
                      onChange={(e) => setAlertSettings(prev => ({ ...prev, enableEmailNotifications: e.target.checked }))}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="email-notifications" className="ml-2 text-sm text-gray-700">
                      Enable Email Notifications
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="sms-notifications"
                      type="checkbox"
                      checked={alertSettings.enableSmsNotifications}
                      onChange={(e) => setAlertSettings(prev => ({ ...prev, enableSmsNotifications: e.target.checked }))}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label htmlFor="sms-notifications" className="ml-2 text-sm text-gray-700">
                      Enable SMS Notifications
                    </label>
                  </div>
                  <div>
                    <label htmlFor="notification-frequency" className="block text-sm font-medium text-gray-600 mb-2">
                      Notification Frequency
                    </label>
                    <select
                      id="notification-frequency"
                      value={alertSettings.notificationFrequency}
                      onChange={(e) => setAlertSettings(prev => ({ ...prev, notificationFrequency: e.target.value as any }))}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="immediate">Immediate</option>
                      <option value="daily">Daily Summary</option>
                      <option value="weekly">Weekly Summary</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // In a real implementation, this would save the settings
                  console.log('Saving alert settings:', alertSettings);
                  setShowSettings(false);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                Save Settings
              </button>
            </div>
          </div>
        </section>
      )}

      {/* No Alerts State */}
      {filteredAlerts.length === 0 && (
        <div className="text-center py-12">
          <span className="text-6xl text-gray-400 mb-4" role="img" aria-label="No alerts">📭</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Alerts Found</h3>
          <p className="text-gray-600 mb-6">
            {alerts.length === 0
              ? 'No alerts have been generated yet.'
              : 'No alerts match your current filter criteria.'
            }
          </p>
          {alerts.length === 0 ? (
            <p className="text-sm text-gray-500">
              Alerts will appear here when thresholds are exceeded or issues are detected.
            </p>
          ) : (
            <button
              onClick={() => {
                setFilterCategory('all');
                setFilterSeverity('all');
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}


'use client';

import React, { useState, useEffect } from 'react';
// import { FaExclamationTriangle, FaCheckCircle, FaClock, FaTimes, FaSync } from 'react-icons/fa';

interface DateRange {
  start: string;
  end: string;
}

interface DeliveryStatusGridProps {
  dateRange: DateRange;
  onDateRangeChange: (dateRange: DateRange) => void;
}

interface MessageStatus {
  id: string;
  recipient: string;
  recipientName?: string;
  status: 'sent' | 'delivered' | 'read' | 'failed' | 'pending';
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
  failedAt?: string;
  errorMessage?: string;
  templateId?: string;
  campaignId?: string;
  retryCount?: number;
  lastUpdated: string;
}

interface StatusSummary {
  total: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  pending: number;
}

export default function DeliveryStatusGrid({
  dateRange,
  onDateRangeChange
}: DeliveryStatusGridProps) {
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [messages, setMessages] = useState<MessageStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedMessage, setSelectedMessage] = useState<MessageStatus | null>(null);
  const [showFailedOnly, setShowFailedOnly] = useState(false);

  // Enhanced mock data for demonstration
  const mockMessages: MessageStatus[] = [
    {
      id: '1',
      recipient: '+1234567890',
      recipientName: 'John Doe',
      status: 'delivered',
      sentAt: '2024-01-15T10:30:00Z',
      deliveredAt: '2024-01-15T10:30:05Z',
      templateId: 'welcome_template',
      campaignId: 'campaign_001',
      lastUpdated: '2024-01-15T10:30:05Z'
    },
    {
      id: '2',
      recipient: '+1234567891',
      recipientName: 'Jane Smith',
      status: 'sent',
      sentAt: '2024-01-15T10:31:00Z',
      templateId: 'event_reminder',
      campaignId: 'campaign_002',
      lastUpdated: '2024-01-15T10:31:00Z'
    },
    {
      id: '3',
      recipient: '+1234567892',
      recipientName: 'Bob Johnson',
      status: 'read',
      sentAt: '2024-01-15T10:32:00Z',
      deliveredAt: '2024-01-15T10:32:02Z',
      readAt: '2024-01-15T10:35:00Z',
      templateId: 'payment_confirmation',
      campaignId: 'campaign_003',
      lastUpdated: '2024-01-15T10:35:00Z'
    },
    {
      id: '4',
      recipient: '+1234567893',
      recipientName: 'Alice Brown',
      status: 'failed',
      sentAt: '2024-01-15T10:33:00Z',
      failedAt: '2024-01-15T10:33:05Z',
      errorMessage: 'Invalid phone number format',
      templateId: 'ticket_confirmation',
      campaignId: 'campaign_004',
      retryCount: 2,
      lastUpdated: '2024-01-15T10:33:05Z'
    },
    {
      id: '5',
      recipient: '+1234567894',
      recipientName: 'Charlie Wilson',
      status: 'pending',
      sentAt: '2024-01-15T10:34:00Z',
      templateId: 'survey_request',
      campaignId: 'campaign_005',
      lastUpdated: '2024-01-15T10:34:00Z'
    },
    {
      id: '6',
      recipient: '+1234567895',
      recipientName: 'Diana Prince',
      status: 'delivered',
      sentAt: '2024-01-15T10:35:00Z',
      deliveredAt: '2024-01-15T10:35:03Z',
      templateId: 'event_reminder',
      campaignId: 'campaign_002',
      lastUpdated: '2024-01-15T10:35:03Z'
    }
  ];

  // Load messages data
  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessages(mockMessages);
      setLoading(false);
    };

    loadMessages();
  }, [dateRange]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setLastUpdated(new Date());
      // In a real implementation, this would fetch updated statuses
      console.log('Auto-refreshing delivery status...');
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return '✅';
      case 'sent':
        return '📤';
      case 'read':
        return '👁️';
      case 'failed':
        return '❌';
      case 'pending':
        return '⏳';
      default:
        return '⚠️';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'read':
        return 'bg-purple-100 text-purple-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate status summary
  const statusSummary: StatusSummary = messages.reduce(
    (acc, message) => {
      acc.total++;
      acc[message.status]++;
      return acc;
    },
    { total: 0, sent: 0, delivered: 0, read: 0, failed: 0, pending: 0 }
  );

  // Filter messages based on status and failed only option
  const filteredMessages = messages.filter(message => {
    if (showFailedOnly && message.status !== 'failed') return false;
    if (statusFilter !== 'all' && message.status !== statusFilter) return false;
    return true;
  });

  const handleRetryMessage = (messageId: string) => {
    // In a real implementation, this would call a retry API
    console.log(`Retrying message ${messageId}`);
    alert(`Retry functionality will be implemented for message ${messageId}`);
  };

  const handleViewDetails = (message: MessageStatus) => {
    setSelectedMessage(message);
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Real-time Delivery Status</h2>
            <p className="text-gray-600">
              Monitor message delivery status in real-time from {dateRange.start} to {dateRange.end}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoRefresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                aria-describedby="auto-refresh-help"
              />
              <label htmlFor="autoRefresh" className="text-sm text-gray-700">
                Auto-refresh
              </label>
              <span id="auto-refresh-help" className="sr-only">
                Automatically refresh delivery status every 30 seconds
              </span>
            </div>
            <button
              onClick={() => {
                setLastUpdated(new Date());
                // In a real implementation, this would trigger a refresh
                console.log('Manual refresh triggered');
              }}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              aria-label="Manually refresh delivery status"
            >
              <span role="img" aria-label="Refresh">🔄</span>
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-gray-50 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Statuses</option>
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="read">Read</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div className="flex items-end">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="show-failed-only"
                checked={showFailedOnly}
                onChange={(e) => setShowFailedOnly(e.target.checked)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="show-failed-only" className="ml-2 text-sm text-gray-700">
                Show failed messages only
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Status Summary */}
      <section aria-labelledby="status-summary-heading" className="mb-6">
        <h3 id="status-summary-heading" className="sr-only">Delivery Status Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3" role="img" aria-label="Total messages">📊</span>
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900" aria-label={`${statusSummary.total} total messages`}>
                  {statusSummary.total}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3" role="img" aria-label="Delivered messages">✅</span>
              <div>
                <p className="text-sm font-medium text-green-600">Delivered</p>
                <p className="text-2xl font-bold text-green-900" aria-label={`${statusSummary.delivered} delivered messages`}>
                  {statusSummary.delivered}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3" role="img" aria-label="Sent messages">📤</span>
              <div>
                <p className="text-sm font-medium text-blue-600">Sent</p>
                <p className="text-2xl font-bold text-blue-900" aria-label={`${statusSummary.sent} sent messages`}>
                  {statusSummary.sent}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3" role="img" aria-label="Read messages">👁️</span>
              <div>
                <p className="text-sm font-medium text-purple-600">Read</p>
                <p className="text-2xl font-bold text-purple-900" aria-label={`${statusSummary.read} read messages`}>
                  {statusSummary.read}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-2xl mr-3" role="img" aria-label="Failed messages">❌</span>
              <div>
                <p className="text-sm font-medium text-red-600">Failed</p>
                <p className="text-2xl font-bold text-red-900" aria-label={`${statusSummary.failed} failed messages`}>
                  {statusSummary.failed}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Delivery Status Grid */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Message Status Grid</h3>
            <div className="text-sm text-gray-500" role="status" aria-live="polite">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200" role="table" aria-label="Message delivery status">
            <thead className="bg-gray-50">
              <tr role="row">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col" role="columnheader">
                  Message ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col" role="columnheader">
                  Recipient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col" role="columnheader">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col" role="columnheader">
                  Sent At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col" role="columnheader">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col" role="columnheader">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr role="row">
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <span className="text-4xl animate-spin" role="img" aria-label="Loading">⏳</span>
                    <p className="text-gray-600 mt-2">Loading delivery status...</p>
                  </td>
                </tr>
              ) : filteredMessages.length === 0 ? (
                <tr role="row">
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <span className="text-4xl text-gray-400" role="img" aria-label="No messages">📭</span>
                    <p className="text-gray-600 mt-2">No messages found matching your criteria</p>
                  </td>
                </tr>
              ) : (
                filteredMessages.map((message) => (
                  <tr key={message.id} className="hover:bg-gray-50" role="row">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900" role="cell">
                      {message.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" role="cell">
                      <div>
                        <div className="font-medium text-gray-900">{message.recipientName || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{message.recipient}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" role="cell">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(message.status)}`}>
                        <span className="mr-1" role="img" aria-label={`Status: ${message.status}`}>
                          {getStatusIcon(message.status)}
                        </span>
                        <span className="capitalize">{message.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" role="cell">
                      <div>
                        <div>{formatDateTime(message.sentAt)}</div>
                        <div className="text-xs text-gray-400">{getTimeDifference(message.sentAt)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" role="cell">
                      <div>
                        <div>{formatDateTime(message.lastUpdated)}</div>
                        <div className="text-xs text-gray-400">{getTimeDifference(message.lastUpdated)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" role="cell">
                      <div className="flex items-center space-x-2">
                        {message.status === 'failed' && (
                          <button
                            onClick={() => handleRetryMessage(message.id)}
                            className="text-blue-600 hover:text-blue-900 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 p-1 rounded"
                            aria-label={`Retry failed message ${message.id}`}
                          >
                            🔄 Retry
                          </button>
                        )}
                        <button
                          onClick={() => handleViewDetails(message)}
                          className="text-gray-600 hover:text-gray-900 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 p-1 rounded"
                          aria-label={`View details for message ${message.id}`}
                        >
                          👁️ Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Real-time Status Placeholder */}
      <div className="mt-8 bg-gray-50 rounded-lg p-8 text-center">
        <span className="text-6xl text-gray-400 mb-4" role="img" aria-label="Real-time tracking">📡</span>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Real-time Status Tracking</h3>
        <p className="text-gray-600">
          Live delivery status updates with WebSocket connections and real-time monitoring will be implemented here.
        </p>
      </div>

      {/* Message Details Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Message Details</h3>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-gray-400 hover:text-gray-600 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded p-1"
                aria-label="Close message details"
              >
                <span className="text-xl">✕</span>
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              {/* Message Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Message Information</h4>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Message ID:</span>
                    <span className="text-sm text-gray-900 font-medium">{selectedMessage.id}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Recipient:</span>
                    <span className="text-sm text-gray-900">{selectedMessage.recipientName || 'Unknown'} ({selectedMessage.recipient})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedMessage.status)}`}>
                      <span className="mr-1" role="img" aria-label={`Status: ${selectedMessage.status}`}>
                        {getStatusIcon(selectedMessage.status)}
                      </span>
                      <span className="capitalize">{selectedMessage.status}</span>
                    </span>
                  </div>
                  {selectedMessage.templateId && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Template:</span>
                      <span className="text-sm text-gray-900">{selectedMessage.templateId}</span>
                    </div>
                  )}
                  {selectedMessage.campaignId && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Campaign:</span>
                      <span className="text-sm text-gray-900">{selectedMessage.campaignId}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Timeline</h4>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Sent:</span>
                    <span className="text-sm text-gray-900">{formatDateTime(selectedMessage.sentAt)}</span>
                  </div>
                  {selectedMessage.deliveredAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Delivered:</span>
                      <span className="text-sm text-gray-900">{formatDateTime(selectedMessage.deliveredAt)}</span>
                    </div>
                  )}
                  {selectedMessage.readAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Read:</span>
                      <span className="text-sm text-gray-900">{formatDateTime(selectedMessage.readAt)}</span>
                    </div>
                  )}
                  {selectedMessage.failedAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Failed:</span>
                      <span className="text-sm text-gray-900">{formatDateTime(selectedMessage.failedAt)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Updated:</span>
                    <span className="text-sm text-gray-900">{formatDateTime(selectedMessage.lastUpdated)}</span>
                  </div>
                </div>
              </div>

              {/* Error Details */}
              {selectedMessage.errorMessage && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Error Details</h4>
                  <div className="bg-red-50 rounded-lg p-3">
                    <p className="text-sm text-red-800">{selectedMessage.errorMessage}</p>
                    {selectedMessage.retryCount && (
                      <p className="text-xs text-red-600 mt-1">Retry attempts: {selectedMessage.retryCount}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                {selectedMessage.status === 'failed' && (
                  <button
                    onClick={() => {
                      handleRetryMessage(selectedMessage.id);
                      setSelectedMessage(null);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    🔄 Retry Message
                  </button>
                )}
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


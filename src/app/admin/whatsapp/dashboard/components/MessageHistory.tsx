'use client';

import React, { useState, useEffect } from 'react';
// import { FaHistory, FaSearch, FaFilter, FaDownload } from 'react-icons/fa';

interface DateRange {
  start: string;
  end: string;
}

interface WhatsAppMessage {
  id: string;
  recipient: {
    name: string;
    phone: string;
    avatar?: string;
  };
  content: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
  errorMessage?: string;
  templateId?: string;
  campaignId?: string;
}

interface MessageHistoryProps {
  dateRange: DateRange;
  onDateRangeChange: (dateRange: DateRange) => void;
}

export default function MessageHistory({
  dateRange,
  onDateRangeChange
}: MessageHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<WhatsAppMessage | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const messagesPerPage = 10;

  // Sample data for demonstration
  useEffect(() => {
    const loadMessages = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const sampleMessages: WhatsAppMessage[] = [
        {
          id: '1',
          recipient: { name: 'John Doe', phone: '+1234567890' },
          content: 'Thank you for registering for our event! We look forward to seeing you.',
          status: 'delivered',
          sentAt: '2024-01-15T10:30:00Z',
          deliveredAt: '2024-01-15T10:30:05Z',
          readAt: '2024-01-15T11:45:00Z',
          templateId: 'welcome_template',
          campaignId: 'event_registration_2024'
        },
        {
          id: '2',
          recipient: { name: 'Jane Smith', phone: '+1234567891' },
          content: 'Your ticket for the annual conference has been confirmed.',
          status: 'read',
          sentAt: '2024-01-15T09:15:00Z',
          deliveredAt: '2024-01-15T09:15:02Z',
          readAt: '2024-01-15T09:45:00Z',
          templateId: 'ticket_confirmation',
          campaignId: 'conference_2024'
        },
        {
          id: '3',
          recipient: { name: 'Bob Johnson', phone: '+1234567892' },
          content: 'Event reminder: Our meeting starts in 1 hour.',
          status: 'sent',
          sentAt: '2024-01-15T14:00:00Z',
          templateId: 'event_reminder',
          campaignId: 'meeting_reminder_2024'
        },
        {
          id: '4',
          recipient: { name: 'Alice Brown', phone: '+1234567893' },
          content: 'Payment confirmation for your membership renewal.',
          status: 'failed',
          sentAt: '2024-01-15T08:00:00Z',
          errorMessage: 'Invalid phone number format',
          templateId: 'payment_confirmation',
          campaignId: 'membership_renewal_2024'
        },
        {
          id: '5',
          recipient: { name: 'Charlie Wilson', phone: '+1234567894' },
          content: 'Survey: How was your experience at our recent event?',
          status: 'delivered',
          sentAt: '2024-01-14T16:30:00Z',
          deliveredAt: '2024-01-14T16:30:03Z',
          templateId: 'event_survey',
          campaignId: 'feedback_collection_2024'
        }
      ];

      setMessages(sampleMessages);
      setTotalPages(Math.ceil(sampleMessages.length / messagesPerPage));
      setLoading(false);
    };

    loadMessages();
  }, [dateRange]);

  const filteredMessages = messages.filter(message => {
    const matchesSearch = searchTerm === '' ||
      message.recipient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.recipient.phone.includes(searchTerm) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.id.includes(searchTerm);

    const matchesStatus = statusFilter === 'all' || message.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const paginatedMessages = filteredMessages.slice(
    (currentPage - 1) * messagesPerPage,
    currentPage * messagesPerPage
  );

  const getStatusBadge = (status: WhatsAppMessage['status']) => {
    const statusConfig = {
      sent: { bg: 'bg-blue-100', text: 'text-blue-800', icon: '📤' },
      delivered: { bg: 'bg-green-100', text: 'text-green-800', icon: '✅' },
      read: { bg: 'bg-purple-100', text: 'text-purple-800', icon: '👁️' },
      failed: { bg: 'bg-red-100', text: 'text-red-800', icon: '❌' }
    };

    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <span className="mr-1">{config.icon}</span>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Message History</h2>
        <p className="text-gray-600">
          View all WhatsApp messages sent from {dateRange.start} to {dateRange.end}
        </p>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 bg-gray-50 rounded-lg p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
              <input
                type="text"
                placeholder="Search messages by content, recipient, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Statuses</option>
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="read">Read</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {/* Export Button */}
          <button
            onClick={() => {
              const csvData = `ID,Recipient,Phone,Content,Status,Sent At,Delivered At,Read At,Template ID,Campaign ID,Error
${filteredMessages.map(msg =>
                `"${msg.id}","${msg.recipient.name}","${msg.recipient.phone}","${msg.content}","${msg.status}","${msg.sentAt}","${msg.deliveredAt || ''}","${msg.readAt || ''}","${msg.templateId || ''}","${msg.campaignId || ''}","${msg.errorMessage || ''}"`
              ).join('\n')}`;
              const blob = new Blob([csvData], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `whatsapp-messages-${dateRange.start}-to-${dateRange.end}.csv`;
              a.click();
              window.URL.revokeObjectURL(url);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center"
          >
            <span className="mr-2">📥</span>
            Export CSV
          </button>
        </div>
      </div>

      {/* Message List Placeholder */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Recent Messages</h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>🔍</span>
              <span>Filtered results</span>
            </div>
          </div>
        </div>

        {/* Table Header */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
            <div className="col-span-3">Recipient</div>
            <div className="col-span-4">Message Content</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Sent At</div>
            <div className="col-span-1">Actions</div>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="px-6 py-8 text-center">
              <span className="text-4xl animate-spin">⏳</span>
              <p className="text-gray-600 mt-2">Loading messages...</p>
            </div>
          ) : paginatedMessages.length === 0 ? (
            <div className="px-6 py-8 text-center">
              <span className="text-4xl text-gray-400">📭</span>
              <p className="text-gray-600 mt-2">No messages found</p>
            </div>
          ) : (
            paginatedMessages.map((message) => (
              <div key={message.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="grid grid-cols-12 gap-4 text-sm">
                  <div className="col-span-3">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600">
                          {message.recipient.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="font-medium text-gray-900">{message.recipient.name}</div>
                        <div className="text-gray-500 text-xs">{message.recipient.phone}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-4">
                    <div className="text-gray-900 truncate">{message.content}</div>
                    {message.templateId && (
                      <div className="text-xs text-gray-500 mt-1">Template: {message.templateId}</div>
                    )}
                  </div>
                  <div className="col-span-2">
                    {getStatusBadge(message.status)}
                    {message.errorMessage && (
                      <div className="text-xs text-red-600 mt-1">{message.errorMessage}</div>
                    )}
                  </div>
                  <div className="col-span-2">
                    <div className="text-gray-900">{formatDate(message.sentAt)}</div>
                    {message.readAt && (
                      <div className="text-xs text-green-600">Read: {formatDate(message.readAt)}</div>
                    )}
                  </div>
                  <div className="col-span-1">
                    <button
                      onClick={() => setSelectedMessage(message)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && filteredMessages.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {(currentPage - 1) * messagesPerPage + 1} to {Math.min(currentPage * messagesPerPage, filteredMessages.length)} of {filteredMessages.length} results
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  const isActive = pageNum === currentPage;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 text-sm rounded-md ${isActive
                          ? 'bg-green-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Message Details</h3>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-xl">✕</span>
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              {/* Recipient Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Recipient</h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {selectedMessage.recipient.name.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-3">
                      <div className="font-medium text-gray-900">{selectedMessage.recipient.name}</div>
                      <div className="text-sm text-gray-500">{selectedMessage.recipient.phone}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message Content */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Message Content</h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-900">{selectedMessage.content}</p>
                </div>
              </div>

              {/* Status and Timeline */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Status & Timeline</h4>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    {getStatusBadge(selectedMessage.status)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Sent:</span>
                    <span className="text-sm text-gray-900">{formatDate(selectedMessage.sentAt)}</span>
                  </div>
                  {selectedMessage.deliveredAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Delivered:</span>
                      <span className="text-sm text-gray-900">{formatDate(selectedMessage.deliveredAt)}</span>
                    </div>
                  )}
                  {selectedMessage.readAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Read:</span>
                      <span className="text-sm text-gray-900">{formatDate(selectedMessage.readAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Metadata */}
              {(selectedMessage.templateId || selectedMessage.campaignId) && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Metadata</h4>
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
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
              )}

              {/* Error Message */}
              {selectedMessage.errorMessage && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Error Details</h4>
                  <div className="bg-red-50 rounded-lg p-3">
                    <p className="text-sm text-red-800">{selectedMessage.errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                {selectedMessage.status === 'failed' && (
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    🔄 Retry Send
                  </button>
                )}
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
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

'use client';

import { useState, useEffect } from 'react';
// import {
//   FaPlus,
//   FaEdit,
//   FaTrash,
//   FaCheckCircle,
//   FaClock,
//   FaExclamationTriangle,
//   FaFileAlt,
//   FaSearch,
//   FaFilter
// } from 'react-icons/fa';

interface MessageTemplate {
  id: string;
  name: string;
  category: string;
  language: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  createdAt: string;
  components: Array<{
    type: string;
    text: string;
  }>;
  usageCount?: number;
  lastUsed?: string;
}

export default function MessageTemplatesManager() {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  // Load sample templates data
  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const sampleTemplates: MessageTemplate[] = [
        {
          id: '1',
          name: 'welcome_template',
          category: 'UTILITY',
          language: 'en_US',
          status: 'APPROVED',
          createdAt: '2024-01-10T10:00:00Z',
          components: [
            { type: 'BODY', text: 'Welcome to our organization! We\'re excited to have you join us.' }
          ],
          usageCount: 45,
          lastUsed: '2024-01-15T14:30:00Z'
        },
        {
          id: '2',
          name: 'event_reminder',
          category: 'UTILITY',
          language: 'en_US',
          status: 'APPROVED',
          createdAt: '2024-01-12T09:00:00Z',
          components: [
            { type: 'BODY', text: 'Reminder: Your event {{1}} is scheduled for {{2}}. See you there!' }
          ],
          usageCount: 23,
          lastUsed: '2024-01-14T16:45:00Z'
        },
        {
          id: '3',
          name: 'payment_confirmation',
          category: 'UTILITY',
          language: 'en_US',
          status: 'PENDING',
          createdAt: '2024-01-14T11:00:00Z',
          components: [
            { type: 'BODY', text: 'Your payment of ${{1}} has been confirmed. Thank you!' }
          ]
        },
        {
          id: '4',
          name: 'survey_request',
          category: 'MARKETING',
          language: 'en_US',
          status: 'REJECTED',
          createdAt: '2024-01-08T15:00:00Z',
          components: [
            { type: 'BODY', text: 'We\'d love your feedback! Please take our survey: {{1}}' }
          ]
        },
        {
          id: '5',
          name: 'ticket_confirmation',
          category: 'UTILITY',
          language: 'en_US',
          status: 'APPROVED',
          createdAt: '2024-01-09T13:00:00Z',
          components: [
            { type: 'BODY', text: 'Your ticket for {{1}} has been confirmed. Ticket ID: {{2}}' }
          ],
          usageCount: 67,
          lastUsed: '2024-01-15T10:20:00Z'
        }
      ];

      setTemplates(sampleTemplates);
      setLoading(false);
    };

    loadTemplates();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return '✅';
      case 'PENDING':
        return '⏳';
      case 'REJECTED':
        return '❌';
      default:
        return '⏳';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = searchTerm === '' ||
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.components?.find(c => c.type === 'BODY')?.text?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || template.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getUsageStats = () => {
    const approved = templates.filter(t => t.status === 'APPROVED');
    const totalUsage = approved.reduce((sum, t) => sum + (t.usageCount || 0), 0);
    const mostUsed = approved.sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))[0];

    return { totalUsage, mostUsed };
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Message Templates</h3>
            <p className="mt-1 text-sm text-gray-600">
              Manage your WhatsApp message templates
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
          >
            <span>➕</span>
            Create Template
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <label htmlFor="template-search" className="sr-only">
            Search message templates
          </label>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400" role="img" aria-label="Search">🔍</span>
          </div>
          <input
            id="template-search"
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            aria-describedby="search-help"
          />
          <span id="search-help" className="sr-only">
            Search by template name, category, or content
          </span>
        </div>
        <div className="relative">
          <label htmlFor="status-filter" className="sr-only">
            Filter templates by status
          </label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-md py-2 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            aria-describedby="filter-help"
          >
            <option value="all">All Status</option>
            <option value="APPROVED">Approved</option>
            <option value="PENDING">Pending</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-400" role="img" aria-label="Filter">🔍</span>
          </div>
          <span id="filter-help" className="sr-only">
            Filter templates by their approval status
          </span>
        </div>
      </div>

      {/* Templates List */}
      <div className="bg-white border border-gray-200 rounded-lg">
        {loading ? (
          <div className="text-center py-12">
            <span className="text-4xl animate-spin">⏳</span>
            <p className="text-gray-600 mt-2">Loading templates...</p>
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl text-gray-400 mb-4">📄</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {templates.length === 0 ? 'No templates found' : 'No templates match your search'}
            </h3>
            <p className="text-gray-600 mb-6">
              {templates.length === 0
                ? 'Create your first WhatsApp message template to get started.'
                : 'Try adjusting your search or filter criteria.'
              }
            </p>
            {templates.length === 0 && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md font-medium"
              >
                Create Your First Template
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200" role="table" aria-label="Message templates">
              <thead className="bg-gray-50">
                <tr role="row">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col" role="columnheader">
                    Template
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col" role="columnheader">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col" role="columnheader">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col" role="columnheader">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col" role="columnheader">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider" scope="col" role="columnheader">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTemplates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50" role="row">
                    <td className="px-6 py-4 whitespace-nowrap" role="cell">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-green-600" role="img" aria-label="Template">📄</span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {template.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {template.components?.find(c => c.type === 'BODY')?.text || 'No body text'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" role="cell">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {template.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap" role="cell">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(template.status)}`}>
                        <span className="mr-1" role="img" aria-label={`Status: ${template.status}`}>{getStatusIcon(template.status)}</span>
                        {template.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" role="cell">
                      {template.usageCount ? (
                        <div>
                          <div className="font-medium" aria-label={`${template.usageCount} uses`}>{template.usageCount} uses</div>
                          {template.lastUsed && (
                            <div className="text-xs text-gray-500">
                              Last: {formatDate(template.lastUsed)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">No usage</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" role="cell">
                      {formatDate(template.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" role="cell">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedTemplate(template)}
                          className="text-blue-600 hover:text-blue-900 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 p-1 rounded"
                          aria-label={`View details for template ${template.name}`}
                        >
                          <span role="img" aria-hidden="true">👁️</span>
                        </button>
                        <button
                          className="text-blue-600 hover:text-blue-900 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 p-1 rounded"
                          aria-label={`Edit template ${template.name}`}
                        >
                          <span role="img" aria-hidden="true">✏️</span>
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 p-1 rounded"
                          aria-label={`Delete template ${template.name}`}
                        >
                          <span role="img" aria-hidden="true">🗑️</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Template Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-2xl text-green-500">✅</span>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Approved</p>
              <p className="text-2xl font-semibold text-gray-900">
                {templates.filter(t => t.status === 'APPROVED').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-2xl text-yellow-500">⏳</span>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">
                {templates.filter(t => t.status === 'PENDING').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-2xl text-red-500">❌</span>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Rejected</p>
              <p className="text-2xl font-semibold text-gray-900">
                {templates.filter(t => t.status === 'REJECTED').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-2xl text-blue-500">📊</span>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Usage</p>
              <p className="text-2xl font-semibold text-gray-900">{getUsageStats().totalUsage}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Template Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Template</h3>
              <p className="text-sm text-gray-600 mb-4">
                Template creation form will be implemented in a future task.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Detail Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Template Details</h3>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="text-xl">✕</span>
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              {/* Template Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Template Information</h4>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Name:</span>
                    <span className="text-sm text-gray-900 font-medium">{selectedTemplate.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Category:</span>
                    <span className="text-sm text-gray-900">{selectedTemplate.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Language:</span>
                    <span className="text-sm text-gray-900">{selectedTemplate.language}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedTemplate.status)}`}>
                      <span className="mr-1">{getStatusIcon(selectedTemplate.status)}</span>
                      {selectedTemplate.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Created:</span>
                    <span className="text-sm text-gray-900">{formatDate(selectedTemplate.createdAt)}</span>
                  </div>
                </div>
              </div>

              {/* Template Content */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Template Content</h4>
                <div className="bg-gray-50 rounded-lg p-3">
                  {selectedTemplate.components.map((component, index) => (
                    <div key={index} className="mb-2">
                      <div className="text-xs font-medium text-gray-500 uppercase">{component.type}</div>
                      <div className="text-sm text-gray-900 mt-1 p-2 bg-white rounded border">
                        {component.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Usage Statistics */}
              {selectedTemplate.usageCount && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Usage Statistics</h4>
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Uses:</span>
                      <span className="text-sm text-gray-900 font-medium">{selectedTemplate.usageCount}</span>
                    </div>
                    {selectedTemplate.lastUsed && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Last Used:</span>
                        <span className="text-sm text-gray-900">{formatDate(selectedTemplate.lastUsed)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  ✏️ Edit Template
                </button>
                <button
                  onClick={() => setSelectedTemplate(null)}
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


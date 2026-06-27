'use client';

import { useState } from 'react';
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaDownload,
  FaChartBar,
  FaClock,
  FaUsers,
  FaPaperPlane,
  FaRedo
} from 'react-icons/fa';

interface DeliveryReportProps {
  report: any;
  onStartNew: () => void;
}

export default function DeliveryReport({ report, onStartNew }: DeliveryReportProps) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'details' | 'failed'>('overview');

  const deliveryRate = parseFloat(report.deliveryRate);
  const successRate = ((report.delivered / report.total) * 100).toFixed(1);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <FaCheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <FaExclamationTriangle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <FaClock className="h-4 w-4 text-yellow-500" />;
      default:
        return <FaClock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExportReport = () => {
    // In real implementation, this would generate and download a CSV/PDF report
    const csvContent = [
      ['Phone', 'Name', 'Email', 'Status', 'Sent At', 'Delivered At', 'Error'],
      ...Array.from({ length: report.total }, (_, i) => [
        `+123456789${i}`,
        `Recipient ${i + 1}`,
        `user${i + 1}@example.com`,
        i < report.delivered ? 'delivered' : i < report.sent ? 'failed' : 'pending',
        new Date().toISOString(),
        i < report.delivered ? new Date().toISOString() : '',
        i >= report.delivered && i < report.sent ? 'Invalid phone number' : ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `whatsapp-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Delivery Report</h3>
        <p className="text-sm text-gray-600">
          Campaign completed on {new Date(report.completedAt).toLocaleString()}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaPaperPlane className="h-8 w-8 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Sent</p>
              <p className="text-2xl font-bold text-gray-900">{report.sent}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaCheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Delivered</p>
              <p className="text-2xl font-bold text-gray-900">{report.delivered}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-8 w-8 text-red-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Failed</p>
              <p className="text-2xl font-bold text-gray-900">{report.failed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FaChartBar className="h-8 w-8 text-purple-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Success Rate</p>
              <p className="text-2xl font-bold text-gray-900">{successRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Performance Summary</h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Delivery Rate</span>
              <span className="text-sm font-medium text-gray-900">{report.deliveryRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${report.deliveryRate}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Success Rate</span>
              <span className="text-sm font-medium text-gray-900">{successRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${successRate}%` }}
              ></div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Completion Time</span>
              <span className="text-sm font-medium text-gray-900">
                {report.status === 'cancelled' ? 'Cancelled' : 'Completed'}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {new Date(report.completedAt).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Report Tabs */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview', icon: FaChartBar },
              { id: 'details', name: 'All Messages', icon: FaUsers },
              { id: 'failed', name: 'Failed Messages', icon: FaExclamationTriangle }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`${selectedTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {selectedTab === 'overview' && (
            <div className="space-y-4">
              <h5 className="text-sm font-medium text-gray-900">Campaign Overview</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h6 className="text-sm font-medium text-gray-700 mb-2">Statistics</h6>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Total Recipients:</dt>
                      <dd className="text-sm font-medium text-gray-900">{report.total}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Messages Sent:</dt>
                      <dd className="text-sm font-medium text-gray-900">{report.sent}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Successfully Delivered:</dt>
                      <dd className="text-sm font-medium text-gray-900">{report.delivered}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Failed Deliveries:</dt>
                      <dd className="text-sm font-medium text-gray-900">{report.failed}</dd>
                    </div>
                  </dl>
                </div>
                <div>
                  <h6 className="text-sm font-medium text-gray-700 mb-2">Performance</h6>
                  <dl className="space-y-2">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Delivery Rate:</dt>
                      <dd className="text-sm font-medium text-gray-900">{report.deliveryRate}%</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Success Rate:</dt>
                      <dd className="text-sm font-medium text-gray-900">{successRate}%</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Campaign Status:</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {report.status === 'cancelled' ? 'Cancelled' : 'Completed'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Completed At:</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {new Date(report.completedAt).toLocaleString()}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'details' && (
            <div className="space-y-4">
              <h5 className="text-sm font-medium text-gray-900">All Messages</h5>
              <div className="bg-gray-50 border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recipient
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sent At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {Array.from({ length: Math.min(20, report.total) }, (_, i) => (
                      <tr key={i}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          Recipient {i + 1}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          +123456789{i}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            i < report.delivered ? 'delivered' : i < report.sent ? 'failed' : 'pending'
                          )}`}>
                            {getStatusIcon(i < report.delivered ? 'delivered' : i < report.sent ? 'failed' : 'pending')}
                            <span className="ml-1">
                              {i < report.delivered ? 'Delivered' : i < report.sent ? 'Failed' : 'Pending'}
                            </span>
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {new Date().toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {report.total > 20 && (
                <p className="text-sm text-gray-500 text-center">
                  Showing first 20 of {report.total} messages
                </p>
              )}
            </div>
          )}

          {selectedTab === 'failed' && (
            <div className="space-y-4">
              <h5 className="text-sm font-medium text-gray-900">Failed Messages</h5>
              {report.failed > 0 ? (
                <div className="space-y-3">
                  {Array.from({ length: Math.min(10, report.failed) }, (_, i) => (
                    <div key={i} className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <FaExclamationTriangle className="text-red-500 mr-3 mt-0.5" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h6 className="text-sm font-medium text-red-800">
                              +123456789{i + report.delivered}
                            </h6>
                            <span className="text-xs text-red-600">
                              {new Date().toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-red-700 mt-1">
                            Invalid phone number format
                          </p>
                          <button className="text-xs text-red-600 hover:text-red-800 mt-2 flex items-center gap-1">
                            <FaRedo className="h-3 w-3" />
                            Retry
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaCheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Failed Messages</h3>
                  <p className="text-gray-600">All messages were delivered successfully!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <button
          onClick={handleExportReport}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
        >
          <FaDownload className="h-4 w-4" />
          Export Report
        </button>
        <button
          onClick={onStartNew}
          className="px-6 py-2 text-sm font-medium text-white bg-green-500 border border-transparent rounded-md hover:bg-green-600"
        >
          Start New Campaign
        </button>
      </div>
    </div>
  );
}

















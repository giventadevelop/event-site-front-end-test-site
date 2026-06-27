import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import AdminNavigation from '@/components/AdminNavigation';
import {
  FaDownload,
  FaChartBar,
  FaFileExcel,
  FaFileCsv,
  FaCalendarAlt,
  FaUsers,
  FaFilter
} from 'react-icons/fa';

function LoadingSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-8 py-8">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function AdminEventsReportsPage() {
  const { userId } = await safeAuth();

  if (!userId) {
    notFound();
  }

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <AdminEventsReportsContent />
    </Suspense>
  );
}

function AdminEventsReportsContent() {
  const reportTypes = [
    {
      title: 'Registration Summary',
      description: 'Complete overview of all event registrations with attendee details.',
      icon: FaUsers,
      color: 'blue',
      formats: ['CSV', 'Excel'],
      lastGenerated: '2 hours ago'
    },
    {
      title: 'Event Analytics',
      description: 'Detailed analytics including trends, capacity utilization, and demographics.',
      icon: FaChartBar,
      color: 'green',
      formats: ['Excel', 'PDF'],
      lastGenerated: '1 day ago'
    },
    {
      title: 'Guest Demographics',
      description: 'Age group distribution, relationship analysis, and special requirements.',
      icon: FaUsers,
      color: 'purple',
      formats: ['CSV', 'Excel'],
      lastGenerated: '3 hours ago'
    },
    {
      title: 'Event Performance',
      description: 'Event success metrics, attendance rates, and capacity analysis.',
      icon: FaCalendarAlt,
      color: 'orange',
      formats: ['Excel', 'PDF'],
      lastGenerated: '1 week ago'
    },
    {
      title: 'Special Requirements',
      description: 'Summary of all special requirements and accessibility needs.',
      icon: FaFilter,
      color: 'red',
      formats: ['CSV'],
      lastGenerated: '5 hours ago'
    },
    {
      title: 'Email Campaign Results',
      description: 'Email delivery statistics and engagement metrics.',
      icon: FaDownload,
      color: 'teal',
      formats: ['Excel', 'CSV'],
      lastGenerated: '2 days ago'
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-50 border-blue-200 text-blue-700',
      green: 'bg-green-50 border-green-200 text-green-700',
      purple: 'bg-purple-50 border-purple-200 text-purple-700',
      orange: 'bg-orange-50 border-orange-200 text-orange-700',
      red: 'bg-red-50 border-red-200 text-red-700',
      teal: 'bg-teal-50 border-teal-200 text-teal-700'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const getIconColorClasses = (color: string) => {
    const colorMap = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
      orange: 'text-orange-600',
      red: 'text-red-600',
      teal: 'text-teal-600'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="max-w-6xl mx-auto px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Reports & Exports</h1>
        <p className="text-gray-600">
          Generate detailed reports and export data for analysis and record-keeping.
        </p>
      </div>

      {/* Admin Navigation */}
      <AdminNavigation currentPage="event-reports" />

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button 
            className="flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
            title="Export All Registrations"
            aria-label="Export All Registrations"
            type="button"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0L8 8m4 4v8" />
              </svg>
            </div>
            <span className="font-semibold text-blue-700">Export All Registrations</span>
          </button>
          <button 
            className="flex-shrink-0 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
            title="Generate Analytics Report"
            aria-label="Generate Analytics Report"
            type="button"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="font-semibold text-green-700">Generate Analytics Report</span>
          </button>
          <button 
            className="flex-shrink-0 h-14 rounded-xl bg-purple-100 hover:bg-purple-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
            title="Export to Excel"
            aria-label="Export to Excel"
            type="button"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-semibold text-purple-700">Export to Excel</span>
          </button>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report, index) => {
          const IconComponent = report.icon;
          return (
            <div
              key={index}
              className={`p-6 rounded-lg border-2 transition-all duration-200 hover:shadow-lg ${getColorClasses(report.color)}`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <IconComponent className={`h-8 w-8 ${getIconColorClasses(report.color)}`} />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold mb-2">{report.title}</h3>
                  <p className="text-sm mb-4 opacity-80">{report.description}</p>

                  {/* Formats */}
                  <div className="mb-4">
                    <p className="text-xs font-medium mb-2">Available Formats:</p>
                    <div className="flex flex-wrap gap-1">
                      {report.formats.map((format, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs bg-white bg-opacity-50 rounded-full"
                        >
                          {format}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Last Generated */}
                  <p className="text-xs opacity-70 mb-4">
                    Last generated: {report.lastGenerated}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button className="px-3 py-1 text-xs bg-white bg-opacity-50 rounded hover:bg-opacity-70 transition-colors">
                      Generate
                    </button>
                    <button className="px-3 py-1 text-xs bg-white bg-opacity-50 rounded hover:bg-opacity-70 transition-colors">
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Report Builder */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Custom Report Builder</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Report Type
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="">Select report type...</option>
              <option value="registrations">Registration Data</option>
              <option value="events">Event Performance</option>
              <option value="guests">Guest Demographics</option>
              <option value="analytics">Analytics Summary</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="last7days">Last 7 days</option>
              <option value="last30days">Last 30 days</option>
              <option value="last90days">Last 90 days</option>
              <option value="lastyear">Last year</option>
              <option value="custom">Custom range</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Format
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="csv">CSV</option>
              <option value="excel">Excel</option>
              <option value="pdf">PDF</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Filter
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="all">All Events</option>
              <option value="free">Free Events Only</option>
              <option value="paid">Paid Events Only</option>
              <option value="specific">Specific Event</option>
            </select>
          </div>
        </div>
        <div className="mt-6">
          <button 
            className="w-full flex-shrink-0 h-14 rounded-xl bg-teal-100 hover:bg-teal-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
            title="Generate Custom Report"
            aria-label="Generate Custom Report"
            type="button"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-teal-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0L8 8m4 4v8" />
              </svg>
            </div>
            <span className="font-semibold text-teal-700">Generate Custom Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import type { EventDashboardData } from './ApiServerActions';
// Icons removed - using inline SVGs instead
import Link from 'next/link';

interface EventDashboardClientProps {
  data: EventDashboardData;
}

export default function EventDashboardClient({ data }: EventDashboardClientProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [currentPage, setCurrentPage] = useState(0); // 0-based pagination
  const pageSize = 20; // Show 20 registrations per page

  const {
    eventDetails,
    totalAttendees,
    totalGuests,
    capacityUtilization,
    registrationTrends,
    ageGroupStats,
    relationshipStats,
    specialRequirements,
    recentRegistrations,
    topEvents
  } = data;

  // Calculate pagination values
  const totalCount = recentRegistrations.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const displayPage = currentPage + 1; // Display as 1-based
  const startItem = totalCount > 0 ? currentPage * pageSize + 1 : 0;
  const endItem = totalCount > 0 ? Math.min((currentPage + 1) * pageSize, totalCount) : 0;
  const isPrevDisabled = currentPage === 0;
  const isNextDisabled = currentPage >= totalPages - 1;

  // Get paginated registrations
  const paginatedRegistrations = recentRegistrations.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
  );

  const handlePrevPage = () => {
    if (!isPrevDisabled) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (!isNextDisabled) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {eventDetails ? `${eventDetails.title} - Dashboard` : 'Event Management Dashboard'}
        </h1>
        <p className="text-gray-600">
          {eventDetails
            ? `Manage registrations and analytics for this event`
            : 'Overview of all events and registrations'
          }
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Attendees</p>
              <p className="text-2xl font-bold text-gray-900">{totalAttendees.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Guests</p>
              <p className="text-2xl font-bold text-gray-900">{totalGuests.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-yellow-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Capacity Utilization</p>
              <p className="text-2xl font-bold text-gray-900">{capacityUtilization}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Events</p>
              <p className="text-2xl font-bold text-gray-900">{topEvents.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Registration Trends */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Registration Trends</h3>
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between space-x-1">
            {registrationTrends.slice(-7).map((trend, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className="bg-blue-500 rounded-t w-full"
                  style={{ height: `${Math.max((trend.count / Math.max(...registrationTrends.map(t => t.count))) * 200, 4)}px` }}
                ></div>
                <span className="text-xs text-gray-500 mt-2">
                  {new Date(trend.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span className="text-xs font-medium text-gray-700">{trend.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Age Group Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Guest Age Groups</h3>
          <div className="space-y-3">
            {ageGroupStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">{stat.ageGroup}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${stat.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {stat.count} ({stat.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Relationship Statistics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Guest Relationships</h3>
          <div className="space-y-3">
            {relationshipStats.slice(0, 5).map((stat, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700">{stat.relationship}</span>
                </div>
                <span className="text-sm text-gray-600">
                  {stat.count} ({stat.percentage}%)
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Special Requirements */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Special Requirements</h3>
          <div className="space-y-3">
            {specialRequirements.slice(0, 5).map((req, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700 truncate">{req.requirement}</span>
                </div>
                <span className="text-sm text-gray-600">{req.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Events */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Events by Attendance</h3>
          <div className="space-y-3">
            {topEvents.slice(0, 5).map((event, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700 truncate">{event.title}</span>
                </div>
                <span className="text-sm text-gray-600">{event.attendeeCount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Registrations */}
      <div className="bg-white rounded-lg shadow p-6">
        <style dangerouslySetInnerHTML={{
          __html: `
            .table-scroll-container {
              overflow-x: scroll !important;
              overflow-y: visible !important;
              scrollbar-width: thin !important;
              scrollbar-color: #EC4899 #FCE7F3 !important;
              -ms-overflow-style: -ms-autohiding-scrollbar !important;
            }
            .table-scroll-container::-webkit-scrollbar {
              height: 20px !important;
              display: block !important;
              -webkit-appearance: none !important;
              appearance: none !important;
            }
            .table-scroll-container::-webkit-scrollbar-track {
              background: linear-gradient(90deg, #DBEAFE, #E9D5FF, #FCE7F3, #FED7AA) !important;
              border-radius: 10px !important;
              -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.15) !important;
              box-shadow: inset 0 0 6px rgba(0,0,0,0.15) !important;
            }
            .table-scroll-container::-webkit-scrollbar-thumb {
              background: linear-gradient(90deg, #3B82F6, #8B5CF6, #EC4899, #F97316) !important;
              border-radius: 10px !important;
              border: 4px solid #F3F4F6 !important;
              -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.4) !important;
              box-shadow: inset 0 0 6px rgba(0,0,0,0.4) !important;
              min-width: 50px !important;
              background-clip: padding-box !important;
            }
            .table-scroll-container::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(90deg, #2563EB, #7C3AED, #DB2777, #EA580C) !important;
              border-color: #E5E7EB !important;
            }
            .table-scroll-container::-webkit-scrollbar-thumb:active {
              background: linear-gradient(90deg, #1D4ED8, #6D28D9, #BE185D, #C2410C) !important;
              border-color: #D1D5DB !important;
            }
            .table-scroll-container::-webkit-scrollbar-button {
              display: none !important;
            }
            .table-scroll-container::-webkit-scrollbar-corner {
              background: #E0E7FF !important;
            }
            .table-scroll-container::after {
              content: '';
              display: block;
              width: 100vw;
              height: 1px;
              flex-shrink: 0;
            }
            .table-scroll-container {
              display: flex !important;
            }
          `
        }} />
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Registrations</h3>
          <button
            type="button"
            className="flex-shrink-0 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center gap-3 px-4 transition-all duration-300 hover:scale-105"
            title="Export CSV"
            aria-label="Export CSV"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <span className="font-semibold text-green-700">Export CSV</span>
          </button>
        </div>
        <div className="rounded-lg overflow-hidden" style={{
          background: 'linear-gradient(to right, #3B82F6, #8B5CF6, #EC4899, #F97316)',
          padding: '4px'
        }}>
        <div
          className="w-full table-scroll-container"
          style={{
            overflowX: 'scroll',
            overflowY: 'visible',
            WebkitOverflowScrolling: 'touch',
            maxWidth: '100%',
            display: 'flex',
            position: 'relative',
            width: '100%',
            minHeight: '1px',
            scrollbarGutter: 'stable',
            background: 'linear-gradient(to right, #3B82F6, #8B5CF6, #EC4899, #F97316)',
            borderRadius: '8px',
            padding: '20px'
          }}
        >
          <table className="divide-y divide-gray-200" style={{
            width: 'max-content',
            minWidth: 'fit-content',
            flexShrink: 0,
            background: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '8px',
            overflow: 'hidden'
          }}>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registration Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Guests
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedRegistrations.map((attendee, index) => (
                <tr key={attendee.id || index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {attendee.firstName} {attendee.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {attendee.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {eventDetails?.title || 'Event'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {attendee.registrationDate
                      ? new Date(attendee.registrationDate).toLocaleDateString()
                      : 'N/A'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${attendee.registrationStatus === 'REGISTERED'
                      ? 'bg-green-100 text-green-800'
                      : attendee.registrationStatus === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                      }`}>
                      {attendee.registrationStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {attendee.totalNumberOfGuests || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>

        {/* Pagination Controls - Always visible, matching admin page style */}
        {totalCount > 0 && (
          <div className="mt-8">
            <div className="flex justify-between items-center">
              {/* Previous Button */}
              <button
                onClick={handlePrevPage}
                disabled={isPrevDisabled}
                className="px-5 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg shadow-sm border-2 border-blue-400 hover:border-blue-500 disabled:bg-blue-100 disabled:border-blue-300 disabled:text-blue-500 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md"
                title="Previous Page"
                aria-label="Previous Page"
                type="button"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Previous</span>
              </button>

              {/* Page Info */}
              <div className="px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
                <span className="text-sm font-bold text-blue-700">
                  Page <span className="text-blue-600">{displayPage}</span> of <span className="text-blue-600">{totalPages}</span>
                </span>
              </div>

              {/* Next Button */}
              <button
                onClick={handleNextPage}
                disabled={isNextDisabled}
                className="px-5 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg shadow-sm border-2 border-blue-400 hover:border-blue-500 disabled:bg-blue-100 disabled:border-blue-300 disabled:text-blue-500 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-md"
                title="Next Page"
                aria-label="Next Page"
                type="button"
              >
                <span>Next</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Item Count Text */}
            <div className="text-center mt-3">
              {totalCount > 0 ? (
                <div className="inline-flex items-center px-4 py-2 bg-blue-50 border-2 border-blue-300 rounded-lg shadow-sm">
                  <span className="text-sm text-gray-700">
                    Showing <span className="font-bold text-blue-600">{startItem}</span> to <span className="font-bold text-blue-600">{endItem}</span> of <span className="font-bold text-blue-600">{totalCount}</span> registrations
                  </span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border-2 border-orange-300 rounded-lg shadow-sm">
                  <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-orange-700">No registrations found</span>
                  <span className="text-sm text-orange-600">[No registrations match your criteria]</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex justify-center space-x-4">
        <Link
          href="/admin/events/dashboard"
          className="flex-shrink-0 h-14 rounded-xl bg-teal-100 hover:bg-teal-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
          title="Event Analytics"
          aria-label="Event Analytics"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-teal-200 flex items-center justify-center">
            <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span className="font-semibold text-teal-700">Event Analytics</span>
        </Link>
        <Link
          href="/admin/events/registrations"
          className="flex-shrink-0 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
          title="View All Registrations"
          aria-label="View All Registrations"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <span className="font-semibold text-green-700">View All Registrations</span>
        </Link>
      </div>
    </div>
  );
}

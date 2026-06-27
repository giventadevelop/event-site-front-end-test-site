import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
// Icons removed - using inline SVGs instead
import AdminNavigation from '@/components/AdminNavigation';

function LoadingSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
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

export default async function AdminEventsPage() {
  const { userId } = await safeAuth();

  if (!userId) {
    notFound();
  }

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <AdminEventsContent />
    </Suspense>
  );
}

function AdminEventsContent() {
  const eventManagementFeatures = [
    {
      title: 'Event Analytics Dashboard',
      description: 'View comprehensive analytics, registration trends, and guest statistics for all events.',
      href: '/admin/events/dashboard',
      icon: 'FaChartLine',
      color: 'teal',
      features: ['Registration trends', 'Capacity utilization', 'Guest analytics', 'Special requirements summary']
    },
    {
      title: 'Registration Management',
      description: 'Manage all event registrations, view attendee details, and export data.',
      href: '/admin/events/registrations',
      icon: 'FaUsers',
      color: 'indigo',
      features: ['View all registrations', 'Search and filter', 'Export to CSV', 'Manage attendee status']
    },
    {
      title: 'Event Management',
      description: 'Create, edit, and manage events. View all events in the system.',
      href: '/admin',
      icon: 'FaCalendarAlt',
      color: 'green',
      features: ['Create new events', 'Edit existing events', 'Cancel events', 'Event listings']
    },
    {
      title: 'Create New Event',
      description: 'Quick access to create a new event with all necessary details.',
      href: '/admin/events/new',
      icon: 'FaPlus',
      color: 'blue',
      features: ['Event details', 'Pricing setup', 'Capacity management', 'Registration settings']
    },
    {
      title: 'Event Settings',
      description: 'Configure global event settings and preferences.',
      href: '/admin/events/settings',
      icon: 'FaCog',
      color: 'gray',
      features: ['Default settings', 'Email templates', 'Registration rules', 'System preferences']
    },
    {
      title: 'Reports & Exports',
      description: 'Generate detailed reports and export data for analysis.',
      href: '/admin/events/reports',
      icon: 'FaDownload',
      color: 'purple',
      features: ['Custom reports', 'Data exports', 'Analytics reports', 'Registration summaries']
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      teal: 'bg-teal-50 border-teal-200 text-teal-700 hover:bg-teal-100',
      indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100',
      green: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
      blue: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
      gray: 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100',
      purple: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.gray;
  };

  const getIconColorClasses = (color: string) => {
    const colorMap = {
      teal: 'text-teal-600',
      indigo: 'text-indigo-600',
      green: 'text-green-600',
      blue: 'text-blue-600',
      gray: 'text-gray-600',
      purple: 'text-purple-600'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.gray;
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Analytics Dashboard</h1>
        <p className="text-gray-600">
          View comprehensive event analytics, registration trends, and performance metrics.
        </p>
      </div>

      {/* Admin Navigation */}
      <AdminNavigation currentPage="event-analytics" />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-blue-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">-</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Registrations</p>
              <p className="text-2xl font-bold text-gray-900">-</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Events</p>
              <p className="text-2xl font-bold text-gray-900">-</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-purple-100 flex items-center justify-center">
              <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Reports Generated</p>
              <p className="text-2xl font-bold text-gray-900">-</p>
            </div>
          </div>
        </div>
      </div>

      {/* Event Management Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {eventManagementFeatures.map((feature, index) => {
          const getIconSvg = (iconName: string, color: string) => {
            const iconColor = getIconColorClasses(color);
            const bgColor = color === 'teal' ? 'bg-teal-100' : 
                          color === 'indigo' ? 'bg-indigo-100' :
                          color === 'green' ? 'bg-green-100' :
                          color === 'blue' ? 'bg-blue-100' :
                          color === 'gray' ? 'bg-gray-100' :
                          'bg-purple-100';
            
            if (iconName === 'FaChartLine') {
              return (
                <div className={`w-14 h-14 rounded-xl ${bgColor} flex items-center justify-center`}>
                  <svg className={`w-10 h-10 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              );
            } else if (iconName === 'FaUsers') {
              return (
                <div className={`w-14 h-14 rounded-xl ${bgColor} flex items-center justify-center`}>
                  <svg className={`w-10 h-10 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              );
            } else if (iconName === 'FaCalendarAlt') {
              return (
                <div className={`w-14 h-14 rounded-xl ${bgColor} flex items-center justify-center`}>
                  <svg className={`w-10 h-10 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              );
            } else if (iconName === 'FaPlus') {
              return (
                <div className={`w-14 h-14 rounded-xl ${bgColor} flex items-center justify-center`}>
                  <svg className={`w-10 h-10 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              );
            } else if (iconName === 'FaCog') {
              return (
                <div className={`w-14 h-14 rounded-xl ${bgColor} flex items-center justify-center`}>
                  <svg className={`w-10 h-10 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              );
            } else if (iconName === 'FaDownload') {
              return (
                <div className={`w-14 h-14 rounded-xl ${bgColor} flex items-center justify-center`}>
                  <svg className={`w-10 h-10 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
              );
            }
            return null;
          };
          
          return (
            <Link
              key={index}
              href={feature.href}
              className={`block p-6 rounded-lg border-2 transition-all duration-300 hover:scale-105 group ${getColorClasses(feature.color)}`}
            >
              <div className="flex items-start">
                <div className="group-hover:scale-110 transition-transform duration-300">
                  {getIconSvg(feature.icon, feature.color)}
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm mb-4 opacity-80">{feature.description}</p>
                  <ul className="text-xs space-y-1">
                    {feature.features.map((item, idx) => (
                      <li key={idx} className="flex items-center">
                        <span className="w-1 h-1 bg-current rounded-full mr-2"></span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link
            href="/admin/events/new"
            className="flex-shrink-0 h-14 rounded-xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
            title="Create New Event"
            aria-label="Create New Event"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="font-semibold text-blue-700">Create New Event</span>
          </Link>
          <Link
            href="/admin/events/dashboard"
            className="flex-shrink-0 h-14 rounded-xl bg-teal-100 hover:bg-teal-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
            title="View Analytics"
            aria-label="View Analytics"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-teal-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="font-semibold text-teal-700">View Analytics</span>
          </Link>
          <Link
            href="/admin/events/registrations"
            className="flex-shrink-0 h-14 rounded-xl bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
            title="Manage Registrations"
            aria-label="Manage Registrations"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="font-semibold text-indigo-700">Manage Registrations</span>
          </Link>
          <Link
            href="/admin/events/registrations?export=true"
            className="flex-shrink-0 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
            title="Export Data"
            aria-label="Export Data"
          >
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <span className="font-semibold text-green-700">Export Data</span>
          </Link>
        </div>
      </div>
    </div>
  );
}


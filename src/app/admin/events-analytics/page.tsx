import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import Link from 'next/link';
import {
  FaChartLine,
  FaUsers,
  FaCalendarAlt,
  FaPlus,
  FaEye,
  FaCog,
  FaDownload,
  FaFilter
} from 'react-icons/fa';
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
      icon: FaChartLine,
      color: 'teal',
      features: ['Registration trends', 'Capacity utilization', 'Guest analytics', 'Special requirements summary']
    },
    {
      title: 'Registration Management',
      description: 'Manage all event registrations, view attendee details, and export data.',
      href: '/admin/events/registrations',
      icon: FaUsers,
      color: 'indigo',
      features: ['View all registrations', 'Search and filter', 'Export to CSV', 'Manage attendee status']
    },
    {
      title: 'Event Management',
      description: 'Create, edit, and manage events. View all events in the system.',
      href: '/admin',
      icon: FaCalendarAlt,
      color: 'green',
      features: ['Create new events', 'Edit existing events', 'Cancel events', 'Event listings']
    },
    {
      title: 'Create New Event',
      description: 'Quick access to create a new event with all necessary details.',
      href: '/admin/events/new',
      icon: FaPlus,
      color: 'blue',
      features: ['Event details', 'Pricing setup', 'Capacity management', 'Registration settings']
    },
    {
      title: 'Event Settings',
      description: 'Configure global event settings and preferences.',
      href: '/admin/events/settings',
      icon: FaCog,
      color: 'gray',
      features: ['Default settings', 'Email templates', 'Registration rules', 'System preferences']
    },
    {
      title: 'Reports & Exports',
      description: 'Generate detailed reports and export data for analysis.',
      href: '/admin/events/reports',
      icon: FaDownload,
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Analytics</h1>
        <p className="text-gray-600">
          View comprehensive analytics, reports, and insights for all events.
        </p>
      </div>

      {/* Admin Navigation */}
      <AdminNavigation currentPage="events" />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FaCalendarAlt className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">-</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <FaUsers className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Registrations</p>
              <p className="text-2xl font-bold text-gray-900">-</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FaEye className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Events</p>
              <p className="text-2xl font-bold text-gray-900">-</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FaDownload className="h-6 w-6 text-purple-600" />
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
          const IconComponent = feature.icon;
          return (
            <Link
              key={index}
              href={feature.href}
              className={`block p-6 rounded-lg border-2 transition-all duration-200 ${getColorClasses(feature.color)}`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <IconComponent className={`h-8 w-8 ${getIconColorClasses(feature.color)}`} />
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
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <FaPlus className="mr-2" />
            Create New Event
          </Link>
          <Link
            href="/admin/events/dashboard"
            className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
          >
            <FaChartLine className="mr-2" />
            View Analytics
          </Link>
          <Link
            href="/admin/events/registrations"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            <FaUsers className="mr-2" />
            Manage Registrations
          </Link>
          <Link
            href="/admin/events/registrations?export=true"
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <FaDownload className="mr-2" />
            Export Data
          </Link>
        </div>
      </div>
    </div>
  );
}

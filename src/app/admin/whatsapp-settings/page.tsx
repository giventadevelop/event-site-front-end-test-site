import { Suspense } from 'react';
import Link from 'next/link';
// import { FaArrowLeft, FaWhatsapp, FaCog, FaMessage, FaChartBar } from 'react-icons/fa';
import WhatsAppSettingsFormSimple from './WhatsAppSettingsFormSimple';
// import { WhatsAppErrorBoundary } from '@/components/whatsapp/WhatsAppErrorBoundary';

export default async function WhatsAppSettingsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Skip Navigation Link for Screen Readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50"
      >
        Skip to main content
      </a>
      {/* Breadcrumb Navigation */}
      <nav className="flex mb-8" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link
              href="/admin"
              className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600"
            >
              ←
              Admin Dashboard
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                WhatsApp Integration
              </span>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">
                Settings
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <header className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <span role="img" aria-label="WhatsApp">📱</span>
              WhatsApp Settings
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Configure WhatsApp integration settings for your organization
            </p>
          </div>
          <nav className="flex gap-3" aria-label="WhatsApp actions">
            <Link
              href="/admin/whatsapp/bulk-messaging"
              className="bg-green-500 hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
              aria-describedby="send-messages-description"
            >
              <span role="img" aria-label="Send messages">💬</span>
              Send Messages
            </Link>
            <span id="send-messages-description" className="sr-only">
              Navigate to bulk messaging interface to send WhatsApp messages
            </span>
            <Link
              href="/admin/whatsapp/dashboard"
              className="bg-blue-500 hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
              aria-describedby="analytics-description"
            >
              <span role="img" aria-label="Analytics">📊</span>
              Analytics
            </Link>
            <span id="analytics-description" className="sr-only">
              View WhatsApp messaging analytics and performance metrics
            </span>
          </nav>
        </div>
      </header>

      {/* Quick Stats */}
      <section aria-labelledby="stats-heading" className="mb-8">
        <h2 id="stats-heading" className="sr-only">WhatsApp Integration Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span role="img" aria-label="Integration status">📱</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Integration Status
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"
                        aria-label="Integration status: Not configured"
                      >
                        Not Configured
                      </span>
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
                  <span role="img" aria-label="Templates">⚙️</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Templates
                    </dt>
                    <dd className="text-lg font-medium text-gray-900" aria-label="0 templates">0</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span role="img" aria-label="Messages sent">💬</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Messages Sent
                    </dt>
                    <dd className="text-lg font-medium text-gray-900" aria-label="0 messages sent">0</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span role="img" aria-label="Delivery rate">📊</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Delivery Rate
                    </dt>
                    <dd className="text-lg font-medium text-gray-900" aria-label="Delivery rate not available">--</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Settings Form */}
      <main id="main-content" aria-labelledby="settings-heading">
        <h2 id="settings-heading" className="sr-only">WhatsApp Integration Settings</h2>
        <Suspense
          fallback={
            <div className="bg-white rounded-lg shadow-md p-6" role="status" aria-live="polite">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
              <span className="sr-only">Loading WhatsApp settings form...</span>
            </div>
          }
        >
          <WhatsAppSettingsFormSimple />
        </Suspense>
      </main>
    </div>
  );
}

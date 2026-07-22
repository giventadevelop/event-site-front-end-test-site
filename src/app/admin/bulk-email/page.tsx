'use client';

import React from 'react';
import Link from 'next/link';
import AdminNavigation from '@/components/AdminNavigation';
import { FaEnvelope, FaNewspaper, FaArrowRight } from 'react-icons/fa';

export default function BulkEmailPage() {
  return (
    <div className="max-w-5xl mx-auto px-8 py-8" style={{ paddingTop: '180px' }}>
      {/* Header with back button */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mb-8 px-2.5 sm:px-3 md:px-4 lg:px-6 xl:px-8">
        <Link
          href="/admin"
          className="flex-shrink-0 h-14 rounded-xl bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
          title="Back to Admin"
          aria-label="Back to Admin"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-200 flex items-center justify-center">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </div>
          <span className="font-semibold text-indigo-700">Back to Admin</span>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bulk Email Management</h1>
          <p className="text-gray-600">Send bulk emails to your members and subscribers</p>
        </div>
      </div>

      <AdminNavigation currentPage="bulk-email" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Promotional Emails for Events */}
        <Link
          href="/admin/promotion-emails"
          className="group bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-yellow-400 hover:shadow-lg transition-all duration-200"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center group-hover:bg-yellow-200 transition-colors">
                <FaEnvelope className="w-8 h-8 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  Promotional Emails for Events
                </h2>
                <p className="text-sm text-gray-600">
                  Create and send promotional emails for specific events
                </p>
              </div>
            </div>
            <FaArrowRight className="w-5 h-5 text-gray-400 group-hover:text-yellow-600 transition-colors" />
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Create event-specific email templates</li>
              <li>• Send test emails before bulk sending</li>
              <li>• Send to all members or specific groups</li>
              <li>• Track email history and delivery status</li>
            </ul>
          </div>
        </Link>

        {/* Newsletter Emails */}
        <Link
          href="/admin/newsletter-emails"
          className="group bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-400 hover:shadow-lg transition-all duration-200"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <FaNewspaper className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  Newsletter Emails
                </h2>
                <p className="text-sm text-gray-600">
                  Create and send newsletter emails with news and updates
                </p>
              </div>
            </div>
            <FaArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Create newsletter email templates</li>
              <li>• Send test emails before bulk sending</li>
              <li>• Send to all members or specific groups</li>
              <li>• Track email history and delivery status</li>
            </ul>
          </div>
        </Link>
      </div>
    </div>
  );
}
































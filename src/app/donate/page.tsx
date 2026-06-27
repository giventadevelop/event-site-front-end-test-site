'use client';

import React from 'react';
import GivebutterWidget from '@/components/GivebutterWidget';

/**
 * Donation Page
 * Displays the Givebutter donation widget
 */
export default function DonatePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Support Our Mission
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Your generous donation helps us continue our mission to preserve and promote Malayali culture
            across the United States. Every contribution makes a difference.
          </p>
        </div>

        {/* Givebutter Widget */}
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
          <GivebutterWidget />
        </div>

        {/* Additional Information */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            All donations are processed securely through Givebutter.
            Your information is protected and your contribution is tax-deductible.
          </p>
        </div>
      </div>
    </div>
  );
}

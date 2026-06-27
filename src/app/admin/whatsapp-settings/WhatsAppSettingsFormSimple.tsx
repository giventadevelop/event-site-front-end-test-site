'use client';

import React from 'react';
// import { FaWhatsapp } from 'react-icons/fa';

export default function WhatsAppSettingsFormSimple() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <span role="img" aria-label="WhatsApp integration">📱</span>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">WhatsApp Integration</h2>
          <p className="text-sm text-gray-600">Configure your WhatsApp Business API settings</p>
        </div>
      </div>

      <div className="text-center py-12">
        <span role="img" aria-label="WhatsApp setup">📱</span>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          WhatsApp Integration Setup
        </h3>
        <p className="text-gray-600 mb-6">
          This is a simplified version to test the basic page structure.
        </p>
        <button
          type="button"
          className="bg-green-500 hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-white px-6 py-2 rounded-md font-medium transition-colors"
          aria-describedby="configure-description"
        >
          Configure Integration
        </button>
        <span id="configure-description" className="sr-only">
          Start the WhatsApp integration configuration process
        </span>
      </div>
    </div>
  );
}

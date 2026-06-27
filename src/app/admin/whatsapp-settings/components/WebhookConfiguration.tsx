'use client';

import { useState } from 'react';
import { FaCopy, FaCheck, FaLink, FaExclamationTriangle, FaShieldAlt } from 'react-icons/fa';

export default function WebhookConfiguration() {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookToken, setWebhookToken] = useState('');
  const [copied, setCopied] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const generateWebhookToken = () => {
    const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    setWebhookToken(token);
  };

  const validateWebhookUrl = (url: string) => {
    if (!url) {
      setErrors(prev => ({ ...prev, webhookUrl: '' }));
      return true;
    }

    if (!url.startsWith('https://')) {
      setErrors(prev => ({ ...prev, webhookUrl: 'Webhook URL must use HTTPS' }));
      return false;
    }

    try {
      new URL(url);
      setErrors(prev => ({ ...prev, webhookUrl: '' }));
      return true;
    } catch {
      setErrors(prev => ({ ...prev, webhookUrl: 'Invalid URL format' }));
      return false;
    }
  };

  const handleWebhookUrlChange = (value: string) => {
    setWebhookUrl(value);
    validateWebhookUrl(value);
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const webhookEndpoint = webhookUrl ? `${webhookUrl}/api/webhooks/whatsapp` : '';

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-medium text-gray-900">Webhook Configuration</h3>
        <p className="mt-1 text-sm text-gray-600">
          Configure webhook URL for receiving delivery receipts and status updates
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Webhook URL */}
        <div>
          <label htmlFor="webhookUrl" className="block text-sm font-medium text-gray-700 mb-2">
            Webhook URL (Optional)
          </label>
          <div className="relative">
            <input
              type="url"
              id="webhookUrl"
              value={webhookUrl}
              onChange={(e) => handleWebhookUrlChange(e.target.value)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.webhookUrl ? 'border-red-300' : 'border-gray-300'
                }`}
              placeholder="https://yourdomain.com"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <FaLink className="h-4 w-4 text-gray-400" />
            </div>
          </div>
          {errors.webhookUrl && (
            <div className="mt-1 flex items-center text-sm text-red-600">
              <FaExclamationTriangle className="h-4 w-4 mr-1" />
              {errors.webhookUrl}
            </div>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Your domain URL (without trailing slash). We'll append /api/webhooks/whatsapp
          </p>
        </div>

        {/* Webhook Token */}
        <div>
          <label htmlFor="webhookToken" className="block text-sm font-medium text-gray-700 mb-2">
            Webhook Token
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              id="webhookToken"
              value={webhookToken}
              onChange={(e) => setWebhookToken(e.target.value)}
              className="block flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              placeholder="Generate or enter webhook token"
              readOnly
            />
            <button
              type="button"
              onClick={generateWebhookToken}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md text-sm font-medium"
            >
              Generate
            </button>
            <button
              type="button"
              onClick={() => copyToClipboard(webhookToken, 'token')}
              disabled={!webhookToken}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {copied ? <FaCheck className="h-4 w-4" /> : <FaCopy className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Use this token to verify webhook requests from Twilio
          </p>
        </div>
      </div>

      {/* Webhook Endpoint Display */}
      {webhookEndpoint && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Your Webhook Endpoint</h4>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-sm font-mono text-gray-800">
              {webhookEndpoint}
            </code>
            <button
              type="button"
              onClick={() => copyToClipboard(webhookEndpoint, 'endpoint')}
              className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm font-medium flex items-center gap-2"
            >
              {copied ? <FaCheck className="h-4 w-4" /> : <FaCopy className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-600">
            Copy this URL and configure it in your Twilio Console under WhatsApp → Sandbox Settings
          </p>
        </div>
      )}

      {/* Help Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <FaShieldAlt className="text-blue-500 mr-3 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-800">Webhook Security</h4>
            <p className="text-sm text-blue-700 mt-1">
              Webhooks are used to receive delivery receipts and message status updates.
              The token ensures that requests are coming from Twilio and not malicious sources.
            </p>
          </div>
        </div>
      </div>

      {/* Verification Status */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <FaExclamationTriangle className="text-yellow-500 mr-3" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800">Verification Required</h4>
            <p className="text-sm text-yellow-700 mt-1">
              After configuring your webhook URL in Twilio Console, click "Test Connection" to verify the setup.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

















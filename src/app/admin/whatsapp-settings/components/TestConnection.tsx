'use client';

import { FaCheckCircle, FaExclamationTriangle, FaSpinner, FaWifi } from 'react-icons/fa';

interface TestConnectionProps {
  status: 'idle' | 'testing' | 'success' | 'error';
  testResult: any;
  onTest: (credentials: any) => void;
}

export default function TestConnection({ status, testResult, onTest }: TestConnectionProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'testing':
        return <FaSpinner className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'success':
        return <FaCheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <FaExclamationTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <FaWifi className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'testing':
        return 'Testing connection...';
      case 'success':
        return 'Connection successful';
      case 'error':
        return 'Connection failed';
      default:
        return 'Not tested';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'testing':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-medium text-gray-900">Connection Test</h3>
        <p className="mt-1 text-sm text-gray-600">
          Test your Twilio credentials and webhook configuration
        </p>
      </div>

      {/* Connection Status */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <h4 className="text-sm font-medium text-gray-900">Connection Status</h4>
              <p className={`text-sm ${getStatusColor()}`}>
                {getStatusText()}
              </p>
            </div>
          </div>
          <div className="text-right">
            {testResult?.timestamp && (
              <p className="text-xs text-gray-500">
                Last tested: {new Date(testResult.timestamp).toLocaleString()}
              </p>
            )}
          </div>
        </div>

        {/* Test Results */}
        {testResult && (
          <div className="mt-4">
            {testResult.success ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start">
                  <FaCheckCircle className="text-green-500 mr-3 mt-0.5" />
                  <div>
                    <h5 className="text-sm font-medium text-green-800">Connection Successful</h5>
                    <p className="text-sm text-green-700 mt-1">{testResult.message}</p>

                    {testResult.details && (
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg p-3">
                          <h6 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Account Status</h6>
                          <p className="text-sm font-medium text-gray-900 mt-1">
                            {testResult.details.accountStatus}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <h6 className="text-xs font-medium text-gray-500 uppercase tracking-wide">WhatsApp Status</h6>
                          <p className="text-sm font-medium text-gray-900 mt-1">
                            {testResult.details.whatsappStatus}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-3">
                          <h6 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Webhook Status</h6>
                          <p className="text-sm font-medium text-gray-900 mt-1">
                            {testResult.details.webhookStatus}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start">
                  <FaExclamationTriangle className="text-red-500 mr-3 mt-0.5" />
                  <div>
                    <h5 className="text-sm font-medium text-red-800">Connection Failed</h5>
                    <p className="text-sm text-red-700 mt-1">{testResult.message}</p>

                    <div className="mt-3">
                      <h6 className="text-sm font-medium text-red-800">Troubleshooting Steps:</h6>
                      <ul className="text-sm text-red-700 mt-2 space-y-1">
                        <li>• Verify your Account SID and Auth Token are correct</li>
                        <li>• Check that your WhatsApp From number is properly formatted</li>
                        <li>• Ensure your Twilio account has WhatsApp access enabled</li>
                        <li>• Verify your webhook URL is accessible and uses HTTPS</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Connection Details */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">What gets tested?</h4>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <FaCheckCircle className="h-4 w-4 text-green-500 mr-2" />
            Twilio Account credentials validation
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <FaCheckCircle className="h-4 w-4 text-green-500 mr-2" />
            WhatsApp Business API access verification
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <FaCheckCircle className="h-4 w-4 text-green-500 mr-2" />
            Webhook URL accessibility (if configured)
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <FaCheckCircle className="h-4 w-4 text-green-500 mr-2" />
            Message template API connectivity
          </div>
        </div>
      </div>
    </div>
  );
}

















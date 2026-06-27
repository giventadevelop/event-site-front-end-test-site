'use client';

import { useState } from 'react';
import { FaEye, FaEdit, FaCheck, FaExclamationTriangle, FaUsers, FaClock } from 'react-icons/fa';

interface MessagePreviewProps {
  messageData: any;
  recipients: any[];
  onConfirmed: () => void;
  onEdit: () => void;
}

export default function MessagePreview({ messageData, recipients, onConfirmed, onEdit }: MessagePreviewProps) {
  const [selectedRecipientIndex, setSelectedRecipientIndex] = useState(0);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('mobile');

  const selectedRecipient = recipients[selectedRecipientIndex];

  const getPreviewMessage = () => {
    if (!messageData.messageBody || !selectedRecipient) {
      return messageData.messageBody || '';
    }

    // Replace template variables with recipient data
    let message = messageData.messageBody;

    // Replace common variables
    message = message.replace(/\{\{name\}\}/g, selectedRecipient.name || 'Friend');
    message = message.replace(/\{\{firstName\}\}/g, selectedRecipient.name?.split(' ')[0] || 'Friend');
    message = message.replace(/\{\{phone\}\}/g, selectedRecipient.phone);
    message = message.replace(/\{\{email\}\}/g, selectedRecipient.email || '');

    // Add more template variables as needed
    message = message.replace(/\{\{event\}\}/g, 'Your Event');
    message = message.replace(/\{\{date\}\}/g, new Date().toLocaleDateString());
    message = message.replace(/\{\{time\}\}/g, new Date().toLocaleTimeString());

    return message;
  };

  const validateMessage = () => {
    const issues = [];

    if (!messageData.messageBody.trim()) {
      issues.push('Message content is required');
    }

    if (messageData.messageBody.length > 4096) {
      issues.push('Message exceeds WhatsApp character limit (4096)');
    }

    if (recipients.length === 0) {
      issues.push('At least one recipient is required');
    }

    if (recipients.some(r => !r.phone.trim())) {
      issues.push('All recipients must have valid phone numbers');
    }

    if (messageData.messageType === 'MARKETING' && recipients.length > 1000) {
      issues.push('Marketing messages are limited to 1000 recipients per day');
    }

    return issues;
  };

  const validationIssues = validateMessage();
  const isValid = validationIssues.length === 0;

  const getEstimatedCost = () => {
    // Mock cost calculation - in real implementation, this would use actual pricing
    const baseCost = 0.005; // $0.005 per message
    return (recipients.length * baseCost).toFixed(3);
  };

  const getEstimatedTime = () => {
    // Mock time estimation - in real implementation, this would consider rate limits
    const messagesPerMinute = 60;
    const minutes = Math.ceil(recipients.length / messagesPerMinute);
    return minutes;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Preview & Validate</h3>
        <p className="text-sm text-gray-600">
          Review your message and recipients before sending
        </p>
      </div>

      {/* Validation Issues */}
      {validationIssues.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <FaExclamationTriangle className="text-red-500 mr-3 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-red-800">Issues Found</h4>
              <ul className="text-sm text-red-700 mt-2 space-y-1">
                {validationIssues.map((issue, index) => (
                  <li key={index}>• {issue}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">Message Preview</h4>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewMode('mobile')}
                className={`px-3 py-1 text-xs rounded-md ${previewMode === 'mobile'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                  }`}
              >
                Mobile
              </button>
              <button
                onClick={() => setPreviewMode('desktop')}
                className={`px-3 py-1 text-xs rounded-md ${previewMode === 'desktop'
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                  }`}
              >
                Desktop
              </button>
            </div>
          </div>

          {/* WhatsApp Preview */}
          <div className={`bg-white border-2 rounded-lg p-4 ${previewMode === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'
            }`}>
            <div className="bg-green-500 text-white p-3 rounded-t-lg">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <FaUsers className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="font-medium text-sm">WhatsApp Business</p>
                  <p className="text-xs opacity-90">Online</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-b-lg">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-sm text-gray-800 whitespace-pre-wrap">
                  {getPreviewMessage()}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>

          {/* Recipient Selection */}
          {recipients.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview with Recipient:
              </label>
              <select
                value={selectedRecipientIndex}
                onChange={(e) => setSelectedRecipientIndex(Number(e.target.value))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {recipients.map((recipient, index) => (
                  <option key={index} value={index}>
                    {recipient.name || 'Unknown'} ({recipient.phone})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Campaign Summary */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">Campaign Summary</h4>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
            {/* Message Details */}
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-2">Message Details</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{messageData.messageType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Characters:</span>
                  <span className="font-medium">{messageData.messageBody.length}/4096</span>
                </div>
                {messageData.templateName && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Template:</span>
                    <span className="font-medium">{messageData.templateName}</span>
                  </div>
                )}
                {messageData.scheduledAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Scheduled:</span>
                    <span className="font-medium">
                      {new Date(messageData.scheduledAt).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Recipients */}
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-2">Recipients</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Recipients:</span>
                  <span className="font-medium">{recipients.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">With Names:</span>
                  <span className="font-medium">
                    {recipients.filter(r => r.name).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Estimates */}
            <div>
              <h5 className="text-sm font-medium text-gray-900 mb-2">Estimates</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Cost:</span>
                  <span className="font-medium">${getEstimatedCost()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Time:</span>
                  <span className="font-medium flex items-center gap-1">
                    <FaClock className="h-3 w-3" />
                    {getEstimatedTime()} min
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sample Recipients */}
          <div>
            <h5 className="text-sm font-medium text-gray-900 mb-2">
              Sample Recipients ({Math.min(5, recipients.length)} of {recipients.length})
            </h5>
            <div className="bg-white border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
              {recipients.slice(0, 5).map((recipient, index) => (
                <div key={index} className="px-3 py-2 border-b border-gray-100 last:border-b-0">
                  <p className="text-sm font-medium text-gray-900">
                    {recipient.name || 'Unknown'}
                  </p>
                  <p className="text-xs text-gray-500">{recipient.phone}</p>
                </div>
              ))}
              {recipients.length > 5 && (
                <div className="px-3 py-2 text-xs text-gray-500 text-center">
                  ... and {recipients.length - 5} more recipients
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onEdit}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
        >
          <FaEdit className="h-4 w-4" />
          Edit Message
        </button>
        <button
          onClick={onConfirmed}
          disabled={!isValid}
          className={`px-6 py-2 text-sm font-medium rounded-md flex items-center gap-2 ${isValid
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
        >
          <FaCheck className="h-4 w-4" />
          Confirm & Continue
        </button>
      </div>
    </div>
  );
}

















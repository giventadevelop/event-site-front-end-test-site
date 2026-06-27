'use client';

import { useState } from 'react';
import { FaFileAlt, FaClock, FaInfoCircle } from 'react-icons/fa';

interface BulkMessageComposerProps {
  onMessageComposed: (data: any) => void;
  initialData?: any;
}

export default function BulkMessageComposer({ onMessageComposed, initialData }: BulkMessageComposerProps) {
  const [messageData, setMessageData] = useState({
    messageBody: initialData?.messageBody || '',
    templateName: initialData?.templateName || '',
    messageType: initialData?.messageType || 'TRANSACTIONAL',
    scheduledAt: initialData?.scheduledAt || '',
  });

  const [characterCount, setCharacterCount] = useState(0);
  const [isTemplateMode, setIsTemplateMode] = useState(false);

  const handleMessageChange = (value: string) => {
    setMessageData(prev => ({ ...prev, messageBody: value }));
    setCharacterCount(value.length);
  };

  const handleSubmit = () => {
    if (messageData.messageBody.trim() && (!isTemplateMode || messageData.templateName)) {
      onMessageComposed(messageData);
    }
  };

  const isValid = messageData.messageBody.trim() &&
    (!isTemplateMode || messageData.templateName) &&
    characterCount <= 4096;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Compose Your Message</h3>
        <p className="text-sm text-gray-600">
          Write your WhatsApp message or select from approved templates
        </p>
      </div>

      {/* Message Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Message Type</label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="messageType"
              value="TRANSACTIONAL"
              checked={messageData.messageType === 'TRANSACTIONAL'}
              onChange={(e) => setMessageData(prev => ({ ...prev, messageType: e.target.value }))}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Transactional</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="messageType"
              value="MARKETING"
              checked={messageData.messageType === 'MARKETING'}
              onChange={(e) => setMessageData(prev => ({ ...prev, messageType: e.target.value }))}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Marketing</span>
          </label>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Transactional messages can be sent anytime. Marketing messages have restrictions.
        </p>
      </div>

      {/* Template Mode Toggle */}
      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={isTemplateMode}
            onChange={(e) => setIsTemplateMode(e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm font-medium text-gray-700">Use Message Template</span>
        </label>
        <p className="text-xs text-gray-500 mt-1">
          Templates are pre-approved by WhatsApp and can be reused
        </p>
      </div>

      {/* Template Selection */}
      {isTemplateMode && (
        <div>
          <label htmlFor="templateName" className="block text-sm font-medium text-gray-700 mb-2">
            Select Template
          </label>
          <select
            id="templateName"
            value={messageData.templateName}
            onChange={(e) => setMessageData(prev => ({ ...prev, templateName: e.target.value }))}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">Choose a template...</option>
            <option value="welcome_message">Welcome Message</option>
            <option value="event_reminder">Event Reminder</option>
            <option value="payment_confirmation">Payment Confirmation</option>
            <option value="newsletter">Newsletter</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Only approved templates are available for selection
          </p>
        </div>
      )}

      {/* Message Composition */}
      <div>
        <label htmlFor="messageBody" className="block text-sm font-medium text-gray-700 mb-2">
          Message Content
        </label>
        <div className="relative">
          <textarea
            id="messageBody"
            value={messageData.messageBody}
            onChange={(e) => handleMessageChange(e.target.value)}
            rows={6}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder={isTemplateMode
              ? "Select a template to see the message content..."
              : "Type your WhatsApp message here..."
            }
            disabled={isTemplateMode && !messageData.templateName}
          />
          <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-white px-2 py-1 rounded">
            {characterCount}/4096
          </div>
        </div>

        {/* Character Count Warning */}
        {characterCount > 4096 && (
          <div className="mt-2 flex items-center text-sm text-red-600">
            <FaInfoCircle className="h-4 w-4 mr-1" />
            Message exceeds WhatsApp character limit
          </div>
        )}

        {/* Template Variables Info */}
        {isTemplateMode && messageData.templateName && (
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Template Variables</h4>
            <p className="text-sm text-blue-700">
              Use variables like {'{{name}}'} or {'{{event}}'} in your message.
              These will be replaced with actual values for each recipient.
            </p>
          </div>
        )}
      </div>

      {/* Scheduling */}
      <div>
        <label htmlFor="scheduledAt" className="block text-sm font-medium text-gray-700 mb-2">
          Schedule Message (Optional)
        </label>
        <div className="relative">
          <input
            type="datetime-local"
            id="scheduledAt"
            value={messageData.scheduledAt}
            onChange={(e) => setMessageData(prev => ({ ...prev, scheduledAt: e.target.value }))}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          <FaClock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Leave empty to send immediately
        </p>
      </div>

      {/* Message Preview */}
      {messageData.messageBody && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <FaFileAlt className="h-4 w-4 mr-2" />
            Message Preview
          </h4>
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="text-sm text-gray-800 whitespace-pre-wrap">
              {messageData.messageBody}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => setMessageData({
            messageBody: '',
            templateName: '',
            messageType: 'TRANSACTIONAL',
            scheduledAt: '',
          })}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Clear
        </button>
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className={`px-6 py-2 text-sm font-medium rounded-md ${isValid
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
        >
          Continue to Recipients
        </button>
      </div>
    </div>
  );
}

















'use client';

import { useState } from 'react';
import { FaEye, FaEyeSlash, FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa';

interface TwilioCredentialsSectionProps {
  onConnectionTest: (credentials: any) => void;
}

export default function TwilioCredentialsSection({ onConnectionTest }: TwilioCredentialsSectionProps) {
  const [showAuthToken, setShowAuthToken] = useState(false);
  const [credentials, setCredentials] = useState({
    twilioAccountSid: '',
    twilioAuthToken: '',
    twilioWhatsappFrom: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = (name: string, value: string) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'twilioAccountSid':
        if (!value) {
          newErrors.twilioAccountSid = 'Account SID is required';
        } else if (!/^AC[a-f0-9]{32}$/.test(value)) {
          newErrors.twilioAccountSid = 'Invalid Twilio Account SID format';
        } else {
          delete newErrors.twilioAccountSid;
        }
        break;
      case 'twilioAuthToken':
        if (!value) {
          newErrors.twilioAuthToken = 'Auth Token is required';
        } else if (value.length < 32) {
          newErrors.twilioAuthToken = 'Auth token must be at least 32 characters';
        } else {
          delete newErrors.twilioAuthToken;
        }
        break;
      case 'twilioWhatsappFrom':
        if (!value) {
          newErrors.twilioWhatsappFrom = 'WhatsApp From number is required';
        } else if (!/^whatsapp:\+\d{10,15}$/.test(value)) {
          newErrors.twilioWhatsappFrom = 'Invalid WhatsApp number format (use whatsapp:+1234567890)';
        } else {
          delete newErrors.twilioWhatsappFrom;
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (name: string, value: string) => {
    setCredentials(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleTestConnection = () => {
    const isValid = Object.keys(credentials).every(key =>
      validateField(key, credentials[key as keyof typeof credentials])
    );

    if (isValid) {
      onConnectionTest(credentials);
    }
  };

  const isFormValid = Object.keys(errors).length === 0 &&
    Object.values(credentials).every(value => value.trim() !== '');

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h3 className="text-lg font-medium text-gray-900">Twilio Credentials</h3>
        <p className="mt-1 text-sm text-gray-600">
          Configure your Twilio WhatsApp Business API credentials
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Account SID */}
        <div>
          <label htmlFor="twilioAccountSid" className="block text-sm font-medium text-gray-700 mb-2">
            Twilio Account SID
          </label>
          <div className="relative">
            <input
              type="text"
              id="twilioAccountSid"
              value={credentials.twilioAccountSid}
              onChange={(e) => handleInputChange('twilioAccountSid', e.target.value)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.twilioAccountSid ? 'border-red-300' : 'border-gray-300'
                }`}
              placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            />
            {credentials.twilioAccountSid && !errors.twilioAccountSid && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <FaShieldAlt className="h-4 w-4 text-green-500" />
              </div>
            )}
          </div>
          {errors.twilioAccountSid && (
            <div className="mt-1 flex items-center text-sm text-red-600">
              <FaExclamationTriangle className="h-4 w-4 mr-1" />
              {errors.twilioAccountSid}
            </div>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Found in your Twilio Console under Account Info
          </p>
        </div>

        {/* Auth Token */}
        <div>
          <label htmlFor="twilioAuthToken" className="block text-sm font-medium text-gray-700 mb-2">
            Twilio Auth Token
          </label>
          <div className="relative">
            <input
              type={showAuthToken ? 'text' : 'password'}
              id="twilioAuthToken"
              value={credentials.twilioAuthToken}
              onChange={(e) => handleInputChange('twilioAuthToken', e.target.value)}
              className={`block w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.twilioAuthToken ? 'border-red-300' : 'border-gray-300'
                }`}
              placeholder="Enter your auth token"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => setShowAuthToken(!showAuthToken)}
            >
              {showAuthToken ? (
                <FaEyeSlash className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              ) : (
                <FaEye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              )}
            </button>
          </div>
          {errors.twilioAuthToken && (
            <div className="mt-1 flex items-center text-sm text-red-600">
              <FaExclamationTriangle className="h-4 w-4 mr-1" />
              {errors.twilioAuthToken}
            </div>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Your Twilio Auth Token (keep this secure)
          </p>
        </div>

        {/* WhatsApp From Number */}
        <div>
          <label htmlFor="twilioWhatsappFrom" className="block text-sm font-medium text-gray-700 mb-2">
            WhatsApp From Number
          </label>
          <div className="relative">
            <input
              type="text"
              id="twilioWhatsappFrom"
              value={credentials.twilioWhatsappFrom}
              onChange={(e) => handleInputChange('twilioWhatsappFrom', e.target.value)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 ${errors.twilioWhatsappFrom ? 'border-red-300' : 'border-gray-300'
                }`}
              placeholder="whatsapp:+1234567890"
            />
            {credentials.twilioWhatsappFrom && !errors.twilioWhatsappFrom && (
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <FaShieldAlt className="h-4 w-4 text-green-500" />
              </div>
            )}
          </div>
          {errors.twilioWhatsappFrom && (
            <div className="mt-1 flex items-center text-sm text-red-600">
              <FaExclamationTriangle className="h-4 w-4 mr-1" />
              {errors.twilioWhatsappFrom}
            </div>
          )}
          <p className="mt-1 text-xs text-gray-500">
            Your WhatsApp Business number in format: whatsapp:+1234567890
          </p>
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <FaShieldAlt className="text-blue-500 mr-3 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-800">Security Notice</h4>
            <p className="text-sm text-blue-700 mt-1">
              Your credentials are encrypted and stored securely. We never log or expose your auth tokens.
            </p>
          </div>
        </div>
      </div>

      {/* Test Connection Button */}
      <div className="flex justify-end">
        <button
          onClick={handleTestConnection}
          disabled={!isFormValid}
          className={`px-6 py-2 rounded-md font-medium ${isFormValid
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
        >
          Test Connection
        </button>
      </div>
    </div>
  );
}

















'use client';

import { useState } from 'react';
import Image from 'next/image';
import { getAppUrl } from '@/lib/env';
import PredefinedDonationButtons from '@/components/donation/PredefinedDonationButtons';
import PrayerIntentionInput from '@/components/donation/PrayerIntentionInput';
import { initializeDonationPayment } from '../donation/ApiServerActions';
import type { DonationCheckoutData } from '../donation/DonationServerData';

interface MassOfferingClientProps {
  initialData: DonationCheckoutData;
  eventId: string;
}

export default function MassOfferingClient({
  initialData,
  eventId,
}: MassOfferingClientProps) {
  const [donationAmount, setDonationAmount] = useState<number | null>(null);
  const [email, setEmail] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [prayerIntention, setPrayerIntention] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handlePresetAmount = (amount: number) => {
    setDonationAmount(amount);
    if (errors.amount) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.amount;
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!donationAmount || donationAmount < 1) {
      newErrors.amount = 'Please select a donation amount (minimum $1)';
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!firstName?.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!lastName?.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDonate = async () => {
    if (!validateForm()) {
      return;
    }

    setIsProcessing(true);

    try {
      const origin =
        typeof window !== 'undefined' ? window.location.origin : getAppUrl();

      const response = await initializeDonationPayment({
        eventId: parseInt(eventId),
        amount: donationAmount!,
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
        givebutterCampaignId: initialData.givebutterCampaignId,
        isFundraiser: initialData.isFundraiserEvent,
        isCharity: initialData.isCharityEvent,
        prayerIntention: prayerIntention.trim() || undefined,
        returnUrl: `${origin}/events/${eventId}/offering/success`,
        cancelUrl: `${origin}/events/${eventId}`,
      });

      // Redirect to GiveButter checkout URL (handle both checkoutUrl and sessionUrl)
      const checkoutUrl = response.checkoutUrl || response.sessionUrl;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Offering error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to process offering. Please try again.';
      alert(errorMessage);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Image Section */}
      {initialData.heroImageUrl && (
        <div className="relative w-full h-64 sm:h-80 md:h-96 overflow-hidden">
          <Image
            src={initialData.heroImageUrl}
            alt={initialData.event.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h1 className="text-3xl font-bold mb-2">{initialData.event.title}</h1>
            {initialData.event.caption && (
              <p className="text-lg opacity-90">{initialData.event.caption}</p>
            )}
          </div>
        </div>
      )}

      {/* Offering Form Section */}
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">Mass Offering</h2>
          
          {/* Preset Donation Buttons */}
          <PredefinedDonationButtons
            onAmountSelect={handlePresetAmount}
            selectedAmount={donationAmount}
            presets={[5, 10, 25, 50, 100]}
          />

          {errors.amount && (
            <div className="text-red-500 text-sm mt-1 mb-4">{errors.amount}</div>
          )}

          {/* Donor Information Form */}
          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                id="email"
                type="email"
                placeholder="Email *"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) {
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.email;
                      return newErrors;
                    });
                  }
                }}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-blue-500 text-base ${
                  errors.email
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-400 focus:border-blue-500'
                }`}
              />
              {errors.email && (
                <div className="text-red-500 text-sm mt-1">{errors.email}</div>
              )}
            </div>

            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                id="firstName"
                type="text"
                placeholder="First Name *"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (errors.firstName) {
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.firstName;
                      return newErrors;
                    });
                  }
                }}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-blue-500 text-base ${
                  errors.firstName
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-400 focus:border-blue-500'
                }`}
              />
              {errors.firstName && (
                <div className="text-red-500 text-sm mt-1">{errors.firstName}</div>
              )}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                id="lastName"
                type="text"
                placeholder="Last Name *"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  if (errors.lastName) {
                    setErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.lastName;
                      return newErrors;
                    });
                  }
                }}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-blue-500 text-base ${
                  errors.lastName
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-400 focus:border-blue-500'
                }`}
              />
              {errors.lastName && (
                <div className="text-red-500 text-sm mt-1">{errors.lastName}</div>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone (Optional)
              </label>
              <input
                id="phone"
                type="tel"
                placeholder="Phone (Optional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 text-base"
              />
            </div>

            {/* Prayer Intention (required for offerings) */}
            <PrayerIntentionInput
              value={prayerIntention}
              onChange={setPrayerIntention}
              optional={true}
            />
          </div>

          {/* Error Summary */}
          {Object.keys(errors).length > 0 && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Please fix the following {Object.keys(errors).length} error{Object.keys(errors).length !== 1 ? 's' : ''}:
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <ul className="list-disc pl-5 space-y-1">
                      {Object.entries(errors).map(([fieldName, errorMessage]) => (
                        <li key={fieldName}>
                          <span className="font-medium capitalize">{fieldName.replace(/([A-Z])/g, ' $1').trim()}:</span> {errorMessage}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Donate Button */}
          <button
            onClick={handleDonate}
            disabled={isProcessing || !donationAmount}
            className="mt-6 w-full bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            type="button"
          >
            {isProcessing ? 'Processing...' : `Donate ${donationAmount ? `$${donationAmount.toFixed(2)}` : ''}`}
          </button>

          {/* Return to Event Link */}
          <div className="mt-4 text-center">
            <a
              href={`/events/${eventId}`}
              className="text-teal-600 hover:text-teal-700 text-sm font-medium"
            >
              ← Return to Event
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

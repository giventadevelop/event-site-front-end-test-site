'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import type { MembershipPlanDTO } from '@/types';
import { ValidationErrorDialog } from './ValidationErrorDialog';

interface MembershipPlanFormProps {
  plan?: MembershipPlanDTO | null;
  onSubmit: (plan: Partial<MembershipPlanDTO>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  existingPlans?: MembershipPlanDTO[]; // For duplicate validation
}

export function MembershipPlanForm({ plan, onSubmit, onCancel, isLoading = false, existingPlans = [] }: MembershipPlanFormProps) {
  const [formData, setFormData] = useState<Partial<MembershipPlanDTO>>({
    planName: '',
    planCode: '',
    description: '',
    planType: 'SUBSCRIPTION',
    billingInterval: 'MONTHLY',
    price: 0,
    currency: 'USD',
    trialDays: 0,
    isActive: true,
    maxEventsPerMonth: undefined,
    maxAttendeesPerEvent: undefined,
    featuresJson: {},
    stripePriceId: '',
    stripeProductId: '',
  });
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [planNameError, setPlanNameError] = useState<string | null>(null);
  const [planCodeError, setPlanCodeError] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [validationDialogOpen, setValidationDialogOpen] = useState(false);
  const [validationDialogMessage, setValidationDialogMessage] = useState('');
  const [displayPrice, setDisplayPrice] = useState<string>('0.00');

  useEffect(() => {
    if (plan) {
      setFormData({
        planName: plan.planName || '',
        planCode: plan.planCode || '',
        description: plan.description || '',
        planType: plan.planType || 'SUBSCRIPTION',
        billingInterval: plan.billingInterval || 'MONTHLY',
        price: plan.price || 0,
        currency: plan.currency || 'USD',
        trialDays: plan.trialDays || 0,
        isActive: plan.isActive !== undefined ? plan.isActive : true,
        maxEventsPerMonth: plan.maxEventsPerMonth,
        maxAttendeesPerEvent: plan.maxAttendeesPerEvent,
        featuresJson: plan.featuresJson || {},
        stripePriceId: plan.stripePriceId || '',
        stripeProductId: plan.stripeProductId || '',
      });
      // Format price for display with 2 decimal places
      setDisplayPrice((plan.price || 0).toFixed(2));
    } else {
      // Initialize display price for new plan
      setDisplayPrice('0.00');
    }
  }, [plan]);

  // Update display price when formData.price changes from external source (e.g., plan prop)
  // Don't update during user input to avoid interfering with typing

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => {
      if (type === 'checkbox') {
        return { ...prev, [name]: checked };
      }
      if (type === 'number') {
        // Handle empty number fields as undefined (for nullable fields)
        if (value === '' && (name === 'maxEventsPerMonth' || name === 'maxAttendeesPerEvent')) {
          return { ...prev, [name]: undefined };
        }
        return { ...prev, [name]: parseFloat(value) || 0 };
      }
      return { ...prev, [name]: value };
    });

    // Real-time validation for plan name
    if (name === 'planName' && value.trim()) {
      const normalizedValue = value.trim().toLowerCase();
      const duplicate = existingPlans.find(
        (p) => p.planName?.toLowerCase() === normalizedValue && p.id !== plan?.id
      );
      if (duplicate) {
        setPlanNameError(`A plan with the name "${value}" already exists.`);
      } else {
        setPlanNameError(null);
      }
    } else if (name === 'planName') {
      setPlanNameError(null);
    }

    // Real-time validation for plan code
    if (name === 'planCode') {
      const trimmedValue = value.trim();

      // Required field validation
      if (!trimmedValue) {
        setPlanCodeError('Plan code is required.');
        return;
      }

      // Minimum length validation (4 characters)
      if (trimmedValue.length < 4) {
        setPlanCodeError('Plan code must be at least 4 characters long.');
        return;
      }

      // Duplicate validation (only check if length is valid)
      const normalizedValue = trimmedValue.toLowerCase();
      const duplicate = existingPlans.find(
        (p) => p.planCode?.toLowerCase() === normalizedValue && p.id !== plan?.id
      );
      if (duplicate) {
        setPlanCodeError(`A plan with the code "${value}" already exists. Plan codes must be unique.`);
      } else {
        setPlanCodeError(null);
      }
    }

    // Real-time validation for price (subscription plans must have price >= $0.60)
    if (name === 'price' || name === 'planType') {
      const currentPlanType = name === 'planType' ? value : formData.planType;
      const currentPrice = name === 'price' ? (type === 'number' ? parseFloat(value) || 0 : formData.price) : formData.price;

      // Clear error if price is being cleared
      if (name === 'price' && value === '') {
        setPriceError(null);
        return;
      }

      if (currentPlanType === 'SUBSCRIPTION') {
        if (!currentPrice || currentPrice <= 0) {
          setPriceError('Subscription plans must have a price greater than zero.');
        } else if (currentPrice < 0.60) {
          setPriceError('Subscription plans must have a minimum price of $0.60.');
        } else {
          setPriceError(null);
        }
      } else {
        setPriceError(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent default HTML5 validation
    e.stopPropagation();

    // Validate JSON before submitting
    if (jsonError) {
      setValidationDialogMessage('Please fix the JSON syntax error before submitting.');
      setValidationDialogOpen(true);
      return;
    }

    // VALIDATION: Plan name is required
    if (!formData.planName || !formData.planName.trim()) {
      setValidationDialogMessage('Plan name is required.');
      setValidationDialogOpen(true);
      return;
    }

    // VALIDATION: Plan code is required
    if (!formData.planCode || !formData.planCode.trim()) {
      setPlanCodeError('Plan code is required.');
      setValidationDialogMessage('Plan code is required.');
      setValidationDialogOpen(true);
      return;
    }

    // VALIDATION: Plan code minimum length (4 characters)
    if (formData.planCode.trim().length < 4) {
      setPlanCodeError('Plan code must be at least 4 characters long.');
      setValidationDialogMessage('Plan code must be at least 4 characters long.');
      setValidationDialogOpen(true);
      return;
    }

    // Validate for duplicates before submitting
    if (planNameError) {
      setValidationDialogMessage(planNameError);
      setValidationDialogOpen(true);
      return;
    }

    if (planCodeError) {
      setValidationDialogMessage(planCodeError);
      setValidationDialogOpen(true);
      return;
    }

    // VALIDATION: Price is required
    if (formData.price === undefined || formData.price === null || formData.price === '') {
      setPriceError('Price is required.');
      setValidationDialogMessage('Price is required.');
      setValidationDialogOpen(true);
      return;
    }

    // VALIDATION: Price must be >= $0.60 for subscription plans
    if (formData.planType === 'SUBSCRIPTION') {
      if (!formData.price || formData.price <= 0) {
        setPriceError('Subscription plans must have a price greater than zero.');
        setValidationDialogMessage('Subscription plans must have a price greater than zero.');
        setValidationDialogOpen(true);
        return;
      } else if (formData.price < 0.60) {
        setPriceError('Subscription plans must have a minimum price of $0.60.');
        setValidationDialogMessage('Subscription plans must have a minimum price of $0.60.');
        setValidationDialogOpen(true);
        return;
      }
    }

    // Clear price error if validation passes
    setPriceError(null);

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Plan Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="planName"
          value={formData.planName}
          onChange={handleChange}
          required
          className={`mt-1 block w-full border rounded-xl focus:ring-blue-500 px-4 py-3 text-base ${
            planNameError ? 'border-red-500 focus:border-red-500' : 'border-gray-400 focus:border-blue-500'
          }`}
          placeholder="e.g., Basic Plan, Premium Plan"
        />
        {planNameError && (
          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {planNameError}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Display name for the membership plan. Must be unique.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Plan Code <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="planCode"
          value={formData.planCode}
          onChange={handleChange}
          className={`mt-1 block w-full border rounded-xl focus:ring-blue-500 px-4 py-3 text-base font-mono text-sm ${
            planCodeError ? 'border-red-500 focus:border-red-500' : 'border-gray-400 focus:border-blue-500'
          }`}
          placeholder="e.g., basic_monthly, premium_yearly"
          pattern="[a-zA-Z0-9_-]+"
          title="Only letters, numbers, underscores, and hyphens allowed. Minimum 4 characters."
        />
        {planCodeError && (
          <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {planCodeError}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Unique identifier code for the plan (used in APIs and integrations). Must be at least 4 characters long, unique, and contain only letters, numbers, underscores, and hyphens.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Plan Type</label>
          <select
            name="planType"
            value={formData.planType}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
          >
            <option value="SUBSCRIPTION">Subscription</option>
            <option value="ONE_TIME">One Time</option>
            <option value="FREEMIUM">Freemium</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Billing Interval</label>
          <select
            name="billingInterval"
            value={formData.billingInterval}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
          >
            <option value="MONTHLY">Monthly</option>
            <option value="QUARTERLY">Quarterly</option>
            <option value="YEARLY">Yearly</option>
            <option value="ONE_TIME">One Time</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Price <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="price"
            value={displayPrice}
            onChange={(e) => {
              const inputValue = e.target.value;
              // Allow empty input or partial decimal input during typing
              if (inputValue === '' || inputValue === '.') {
                setDisplayPrice(inputValue);
                setFormData((prev) => ({ ...prev, price: 0 }));
                setPriceError(null);
                return;
              }

              const numValue = parseFloat(inputValue) || 0;
              // Update formData with numeric value for validation
              setFormData((prev) => ({ ...prev, price: numValue }));

              // Update display value - allow user to type freely
              setDisplayPrice(inputValue);

              // Trigger price validation
              const currentPlanType = formData.planType;
              if (currentPlanType === 'SUBSCRIPTION') {
                if (!numValue || numValue <= 0) {
                  setPriceError('Subscription plans must have a price greater than zero.');
                } else if (numValue < 0.60) {
                  setPriceError('Subscription plans must have a minimum price of $0.60.');
                } else {
                  setPriceError(null);
                }
              } else {
                setPriceError(null);
              }
            }}
            onBlur={(e) => {
              // Format to 2 decimal places on blur
              const inputValue = e.target.value;
              if (inputValue === '' || inputValue === '.') {
                setDisplayPrice('0.00');
                setFormData((prev) => ({ ...prev, price: 0 }));
              } else {
                const numValue = parseFloat(inputValue) || 0;
                const formattedValue = numValue.toFixed(2);
                setDisplayPrice(formattedValue);
                setFormData((prev) => ({ ...prev, price: numValue }));
              }
            }}
            step="0.01"
            className={`mt-1 block w-full border rounded-xl focus:ring-blue-500 px-4 py-3 text-base ${
              priceError ? 'border-red-500 focus:border-red-500' : 'border-gray-400 focus:border-blue-500'
            }`}
            placeholder="0.00"
          />
          {priceError && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {priceError}
            </p>
          )}
          {formData.planType === 'SUBSCRIPTION' && !priceError && (
            <p className="mt-1 text-xs text-gray-500">
              Subscription plans must have a minimum price of $0.60.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
          <input
            type="text"
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            required
            maxLength={3}
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Trial Days</label>
        <input
          type="number"
          name="trialDays"
          value={formData.trialDays}
          onChange={handleChange}
          min="0"
          className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Events Per Month</label>
          <input
            type="number"
            name="maxEventsPerMonth"
            value={formData.maxEventsPerMonth || ''}
            onChange={handleChange}
            min="0"
            placeholder="Unlimited if empty"
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Max Attendees Per Event</label>
          <input
            type="number"
            name="maxAttendeesPerEvent"
            value={formData.maxAttendeesPerEvent || ''}
            onChange={handleChange}
            min="0"
            placeholder="Unlimited if empty"
            className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
          />
        </div>
      </div>

      {/* Stripe IDs - Always show in edit mode (read-only display for informational purposes) */}
      {plan && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stripe Product ID <span className="ml-2 text-xs text-gray-500 font-normal">(Auto-generated)</span>
            </label>
            <div className="mt-1 block w-full border border-gray-300 rounded-xl bg-gray-100 px-4 py-3 text-base">
              {formData.stripeProductId ? (
                <p className="text-gray-800 font-mono text-sm break-all">{formData.stripeProductId}</p>
              ) : (
                <p className="text-gray-500 italic text-sm">Not yet created by Stripe API</p>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Automatically created by Stripe API when the plan is created. This value cannot be edited.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stripe Price ID <span className="ml-2 text-xs text-gray-500 font-normal">(Auto-generated)</span>
            </label>
            <div className="mt-1 block w-full border border-gray-300 rounded-xl bg-gray-100 px-4 py-3 text-base">
              {formData.stripePriceId ? (
                <p className="text-gray-800 font-mono text-sm break-all">{formData.stripePriceId}</p>
              ) : (
                <p className="text-gray-500 italic text-sm">Not yet created by Stripe API</p>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Automatically created by Stripe API when the plan is created. This value cannot be edited.
            </p>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Features JSON</label>
        <textarea
          name="featuresJson"
          value={JSON.stringify(formData.featuresJson || {}, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value);
              setFormData((prev) => ({ ...prev, featuresJson: parsed }));
              setJsonError(null);
            } catch (err) {
              setJsonError('Invalid JSON format. Please check your syntax.');
            }
          }}
          rows={6}
          placeholder='{"feature1": true, "feature2": "value"}'
          className={`mt-1 block w-full border rounded-xl focus:ring-blue-500 px-4 py-3 text-base font-mono text-sm ${
            jsonError ? 'border-red-500 focus:border-red-500' : 'border-gray-400 focus:border-blue-500'
          }`}
        />
        {jsonError ? (
          <p className="mt-1 text-xs text-red-600">{jsonError}</p>
        ) : (
          <p className="mt-1 text-xs text-gray-500">Enter valid JSON format for features (e.g., {"{"}"feature1": true, "feature2": "value"{"}"})</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center cursor-pointer">
          <span className="relative flex items-center justify-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="custom-checkbox"
              onClick={(e) => e.stopPropagation()}
            />
            <span className="custom-checkbox-tick">
              {formData.isActive && (
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l5 5L19 7" />
                </svg>
              )}
            </span>
          </span>
          <span className="ml-2 text-sm font-medium text-gray-700 select-none">Active</span>
        </label>
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" disabled={isLoading} className="bg-blue-500 hover:bg-blue-600 text-white">
          {isLoading ? 'Saving...' : plan ? 'Update Plan' : 'Create Plan'}
        </Button>
        <Button type="button" onClick={onCancel} variant="outline" className="bg-teal-100 hover:bg-teal-200 text-teal-800">
          Cancel
        </Button>
      </div>

      {/* Validation Error Dialog */}
      <ValidationErrorDialog
        isOpen={validationDialogOpen}
        title="Validation Error"
        message={validationDialogMessage}
        onClose={() => setValidationDialogOpen(false)}
      />
    </form>
  );
}


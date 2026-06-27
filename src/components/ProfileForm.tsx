"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { flushSync } from "react-dom";
import { UserProfileDTO } from "@/types";
import { getTenantId } from '@/lib/env';
import {
  resubscribeEmailAction,
  unsubscribeEmailAction,
  fetchUserProfileByEmailAction,
  generateEmailSubscriptionTokenAction,
} from '@/app/profile/actions';

type UserProfileFormData = Omit<UserProfileDTO, 'createdAt' | 'updatedAt' | 'id'> & { id?: number };
const defaultFormData: UserProfileFormData = {
  userId: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  zipCode: '',
  country: '',
  notes: '',
  familyName: '',
  cityTown: '',
  district: '',
  educationalInstitution: '',
  profileImageUrl: '',
  isEmailSubscribed: true,  // default to true
  emailSubscriptionToken: '',
  isEmailSubscriptionTokenUsed: false,
};

function LoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i}>
            <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
      <div>
        <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
      <div className="flex justify-end">
        <div className="h-10 w-32 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

interface ProfileFormProps {
  initialProfile?: UserProfileDTO | null;
}

const DialogBox = ({ message, onClose }: { message: string; onClose: () => void }) => {
  const router = useRouter();

  const handleOk = () => {
    onClose();
    router.push('/');
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Profile Updated Successfully!</h3>
          <p className="text-gray-600 mb-8 leading-relaxed">{message}</p>
          <div className="flex justify-center">
            <button
              onClick={handleOk}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmailDialogBox = ({ message, onClose }: { message: string; onClose: () => void }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Email Subscription Updated!</h3>
          <p className="text-gray-600 mb-8 leading-relaxed">{message}</p>
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ProfileForm({ initialProfile }: ProfileFormProps) {
  const router = useRouter();
  const { userId } = useAuth();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(!initialProfile);
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showErrors, setShowErrors] = useState(false);
  
  // Refs for form fields to enable scroll-to-error functionality
  const fieldRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement>>({});
  
  const [formData, setFormData] = useState<UserProfileFormData>(() => {
    if (initialProfile) {
      return {
        userId: initialProfile.userId || '',
        firstName: initialProfile.firstName || '',
        lastName: initialProfile.lastName || '',
        email: initialProfile.email || '',
        phone: initialProfile.phone || '',
        addressLine1: initialProfile.addressLine1 || '',
        addressLine2: initialProfile.addressLine2 || '',
        city: initialProfile.city || '',
        state: initialProfile.state || '',
        zipCode: initialProfile.zipCode || '',
        country: initialProfile.country || '',
        notes: initialProfile.notes || '',
        familyName: initialProfile.familyName || '',
        cityTown: initialProfile.cityTown || '',
        district: initialProfile.district || '',
        educationalInstitution: initialProfile.educationalInstitution || '',
        profileImageUrl: initialProfile.profileImageUrl || '',
        isEmailSubscribed: initialProfile.isEmailSubscribed ?? true,
        emailSubscriptionToken: initialProfile.emailSubscriptionToken || '',
        isEmailSubscriptionTokenUsed: initialProfile.isEmailSubscriptionTokenUsed ?? false,
      };
    }
    return defaultFormData;
  });
  const [profileId, setProfileId] = useState<number | null>(initialProfile?.id || null);
  const [resubscribeLoading, setResubscribeLoading] = useState(false);
  const [resubscribeSuccess, setResubscribeSuccess] = useState(false);
  const [resubscribeError, setResubscribeError] = useState<string | null>(null);
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailDialogMessage, setEmailDialogMessage] = useState("");



  // Function to scroll to the first error field
  const scrollToFirstError = (errorObj?: Record<string, string>) => {
    // Use provided errors or fall back to state
    const errorsToUse = errorObj || errors;
    const firstErrorField = Object.keys(errorsToUse)[0];
    if (firstErrorField && fieldRefs.current[firstErrorField]) {
      const field = fieldRefs.current[firstErrorField];
      // Scroll to field but DON'T focus it immediately
      // This allows all fields to show red borders before focusing
      field.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
      // Delay focus slightly to ensure all fields have rendered with red borders
      setTimeout(() => {
        if (fieldRefs.current[firstErrorField]) {
          fieldRefs.current[firstErrorField]?.focus();
        }
      }, 100);
    }
  };

  // Helper to get error count
  const getErrorCount = () => Object.keys(errors).length;

  // Validation function
  function validate(): boolean {
    const errs: Record<string, string> = {};
    
    // Required field validations
    if (!formData.firstName || formData.firstName.trim() === '') {
      errs.firstName = 'First name is required';
    }
    if (!formData.lastName || formData.lastName.trim() === '') {
      errs.lastName = 'Last name is required';
    }
    if (!formData.email || formData.email.trim() === '') {
      errs.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }

    // CRITICAL: Use flushSync to force immediate state update so red borders appear instantly
    const hasErrors = Object.keys(errs).length > 0;

    if (hasErrors) {
      // Force synchronous state updates so fields show red borders immediately
      flushSync(() => {
        setErrors(errs);
        setShowErrors(true);
      });

      // Scroll to first error field
      scrollToFirstError(errs);
    } else {
      setErrors({});
      setShowErrors(false);
    }

    return !hasErrors;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (value || ''),
    }));
  };

  // Handler for email subscription changes
  const handleEmailSubscriptionChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    const email = formData.email;

    if (!email) {
      setResubscribeError('Email address is required for subscription changes.');
      return;
    }

    // Use the existing emailSubscriptionToken from the form data
    const existingToken = formData.emailSubscriptionToken;
    console.log('[EMAIL-SUBSCRIPTION] Using existing token:', existingToken);
    console.log('[EMAIL-SUBSCRIPTION] Email:', email);
    console.log('[EMAIL-SUBSCRIPTION] Action:', checked ? 'resubscribe' : 'unsubscribe');

    if (!existingToken) {
      setResubscribeError('Email subscription token not found. Please refresh the page and try again.');
      return;
    }

    setResubscribeLoading(true);
    setResubscribeError(null);

    try {
      const result = checked
        ? await resubscribeEmailAction(email, existingToken)
        : await unsubscribeEmailAction(email, existingToken);

      if (result.success) {
        setFormData((prev) => ({ ...prev, isEmailSubscribed: checked }));
        setEmailDialogMessage(result.message);
        setShowEmailDialog(true);
      } else {
        setResubscribeError(result.message);
        // Revert the checkbox state
        setFormData((prev) => ({ ...prev, isEmailSubscribed: !checked }));
      }
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Network error. Please try again.';
      setResubscribeError(errorMessage);
      // Revert the checkbox state
      setFormData((prev) => ({ ...prev, isEmailSubscribed: !checked }));
    } finally {
      setResubscribeLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent browser default validation and scrolling
    
    if (!userId) {
      console.debug('No userId available, cannot submit form');
      return;
    }

    // CRITICAL: Always validate before submission
    const isValid = validate();
    if (!isValid) {
      console.log('[ProfileForm handleSubmit] Validation failed - preventing submission');
      return; // Validation failed - prevent submission
    }

    console.log('[ProfileForm handleSubmit] Validation passed - proceeding with submission');

    // Clear any previous errors and hide error display
    setErrors({});
    setShowErrors(false);

    setLoading(true);
    setError(null);
    setProfileUpdateSuccess(false);

    try {
      // Import server actions
      const { updateUserProfileAction, createUserProfileAction } = await import('../app/profile/actions');

      let result = null;

      if (profileId) {
        // Update existing profile
        result = await updateUserProfileAction(profileId, formData);
      } else {
        // Create new profile
        result = await createUserProfileAction({
          ...formData,
          userId,
          userRole: 'MEMBER',
          userStatus: 'PENDING_APPROVAL',
        });
      }

      if (result) {
        setProfileId(result.id);
        setProfileUpdateSuccess(true);
        setError(null);
        setDialogMessage("Profile saved successfully!");
      } else {
        setError('Failed to save profile. Please try again.');
        setDialogMessage('Failed to save profile. Please try again.');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to save profile data");
      setDialogMessage("An error occurred while saving the profile.");

      if (error instanceof Error) {
        console.error('[ProfileForm] Error during profile save:', error.message);
      } else {
        console.error('[ProfileForm] Unknown error during profile save:', error);
      }
    } finally {
      setLoading(false);
      setShowDialog(true);
    }
  };

  // Handler for resubscribe
  const handleResubscribe = async () => {
    setResubscribeLoading(true);
    setResubscribeError(null);
    setResubscribeSuccess(false);
    try {
      const email = formData.email;
      let token = formData.emailSubscriptionToken;
      let profileId = formData.id;

      if (!email) {
        setResubscribeError('Missing email.');
        return;
      }

      // If no token exists or no profile ID, fetch profile by email first
      if (!token || !profileId) {
        console.log('[ProfileForm] No email subscription token or profile ID found, fetching profile by email...');

        const profile = await fetchUserProfileByEmailAction(email);
        if (!profile) {
          setResubscribeError('User profile not found. Please make sure you have completed your profile setup first.');
          return;
        }

        profileId = profile.id!;
        token = profile.emailSubscriptionToken;

        // Update form data with fetched profile info
        setFormData((prev) => ({
          ...prev,
          id: profileId,
          emailSubscriptionToken: token,
          isEmailSubscribed: profile.isEmailSubscribed
        }));

        console.log('[ProfileForm] Fetched profile by email:', { profileId, hasToken: !!token });
      }

      // If still no token after fetching profile, generate a new one
      if (!token) {
        console.log('[ProfileForm] No email subscription token found in profile, generating new one...');

        const tokenResult = await generateEmailSubscriptionTokenAction(profileId);
        if (!tokenResult.success) {
          setResubscribeError(`Failed to generate email subscription token: ${tokenResult.error}`);
          return;
        }

        token = tokenResult.token!;
        // Update the form data with the new token
        setFormData((prev) => ({
          ...prev,
          emailSubscriptionToken: token,
          isEmailSubscribed: true
        }));
        console.log('[ProfileForm] Generated new email subscription token:', token);
      }

      const result = await resubscribeEmailAction(email, token);
      if (result.success) {
        setResubscribeSuccess(true);
        setResubscribeError(null);
        setFormData((prev) => ({ ...prev, isEmailSubscribed: true }));
        setEmailDialogMessage(result.message);
        setShowEmailDialog(true);
      } else {
        setResubscribeError(result.message);
      }
    } catch (e) {
      setResubscribeError('Network error. Please try again.');
    } finally {
      setResubscribeLoading(false);
    }
  };

  if (initialLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto p-4">
      {/* Top action row: Skip and Resubscribe */}
      <div className="flex justify-between items-center mb-6">
        <a
          href="/"
          className="flex-shrink-0 h-14 rounded-xl bg-indigo-100 hover:bg-indigo-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-6"
          title="Skip for now"
          aria-label="Skip for now"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-indigo-200 flex items-center justify-center">
            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <span className="font-semibold text-indigo-700">Skip for now</span>
        </a>
        {formData.isEmailSubscribed === false && !resubscribeSuccess && (
          <button
            type="button"
            onClick={handleResubscribe}
            disabled={resubscribeLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {resubscribeLoading ? "Resubscribing..." : "Resubscribe to Emails"}
          </button>
        )}
      </div>
      {profileUpdateSuccess && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4 flex items-center">
          <span>Your Profile is updated.</span>
        </div>
      )}
      {resubscribeSuccess && (
        <div className="bg-green-50 text-green-700 p-3 rounded-md mb-4 flex items-center">
          <span>You are now subscribed to emails.</span>
        </div>
      )}
      {resubscribeError && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md mb-4 flex items-center">
          <span>{resubscribeError}</span>
        </div>
      )}

      <div className="border rounded-lg p-4 bg-gray-50 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name *
            </label>
            <input
              ref={(el) => { if (el) fieldRefs.current.firstName = el; }}
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`mt-1 block w-full border rounded-xl focus:ring-blue-500 px-4 py-3 text-base ${
                errors.firstName 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-400 focus:border-blue-500'
              }`}
            />
            {errors.firstName && (
              <div className="text-red-500 text-sm mt-1">{errors.firstName}</div>
            )}
          </div>
          <div className="md:col-span-2">
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last Name *
            </label>
            <input
              ref={(el) => { if (el) fieldRefs.current.lastName = el; }}
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`mt-1 block w-full border rounded-xl focus:ring-blue-500 px-4 py-3 text-base ${
                errors.lastName 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-400 focus:border-blue-500'
              }`}
            />
            {errors.lastName && (
              <div className="text-red-500 text-sm mt-1">{errors.lastName}</div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email *
            </label>
            <input
              ref={(el) => { if (el) fieldRefs.current.email = el; }}
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`mt-1 block w-full border rounded-xl focus:ring-blue-500 px-4 py-3 text-base ${
                errors.email 
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                  : 'border-gray-400 focus:border-blue-500'
              }`}
            />
            {errors.email && (
              <div className="text-red-500 text-sm mt-1">{errors.email}</div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone || ""}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
            />
          </div>
        </div>
        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="md:col-span-2">
            <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700">
              Address Line 1
            </label>
            <input
              type="text"
              id="addressLine1"
              name="addressLine1"
              value={formData.addressLine1 || ""}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
            />
          </div>
        </div>
        <div className="md:col-span-3 grid grid-cols-1 gap-4 mt-4">
          <div>
            <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700">
              Address Line 2
            </label>
            <input
              type="text"
              id="addressLine2"
              name="addressLine2"
              value={formData.addressLine2 || ""}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
            />
          </div>
        </div>
        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city || ""}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
            />
          </div>
          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
              State
            </label>
            <input
              type="text"
              id="state"
              name="state"
              value={formData.state || ""}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
            />
          </div>
        </div>
        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700">
              ZIP Code
            </label>
            <input
              type="text"
              id="zipCode"
              name="zipCode"
              value={formData.zipCode || ""}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
            />
          </div>
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
              Country
            </label>
            <input
              type="text"
              id="country"
              name="country"
              value={formData.country || ""}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
            />
          </div>
        </div>
      </div>

      <div className="my-6">
        <div className="font-bold text-blue-700 mb-2 text-sm">[* The below fields are optional, your whereabouts in India]</div>
        <div className="border rounded-lg p-4 bg-blue-50">
          <h3 className="text-base font-semibold mb-4">India Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="familyName" className="block text-sm font-medium text-gray-700">
                Family Name
              </label>
              <input
                type="text"
                id="familyName"
                name="familyName"
                value={formData.familyName || ""}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                tabIndex={0}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 mt-4">
            <div>
              <label htmlFor="district" className="block text-sm font-medium text-gray-700">
                District
              </label>
              <input
                type="text"
                id="district"
                name="district"
                value={formData.district || ""}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                tabIndex={0}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 mt-4">
            <div>
              <label htmlFor="cityTown" className="block text-sm font-medium text-gray-700">
                City/Town
              </label>
              <input
                type="text"
                id="cityTown"
                name="cityTown"
                value={formData.cityTown || ""}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                tabIndex={0}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 mt-4">
            <div>
              <label htmlFor="educationalInstitution" className="block text-sm font-medium text-gray-700">
                Educational Institution
              </label>
              <input
                type="text"
                id="educationalInstitution"
                name="educationalInstitution"
                value={formData.educationalInstitution || ""}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                tabIndex={0}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Email Subscription Section */}
      <div className="border rounded-lg p-6 bg-blue-50 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Preferences</h3>
        <div className="flex items-start space-x-3">
          <label className="flex flex-col items-center">
            <span className="relative flex items-center justify-center">
              <input
                type="checkbox"
                id="isEmailSubscribed"
                name="isEmailSubscribed"
                checked={formData.isEmailSubscribed || false}
                onChange={handleEmailSubscriptionChange}
                disabled={resubscribeLoading}
                onClick={(e) => e.stopPropagation()}
                className="custom-checkbox"
              />
              <span className="custom-checkbox-tick">
                {formData.isEmailSubscribed && (
                  <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" strokeWidth="4" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l5 5L19 7" />
                  </svg>
                )}
              </span>
            </span>
            <span className="mt-2 text-xs text-center select-none break-words max-w-[6rem]">
              {resubscribeLoading ? 'Updating...' : 'Email Notifications'}
            </span>
          </label>
          <div className="flex-1">
            <label htmlFor="isEmailSubscribed" className="text-sm font-medium text-gray-700 cursor-pointer">
              Subscribe to email notifications and updates
              {resubscribeLoading && (
                <span className="ml-2 text-blue-600 text-xs">(Updating...)</span>
              )}
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Receive important event updates, announcements, and newsletters from our organization.
            </p>
          </div>
        </div>
      </div>

      <div className="border rounded-lg p-4 bg-gray-50 mb-6">
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes || ""}
          onChange={handleChange}
          rows={4}
          className="mt-1 block w-full border border-gray-400 rounded-lg focus:border-blue-500 focus:ring-blue-500"
          tabIndex={0}
        />
      </div>

      {/* Error Summary Display - Above the save button */}
      {showErrors && getErrorCount() > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Please fix the following {getErrorCount()} error{getErrorCount() !== 1 ? 's' : ''}:
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

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className={`w-full flex-shrink-0 h-14 rounded-xl bg-green-100 hover:bg-green-200 flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 px-6`}
          title={loading ? "Saving..." : "Save Profile"}
          aria-label={loading ? "Saving..." : "Save Profile"}
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-green-200 flex items-center justify-center">
            {loading ? (
              <svg className="animate-spin w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className="font-semibold text-green-700">{loading ? "Saving..." : "Save Profile"}</span>
        </button>
      </div>

      {showDialog && (
        <DialogBox
          message={dialogMessage}
          onClose={() => setShowDialog(false)}
        />
      )}

      {showEmailDialog && (
        <EmailDialogBox
          message={emailDialogMessage}
          onClose={() => setShowEmailDialog(false)}
        />
      )}
    </form>
  );
}
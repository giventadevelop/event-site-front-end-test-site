"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { EventAttendeeDTO, EventAttendeeGuestDTO, UserProfileDTO, EventDetailsDTO } from "@/types";
import { FaPlus, FaTrashAlt, FaUser, FaUsers, FaChild, FaBaby, FaLock } from "react-icons/fa";
import MemberOnlyGuard from "./auth/MemberOnlyGuard";

interface EventRegistrationFormProps {
  eventId: number;
  eventTitle: string;
  eventDetails?: EventDetailsDTO;
}

type GuestFormData = {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  ageGroup: string;
  relationship: string;
  specialRequirements: string;
};

type RegistrationFormData = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  isMember: boolean;
  specialRequirements: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  dietaryRestrictions: string;
  accessibilityNeeds: string;
  termsAccepted: boolean;
  guests: GuestFormData[];
};

const defaultFormData: RegistrationFormData = {
  email: '',
  firstName: '',
  lastName: '',
  phone: '',
  isMember: false,
  specialRequirements: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelationship: '',
  dietaryRestrictions: '',
  accessibilityNeeds: '',
  termsAccepted: false,
  guests: []
};

const defaultGuestData: GuestFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  ageGroup: 'Adult',
  relationship: '',
  specialRequirements: ''
};

const ageGroups = [
  { value: 'Adult', label: 'Adult (18+)', icon: FaUser },
  { value: 'Teen', label: 'Teen (13-17)', icon: FaUsers },
  { value: 'Child', label: 'Child (5-12)', icon: FaChild },
  { value: 'Infant', label: 'Infant (0-4)', icon: FaBaby }
];

const relationships = [
  'Spouse',
  'Partner',
  'Child',
  'Parent',
  'Sibling',
  'Friend',
  'Colleague',
  'Other'
];

export default function EventRegistrationForm({ eventId, eventTitle, eventDetails }: EventRegistrationFormProps) {
  const router = useRouter();
  const { userId } = useAuth();

  const [loading, setLoading] = useState(false);
  const [emailLookupLoading, setEmailLookupLoading] = useState(false);
  const [formData, setFormData] = useState<RegistrationFormData>(defaultFormData);
  const [existingProfile, setExistingProfile] = useState<UserProfileDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Handle email lookup
  const handleEmailLookup = async (email: string) => {
    if (!email || !email.includes('@')) return;

    setEmailLookupLoading(true);
    try {
      const { lookupUserProfileByEmailAction } = await import('../app/event/registration/actions');
      const profile = await lookupUserProfileByEmailAction(email);

      if (profile) {
        setExistingProfile(profile);
        setFormData(prev => ({
          ...prev,
          email: profile.email || email,
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          phone: profile.phone || '',
          isMember: profile.userStatus === 'ACTIVE'
        }));
      } else {
        setExistingProfile(null);
        setFormData(prev => ({
          ...prev,
          email,
          firstName: '',
          lastName: '',
          phone: '',
          isMember: false
        }));
      }
    } catch (error) {
      console.error('Email lookup failed:', error);
    } finally {
      setEmailLookupLoading(false);
    }
  };

  // Debounced email lookup
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.email && formData.email !== existingProfile?.email) {
        handleEmailLookup(formData.email);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.email]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const addGuest = () => {
    setFormData(prev => ({
      ...prev,
      guests: [...prev.guests, { ...defaultGuestData }]
    }));
  };

  const removeGuest = (index: number) => {
    setFormData(prev => ({
      ...prev,
      guests: prev.guests.filter((_, i) => i !== index)
    }));
  };

  const updateGuest = (index: number, field: keyof GuestFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      guests: prev.guests.map((guest, i) =>
        i === index ? { ...guest, [field]: value } : guest
      )
    }));
  };

  const getGuestCounts = () => {
    const counts = { Adult: 0, Teen: 0, Child: 0, Infant: 0 };
    formData.guests.forEach(guest => {
      if (guest.ageGroup in counts) {
        counts[guest.ageGroup as keyof typeof counts]++;
      }
    });
    return counts;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setError('You must be logged in to register for events');
      return;
    }

    if (!formData.termsAccepted) {
      setError('You must accept the terms and conditions');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Import server actions
      const {
        createEventAttendeeAction,
        createUserProfileAction,
        createEventAttendeeGuestAction
      } = await import('../app/event/registration/actions');

      let userProfileId = existingProfile?.id;

      // Create user profile if it doesn't exist
      if (!existingProfile && formData.email) {
        const newProfile = await createUserProfileAction({
          userId,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          userRole: 'MEMBER',
          userStatus: 'PENDING_APPROVAL'
        });
        userProfileId = newProfile.id;
      }

      // Create event attendee
      const attendeeData: Partial<EventAttendeeDTO> = {
        eventId,
        userId: userProfileId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        isMember: formData.isMember,
        specialRequirements: formData.specialRequirements,
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
        emergencyContactRelationship: formData.emergencyContactRelationship,
        dietaryRestrictions: formData.dietaryRestrictions,
        accessibilityNeeds: formData.accessibilityNeeds,
        registrationStatus: 'REGISTERED',
        registrationDate: new Date().toISOString(),
        totalNumberOfGuests: formData.guests.length
      };

      const attendee = await createEventAttendeeAction(attendeeData);

      // Create guests if any
      if (formData.guests.length > 0 && attendee.id) {
        for (const guest of formData.guests) {
          const guestData: Partial<EventAttendeeGuestDTO> = {
            firstName: guest.firstName,
            lastName: guest.lastName,
            email: guest.email,
            phone: guest.phone,
            ageGroup: guest.ageGroup,
            relationship: guest.relationship,
            specialRequirements: guest.specialRequirements,
            registrationStatus: 'REGISTERED'
          };
          await createEventAttendeeGuestAction(attendee.id, guestData);
        }
      }

      setSuccess(true);
      setTimeout(() => {
        router.push(`/event/success?eventId=${eventId}&attendeeId=${attendee.id}`);
      }, 2000);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const guestCounts = getGuestCounts();

  if (success) {
    return (
      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Registration Successful!</h2>
            <p className="text-gray-600 mb-4">
              You have successfully registered for <strong>{eventTitle}</strong>
            </p>
            <p className="text-sm text-gray-500">
              Redirecting to confirmation page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isMemberOnly = eventDetails?.isMemberOnly === true;

  const formContent = (
    <div className="max-w-5xl mx-auto px-8 py-8">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Register for {eventTitle}</h1>
          {isMemberOnly && (
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold">
              <FaLock className="w-4 h-4" />
              Members Only Event
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Lookup Section */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Primary Attendee Information</h3>

            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                placeholder="Enter your email to lookup existing profile"
              />
              {emailLookupLoading && (
                <p className="text-sm text-blue-600 mt-1">Looking up profile...</p>
              )}
              {existingProfile && (
                <p className="text-sm text-green-600 mt-1">
                  ✓ Found existing profile for {existingProfile.firstName} {existingProfile.lastName}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                />
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
              />
            </div>

            <div className="mt-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isMember"
                  checked={formData.isMember}
                  onChange={handleInputChange}
                  className="custom-checkbox"
                  onClick={(e) => e.stopPropagation()}
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  I am a current member
                </span>
              </label>
            </div>
          </div>

          {/* Guest Management Section */}
          <div className="border rounded-lg p-4 bg-blue-50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Guests</h3>
              <button
                type="button"
                onClick={addGuest}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
              >
                <FaPlus />
                Add Guest
              </button>
            </div>

            {/* Guest Counter */}
            {formData.guests.length > 0 && (
              <div className="mb-4 p-3 bg-white rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Guest Summary</h4>
                <div className="flex gap-4 text-sm">
                  {ageGroups.map(({ value, label, icon: Icon }) => (
                    guestCounts[value as keyof typeof guestCounts] > 0 && (
                      <div key={value} className="flex items-center gap-1">
                        <Icon className="text-blue-600" />
                        <span>{guestCounts[value as keyof typeof guestCounts]} {value}</span>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Guest Forms */}
            {formData.guests.map((guest, index) => (
              <div key={index} className="mb-4 p-4 bg-white rounded-lg border">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Guest {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeGuest(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FaTrashAlt />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={guest.firstName}
                      onChange={(e) => updateGuest(index, 'firstName', e.target.value)}
                      required
                      className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={guest.lastName}
                      onChange={(e) => updateGuest(index, 'lastName', e.target.value)}
                      required
                      className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      value={guest.email}
                      onChange={(e) => updateGuest(index, 'email', e.target.value)}
                      className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={guest.phone}
                      onChange={(e) => updateGuest(index, 'phone', e.target.value)}
                      className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Age Group *
                    </label>
                    <select
                      value={guest.ageGroup}
                      onChange={(e) => updateGuest(index, 'ageGroup', e.target.value)}
                      required
                      className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                    >
                      {ageGroups.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Relationship *
                    </label>
                    <select
                      value={guest.relationship}
                      onChange={(e) => updateGuest(index, 'relationship', e.target.value)}
                      required
                      className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                    >
                      <option value="">Select relationship</option>
                      {relationships.map((rel) => (
                        <option key={rel} value={rel}>{rel}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Special Requirements
                  </label>
                  <textarea
                    value={guest.specialRequirements}
                    onChange={(e) => updateGuest(index, 'specialRequirements', e.target.value)}
                    rows={2}
                    className="mt-1 block w-full border border-gray-400 rounded-lg focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                    placeholder="Any special dietary needs, accessibility requirements, etc."
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Additional Information */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Additional Information</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Special Requirements
                </label>
                <textarea
                  name="specialRequirements"
                  value={formData.specialRequirements}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full border border-gray-400 rounded-lg focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                  placeholder="Any special needs or requirements for the event"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Dietary Restrictions
                </label>
                <textarea
                  name="dietaryRestrictions"
                  value={formData.dietaryRestrictions}
                  onChange={handleInputChange}
                  rows={2}
                  className="mt-1 block w-full border border-gray-400 rounded-lg focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                  placeholder="Any dietary restrictions or allergies"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Accessibility Needs
                </label>
                <textarea
                  name="accessibilityNeeds"
                  value={formData.accessibilityNeeds}
                  onChange={handleInputChange}
                  rows={2}
                  className="mt-1 block w-full border border-gray-400 rounded-lg focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                  placeholder="Any accessibility requirements"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Emergency Contact</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contact Name
                </label>
                <input
                  type="text"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Relationship
                </label>
                <input
                  type="text"
                  name="emergencyContactRelationship"
                  value={formData.emergencyContactRelationship}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
                />
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="border rounded-lg p-4 bg-yellow-50">
            <label className="flex items-start">
              <input
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleInputChange}
                required
                className="custom-checkbox mt-1"
                onClick={(e) => e.stopPropagation()}
              />
              <span className="ml-2 text-sm text-gray-700">
                I agree to the <a href="/terms" className="text-blue-600 hover:underline" target="_blank">Terms and Conditions</a> and
                <a href="/privacy" className="text-blue-600 hover:underline ml-1" target="_blank">Privacy Policy</a>.
                I understand that my registration is subject to approval and I will be notified of the status.
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Registering..." : "Complete Registration"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // If event is member-only, wrap with MemberOnlyGuard
  if (isMemberOnly && eventDetails) {
    return (
      <MemberOnlyGuard event={eventDetails}>
        {formContent}
      </MemberOnlyGuard>
    );
  }

  return formContent;
}

'use client';

import { useState } from 'react';
import { submitFocusGroupGuestInterestServer } from './ApiServerActions';

type Props = {
  focusGroupId: number;
  groupName: string;
};

export default function FocusGroupGuestInterestForm({ focusGroupId, groupName }: Props) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const result = await submitFocusGroupGuestInterestServer({
        focusGroupId,
        firstName,
        lastName,
        email,
        phone,
        message,
      });
      if (!result.ok) {
        setError(result.error || 'Could not submit interest.');
        return;
      }
      setSuccess(
        result.alreadyMember
          ? 'You are already on this group’s list. Sign in anytime to manage your membership.'
          : 'Thanks! Your interest was submitted. An organiser may follow up, or you can sign up later to join fully.'
      );
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit interest.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 pt-6 border-t border-gray-200/80">
      <h3 className="text-base font-semibold text-gray-900 mb-1">Express interest without an account</h3>
      <p className="text-sm text-gray-600 mb-4">
        Leave a few details and we&apos;ll add you as a pending interest for {groupName}. You can create an
        account later to join fully.
      </p>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="guest-firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First name *
          </label>
          <input
            id="guest-firstName"
            name="firstName"
            type="text"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
            autoComplete="given-name"
          />
        </div>
        <div>
          <label htmlFor="guest-lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last name *
          </label>
          <input
            id="guest-lastName"
            name="lastName"
            type="text"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
            autoComplete="family-name"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="guest-email" className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            id="guest-email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
            autoComplete="email"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="guest-phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone (optional)
          </label>
          <input
            id="guest-phone"
            name="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
            autoComplete="tel"
          />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="guest-message" className="block text-sm font-medium text-gray-700 mb-1">
            Message (optional)
          </label>
          <textarea
            id="guest-message"
            name="message"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Why you’d like to join…"
            className="w-full border border-gray-400 rounded-xl focus:border-blue-500 focus:ring-blue-500 px-4 py-3 text-base"
          />
        </div>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-12 px-5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold transition-all duration-300 hover:scale-105 border-2 border-amber-300 hover:border-amber-400 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Submit interest"
            aria-label="Submit guest interest"
          >
            {loading ? 'Submitting…' : 'Submit interest'}
          </button>
        </div>
        {error && (
          <p className="sm:col-span-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
        {success && (
          <p className="sm:col-span-2 text-sm text-green-700" role="status">
            {success}
          </p>
        )}
      </form>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import type { PublicProfileDTO } from '@/types/profileSite';

export function ProfileContactPageClient({ profile }: { profile: PublicProfileDTO }) {
  const socials = [
    { label: 'LinkedIn', url: profile.linkedinUrl },
    { label: 'Twitter', url: profile.twitterUrl },
    { label: 'Website', url: profile.websiteUrl },
    { label: 'YouTube', url: profile.youtubeUrl },
  ].filter((s) => s.url?.trim());

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState(false);

  const showContactForm = profile.contactFormEnabled === true;
  const hasBooking = Boolean(profile.bookingUrl?.trim());

  async function submitAudience(payload: {
    email: string;
    firstName?: string;
    lastName?: string;
    message?: string;
  }) {
    setSubmitting(true);
    setFeedback(null);
    setFeedbackError(false);
    try {
      const res = await fetch('/api/public/profile-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        setFeedback(text || 'Something went wrong. Please try again.');
        setFeedbackError(true);
        return;
      }
      setFeedback(
        payload.message ? 'Message sent. Thank you!' : 'You are subscribed to Perspectives. Thank you!'
      );
      setEmail('');
      setFirstName('');
      setLastName('');
      setMessage('');
    } catch {
      setFeedback('Network error. Please try again.');
      setFeedbackError(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      {profile.contactEmail && (
        <p className="font-body text-lg">
          <a href={`mailto:${profile.contactEmail}`} className="text-primary hover:underline">
            {profile.contactEmail}
          </a>
        </p>
      )}

      <div className="flex flex-wrap gap-4">
        {socials.map((s) => (
          <a
            key={s.label}
            href={s.url!}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary font-semibold hover:underline"
          >
            {s.label}
          </a>
        ))}
        {hasBooking && (
          <a
            href={profile.bookingUrl!}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-primary text-primary-foreground rounded-lg font-semibold"
          >
            Schedule a call
          </a>
        )}
      </div>

      <div className="bg-muted/50 rounded-xl p-6 border border-border/30">
        <h2 className="font-heading font-semibold text-lg mb-1">Perspectives newsletter</h2>
        <p className="text-sm text-muted-foreground mb-4">Occasional essays and notes. No spam.</p>
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!email.trim()) return;
            submitAudience({
              email: email.trim(),
              firstName: firstName.trim() || undefined,
              lastName: lastName.trim() || undefined,
            });
          }}
        >
          <input
            type="email"
            required
            placeholder="Email *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-400 rounded-xl px-4 py-3 text-base"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold disabled:opacity-50"
          >
            {submitting ? 'Sending…' : 'Subscribe'}
          </button>
        </form>
      </div>

      {showContactForm && (
        <div className="bg-muted/50 rounded-xl p-6 border border-border/30">
          <h2 className="font-heading font-semibold text-lg mb-1">Collaboration inquiry</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Send a short note — or use Schedule a call if you prefer a calendar link.
          </p>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (!email.trim()) return;
              submitAudience({
                email: email.trim(),
                firstName: firstName.trim() || undefined,
                lastName: lastName.trim() || undefined,
                message: message.trim() || undefined,
              });
            }}
          >
            <input
              type="email"
              required
              placeholder="Email *"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-400 rounded-xl px-4 py-3 text-base"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full border border-gray-400 rounded-xl px-4 py-3 text-base"
              />
              <input
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border border-gray-400 rounded-xl px-4 py-3 text-base"
              />
            </div>
            <textarea
              placeholder="Your message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full border border-gray-400 rounded-xl px-4 py-3 text-base"
            />
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold disabled:opacity-50"
            >
              {submitting ? 'Sending…' : 'Send message'}
            </button>
          </form>
        </div>
      )}

      {feedback && (
        <p className={`text-sm ${feedbackError ? 'text-destructive' : 'text-success'}`}>{feedback}</p>
      )}
    </div>
  );
}

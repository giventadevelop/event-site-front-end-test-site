'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTenantSettings } from '@/components/TenantSettingsProvider';
import { InstagramIcon } from '@/components/icons/InstagramIcon';
import { buildContactFormPayload } from '@/lib/contactForm';

const QUICK_LINKS = [
  { name: 'CATHOLICATE NEWS', href: '/mosc/news' },
  { name: 'DOWNLOADS', href: '/mosc/downloads' },
  { name: 'E-MAIL', href: '/mosc/email' },
  { name: 'GALLERY', href: '/mosc/gallery' },
  { name: 'CONTACT INFO', href: '/mosc/contact-info' },
];

const currentYear = () => new Date().getFullYear();

export default function SyroFooter() {
  const { settings } = useTenantSettings();
  const [formData, setFormData] = useState({ full_name: '', email_address: '', phone_number: '', feedback: '' });
  const hasAnySocial = settings?.facebookUrl?.trim() || settings?.instagramUrl?.trim() || settings?.twitterUrl?.trim() || settings?.linkedinUrl?.trim() || settings?.youtubeUrl?.trim() || settings?.tiktokUrl?.trim();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = formData.full_name.trim();
    const email = formData.email_address.trim();
    const message = formData.feedback.trim();

    if (!name || name.length < 2) {
      setSubmitStatus('error');
      setSubmitMessage('Please enter your name (at least 2 characters).');
      return;
    }
    if (!email) {
      setSubmitStatus('error');
      setSubmitMessage('Please enter your email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setSubmitStatus('error');
      setSubmitMessage('Please enter a valid email address.');
      return;
    }
    if (!message || message.length < 10) {
      setSubmitStatus('error');
      setSubmitMessage('Please enter a message (at least 10 characters).');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');

    const [firstName, ...restNameParts] = name.split(' ');
    const lastName = restNameParts.join(' ').trim() || 'N/A';
    const messageBody = formData.phone_number.trim()
      ? `${message}\n\nPhone: ${formData.phone_number.trim()}`
      : message;

    const payload = buildContactFormPayload({
      firstName,
      lastName,
      messageBody,
      senderEmail: email,
    });

    try {
      const response = await fetch('/api/proxy/contact-form-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setSubmitMessage('Thank you for your message! We will get back to you soon.');
        setFormData({ full_name: '', email_address: '', phone_number: '', feedback: '' });
        setTimeout(() => {
          setSubmitStatus('idle');
          setSubmitMessage('');
        }, 5000);
      } else {
        setSubmitStatus('error');
        setSubmitMessage(data.error || 'Failed to send message. Please try again.');
        setTimeout(() => {
          setSubmitStatus('idle');
          setSubmitMessage('');
        }, 5000);
      }
    } catch (err) {
      setSubmitStatus('error');
      setSubmitMessage('An error occurred. Please try again later.');
      console.error('Footer contact form error:', err);
      setTimeout(() => {
        setSubmitStatus('idle');
        setSubmitMessage('');
      }, 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer>
      <div className="footer-container">
        <div className="row">
          <div className="col-lg-4 footer-section-1">
            <span className="contact-title">CONTACT US</span>
            <form
              action="#"
              className=""
              id="contact-form"
              autoComplete="off"
              method="post"
              acceptCharset="utf-8"
              onSubmit={handleSubmit}
            >
              <div className="contact-us">
                <div className="form-floating mb-2 subscribe-email-container">
                  <input
                    type="text"
                    className="form-control subscribe-email"
                    name="full_name"
                    id="contact-name"
                    value={formData.full_name}
                    onChange={(e) => setFormData((p) => ({ ...p, full_name: e.target.value }))}
                    disabled={isSubmitting}
                    required
                    aria-required="true"
                  />
                  <label htmlFor="contact-name">Name <span className="text-red-500" aria-hidden="true">*</span></label>
                </div>
                <div className="form-floating mb-2 subscribe-email-container">
                  <input
                    type="email"
                    className="form-control subscribe-email"
                    name="email_address"
                    id="contact-email"
                    pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$"
                    value={formData.email_address}
                    onChange={(e) => setFormData((p) => ({ ...p, email_address: e.target.value }))}
                    disabled={isSubmitting}
                    required
                    aria-required="true"
                  />
                  <label htmlFor="contact-email">Email <span className="text-red-500" aria-hidden="true">*</span></label>
                </div>
                <div className="form-floating mb-2 subscribe-email-container">
                  <input
                    type="tel"
                    className="form-control subscribe-email"
                    name="phone_number"
                    id="contact-phone"
                    value={formData.phone_number}
                    onChange={(e) => setFormData((p) => ({ ...p, phone_number: e.target.value }))}
                    disabled={isSubmitting}
                    required
                    aria-required="true"
                  />
                  <label htmlFor="contact-phone">Phone <span className="text-red-500" aria-hidden="true">*</span></label>
                </div>
                <div className="form-floating mb-4 subscribe-email-container">
                  <textarea
                    className="form-control subscribe-email"
                    cols={3}
                    name="feedback"
                    id="contact-message"
                    value={formData.feedback}
                    onChange={(e) => setFormData((p) => ({ ...p, feedback: e.target.value }))}
                    disabled={isSubmitting}
                    required
                    aria-required="true"
                  />
                  <label htmlFor="contact-message">Message <span className="text-red-500" aria-hidden="true">*</span></label>
                </div>
                {submitStatus !== 'idle' && (
                  <p className="mb-3 text-white small" role="status" aria-live="polite">
                    {submitMessage}
                  </p>
                )}
                <button type="submit" className="primary-button submit-btn" disabled={isSubmitting}>
                  <span>{isSubmitting ? 'Sending...' : 'Submit'}</span>
                  <i className="fa-solid fa-arrow-right-long ms-3" />
                </button>
              </div>
            </form>
          </div>
          <div className="col-lg-5 footer-section-2 ps-5">
            <div className="row">
              <div className="col-lg-4">
                <div className="footer-widget">
                  <h4 className="mb-4">Quick Links</h4>
                  <div id="footer-quicklinks">
                    {QUICK_LINKS.map((link) => (
                      <Link key={link.href} href={link.href}>
                        <p className="mb-3">{link.name}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="footer-widget">
                  <h4 className="mb-4">Upcoming Events</h4>
                  <div id="latest_events">
                    <p className="mb-3 text-white-50">Visit our events page for upcoming events.</p>
                  </div>
                </div>
                <div className="social-media">
                  <h6 className="mb-2 text-white">Social With Us</h6>
                  <ul id="socialmedias" className="list-unstyled d-flex flex-wrap gap-2 align-items-center p-2">
                    {hasAnySocial && (
                      <>
                        {settings?.facebookUrl?.trim() && (
                          <li>
                            <a href={settings.facebookUrl.trim()} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-10 h-10 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md border border-white/20" title="Follow us on Facebook" aria-label="Follow us on Facebook">
                              <svg className="w-5 h-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                            </a>
                          </li>
                        )}
                        {settings?.instagramUrl?.trim() && (
                          <li>
                            <a href={settings.instagramUrl.trim()} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-10 h-10 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md border border-white/20" title="Follow us on Instagram" aria-label="Follow us on Instagram">
                              <InstagramIcon className="w-5 h-5 text-[#E4405F]" />
                            </a>
                          </li>
                        )}
                        {settings?.twitterUrl?.trim() && (
                          <li>
                            <a href={settings.twitterUrl.trim()} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-10 h-10 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md border border-white/20" title="Follow us on X (Twitter)" aria-label="Follow us on X (Twitter)">
                              <svg className="w-5 h-5 text-neutral-900" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                            </a>
                          </li>
                        )}
                        {settings?.linkedinUrl?.trim() && (
                          <li>
                            <a href={settings.linkedinUrl.trim()} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-10 h-10 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md border border-white/20" title="Connect with us on LinkedIn" aria-label="Connect with us on LinkedIn">
                              <svg className="w-5 h-5 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.047-1.852-3.047-1.853 0-2.136 1.445-2.136 2.939v5.677H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                            </a>
                          </li>
                        )}
                        {settings?.youtubeUrl?.trim() && (
                          <li>
                            <a href={settings.youtubeUrl.trim()} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-10 h-10 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md border border-white/20" title="Subscribe to our YouTube channel" aria-label="Subscribe to our YouTube channel">
                              <svg className="w-5 h-5 text-[#FF0000]" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                            </a>
                          </li>
                        )}
                        {settings?.tiktokUrl?.trim() && (
                          <li>
                            <a href={settings.tiktokUrl.trim()} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-10 h-10 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-md border border-white/20" title="Follow us on TikTok" aria-label="Follow us on TikTok">
                              <svg className="w-5 h-5 text-[#000000]" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                            </a>
                          </li>
                        )}
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-3 footer-section-2 pe-5">
            <div className="footer-widget">
              <h4 className="mb-4">Contact Information</h4>
              <p className="mb-1">Headquarters:</p>
              <p className="mb-1">
                Catholicate Palace
                <br />
                Devalokam, Kottayam
                <br />
                Kerala, India
              </p>
              <p className="mb-1">Phone: +91-481-2300-700</p>
              <p className="mb-0">Email: info@mosc.in</p>
            </div>
          </div>
        </div>
        <div className="row footer-bottom-row">
          <div className="col-lg-4 footer-section-11 d-none d-lg-block">
            <ul className="list-unstyled">
              <li className="float-end copy-right">
                <Link href="/mosc">© {currentYear()} The Malankara Orthodox Church. All rights reserved.</Link>
              </li>
            </ul>
          </div>
          <div className="col-lg-8 footer-section-2 made-by pe-5">
            <ul className="d-none d-lg-block list-unstyled">
              <li className="float-end">
                <p className="text-white mb-0">Giventa Inc. USA</p>
              </li>
            </ul>
            <div className="footer-bottom">
              <p className="text-white text-center mb-2 d-block d-lg-none">Giventa Inc. USA</p>
              <p className="text-white text-center mb-2 d-block d-lg-none">
                © {currentYear()} The Malankara Orthodox Church.
                <span className="block mt-1">All rights reserved.</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

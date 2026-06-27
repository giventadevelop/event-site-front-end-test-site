'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useTenantSettings } from '@/components/TenantSettingsProvider';
import { MOSC_REDESIGN_FOOTER_QUICK_LINKS } from './navConfig';
import { InstagramIcon } from '@/components/icons/InstagramIcon';
import { buildContactFormPayload } from '@/lib/contactForm';

/** Primary CTA — mosc_re_design_latest_design_system.json `components.button.primary` + Liturgical Calendar active toggle */
const FOOTER_SUBMIT_BUTTON_CLASS =
  'w-full rounded-full bg-burgundy px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-burgundy/30 transition-all duration-200 hover:bg-burgundy-dark hover:shadow-lg hover:shadow-burgundy/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-burgundy focus-visible:ring-offset-2 focus-visible:ring-offset-parchment disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-burgundy disabled:hover:shadow-md';

/** Pink-red social icons (reverted from burgundy); hover echoes pre-change warmGold accent. ~28px, overflow-visible avoids clipping. */
const FOOTER_SOCIAL_LINK_CLASS =
  'inline-flex items-center justify-center rounded-full p-1 leading-none text-rose-600 transition-colors hover:bg-rose-500/10 hover:text-warmGold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50';
const FOOTER_SOCIAL_SVG_CLASS = 'block h-7 w-7 shrink-0 overflow-visible';

export default function MoscRedesignFooter() {
  const { settings } = useTenantSettings();
  const [formData, setFormData] = useState({ full_name: '', email_address: '', phone_number: '', feedback: '' });
  const hasAnySocial =
    settings?.facebookUrl?.trim() ||
    settings?.instagramUrl?.trim() ||
    settings?.youtubeUrl?.trim() ||
    settings?.tiktokUrl?.trim();
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
    <footer className="border-t-2 border-burgundy/25 bg-parchment text-warmBrown-dark shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact form */}
          <div>
            <h3 className="text-warmGold font-bold text-sm tracking-widest mb-4 border-b border-warmGold/40 pb-2">
              CONTACT US
            </h3>
            <form onSubmit={handleSubmit} className="space-y-3" autoComplete="off">
              <input
                type="text"
                name="full_name"
                placeholder="Full Name"
                value={formData.full_name}
                onChange={(e) => setFormData((p) => ({ ...p, full_name: e.target.value }))}
                className="w-full px-3 py-2 rounded border border-warmBrown/25 bg-white text-warmBrown-dark placeholder:text-warmGray-dark/55 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-warmGold/45"
              />
              <input
                type="email"
                name="email_address"
                placeholder="Email Address"
                value={formData.email_address}
                onChange={(e) => setFormData((p) => ({ ...p, email_address: e.target.value }))}
                className="w-full px-3 py-2 rounded border border-warmBrown/25 bg-white text-warmBrown-dark placeholder:text-warmGray-dark/55 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-warmGold/45"
              />
              <input
                type="tel"
                name="phone_number"
                placeholder="Phone Number"
                value={formData.phone_number}
                onChange={(e) => setFormData((p) => ({ ...p, phone_number: e.target.value }))}
                className="w-full px-3 py-2 rounded border border-warmBrown/25 bg-white text-warmBrown-dark placeholder:text-warmGray-dark/55 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-warmGold/45"
              />
              <textarea
                name="feedback"
                placeholder="Your Message"
                rows={4}
                value={formData.feedback}
                onChange={(e) => setFormData((p) => ({ ...p, feedback: e.target.value }))}
                className="w-full px-3 py-2 rounded border border-warmBrown/25 bg-white text-warmBrown-dark placeholder:text-warmGray-dark/55 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-warmGold/45 resize-none"
              />
              {submitMessage && (
                <p
                  className={`text-xs ${submitStatus === 'success' ? 'text-green-700' : 'text-red-600'}`}
                  role="status"
                >
                  {submitMessage}
                </p>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className={FOOTER_SUBMIT_BUTTON_CLASS}
              >
                {isSubmitting ? 'Sending...' : 'Submit'}
              </button>
            </form>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-warmGold font-bold text-sm tracking-widest mb-4 border-b border-warmGold/40 pb-2">
              QUICK LINKS
            </h3>
            <ul className="space-y-2">
              {MOSC_REDESIGN_FOOTER_QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-warmGray-dark hover:text-burgundy-dark text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Logo + social — parchment footer matches header strip so crest maroon/gold reads clearly */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 w-fit max-w-full">
              <div>
                <div className="relative h-28 w-28 sm:h-28 sm:w-28 mx-auto">
                  <Image
                    src="/images/logos/Current_Edits/MOSC-Logo-only.png"
                    alt="Malankara Orthodox Syrian Church"
                    fill
                    className="object-contain drop-shadow-sm"
                    sizes="(max-width: 640px) 112px, 112px"
                  />
                </div>
              </div>
            </div>
            <p className="text-warmGray-dark/90 text-xs leading-relaxed max-w-xs">
              The Malankara Orthodox Syrian Church traces its origins to the apostolic mission of St. Thomas in India.
            </p>
            {hasAnySocial && (
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 overflow-visible">
                {settings?.facebookUrl?.trim() && (
                  <a
                    href="https://www.facebook.com/catholicatenews.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={FOOTER_SOCIAL_LINK_CLASS}
                    aria-label="Facebook"
                  >
                    <svg className={FOOTER_SOCIAL_SVG_CLASS} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </a>
                )}
                {settings?.instagramUrl?.trim() && (
                  <a
                    href="https://www.instagram.com/malankara_sabha?fbclid=IwY2xjawQvK5tleHRuA2FlbQIxMABicmlkETBMTVQ5UFdQa0dmQlFyYzNSc3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHlkCQWoyNFMKgQSqpGL4xBnm4kYXRK9mSTH54avT-vHV9yn2cuQG3fd-Z0Sy_aem_w-t6H5HlT-irapc29vb1ng"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={FOOTER_SOCIAL_LINK_CLASS}
                    aria-label="Instagram"
                  >
                    <InstagramIcon className={FOOTER_SOCIAL_SVG_CLASS} />
                  </a>
                )}
                {settings?.youtubeUrl?.trim() && (
                  <a
                    href="https://www.youtube.com/@newscatholicate"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={FOOTER_SOCIAL_LINK_CLASS}
                    aria-label="YouTube"
                  >
                    {/* Larger, centered YouTube glyph with full-height rounded container + clear play cutout. */}
                    <svg className="block h-8 w-8 shrink-0 overflow-visible" viewBox="0 0 24 24" aria-hidden>
                      <rect x="1.5" y="5" width="21" height="14" rx="4.5" fill="currentColor" />
                      <path fill="#F5EDD8" d="M10 9.2v5.6l5.6-2.8L10 9.2z" />
                    </svg>
                  </a>
                )}
                {settings?.tiktokUrl?.trim() && (
                  <a
                    href={settings.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={FOOTER_SOCIAL_LINK_CLASS}
                    aria-label="TikTok"
                  >
                    <svg className={FOOTER_SOCIAL_SVG_CLASS} fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.918-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.01-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48.01 2.96.02 4.44-.9-.24-1.92-.2-2.75.29-.82.48-1.39 1.3-1.59 2.22-.1.42-.14.86-.12 1.29.12 1.09.77 2.09 1.7 2.6.94.52 2.12.55 3.08.08 1.02-.5 1.68-1.56 1.78-2.67.07-.53.04-1.07.05-1.61-.01-4.09.02-8.18-.02-12.27z" />
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 mt-6 pt-5 border-t border-warmBrown/20">
          <div className="flex flex-col items-center gap-2">
            <p className="text-warmGray-dark/80 text-xs text-center">
              © {new Date().getFullYear()} Malankara Orthodox Syrian Church. All rights reserved.
            </p>
            <p className="text-warmGray-dark/65 text-[11px] text-center">
              Powered by{' '}
              <a
                href="https://www.giventa.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-burgundy-dark/90 hover:text-warmGold transition-colors underline-offset-2 hover:underline"
              >
                Giventa Inc., USA
              </a>
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-xs pt-1">
              <Link href="/mosc-redesign/privacy-policy" className="text-warmGray-dark/85 hover:text-burgundy-dark transition-colors">
                Privacy Policy
              </Link>
              <Link href="/mosc-redesign/terms-of-use" className="text-warmGray-dark/85 hover:text-burgundy-dark transition-colors">
                Terms of Use
              </Link>
              <Link href="/mosc-redesign/sitemap" className="text-warmGray-dark/85 hover:text-burgundy-dark transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

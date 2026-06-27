"use client";

import Image from "next/image";
import Link from "next/link";
import { Facebook, Linkedin, Youtube, ArrowUp, Mail, Phone, MapPin } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useTenantSettings } from "@/components/TenantSettingsProvider";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { formatAddressBlock } from "@/lib/formatAddress";

// Back-to-top button component with comprehensive styling
const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <button
      onClick={scrollToTop}
      className={`
        fixed bottom-6 right-6 z-50
        w-14 h-14 min-w-[56px] min-h-[56px]
        bg-blue-600 hover:bg-blue-700 active:bg-blue-800
        text-white rounded-full
        flex items-center justify-center
        shadow-xl hover:shadow-2xl
        font-inter font-medium
        focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2
        transition-all duration-300 ease-in-out
        hover:scale-110 active:scale-95
        touch-manipulation
        ${isVisible ? 'translate-y-0 opacity-100 visible' : 'translate-y-4 opacity-0 invisible'}
      `}
      aria-label="Back to top"
    >
      <ArrowUp
        className="w-6 h-6 transition-transform duration-300 group-hover:-translate-y-0.5"
        strokeWidth={2.5}
        aria-hidden="true"
      />
    </button>
  );
};

const linkBaseClass =
  'flex items-center justify-center w-10 h-10 text-gray-400 hover:text-white rounded-lg transition-all duration-300 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900';

const Footer = () => {
  const { settings, organizationIdentity } = useTenantSettings();
  const hasAnySocial = settings?.facebookUrl?.trim() || settings?.instagramUrl?.trim() || settings?.twitterUrl?.trim() || settings?.linkedinUrl?.trim() || settings?.youtubeUrl?.trim() || settings?.tiktokUrl?.trim();
  const formattedAddress = formatAddressBlock(organizationIdentity);
  const contactEmail = settings?.email?.trim() || '';
  const contactPhone = settings?.phoneNumber?.trim() || '';
  const footerDescription =
    organizationIdentity.description?.trim() ||
    'Making a difference in communities worldwide through compassionate action and sustainable impact.';

  return (
    <footer className="bg-gray-900 text-gray-300 footer-edge-to-edge mt-20" data-testid="main-footer" role="contentinfo">
      {/* Main Footer Content */}
      <div className="w-full bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">

            {/* Column 1: Logo and Social Media - icons only when tenant URLs are set */}
            <div className="lg:col-span-1">
              <Link href="/charity-theme" className="inline-block mb-6">
                <Image
                  src="https://cdn.builder.io/api/v1/image/assets%2Fa70a28525f6f491aaa751610252a199c%2Fd7543f582d4f477599d341da96d48e2b?format=webp&width=800"
                  alt="Malayalees Friends Logo"
                  width={150}
                  height={150}
                  priority
                  className="h-12 w-auto"
                />
              </Link>

              <p className="text-gray-400 mb-6 font-inter text-sm leading-relaxed">
                {footerDescription}
              </p>

              {hasAnySocial && (
                <div className="mb-6">
                  <p className="text-white font-inter font-medium text-sm mb-4">Follow our journey</p>
                  <ul className="flex flex-wrap gap-2">
                    {settings?.facebookUrl?.trim() && (
                      <li>
                        <a href={settings.facebookUrl.trim()} target="_blank" rel="noopener noreferrer" className={`${linkBaseClass} bg-gray-800 hover:bg-blue-600 focus:ring-blue-600`} aria-label="Follow us on Facebook">
                          <Facebook size={18} strokeWidth={2} />
                        </a>
                      </li>
                    )}
                    {settings?.instagramUrl?.trim() && (
                      <li>
                        <a href={settings.instagramUrl.trim()} target="_blank" rel="noopener noreferrer" className={`${linkBaseClass} bg-gray-800 hover:bg-pink-600 focus:ring-pink-600`} aria-label="Follow us on Instagram">
                          <InstagramIcon className="w-5 h-5" />
                        </a>
                      </li>
                    )}
                    {settings?.twitterUrl?.trim() && (
                      <li>
                        <a href={settings.twitterUrl.trim()} target="_blank" rel="noopener noreferrer" className={`${linkBaseClass} bg-gray-800 hover:bg-blue-400 focus:ring-blue-400`} aria-label="Follow us on X (Twitter)">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        </a>
                      </li>
                    )}
                    {settings?.linkedinUrl?.trim() && (
                      <li>
                        <a href={settings.linkedinUrl.trim()} target="_blank" rel="noopener noreferrer" className={`${linkBaseClass} bg-gray-800 hover:bg-blue-700 focus:ring-blue-700`} aria-label="Connect with us on LinkedIn">
                          <Linkedin size={18} strokeWidth={2} />
                        </a>
                      </li>
                    )}
                    {settings?.youtubeUrl?.trim() && (
                      <li>
                        <a href={settings.youtubeUrl.trim()} target="_blank" rel="noopener noreferrer" className={`${linkBaseClass} bg-gray-800 hover:bg-red-600 focus:ring-red-600`} aria-label="Subscribe to our YouTube channel">
                          <Youtube size={18} strokeWidth={2} />
                        </a>
                      </li>
                    )}
                    {settings?.tiktokUrl?.trim() && (
                      <li>
                        <a href={settings.tiktokUrl.trim()} target="_blank" rel="noopener noreferrer" className={`${linkBaseClass} bg-gray-800 hover:bg-gray-600 focus:ring-gray-500`} aria-label="Follow us on TikTok">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            {/* Column 2: Contact Information */}
            <div>
              <h6 className="text-white font-inter font-semibold text-lg mb-6 tracking-wide">Get in Touch</h6>

              <div className="space-y-4">
                {formattedAddress && (
                  <div className="flex items-start space-x-3">
                    <MapPin size={18} className="text-blue-400 mt-1 flex-shrink-0" strokeWidth={2} />
                    <p className="text-gray-400 font-inter text-sm leading-relaxed whitespace-pre-wrap">
                      {formattedAddress}
                    </p>
                  </div>
                )}

                {contactPhone && (
                  <div className="flex items-center space-x-3">
                    <Phone size={18} className="text-blue-400 flex-shrink-0" strokeWidth={2} />
                    <p>
                      <a
                        href={`tel:${contactPhone.replace(/\s/g, '')}`}
                        className="text-gray-300 hover:text-white font-inter text-sm transition-colors duration-300 focus:outline-none focus:text-white"
                      >
                        {contactPhone}
                      </a>
                    </p>
                  </div>
                )}

                {contactEmail && (
                  <div className="flex items-center space-x-3">
                    <Mail size={18} className="text-blue-400 flex-shrink-0" strokeWidth={2} />
                    <p>
                      <a
                        href={`mailto:${contactEmail}`}
                        className="text-blue-400 hover:text-blue-300 font-inter text-sm transition-colors duration-300 focus:outline-none focus:text-blue-300"
                      >
                        {contactEmail}
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Column 3: Quick Links */}
            <div>
              <h6 className="text-white font-inter font-semibold text-lg mb-6 tracking-wide">Quick Links</h6>
              <nav>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="/charity-theme"
                      className="text-gray-300 hover:text-white font-inter text-sm transition-colors duration-300 hover:translate-x-1 transform focus:outline-none focus:text-white block"
                    >
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#about"
                      className="text-gray-300 hover:text-white font-inter text-sm transition-colors duration-300 hover:translate-x-1 transform focus:outline-none focus:text-white block"
                    >
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#causes"
                      className="text-gray-300 hover:text-white font-inter text-sm transition-colors duration-300 hover:translate-x-1 transform focus:outline-none focus:text-white block"
                    >
                      Our Causes
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#events"
                      className="text-gray-300 hover:text-white font-inter text-sm transition-colors duration-300 hover:translate-x-1 transform focus:outline-none focus:text-white block"
                    >
                      Events
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#contact"
                      className="text-gray-300 hover:text-white font-inter text-sm transition-colors duration-300 hover:translate-x-1 transform focus:outline-none focus:text-white block"
                    >
                      Contact
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>

            {/* Column 4: Support & Resources */}
            <div>
              <h6 className="text-white font-inter font-semibold text-lg mb-6 tracking-wide">Ways to Help</h6>
              <nav>
                <ul className="space-y-3">
                  <li>
                    <Link
                      href="#donate"
                      className="text-gray-300 hover:text-blue-400 font-inter text-sm transition-colors duration-300 hover:translate-x-1 transform focus:outline-none focus:text-blue-400 block"
                    >
                      Make a Donation
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#volunteer"
                      className="text-gray-300 hover:text-blue-400 font-inter text-sm transition-colors duration-300 hover:translate-x-1 transform focus:outline-none focus:text-blue-400 block"
                    >
                      Become a Volunteer
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#fundraise"
                      className="text-gray-300 hover:text-blue-400 font-inter text-sm transition-colors duration-300 hover:translate-x-1 transform focus:outline-none focus:text-blue-400 block"
                    >
                      Start a Fundraiser
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#sponsor"
                      className="text-gray-300 hover:text-blue-400 font-inter text-sm transition-colors duration-300 hover:translate-x-1 transform focus:outline-none focus:text-blue-400 block"
                    >
                      Corporate Sponsorship
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="#newsletter"
                      className="text-gray-300 hover:text-blue-400 font-inter text-sm transition-colors duration-300 hover:translate-x-1 transform focus:outline-none focus:text-blue-400 block"
                    >
                      Newsletter Signup
                    </Link>
                  </li>
                </ul>
              </nav>
            </div>

          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <div className="bg-gray-900 border-t border-gray-800 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 font-inter text-sm text-center md:text-left">
              © 2024{' '}
              <Link
                href="/charity-theme"
                className="text-white hover:text-blue-400 transition-colors duration-300 focus:outline-none focus:text-blue-400"
              >
                Malayalees US Charity Organization
              </Link>
              .<span className="block md:inline"> All rights reserved.</span> Making hope happen.
            </p>

            <nav className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
              <Link
                href="#privacy"
                className="text-gray-400 hover:text-white font-inter text-sm transition-colors duration-300 focus:outline-none focus:text-white"
              >
                Privacy Policy
              </Link>
              <Link
                href="#terms"
                className="text-gray-400 hover:text-white font-inter text-sm transition-colors duration-300 focus:outline-none focus:text-white"
              >
                Terms of Service
              </Link>
              <Link
                href="#accessibility"
                className="text-gray-400 hover:text-white font-inter text-sm transition-colors duration-300 focus:outline-none focus:text-white"
              >
                Accessibility
              </Link>
            </nav>
          </div>
        </div>
      </div>

      <BackToTopButton />
    </footer>
  );
};

export default Footer;

"use client";

import Image from "next/image";
import Link from "next/link";
import { Facebook, Twitter, Linkedin, Youtube, ArrowUp, Mail, Phone, MapPin } from "lucide-react";
import React, { useEffect, useState } from "react";

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

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 footer-edge-to-edge mt-20">
      {/* Main Footer Content */}
      <div className="w-full bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">

            {/* Column 1: Logo and Social Media */}
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
                Making a difference in communities worldwide through compassionate action and sustainable impact.
              </p>

              <div className="mb-6">
                <p className="text-white font-inter font-medium text-sm mb-4">Follow our journey</p>
                <ul className="flex space-x-4">
                  <li>
                    <a
                      href="#"
                      className="
                        flex items-center justify-center w-10 h-10
                        text-gray-400 hover:text-white
                        bg-gray-800 hover:bg-blue-600
                        rounded-lg transition-all duration-300
                        hover:scale-110 active:scale-95
                        focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-gray-900
                      "
                      aria-label="Follow us on Facebook"
                    >
                      <Facebook size={18} strokeWidth={2} />
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="
                        flex items-center justify-center w-10 h-10
                        text-gray-400 hover:text-white
                        bg-gray-800 hover:bg-blue-400
                        rounded-lg transition-all duration-300
                        hover:scale-110 active:scale-95
                        focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900
                      "
                      aria-label="Follow us on Twitter"
                    >
                      <Twitter size={18} strokeWidth={2} />
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="
                        flex items-center justify-center w-10 h-10
                        text-gray-400 hover:text-white
                        bg-gray-800 hover:bg-blue-700
                        rounded-lg transition-all duration-300
                        hover:scale-110 active:scale-95
                        focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 focus:ring-offset-gray-900
                      "
                      aria-label="Connect with us on LinkedIn"
                    >
                      <Linkedin size={18} strokeWidth={2} />
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="
                        flex items-center justify-center w-10 h-10
                        text-gray-400 hover:text-white
                        bg-gray-800 hover:bg-red-600
                        rounded-lg transition-all duration-300
                        hover:scale-110 active:scale-95
                        focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-gray-900
                      "
                      aria-label="Subscribe to our YouTube channel"
                    >
                      <Youtube size={18} strokeWidth={2} />
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Column 2: Contact Information */}
            <div>
              <h6 className="text-white font-inter font-semibold text-lg mb-6 tracking-wide">Get in Touch</h6>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <MapPin size={18} className="text-blue-400 mt-1 flex-shrink-0" strokeWidth={2} />
                  <p className="text-gray-400 font-inter text-sm leading-relaxed">
                    123 Charity Lane<br />
                    Hope City, HC 12345<br />
                    United States
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <Phone size={18} className="text-blue-400 flex-shrink-0" strokeWidth={2} />
                  <div className="space-y-1">
                    <p>
                      <a
                        href="tel:+15551234567"
                        className="text-gray-300 hover:text-white font-inter text-sm transition-colors duration-300 focus:outline-none focus:text-white"
                      >
                        +1 (555) 123-4567
                      </a>
                    </p>
                    <p>
                      <a
                        href="tel:+18005551234"
                        className="text-gray-300 hover:text-white font-inter text-sm transition-colors duration-300 focus:outline-none focus:text-white"
                      >
                        1-800-555-1234 (Toll Free)
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Mail size={18} className="text-blue-400 flex-shrink-0" strokeWidth={2} />
                  <p>
                    <a
                      href="mailto:contact@charityorg.com"
                      className="text-blue-400 hover:text-blue-300 font-inter text-sm transition-colors duration-300 focus:outline-none focus:text-blue-300"
                    >
                      contact@charityorg.com
                    </a>
                  </p>
                </div>
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
              . All rights reserved. Making hope happen.
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
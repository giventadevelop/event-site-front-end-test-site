'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuth, useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import HeroSection from '../components/HeroSection';
import LiveEventsSection from '../components/LiveEventsSection';
import FeaturedEventsSection from '../components/FeaturedEventsSection';
import ServicesSection from '../components/ServicesSection';
import AboutSection from '../components/AboutSection';
import UpcomingEventsSection from '../components/UpcomingEventsSection';
import CausesSection from '../components/CausesSection';
import TeamSection from '../components/TeamSection';
import SquadRosterSection from '../components/squad/SquadRosterSection';
import OurSponsorsSection from '../components/OurSponsorsSection';
import ProjectsSection from '../components/ProjectsSection';
import TestimonialsSection from '../components/TestimonialsSection';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useTenantSettings } from '@/components/TenantSettingsProvider';
import { bootstrapUserProfile } from '@/components/ProfileBootstrapperApiServerActions';
import Link from 'next/link';
import type { FeaturedEventWithMedia } from '@/lib/homepage/featuredEvents';
import HomeParticleBackground from '../components/HomeParticleBackground';
import { InstagramIcon } from '@/components/icons/InstagramIcon';
import { HomeSectionRail } from '@/components/HomeSectionRail';
import { HomeSectionTitle } from '@/components/HomeSectionTitle';

// Fallback components for when data is not available
const EventsFallback = () => (
  <section className="py-24 bg-green-50">
    <HomeSectionRail eyebrow="Events" containerClassName="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <HomeSectionTitle className="text-3xl md:text-4xl font-bold mb-4">
          Our Upcoming Events
        </HomeSectionTitle>
      </div>
      <div className="text-center text-gray-500 py-8">
        <div className="homepage-glass-card services-glass-card-face bg-white rounded-lg p-8 max-w-md mx-auto">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Upcoming Events Information Temporarily Unavailable</h3>
          <p className="text-gray-500">We're currently updating our upcoming events information. Please check back later.</p>
        </div>
      </div>
    </HomeSectionRail>
  </section>
);

const TeamFallback = () => (
  <section id="team-section" className="py-24 bg-green-50">
    <HomeSectionRail eyebrow="Our team" containerClassName="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <HomeSectionTitle className="text-3xl md:text-4xl font-bold mb-4">
          Meet Our Team
        </HomeSectionTitle>
      </div>
      <div className="text-center text-gray-500 py-8">
        <div className="homepage-glass-card services-glass-card-face bg-white rounded-lg p-8 max-w-md mx-auto">
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Team Members Information Temporarily Unavailable</h3>
          <p className="text-gray-500">We're currently updating our team members information. Please check back later.</p>
        </div>
      </div>
    </HomeSectionRail>
  </section>
);

// Main content component that uses tenant settings
function HomePageContent({ initialFeaturedEvents }: { initialFeaturedEvents: FeaturedEventWithMedia[] }) {
  const {
    showEventsSection,
    showSquadSection,
    showExecutiveCommitteeSection,
    showTeamSection,
    showSponsorsSection,
    loading,
    settings,
  } = useTenantSettings();
  const hasAnySocial = settings?.facebookUrl?.trim() || settings?.instagramUrl?.trim() || settings?.twitterUrl?.trim() || settings?.linkedinUrl?.trim() || settings?.youtubeUrl?.trim() || settings?.tiktokUrl?.trim();

  // Handle hash navigation on page load and hash changes
  useEffect(() => {
    const handleHashNavigation = () => {
      const hash = window.location.hash;
      if (hash) {
        const targetId = hash.substring(1);

        // Show loading indicator for team section
        if (targetId === 'team-section') {
          showNavigationLoading();
        }

        // Wait for element to exist before scrolling (especially important for dynamically loaded sections)
        // CRITICAL: For team-section, also wait for tenant settings to load
        const maxWaitTime = 15000; // 15 seconds max wait (increased for team section)
        const pollInterval = 100; // Check every 100ms
        const startTime = Date.now();
        const headerHeight = 128;

        const waitForElementAndScroll = () => {
          const element = document.getElementById(targetId);

          if (element) {
            // CRITICAL: For team-section, ensure it's fully rendered and visible
            // Check if element has content (not just the container)
            if (targetId === 'team-section') {
              // Wait for tenant settings to load first
              if (loading) {
                const elapsed = Date.now() - startTime;
                if (elapsed < maxWaitTime) {
                  setTimeout(waitForElementAndScroll, pollInterval);
                  return;
                }
              }

              // Check if team section is actually shown (not hidden by settings)
              if (!showTeamSection) {
                console.warn('[HomePage] Team section is not enabled in tenant settings');
                hideNavigationLoading();
                return;
              }

              // Check if element has actual content (team members loaded)
              const hasContent = element.querySelector('.max-w-7xl') &&
                                 (element.querySelector('.grid') || element.querySelector('.flex'));
              if (!hasContent) {
                // Element exists but content not loaded yet, keep waiting
                const elapsed = Date.now() - startTime;
                if (elapsed < maxWaitTime) {
                  setTimeout(waitForElementAndScroll, pollInterval);
                  return;
                }
              }
            }

            // Element exists and is ready, scroll to it with proper offset
            // Use larger offset to ensure section is fully visible above the fold
            const scrollOffset = targetId === 'team-section' ? headerHeight + 40 : headerHeight + 20;
            const targetPosition = element.offsetTop - scrollOffset;

            // Ensure we scroll to the correct element by verifying the ID matches
            if (element.id === targetId) {
              // Small delay to ensure layout is stable before scrolling
              setTimeout(() => {
                window.scrollTo({
                  top: Math.max(0, targetPosition),
                  behavior: 'smooth'
                });
                hideNavigationLoading();
                console.log('[HomePage] Successfully scrolled to:', targetId, 'at position:', targetPosition);
              }, 100);
              return;
            }
          }

          // Element doesn't exist yet
          const elapsed = Date.now() - startTime;
          if (elapsed < maxWaitTime) {
            // Keep waiting
            setTimeout(waitForElementAndScroll, pollInterval);
          } else {
            // Timeout reached
            console.warn('[HomePage] Timeout waiting for element:', targetId);
            hideNavigationLoading();
          }
        };

        // Start waiting for element
        waitForElementAndScroll();
      } else {
        // No hash, hide any existing loading indicator
        hideNavigationLoading();
      }
    };

    // Helper functions for loading indicator
    const showNavigationLoading = () => {
      if (typeof window === 'undefined') return;

      // Remove existing indicator if any
      hideNavigationLoading();

      // Create loading indicator
      const loadingIndicator = document.createElement('div');
      loadingIndicator.id = 'navigation-loading-indicator';
      loadingIndicator.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.9);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        backdrop-filter: blur(4px);
      `;

      // Create spinner
      const spinner = document.createElement('div');
      spinner.style.cssText = `
        width: 48px;
        height: 48px;
        border: 4px solid #e5e7eb;
        border-top-color: #3b82f6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      `;

      // Add keyframes if not already present
      if (!document.getElementById('navigation-loading-styles')) {
        const style = document.createElement('style');
        style.id = 'navigation-loading-styles';
        style.textContent = `
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `;
        document.head.appendChild(style);
      }

      // Create text
      const text = document.createElement('div');
      text.textContent = 'Loading team members...';
      text.style.cssText = `
        margin-top: 16px;
        font-size: 16px;
        font-weight: 500;
        color: #3b82f6;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `;

      loadingIndicator.appendChild(spinner);
      loadingIndicator.appendChild(text);
      document.body.appendChild(loadingIndicator);
    };

    const hideNavigationLoading = () => {
      const indicator = document.getElementById('navigation-loading-indicator');
      if (indicator && indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
      }
    };

    // Handle initial page load with hash
    handleHashNavigation();

    // Handle hash changes (back/forward navigation)
    window.addEventListener('hashchange', handleHashNavigation);

    return () => {
      window.removeEventListener('hashchange', handleHashNavigation);
      hideNavigationLoading();
    };
  }, []);

  return (
    <>
      <HomeParticleBackground />
      <main className="home-page-layout relative z-[1] w-full min-h-screen">
      {/* Fills first screen so header + hero occupy full viewport (no green gap below hero) */}
      <div className="home-hero-viewport-filler">
        <HeroSection />
      </div>
      <div>
        <ErrorBoundary fallback={<EventsFallback />}>
          <LiveEventsSection />
        </ErrorBoundary>
        <ErrorBoundary fallback={<EventsFallback />}>
          <FeaturedEventsSection initialFeaturedEvents={initialFeaturedEvents} />
        </ErrorBoundary>
      </div>
      {/* What We Do and About Foundation sections - Always shown immediately */}
      <ServicesSection />
      <AboutSection />
      {/* Loading state for Upcoming Events and Team sections only */}
      {loading ? (
        <div className="py-16 bg-green-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="relative">
                <Image
                  src="/images/loading_events.jpg"
                  alt="Loading events and team information..."
                  width={300}
                  height={300}
                  className="rounded-lg shadow-2xl animate-pulse"
                  priority
                />
                <div className="absolute inset-0 rounded-lg overflow-hidden">
                  <div className="wavy-animation"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {showEventsSection && (
            <ErrorBoundary fallback={<EventsFallback />}>
              <UpcomingEventsSection />
            </ErrorBoundary>
          )}
          {showSquadSection && (
            <ErrorBoundary fallback={<div className="py-8 text-center text-gray-500">Squad roster unavailable</div>}>
              <div id="squad-section">
                <SquadRosterSection />
              </div>
            </ErrorBoundary>
          )}
          {showExecutiveCommitteeSection && (
            <ErrorBoundary fallback={<TeamFallback />}>
              <TeamSection />
            </ErrorBoundary>
          )}
        </>
      )}
      {/* Causes section - Always shown (outside loading condition) */}
      <CausesSection />
      <ProjectsSection />
      <TestimonialsSection />
      {showSponsorsSection && (
        <ErrorBoundary fallback={<div>Sponsors temporarily unavailable</div>}>
          <OurSponsorsSection />
        </ErrorBoundary>
      )}
      {/* Contact Section - Updated to match "What We Do" styling */}
      <div id="contact" className="py-24 bg-green-50">
        <HomeSectionRail eyebrow="Contact" containerClassName="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <HomeSectionTitle className="text-3xl md:text-4xl font-bold mb-4 text-center">
              Get in Touch
            </HomeSectionTitle>
          </div>

          {/* Contact Description */}
          <p className="contact-description home-section-body-text text-center max-w-2xl mx-auto mb-16 text-gray-600 text-lg">
            Connect with us to learn more about our community initiatives and how you can get involved in preserving and promoting Malayali culture across the United States. Join us in fostering cultural exchange and building stronger connections within our diverse communities.
          </p>

          {/* Contact Cards Grid - Matching "What We Do" card style */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Location Card */}
            <div className="homepage-glass-card services-glass-card-face bg-white rounded-2xl p-8 group">
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                    Location
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm lg:text-base">
                    Unite India<br />
                    New Jersey, USA
                  </p>
                </div>
              </div>
            </div>

            {/* Phone Card */}
            <div className="homepage-glass-card services-glass-card-face bg-white rounded-2xl p-8 group">
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors duration-300">
                    Phone
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm lg:text-base">
                    <a href="tel:+16317088442" className="text-blue-600 hover:underline hover:text-blue-700 transition-colors duration-300">
                      +1 (631) 708-8442
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Email Card */}
            <div className="homepage-glass-card services-glass-card-face bg-white rounded-2xl p-8 group">
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors duration-300">
                    Email
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm lg:text-base">
                    <a href="mailto:Contactus@malyalees.org" className="text-blue-600 hover:underline hover:text-blue-700 transition-colors duration-300">
                      Contactus@malyalees.org
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Social Media Card - icons only when tenant settings URLs are set */}
            {hasAnySocial && (
              <div className="homepage-glass-card services-glass-card-face bg-white rounded-2xl p-8 group">
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2M9 4h6" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors duration-300">
                      Social Media
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {settings?.facebookUrl?.trim() && (
                        <a href={settings.facebookUrl.trim()} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 hover:scale-110" title="Follow us on Facebook" aria-label="Follow us on Facebook">
                          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        </a>
                      )}
                      {settings?.instagramUrl?.trim() && (
                        <a href={settings.instagramUrl.trim()} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-10 h-10 rounded-lg bg-pink-100 hover:bg-pink-200 flex items-center justify-center transition-all duration-300 hover:scale-110" title="Follow us on Instagram" aria-label="Follow us on Instagram">
                          <InstagramIcon className="w-6 h-6 text-pink-600" />
                        </a>
                      )}
                      {settings?.twitterUrl?.trim() && (
                        <a href={settings.twitterUrl.trim()} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-10 h-10 rounded-lg bg-sky-100 hover:bg-sky-200 flex items-center justify-center transition-all duration-300 hover:scale-110" title="Follow us on X (Twitter)" aria-label="Follow us on X (Twitter)">
                          <svg className="w-6 h-6 text-sky-600" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        </a>
                      )}
                      {settings?.linkedinUrl?.trim() && (
                        <a href={settings.linkedinUrl.trim()} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all duration-300 hover:scale-110" title="Connect with us on LinkedIn" aria-label="Connect with us on LinkedIn">
                          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.047-1.852-3.047-1.853 0-2.136 1.445-2.136 2.939v5.677H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                        </a>
                      )}
                      {settings?.youtubeUrl?.trim() && (
                        <a href={settings.youtubeUrl.trim()} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-100 hover:bg-red-200 flex items-center justify-center transition-all duration-300 hover:scale-110" title="Subscribe to our YouTube channel" aria-label="Subscribe to our YouTube channel">
                          <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                        </a>
                      )}
                      {settings?.tiktokUrl?.trim() && (
                        <a href={settings.tiktokUrl.trim()} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all duration-300 hover:scale-110" title="Follow us on TikTok" aria-label="Follow us on TikTok">
                          <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Call to Action - Matching "What We Do" style */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-6 py-3 rounded-full text-sm font-medium">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>Ready to connect? Reach out and join our vibrant community</span>
            </div>
          </div>
        </HomeSectionRail>
      </div>
    </main>
    </>
  );
}

// Main home page (client): receives SSR featured events for first paint
// Note: TenantSettingsProvider is now in root layout, so no need to wrap here
export default function HomePageClient({
  initialFeaturedEvents,
}: {
  initialFeaturedEvents: FeaturedEventWithMedia[];
}) {
  const pathname = usePathname();
  const { isSignedIn, userId, isLoaded } = useAuth();
  const { user } = useUser();
  const [hasCheckedRedirect, setHasCheckedRedirect] = useState(false);

  // Homepage-only typography (eyebrows, section titles) — not a background image
  useEffect(() => {
    document.body.classList.add('home-page-background');
    return () => {
      document.body.classList.remove('home-page-background');
    };
  }, []);

  // CRITICAL: Redirect new sign-ups from home page to /profile
  // This catches cases where Clerk redirects to home page after signup
  // IMPORTANT: Only redirect if the 'signup-redirected' flag is set (user just signed up)
  // Clear the flag after redirect to prevent affecting subsequent logins
  useEffect(() => {
    if (isLoaded && isSignedIn && userId && user && !hasCheckedRedirect && typeof window !== 'undefined') {
      const currentPath = pathname || window.location.pathname;
      
      // Only redirect if we're on the home page AND user just signed up (flag is set)
      // Fix: Changed from !sessionStorage.getItem to check if flag IS set
      const hasJustSignedUp = sessionStorage.getItem('signup-redirected') === 'true';
      
      if (currentPath === '/' && hasJustSignedUp) {
        console.log('[HomePage] 🔄 New sign-up detected on home page, redirecting to /profile');
        
        // Mark that we've checked to prevent multiple redirects
        setHasCheckedRedirect(true);
        
        // Clear the flag immediately to prevent it from affecting subsequent logins
        sessionStorage.removeItem('signup-redirected');
        
        // Extract serializable data from user object (client reference)
        const userData = {
          email: user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress || "",
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          imageUrl: user.imageUrl || "",
        };
        
        // Bootstrap profile in background, then redirect
        bootstrapUserProfile({ userId, userData })
          .then(() => {
            console.log('[HomePage] ✅ Bootstrap completed, redirecting to /profile');
          })
          .catch((err) => {
            console.error('[HomePage] ⚠️ Bootstrap failed, but still redirecting:', err);
          })
          .finally(() => {
            // Always redirect to /profile after signup (never to home page)
            console.log('[HomePage] 🎯 Redirecting to /profile');
            setTimeout(() => {
              window.location.href = '/profile';
            }, 100);
          });
      } else {
        // Not a new sign-up, mark as checked
        // Also clear any stale signup-redirected flags from previous sessions
        if (hasJustSignedUp && currentPath !== '/') {
          sessionStorage.removeItem('signup-redirected');
        }
        setHasCheckedRedirect(true);
      }
    }
  }, [isLoaded, isSignedIn, userId, user, pathname, hasCheckedRedirect]);

  return <HomePageContent initialFeaturedEvents={initialFeaturedEvents} />;
}

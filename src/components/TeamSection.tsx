'use client';

import React, { useState, useEffect, useLayoutEffect } from 'react';
import { HomeSectionRail } from '@/components/HomeSectionRail';
import { HomeSectionTitle } from '@/components/HomeSectionTitle';
import Image from 'next/image';
import Link from 'next/link';
import type { ExecutiveCommitteeTeamMemberDTO } from '@/types';
import { useDeferredFetch } from '@/hooks/usePageReady';
import { parseExecutiveCommitteeTeamMembersResponse } from '@/lib/parseExecutiveCommitteeTeamMembersResponse';
import { getHomepageCacheKey } from '@/lib/homepageCacheKeys';
import Modal from '@/components/ui/Modal';
import styles from './TeamSection.module.css';

/** Max characters to show in card before "Read more". Longer bios open in popup. */
const BIO_TRUNCATE_LENGTH = 120;
/** Show "Read more" when bio exceeds this (so button appears whenever text is visibly truncated or line-clamped). */
const BIO_READ_MORE_THRESHOLD = 50;

const TeamSection: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<ExecutiveCommitteeTeamMemberDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImages, setShowImages] = useState(false);
  const [profileModalMember, setProfileModalMember] = useState<ExecutiveCommitteeTeamMemberDTO | null>(null);

  // Defer team member API call until page ready + 800ms
  // This section is further down the page and mounts after TenantSettings loads,
  // so the effective delay from initial page load is even longer.
  const shouldFetch = useDeferredFetch(800);

  // Cache key for sessionStorage (env-prefixed so local/dev/prod are separate)
  const CACHE_KEY = getHomepageCacheKey('homepage_team_cache');
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Run cache read before paint so cached data shows immediately (no delay on refresh)
  useLayoutEffect(() => {
    try {
      const cachedData = sessionStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setTeamMembers(parseExecutiveCommitteeTeamMembersResponse(data));
          setLoading(false);
          setShowImages(true);
        }
      }
    } catch (_) { /* ignore */ }
  }, [CACHE_KEY, CACHE_DURATION]);

  useEffect(() => {
    const loadTeamMembers = async () => {
      // Check cache first (instant, no deferral needed for cached data)
      try {
        const cachedData = sessionStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          if (Date.now() - timestamp < CACHE_DURATION) {
            console.log('✅ Using cached team data');
            setTeamMembers(parseExecutiveCommitteeTeamMembersResponse(data));
            setLoading(false);
            setShowImages(true); // Show images immediately for cached data
            return;
          }
        }
      } catch (error) {
        console.warn('Failed to read team cache:', error);
      }

      // Defer network request until page is ready + delay
      if (!shouldFetch) return;

      try {
        // Same-origin relative URL (avoids localhost vs 127.0.0.1 / port mismatch)
        const response = await fetch(
          '/api/proxy/executive-committee-team-members?isActive.equals=true&sort=priorityOrder,asc',
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            cache: 'no-store',
          }
        );

        if (!response.ok) {
          console.log('Backend unavailable - team members not loaded:', response.statusText);
          setTeamMembers([]);
          setLoading(false);
          return;
        }

        const data = await response.json();
        const teamMembersList = parseExecutiveCommitteeTeamMembersResponse(data);

        // Cache the data
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify({
            data: teamMembersList,
            timestamp: Date.now()
          }));
        } catch (error) {
          console.warn('Failed to cache team data:', error);
        }

        setTeamMembers(teamMembersList);
        setLoading(false);
        setShowImages(true); // Show images immediately when loaded
      } catch (error) {
        console.log('Backend connection error - team members not loaded:', error);
        setTeamMembers([]);
        setLoading(false);
      }
    };

    loadTeamMembers();
  }, [shouldFetch]);

  // Helper function to get full name
  const getFullName = (member: ExecutiveCommitteeTeamMemberDTO) => {
    return `${member.firstName} ${member.lastName}`.trim();
  };

  // Helper function to parse expertise string into array
  const parseExpertise = (expertise?: string): string[] => {
    if (!expertise) return [];

    try {
      // Try to parse as JSON first (API returns JSON string)
      const parsed = JSON.parse(expertise);
      if (Array.isArray(parsed)) {
        return parsed.map(item => String(item).trim()).filter(Boolean);
      }
    } catch (e) {
      // If JSON parsing fails, fall back to comma-separated parsing
      return expertise.split(',').map(item => item.trim()).filter(Boolean);
    }

    return [];
  };

  // Helper function to get default profile image
  const getDefaultProfileImage = (member: ExecutiveCommitteeTeamMemberDTO) => {
    if (member.profileImageUrl) return member.profileImageUrl;

    // Return a placeholder image based on member's name or use a generic one
    return '/images/user_profile_loading.webp';
  };

  /**
   * Chunk team members by priority: 3 cards per row on the homepage grid.
   * Homepage shows first 6 members (two full rows when there are 6+).
   */
  const displayedRows = ((): ExecutiveCommitteeTeamMemberDTO[][] => {
    const sorted = [...teamMembers].sort((a, b) => (a.priorityOrder ?? 0) - (b.priorityOrder ?? 0));
    const take = Math.min(6, sorted.length);
    if (take === 0) return [];
    const list = sorted.slice(0, take);
    const rows: ExecutiveCommitteeTeamMemberDTO[][] = [];
    let i = 0;
    while (i < list.length) {
      rows.push(list.slice(i, i + 3));
      i += 3;
    }
    return rows;
  })();

  // Don't render anything while loading - section will appear only when fully loaded
  if (loading) {
    return null;
  }

  return (
    <div id="team-section" className="py-24 bg-green-50">
      <HomeSectionRail eyebrow="Our team" containerClassName="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile "Read more" popup */}
        <Modal
          isOpen={!!profileModalMember}
          onClose={() => setProfileModalMember(null)}
          title={profileModalMember ? getFullName(profileModalMember) : ''}
          size="lg"
        >
          {profileModalMember && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                {showImages && (
                  <div className="flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden bg-gray-100">
                    <Image
                      src={getDefaultProfileImage(profileModalMember)}
                      alt={getFullName(profileModalMember)}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const t = e.target as HTMLImageElement;
                        if (t) t.src = '/images/user_profile_loading.webp';
                      }}
                    />
                  </div>
                )}
                <div>
                  <p className="text-base font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block">
                    {profileModalMember.title}
                  </p>
                  {profileModalMember.designation && (
                    <p className="text-sm text-gray-500 mt-2">{profileModalMember.designation}</p>
                  )}
                </div>
              </div>
              {profileModalMember.bio && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">About</h4>
                  <p className="text-gray-600 leading-relaxed">{profileModalMember.bio}</p>
                </div>
              )}
              {profileModalMember.expertise && parseExpertise(profileModalMember.expertise).length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    {parseExpertise(profileModalMember.expertise).map((skill, i) => (
                      <span
                        key={i}
                        className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {(profileModalMember.email || profileModalMember.linkedinUrl || profileModalMember.twitterUrl || profileModalMember.websiteUrl) && (
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Contact</h4>
                  <div className="space-y-2">
                    {profileModalMember.email && (
                      <a
                        href={`mailto:${profileModalMember.email}`}
                        className="text-sm text-gray-600 hover:text-blue-600 flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {profileModalMember.email}
                      </a>
                    )}
                    <div className="flex gap-3 mt-2">
                      {profileModalMember.linkedinUrl && (
                        <a href={profileModalMember.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600" aria-label="LinkedIn">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.047-1.852-3.047-1.853 0-2.136 1.445-2.136 2.939v5.677H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                        </a>
                      )}
                      {profileModalMember.twitterUrl && (
                        <a href={profileModalMember.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-400" aria-label="Twitter">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.665 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.427 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>
                        </a>
                      )}
                      {profileModalMember.websiteUrl && (
                        <a href={profileModalMember.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-purple-600" aria-label="Website">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Section Header */}
        <div className="mb-20 text-center">
          <HomeSectionTitle className="text-4xl md:text-5xl lg:text-6xl font-light leading-tight tracking-tight">
            Meet our amazing team
          </HomeSectionTitle>
          <p className="home-section-body-text text-lg text-gray-600 mt-4 leading-relaxed max-w-2xl mx-auto">
            Dedicated professionals working together to make a positive impact in our communities.
          </p>
        </div>

        {/* Dynamic Team Grid by priority: 3 cards per row */}
        {teamMembers.length > 0 ? (
          <>
            {displayedRows.map((row, rowIndex) => {
              const globalStart = displayedRows.slice(0, rowIndex).reduce((sum, r) => sum + r.length, 0);
              return (
                <div
                  key={rowIndex}
                  className={`${styles.teamGrid} gap-8 lg:gap-10`}
                  style={rowIndex < displayedRows.length - 1 ? { marginBottom: '2.5rem' } : undefined}
                >
                  {row.map((member, cardIndex) => {
                    const globalIndex = globalStart + cardIndex;
                    return (
              <div
                key={member.id}
                className={`${styles.teamCard} team-card group relative rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 ease-out hover:-translate-y-3`}
                style={{
                  animationDelay: `${globalIndex * 150}ms`,
                }}
              >
                {/* Large Photo Section - flex-shrink-0 so long text never shrinks or overlaps image */}
                <div className="relative h-[400px] lg:h-[450px] min-h-[400px] lg:min-h-[450px] flex-shrink-0 overflow-hidden p-4">
                  <div className="relative w-full h-full rounded-xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/10 to-transparent z-10"></div>

                    {showImages ? (
                      <Image
                        src={getDefaultProfileImage(member)}
                        alt={getFullName(member)}
                        fill
                        className="object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        style={{
                          objectPosition: 'center top'
                        }}
                        onError={(e) => {
                          // Fallback to default image on error
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/user_profile_loading.webp';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"></div>
                    )}

                    {/* Subtle overlay for better photo quality */}
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5 rounded-xl"></div>
                  </div>
                </div>

                {/* Card Content - flex column with scrollable body so image never gets cut off */}
                <div className={`${styles.cardContent} team-card-content flex flex-col min-h-0`}>
                  {/* Name and Title - reduced spacing */}
                  <div className="flex-shrink-0 mb-2">
                    <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-300">
                      {getFullName(member)}
                    </h3>
                    <p className="text-base font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block">
                      {member.title}
                    </p>
                    {member.designation && (
                      <p className="text-sm text-gray-500 mt-1">{member.designation}</p>
                    )}
                  </div>

                  {/* Bio Description - text clamped; "Read more" outside clamp so it stays visible, inline after text */}
                  {member.bio && (
                    <div className="flex-shrink-0 mb-2 flex flex-wrap items-baseline gap-x-1">
                      <span className="min-w-0 text-gray-600 leading-snug text-sm lg:text-base line-clamp-2">
                        {member.bio.length <= BIO_TRUNCATE_LENGTH
                          ? member.bio
                          : `${member.bio.slice(0, BIO_TRUNCATE_LENGTH).trim()}…`}
                      </span>
                      {member.bio.length > BIO_READ_MORE_THRESHOLD && (
                        <button
                          type="button"
                          onClick={() => setProfileModalMember(member)}
                          className="flex-shrink-0 text-sm font-semibold text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded transition-colors whitespace-nowrap"
                          aria-label={`Read full profile of ${getFullName(member)}`}
                        >
                          Read more
                        </button>
                      )}
                    </div>
                  )}

                  {/* Expertise: colon after title, list content inline - larger text for readability */}
                  {member.expertise && parseExpertise(member.expertise).length > 0 && (
                    <div className="flex-shrink-0 mb-2">
                      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide leading-snug">
                        Expertise:{' '}
                        <span className="font-normal normal-case text-gray-700 text-sm">
                          {parseExpertise(member.expertise).join(', ')}
                        </span>
                      </p>
                    </div>
                  )}

                  {/* Contact Info - reduced top padding */}
                  <div className="flex-shrink-0 pt-2 border-t border-gray-100 mt-auto">
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="text-sm text-gray-500 hover:text-blue-600 transition-colors duration-200 flex items-center space-x-2"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span>{member.email}</span>
                      </a>
                    )}

                    {/* Social Links */}
                    <div className="flex space-x-3 mt-2">
                      {member.linkedinUrl && (
                        <a
                          href={member.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.047-1.852-3.047-1.853 0-2.136 1.445-2.136 2.939v5.677H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                          </svg>
                        </a>
                      )}
                      {member.twitterUrl && (
                        <a
                          href={member.twitterUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.665 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.427 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                          </svg>
                        </a>
                      )}
                      {member.websiteUrl && (
                        <a
                          href={member.websiteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-purple-600 transition-colors duration-200"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                        </a>
                      )}
                    </div>
                    </div>
                  </div>
                </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Show More Button - Only show if there are more than 6 team members */}
            {teamMembers.length > 6 && (
              <div className="mt-12 flex justify-center">
                <Link
                  href="/team"
                  className="hero-browse-link hero-browse-link-neon"
                  title="View All Team Members"
                  aria-label="View All Team Members"
                >
                  <span>Show More</span>
                  <svg className="shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}
          </>
        ) : (
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
        )}

        {/* Enhanced Stats Section - number removed per request; keep heading and description */}
        <div className="mt-16 text-center">
          <h3 className="home-section-title text-xl lg:text-2xl font-semibold mb-3">
            <span className="home-section-title-lead">Dedicated team members</span>
          </h3>
          <p className="home-section-body-text text-gray-600 max-w-md mx-auto">
            Building stronger communities through dedication, innovation, and collaborative leadership.
          </p>
        </div>
      </HomeSectionRail>
    </div>
  );
};

export default TeamSection;

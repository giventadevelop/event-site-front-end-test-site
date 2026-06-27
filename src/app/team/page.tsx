'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { ExecutiveCommitteeTeamMemberDTO } from '@/types';
import { parseExecutiveCommitteeTeamMembersResponse } from '@/lib/parseExecutiveCommitteeTeamMembersResponse';
import Modal from '@/components/ui/Modal';
import { getHomepageCacheKey } from '@/lib/homepageCacheKeys';
import pageStyles from './TeamPage.module.css';
import HomeParticleBackground from '@/components/HomeParticleBackground';

/** Max characters to show in card before "Read more". Longer bios open in popup. */
const BIO_TRUNCATE_LENGTH = 120;
/** Show "Read more" when bio exceeds this (so button appears whenever text is visibly truncated or line-clamped). */
const BIO_READ_MORE_THRESHOLD = 50;

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<ExecutiveCommitteeTeamMemberDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImages, setShowImages] = useState(false);
  const [page, setPage] = useState(0); // 0-based for calculations
  const [profileModalMember, setProfileModalMember] = useState<ExecutiveCommitteeTeamMemberDTO | null>(null);
  const pageSize = 9; // Display 9 team members per page

  // Cache key for sessionStorage (env-prefixed so local/dev/prod are separate)
  const CACHE_KEY = getHomepageCacheKey('team_page_cache');
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  useEffect(() => {
    document.body.classList.add('home-page-background');
    document.body.classList.add('team-page-background');

    // Fetch team members when component mounts
    const loadTeamMembers = async () => {
      // Check cache first
      try {
        const cachedData = sessionStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          if (Date.now() - timestamp < CACHE_DURATION) {
            console.log('✅ Using cached team data');
            setTeamMembers(parseExecutiveCommitteeTeamMembersResponse(data));
            setLoading(false);
            setShowImages(true);
            return;
          }
        }
      } catch (error) {
        console.warn('Failed to read team cache:', error);
      }

      try {
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
        setShowImages(true);
      } catch (error) {
        console.log('Backend connection error - team members not loaded:', error);
        setTeamMembers([]);
        setLoading(false);
      }
    };

    loadTeamMembers();
    return () => {
      document.body.classList.remove('home-page-background');
      document.body.classList.remove('team-page-background');
    };
  }, []);

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
    return '/images/user_profile_loading.webp';
  };

  // Pagination calculations
  const totalCount = teamMembers.length;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const currentPage = page + 1; // Display as 1-based
  const startItem = totalCount > 0 ? page * pageSize + 1 : 0;
  const endItem = totalCount > 0 ? Math.min(page * pageSize + pageSize, totalCount) : 0;
  const isPrevDisabled = page === 0 || loading;
  const isNextDisabled = page >= totalPages - 1 || loading;

  // Get paginated team members
  const paginatedTeamMembers = teamMembers.slice(page * pageSize, page * pageSize + pageSize);

  // Reset page if it becomes invalid after data changes
  useEffect(() => {
    if (totalPages > 0 && page >= totalPages) {
      setPage(0);
    }
  }, [totalPages, page]);

  const handlePrevPage = () => {
    if (!isPrevDisabled) {
      setPage((prev) => Math.max(0, prev - 1));
    }
  };

  const handleNextPage = () => {
    if (!isNextDisabled) {
      setPage((prev) => Math.min(totalPages - 1, prev + 1));
    }
  };

  return (
    <>
      <HomeParticleBackground />
      <div className={`${pageStyles.teamPage} home-page-layout relative z-[1] min-h-screen`} style={{ paddingTop: '100px' }}>
      {/* Header Section */}
      <section className={`${pageStyles.topSection} py-16`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header with back button - left aligned */}
          <div className={`${pageStyles.topbar} flex items-center mb-8 gap-4 px-16`}>
            <Link
              href="/"
              className={`${pageStyles.backButton} flex-shrink-0 h-14 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 px-3 sm:px-6`}
              title="Back to Home"
              aria-label="Back to Home"
            >
              <div className={`${pageStyles.backButtonIcon} flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center`}>
                <svg className={`${pageStyles.backButtonIconSvg} w-6 h-6`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </div>
              <span className={`${pageStyles.backButtonText} font-semibold hidden sm:inline`}>Back to Home</span>
            </Link>
            <div className="flex-1 min-w-0">
              <h1 className={`${pageStyles.pageTitle} text-2xl sm:text-3xl font-bold mb-2`}>Our Team</h1>
              <p className={`${pageStyles.pageDescription} text-sm sm:text-base`}>
                Meet the dedicated professionals working together to make a positive impact in our communities
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className={`${pageStyles.mainSection} py-24`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile "Read more" popup - same as home team section */}
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

          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="relative">
                <div className={`${pageStyles.loader} w-16 h-16 border-4 rounded-full animate-spin`}></div>
              </div>
            </div>
          ) : teamMembers.length === 0 ? (
            <div className="text-center py-12">
              <div className={`${pageStyles.emptyStateCard} rounded-lg p-8 max-w-md mx-auto`}>
                <div className={`${pageStyles.emptyStateIcon} flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full`}>
                  <svg className={`${pageStyles.emptyStateIconSvg} w-8 h-8`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className={`${pageStyles.emptyStateTitle} text-lg font-medium mb-2`}>Team Members Information Temporarily Unavailable</h3>
                <p className={pageStyles.emptyStateText}>We're currently updating our team members information. Please check back later.</p>
              </div>
            </div>
          ) : (
            <>
              {/* Dynamic Team Grid */}
              <div className={`${pageStyles.teamGrid} gap-8 lg:gap-10`}>
                {paginatedTeamMembers.map((member, index) => (
                  <div
                    key={member.id}
                    className={`${pageStyles.teamCard} group relative rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 ease-out hover:-translate-y-3`}
                    style={{
                      animationDelay: `${index * 150}ms`,
                    }}
                  >
                    {/* Large Photo Section - fixed height so long bio does not shrink image */}
                    <div className={`${pageStyles.teamPhotoSection} relative h-[400px] lg:h-[450px] min-h-[400px] lg:min-h-[450px] flex-shrink-0 overflow-hidden p-4`}>
                      <div className="relative w-full h-full rounded-xl overflow-hidden">
                        <div className={`${pageStyles.teamPhotoOverlay} absolute inset-0 z-10`}></div>

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
                              const target = e.target as HTMLImageElement;
                              target.src = '/images/user_profile_loading.webp';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse"></div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/5 rounded-xl"></div>
                      </div>
                    </div>

                    {/* Card Content - fixed layout so card height stays equal */}
                    <div className={`${pageStyles.cardContent} team-card-content flex flex-col min-h-0`}>
                      {/* Name and Title */}
                      <div className="flex-shrink-0 mb-4">
                        <h3 className={`${pageStyles.memberName} text-xl lg:text-2xl font-bold mb-2 group-hover:text-blue-600 transition-colors duration-300`}>
                          {getFullName(member)}
                        </h3>
                        <p className={`${pageStyles.memberRole} text-base font-medium px-3 py-1 rounded-full inline-block`}>
                          {member.title}
                        </p>
                        {member.designation && (
                          <p className={`${pageStyles.memberDesignation} text-sm mt-2`}>{member.designation}</p>
                        )}
                      </div>

                      {/* Bio Description - clamped to 3 lines so "Read more" stays visible; show button when bio is long */}
                      {member.bio && (
                        <div className="flex-shrink-0 mb-4">
                          <p className={`${pageStyles.memberBio} leading-relaxed text-sm lg:text-base line-clamp-3`}>
                            {member.bio.length <= BIO_TRUNCATE_LENGTH
                              ? member.bio
                              : `${member.bio.slice(0, BIO_TRUNCATE_LENGTH).trim()}…`}
                          </p>
                          {member.bio.length > BIO_READ_MORE_THRESHOLD && (
                            <button
                              type="button"
                              onClick={() => setProfileModalMember(member)}
                              className={`${pageStyles.readMoreButton} mt-4 mb-1 py-2 px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded transition-colors`}
                              aria-label={`Read full profile of ${getFullName(member)}`}
                            >
                              Read more
                            </button>
                          )}
                        </div>
                      )}

                      {/* Expertise Tags */}
                      {member.expertise && parseExpertise(member.expertise).length > 0 && (
                        <div className="flex-shrink-0 mb-4">
                          <p className={`${pageStyles.expertiseHeading} text-xs font-semibold uppercase tracking-wide mb-3`}>
                            Expertise
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {parseExpertise(member.expertise).map((skill, skillIndex) => (
                              <span
                                key={skillIndex}
                                className={`${pageStyles.expertiseChip} text-xs px-3 py-1 rounded-full font-medium transition-colors duration-200`}
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Contact Info - pushed to bottom */}
                      <div className={`${pageStyles.contactSection} flex-shrink-0 pt-4 mt-auto`}>
                        {member.email && (
                          <a
                            href={`mailto:${member.email}`}
                            className={`${pageStyles.contactEmail} text-sm transition-colors duration-200 flex items-center space-x-2`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>{member.email}</span>
                          </a>
                        )}

                        {/* Social Links */}
                        <div className="flex space-x-3 mt-3">
                          {member.linkedinUrl && (
                            <a
                              href={member.linkedinUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`${pageStyles.socialIcon} ${pageStyles.socialLinkedin} transition-colors duration-200`}
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
                              className={`${pageStyles.socialIcon} ${pageStyles.socialTwitter} transition-colors duration-200`}
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
                              className={`${pageStyles.socialIcon} ${pageStyles.socialWebsite} transition-colors duration-200`}
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
                ))}
              </div>

              {/* Pagination Controls - Always visible, matching admin page style */}
              {totalCount > 0 && (
                <div className="mt-8">
                  <div className="flex justify-between items-center">
                    {/* Previous Button */}
                    <button
                      onClick={handlePrevPage}
                      disabled={isPrevDisabled}
                      className={`${pageStyles.paginationButton} px-5 py-2.5 font-semibold rounded-lg border-2 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 hover:scale-105`}
                      title="Previous Page"
                      aria-label="Previous Page"
                      type="button"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span>Previous</span>
                    </button>

                    {/* Page Info */}
                    <div className={`${pageStyles.pageInfo} px-4 py-2 border-2 rounded-lg`}>
                      <span className={`${pageStyles.pageInfoText} text-sm font-bold`}>
                        Page <span className={pageStyles.pageInfoValue}>{currentPage}</span> of <span className={pageStyles.pageInfoValue}>{totalPages}</span>
                      </span>
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={handleNextPage}
                      disabled={isNextDisabled}
                      className={`${pageStyles.paginationButton} px-5 py-2.5 font-semibold rounded-lg border-2 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-300 hover:scale-105`}
                      title="Next Page"
                      aria-label="Next Page"
                      type="button"
                    >
                      <span>Next</span>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  {/* Item Count Text */}
                  <div className="text-center mt-3">
                    {totalCount > 0 ? (
                      <div className={`${pageStyles.itemCountBox} inline-flex items-center px-4 py-2 border-2 rounded-lg`}>
                        <span className={`${pageStyles.itemCountText} text-sm`}>
                          Showing <span className={`${pageStyles.itemCountValue} font-bold`}>{startItem}</span> to <span className={`${pageStyles.itemCountValue} font-bold`}>{endItem}</span> of <span className={`${pageStyles.itemCountValue} font-bold`}>{totalCount}</span> team members
                        </span>
                      </div>
                    ) : (
                      <div className={`${pageStyles.noResultsBox} inline-flex items-center gap-2 px-4 py-2 border-2 rounded-lg`}>
                        <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm font-medium text-orange-700">No team members found</span>
                        <span className="text-sm text-orange-600">[No team members match your criteria]</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Stats Section */}
              <div className="mt-32 text-center">
                <div className="relative">
                  <div className={`${pageStyles.statsNumber} text-6xl md:text-8xl lg:text-9xl font-bold leading-none tracking-tighter mb-6 bg-clip-text text-transparent`}>
                    {teamMembers.length}+
                  </div>
                  <div className={`${pageStyles.statsNumberShadow} absolute inset-0 text-6xl md:text-8xl lg:text-9xl font-bold leading-none tracking-tighter opacity-10 blur-sm bg-clip-text text-transparent`}>
                    {teamMembers.length}+
                  </div>
                </div>
                <h3 className={`${pageStyles.statsTitle} text-xl lg:text-2xl font-semibold mb-3`}>
                  Dedicated team members
                </h3>
                <p className={`${pageStyles.statsText} max-w-md mx-auto`}>
                  Building stronger communities through dedication, innovation, and collaborative leadership.
                </p>
              </div>
            </>
          )}
        </div>
      </section>
      </div>
    </>
  );
}

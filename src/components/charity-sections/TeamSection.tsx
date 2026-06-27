'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import type { ExecutiveCommitteeTeamMemberDTO } from '@/types';
import { parseExecutiveCommitteeTeamMembersResponse } from '@/lib/parseExecutiveCommitteeTeamMembersResponse';
import styles from './TeamSection.module.css';

const TeamSection: React.FC = () => {
  const [teamMembers, setTeamMembers] = useState<ExecutiveCommitteeTeamMemberDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImages, setShowImages] = useState(false);

  useEffect(() => {
    // Fetch team members when component mounts
    const loadTeamMembers = async () => {
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
          console.error('Failed to fetch executive team members:', response.statusText);
          setTeamMembers([]);
          setLoading(false);
          return;
        }

        const data = await response.json();
        setTeamMembers(parseExecutiveCommitteeTeamMembersResponse(data));
        setLoading(false);

        // Delay showing images by 3-5 seconds after page load
        setTimeout(() => {
          setShowImages(true);
        }, 3000 + Math.random() * 2000); // Random delay between 3-5 seconds
      } catch (error) {
        console.error('Error loading team members:', error);
        setTeamMembers([]);
        setLoading(false);
      }
    };

    loadTeamMembers();
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

    // Return a placeholder image based on member's name or use a generic one
    return '/images/user_profile_loading.webp';
  };

  // Helper function to get CSS classes for last row centering
  const getLastRowClasses = (index: number, totalMembers: number) => {
    const itemsPerRow = 4; // Maximum items per row on large screens
    const fullRows = Math.floor(totalMembers / itemsPerRow);
    const itemsInLastRow = totalMembers % itemsPerRow;
    const startOfLastRow = fullRows * itemsPerRow;
    const isInLastRow = index >= startOfLastRow;

    if (isInLastRow && itemsInLastRow > 0) {
      if (itemsInLastRow === 1) {
        return styles.lastRowSingle;
      } else if (itemsInLastRow === 2) {
        if (index === startOfLastRow) {
          return styles.lastRowFirst;
        } else {
          return styles.lastRowSecond;
        }
      } else if (itemsInLastRow === 3) {
        if (index === startOfLastRow) {
          return styles.lastRowFirst;
        } else if (index === startOfLastRow + 1) {
          return styles.lastRowThird;
        } else {
          return styles.lastRowSecond;
        }
      }
    }
    return '';
  };

  if (loading) {
    return (
      <div className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-20">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-6 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"></div>
              <p className="text-gray-600 font-medium">Our team</p>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light leading-tight tracking-tight text-gray-900">
              Meet our amazing{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-medium">
                team
              </span>
            </h2>
            <p className="text-lg text-gray-600 mt-4 leading-relaxed">
              Dedicated professionals working together to make a positive impact in our communities.
            </p>
          </div>

          {/* Loading skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-[2rem] overflow-hidden shadow-lg animate-pulse">
                <div className="h-[400px] lg:h-[450px] bg-gray-200"></div>
                <div className="p-8">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-6 w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-6 w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-24 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-20 flex flex-col lg:flex-row justify-between items-start lg:items-end space-y-6 lg:space-y-0">
          <div className="max-w-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-6 h-3 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"></div>
              <p className="text-gray-600 font-medium">Our team</p>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-light leading-tight tracking-tight text-gray-900">
              Meet our amazing{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-medium">
                team
              </span>
            </h2>
            <p className="text-lg text-gray-600 mt-4 leading-relaxed">
              Dedicated professionals working together to make a positive impact in our communities.
            </p>
          </div>
        </div>

        {/* Dynamic Team Grid with Perfect Equal Distribution */}
        {teamMembers.length > 0 ? (
          <div className={`${styles.teamGrid} gap-8 lg:gap-10`}>
            {teamMembers.map((member, index) => (
              <div
                key={member.id}
                className={`${styles.teamCard} group relative bg-white rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 ease-out hover:-translate-y-3 ${getLastRowClasses(index, teamMembers.length)}`}
                style={{
                  animationDelay: `${index * 150}ms`,
                }}
              >
                {/* Large Photo Section */}
                <div className="relative h-[400px] lg:h-[450px] overflow-hidden p-4">
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

                {/* Card Content - using flexbox for consistent height */}
                <div className={`${styles.cardContent} p-8 bg-white flex flex-col`}>
                  {/* Name and Title */}
                  <div className="mb-6">
                    <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">
                      {getFullName(member)}
                    </h3>
                    <p className="text-base font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full inline-block">
                      {member.title}
                    </p>
                    {member.designation && (
                      <p className="text-sm text-gray-500 mt-2">{member.designation}</p>
                    )}
                  </div>

                  {/* Bio Description */}
                  {member.bio && (
                    <p className="text-gray-600 leading-relaxed mb-6 text-sm lg:text-base">
                      {member.bio}
                    </p>
                  )}

                  {/* Expertise Tags */}
                  {member.expertise && parseExpertise(member.expertise).length > 0 && (
                    <div className="mb-6">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Expertise
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {parseExpertise(member.expertise).map((skill, skillIndex) => (
                          <span
                            key={skillIndex}
                            className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-medium hover:bg-gray-200 transition-colors duration-200"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contact Info - pushed to bottom */}
                  <div className="pt-4 border-t border-gray-100 mt-auto">
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
                    <div className="flex space-x-3 mt-3">
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
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No team members found.</p>
          </div>
        )}

        {/* Enhanced Stats Section */}
        <div className="mt-32 text-center">
          <div className="relative">
            <div className="text-6xl md:text-8xl lg:text-9xl font-bold leading-none tracking-tighter mb-6 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              {teamMembers.length}+
            </div>
            <div className="absolute inset-0 text-6xl md:text-8xl lg:text-9xl font-bold leading-none tracking-tighter opacity-10 blur-sm bg-gradient-to-br from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              {teamMembers.length}+
            </div>
          </div>
          <h3 className="text-xl lg:text-2xl font-semibold text-gray-800 mb-3">
            Dedicated team members
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Building stronger communities through dedication, innovation, and collaborative leadership.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TeamSection;

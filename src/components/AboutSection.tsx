'use client';

import React from 'react';
import { HomeSectionRail } from '@/components/HomeSectionRail';
import { HomeSectionTitle } from '@/components/HomeSectionTitle';

const AboutSection: React.FC = () => {
  return (
    <div id="about-us" className="py-12 bg-green-50">
      <HomeSectionRail eyebrow="About foundation" containerClassName="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          <div className="flex-1 lg:max-w-lg">
            <HomeSectionTitle className="text-4xl md:text-5xl lg:text-6xl font-normal leading-tight tracking-tight">
              Preserve and promote the rich cultural heritage of Kerala
            </HomeSectionTitle>
          </div>

          <div className="flex-1">
            <div className="space-y-6">
              <p className="home-section-body-text text-base leading-relaxed text-gray-600">
                The Unite India Corporation Foundation for Education and Events is a vibrant, community-driven organization based in New Jersey, USA, dedicated to reviving real Malayali culture, empowering the next generation through education, and offering a nostalgic sense of home to our community. Our mission is to preserve and promote the rich cultural heritage of Kerala while fostering a deeper connection among Malayalis in the USA, creating a sense of belonging and unity.
              </p>
            </div>
          </div>
        </div>
      </HomeSectionRail>
    </div>
  );
};

export default AboutSection;

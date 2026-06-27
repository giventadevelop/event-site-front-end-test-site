'use client';

import React from 'react';

const AboutSection: React.FC = () => {
  return (
    <div className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          {/* Left Side - Section Header and Title */}
          <div className="flex-1 lg:max-w-lg">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-5 h-2 bg-yellow-400 rounded"></div>
              <p className="text-gray-600">About foundation</p>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal leading-tight tracking-tight text-blue-600">
              Preserve and promote the rich cultural heritage of Kerala
            </h2>
          </div>

          {/* Right Side - Content */}
          <div className="flex-1">
            <div className="space-y-6">
              <p className="text-base leading-relaxed text-gray-600">
                The Unite India Corporation Foundation for Education and Events is a vibrant, community-driven organization based in New Jersey, USA, dedicated to reviving real Malayali culture, empowering the next generation through education, and offering a nostalgic sense of home to our community. Our mission is to preserve and promote the rich cultural heritage of Kerala while fostering a deeper connection among Malayalis in the USA, creating a sense of belonging and unity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
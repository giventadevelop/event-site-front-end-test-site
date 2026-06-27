'use client';

import React from 'react';

const MissionSection: React.FC = () => {
  return (
    <div className="relative min-h-[60vh] bg-gradient-to-br from-orange-500 to-orange-400 flex items-center overflow-hidden">
      {/* Background Pattern */}
      <div
        className="absolute top-0 right-0 w-1/2 h-full opacity-30"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
        }}
      ></div>

      {/* Content */}
      <div className="relative z-20 text-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-12">
          <div className="flex-1">
            <h2 className="text-3xl md:text-5xl font-normal leading-tight tracking-tight mb-8">
              The long journey to end poverty begins with a child.
            </h2>

            <button className="bg-transparent text-yellow-400 border-2 border-yellow-400 rounded-full px-8 py-3 text-base font-medium hover:bg-yellow-400 hover:text-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ease-in-out">
              Donate
            </button>
          </div>

          <div className="flex-1 hidden md:block">
            {/* Decorative space for visual balance */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MissionSection;
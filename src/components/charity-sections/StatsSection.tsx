'use client';

import React from 'react';

const StatsSection: React.FC = () => {
  return (
    <div className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row space-y-8 md:space-y-0 md:space-x-16 justify-center items-center">
          <div className="text-center px-8">
            <div className="text-6xl md:text-8xl font-semibold leading-none tracking-tighter mb-4 bg-gradient-to-br from-orange-500 to-orange-400 bg-clip-text text-transparent">
              10k
            </div>
            <p className="text-base font-semibold text-gray-600 tracking-tight">
              People helped
            </p>
          </div>

          <div className="w-full md:w-px h-px md:h-24 bg-gray-300"></div>

          <div className="text-center px-8">
            <div className="text-6xl md:text-8xl font-semibold leading-none tracking-tighter mb-4 bg-gradient-to-br from-orange-500 to-orange-400 bg-clip-text text-transparent">
              200+
            </div>
            <p className="text-base font-semibold text-gray-600 tracking-tight">
              Closed projects
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
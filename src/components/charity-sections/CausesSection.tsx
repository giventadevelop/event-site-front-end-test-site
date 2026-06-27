'use client';

import React from 'react';

const causes = [
  {
    id: 1,
    title: 'Clean Water Access',
    description: 'Providing clean drinking water to communities in need through sustainable infrastructure projects.',
    image: 'https://images.pexels.com/photos/15308719/pexels-photo-15308719.jpeg',
  },
  {
    id: 2,
    title: 'Healthcare Support',
    description: 'Improving healthcare access and medical facilities in underserved areas.',
    image: 'https://images.pexels.com/photos/10902685/pexels-photo-10902685.jpeg',
  },
  {
    id: 3,
    title: 'Education for All',
    description: 'Building schools and providing educational resources to children in rural communities.',
    image: 'https://images.pexels.com/photos/20556421/pexels-photo-20556421.jpeg',
  }
];

const CausesSection: React.FC = () => {
  return (
    <div className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-16 flex flex-col md:flex-row justify-between items-start md:items-end space-y-4 md:space-y-0">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-5 h-2 bg-yellow-400 rounded"></div>
              <p className="text-gray-600">Our causes</p>
            </div>

            <h2 className="text-4xl md:text-6xl font-normal leading-tight tracking-tight max-w-2xl">
              Various things we help in whole world
            </h2>
          </div>

        </div>

        {/* Causes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {causes.map((cause) => (
            <div key={cause.id} className="bg-white rounded-3xl overflow-hidden shadow-md hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 ease-in-out">
              <div className="relative">
                <img
                  src={cause.image}
                  alt={cause.title}
                  className="w-full h-48 object-cover"
                />
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {cause.title}
                </h3>

                <p className="text-gray-600 mb-4 leading-relaxed">
                  {cause.description}
                </p>


              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CausesSection;
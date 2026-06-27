'use client';

import React from 'react';

const TestimonialsSection: React.FC = () => {
  return (
    <div className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row space-y-8 lg:space-y-0 lg:space-x-16 items-center">
          <div className="flex-1">
            {/* Section Header */}
            <div className="mb-16">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-5 h-2 bg-yellow-400 rounded"></div>
                <p className="text-gray-600">Testimonials</p>
              </div>

              <h2 className="text-4xl md:text-6xl font-normal leading-tight tracking-tight max-w-2xl">
                What people say about our charity company
              </h2>
            </div>

            {/* Testimonial Card */}
            <div className="bg-white rounded-3xl p-12 shadow-md relative">
              <div className="text-5xl text-yellow-400 mb-6">&ldquo;</div>

              <p className="text-lg leading-relaxed text-gray-600 mb-8">
                Halosaur duckbilled barracudina, goosefish gar pleco, chum salmon armoured catfish gudgeon
                sawfish whitefish orbicular batfish mummichog paradise fish! Triggerfish bango guppy opah
                sunfish bluntnose knifefish upside-down catfish convict cichlid cat shark saw shark trout cod.
              </p>

              <div className="flex items-center space-x-4">
                <img
                  src="/images/testimonial-samanta.jpg"
                  alt="Samanta Johnson"
                  className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                />
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Samanta</h4>
                  <p className="text-gray-600">Volunteer</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex space-x-4">
            <button className="bg-yellow-400/10 border-2 border-yellow-400 text-yellow-400 w-12 h-12 rounded-full flex items-center justify-center hover:bg-yellow-400 hover:text-white hover:scale-110 transition-all duration-300 ease-in-out">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button className="bg-yellow-400/10 border-2 border-yellow-400 text-yellow-400 w-12 h-12 rounded-full flex items-center justify-center hover:bg-yellow-400 hover:text-white hover:scale-110 transition-all duration-300 ease-in-out">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsSection;
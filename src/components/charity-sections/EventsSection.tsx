'use client';

import React from 'react';
import ArrowRightIcon from './icons/ArrowRightIcon';

const events = [
  {
    id: 1,
    title: 'Shaman stories & celebrations',
    location: 'Manhattan Club, 350 5th Ave, New York, NY, United States',
    time: '8',
    period: 'pm',
    date: 'Jan. 08 / 26',
    timeColor: '#FFCE59'
  },
  {
    id: 2,
    title: 'Paint games on the streets',
    location: 'Manhattan Club, 350 5th Ave, New York, NY, United States',
    time: '10',
    period: 'pm',
    date: 'Jan. 10 / 26',
    timeColor: '#ED653A'
  },
  {
    id: 3,
    title: 'Charity auction for children',
    location: 'Manhattan Club, 350 5th Ave, New York, NY, United States',
    time: '2',
    period: 'pm',
    date: 'Jan. 15 / 26',
    timeColor: '#37E085'
  }
];

const EventsSection: React.FC = () => {
  return (
    <div className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-16">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-5 h-2 bg-yellow-400 rounded"></div>
            <p className="text-gray-600">Events</p>
          </div>

          <h2 className="text-4xl md:text-6xl font-normal leading-tight tracking-tight max-w-2xl">
            Upcoming events & celebrations
          </h2>
        </div>

        {/* Featured Event */}
        <div className="mb-12">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-12 text-white relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%2337E085" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="3"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
              }}
            ></div>

            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-4">
                <span
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{ backgroundColor: '#37E085', color: 'white' }}
                >
                  Featured Event
                </span>
              </div>

              <h3 className="text-3xl md:text-4xl font-semibold mb-4">
                Annual Charity Gala Dinner
              </h3>

              <p className="text-white/80 mb-6 max-w-2xl">
                Join us for an evening of celebration, inspiration, and giving. This year&apos;s gala will feature
                live entertainment, silent auctions, and stories from the communities we&apos;ve helped.
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-8 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                  <span className="text-white/80">Jan. 25, 2026</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                  <span className="text-white/80">7:00 PM</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                  <span className="text-white/80">Grand Ballroom, NYC</span>
                </div>
              </div>

              <button className="bg-transparent text-yellow-400 border border-yellow-400 rounded-full px-6 py-3 text-sm font-medium hover:bg-yellow-400 hover:text-white transition-all duration-300 ease-in-out">
                Get Tickets
              </button>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-200 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ease-in-out">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="text-2xl font-bold"
                    style={{ color: event.timeColor }}
                  >
                    {event.time}
                    <span className="text-sm font-normal ml-1">{event.period}</span>
                  </div>
                  <span className="text-sm text-gray-500">{event.date}</span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {event.title}
                </h3>

                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {event.location}
                </p>

                <button className="bg-transparent text-gray-900 border border-yellow-400 rounded-full px-4 py-2 text-sm font-medium hover:bg-yellow-400 hover:text-white transition-all duration-300 ease-in-out flex items-center space-x-2">
                  <span>Learn more</span>
                  <ArrowRightIcon width={14} height={14} color="currentColor" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Events Button */}
        <div className="text-center mt-12">
          <button className="bg-transparent text-gray-900 border border-yellow-400 rounded-full px-8 py-3 text-sm font-medium hover:bg-yellow-400 hover:text-white hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 ease-in-out">
            View all events
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventsSection;
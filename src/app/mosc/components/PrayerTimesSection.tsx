'use client';

import React from 'react';
import AppIcon from './AppIcon';

const PrayerTimesSection = () => {
  const prayerTimes = [
    { name: 'Morning Prayer (Sapro)', time: '6:00 AM', description: 'Begin the day with sacred prayers and psalms', icon: 'Sunrise' },
    { name: 'Holy Qurbana', time: '9:00 AM', description: 'The Divine Liturgy - our central act of worship', icon: 'Cross', isMain: true },
    { name: 'Evening Prayer (Ramsho)', time: '6:00 PM', description: 'Conclude the day with thanksgiving and intercession', icon: 'Sunset' }
  ];

  const today = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = dayNames[today.getUTCDay()];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-syro-display font-semibold text-syro-h3 text-syro-blue mb-4">
            Daily Prayer Schedule
          </h2>
          <p className="font-syro-primary text-syro-body text-syro-dark-gray">
            Join us in prayer throughout the day - Today is {currentDay}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {prayerTimes?.map((prayer, index) => (
            <div
              key={index}
              className={`text-center p-8 rounded-lg ${
                prayer?.isMain
                  ? 'bg-syro-red text-white shadow-syro-card-hover'
                  : 'bg-syro-bg-gray/50 hover:bg-syro-bg-gray transition-all duration-300'
              }`}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                prayer?.isMain ? 'bg-white/20' : 'bg-syro-red/10'
              }`}>
                <AppIcon
                  name={prayer?.icon}
                  size={32}
                  className={prayer?.isMain ? 'text-white' : 'text-syro-red'}
                />
              </div>
              <h3 className={`font-syro-display font-medium text-xl mb-2 ${prayer?.isMain ? 'text-white' : 'text-syro-blue'}`}>
                {prayer?.name}
              </h3>
              <div className={`text-2xl font-bold mb-3 ${prayer?.isMain ? 'text-white' : 'text-syro-red'}`}>
                {prayer?.time}
              </div>
              <p className={`font-syro-primary leading-relaxed ${prayer?.isMain ? 'text-white/90' : 'text-syro-dark-gray'}`}>
                {prayer?.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-syro-bg-gray/50 rounded-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <AppIcon name="Info" size={20} className="text-syro-red" />
              <h4 className="font-syro-display font-medium text-lg text-syro-blue">Special Services</h4>
            </div>
            <p className="font-syro-primary text-syro-dark-gray">
              Additional services are held on feast days and special occasions.
              Please check our announcements for any schedule changes during holy seasons.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PrayerTimesSection;

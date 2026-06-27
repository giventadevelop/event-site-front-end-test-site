'use client';

import React from 'react';
import Icon from './ui/Icon';

const DailyPrayerScheduleSection = () => {
  // Use timezone-independent day calculation to prevent hydration mismatches
  // Using UTC ensures server and client render the same day
  const today = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayOfWeek = dayNames[today.getUTCDay()];

  const prayerTimes = [
    {
      name: 'Morning Prayer (Sapra)',
      time: '6:00 AM',
      icon: 'sun',
      description: 'Begin the day with a short prayer and psalm.',
      highlight: false
    },
    {
      name: 'Holy Qurbana',
      time: '9:00 AM',
      icon: 'cross',
      description: 'The Holy Liturgy, our central act of worship.',
      highlight: true
    },
    {
      name: 'Evening Prayer (Ramsha)',
      time: '6:00 PM',
      icon: 'moon',
      description: 'Conclude the day in thanksgiving and remembrance.',
      highlight: false
    }
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-heading font-semibold text-3xl text-foreground mb-4">
            Daily Prayer Schedule
          </h2>
          <p className="font-body text-lg text-muted-foreground">
            Join us in prayer throughout the day. Today is {dayOfWeek}.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {prayerTimes.map((prayer) => (
            <div
              key={prayer.name}
              className={`bg-card rounded-lg sacred-shadow p-6 text-center ${prayer.highlight
                ? 'ring-2 ring-primary bg-primary/5'
                : 'hover:sacred-shadow-lg reverent-transition'
                }`}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${prayer.highlight
                ? 'bg-primary text-primary-foreground'
                : 'bg-primary/10 text-primary'
                }`}>
                <Icon name={prayer.icon} size={32} className={prayer.highlight ? 'text-primary-foreground' : 'text-primary'} />
              </div>

              <h3 className={`font-heading font-semibold text-xl mb-2 ${prayer.highlight ? 'text-primary' : 'text-foreground'
                }`}>
                {prayer.name}
              </h3>

              <p className={`text-2xl font-bold mb-3 ${prayer.highlight ? 'text-primary' : 'text-foreground'
                }`}>
                {prayer.time}
              </p>

              <p className="font-body text-muted-foreground leading-relaxed">
                {prayer.description}
              </p>
            </div>
          ))}
        </div>

        {/* Special Services Notice */}
        <div className="bg-card rounded-lg sacred-shadow p-6 text-center">
          <h3 className="font-heading font-medium text-lg text-foreground mb-2">
            Special Services
          </h3>
          <p className="font-body text-muted-foreground">
            Please check the calendar for special service schedules during feast days and seasonal observances.
          </p>
        </div>
      </div>
    </section>
  );
};

export default DailyPrayerScheduleSection;

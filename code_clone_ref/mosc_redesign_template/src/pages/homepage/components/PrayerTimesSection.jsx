import React from 'react';
import Icon from '../../../components/AppIcon';

const PrayerTimesSection = () => {
  const prayerTimes = [
    {
      name: 'Morning Prayer (Sapro)',
      time: '6:00 AM',
      description: 'Begin the day with sacred prayers and psalms',
      icon: 'Sunrise'
    },
    {
      name: 'Holy Qurbana',
      time: '9:00 AM',
      description: 'The Divine Liturgy - our central act of worship',
      icon: 'Cross',
      isMain: true
    },
    {
      name: 'Evening Prayer (Ramsho)',
      time: '6:00 PM',
      description: 'Conclude the day with thanksgiving and intercession',
      icon: 'Sunset'
    }
  ];

  const currentDay = new Date()?.toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <section className="py-16 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-heading font-semibold text-3xl text-foreground mb-4">
            Daily Prayer Schedule
          </h2>
          <p className="font-body text-lg text-muted-foreground">
            Join us in prayer throughout the day - Today is {currentDay}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {prayerTimes?.map((prayer, index) => (
            <div 
              key={index} 
              className={`text-center p-8 rounded-lg ${
                prayer?.isMain 
                  ? 'bg-primary text-primary-foreground sacred-shadow-lg' 
                  : 'bg-muted/50 hover:bg-muted reverent-transition'
              }`}
            >
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                prayer?.isMain 
                  ? 'bg-primary-foreground/20' 
                  : 'bg-primary/10'
              }`}>
                <Icon 
                  name={prayer?.icon} 
                  size={32} 
                  className={prayer?.isMain ? 'text-primary-foreground' : 'text-primary'} 
                />
              </div>
              
              <h3 className={`font-heading font-medium text-xl mb-2 ${
                prayer?.isMain ? 'text-primary-foreground' : 'text-foreground'
              }`}>
                {prayer?.name}
              </h3>
              
              <div className={`text-2xl font-bold mb-3 ${
                prayer?.isMain ? 'text-primary-foreground' : 'text-primary'
              }`}>
                {prayer?.time}
              </div>
              
              <p className={`font-body leading-relaxed ${
                prayer?.isMain ? 'text-primary-foreground/90' : 'text-muted-foreground'
              }`}>
                {prayer?.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-muted/50 rounded-lg p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <Icon name="Info" size={20} className="text-primary" />
              <h4 className="font-heading font-medium text-lg text-foreground">
                Special Services
              </h4>
            </div>
            <p className="font-body text-muted-foreground">
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
'use client';

import React from 'react';
import AppIcon from './AppIcon';

const WelcomeSection = () => {
  const features = [
    { icon: 'Heart', title: 'Spiritual Guidance', description: 'Find peace and direction through our pastoral care and spiritual counseling services.' },
    { icon: 'Users', title: 'Community Fellowship', description: 'Join our vibrant community of believers in worship, service, and Christian fellowship.' },
    { icon: 'Church', title: 'Orthodox Traditions', description: 'Experience the rich liturgical traditions and theological heritage of the Oriental Orthodox Church.' },
    { icon: 'Calendar', title: 'Regular Services', description: 'Participate in our daily prayers, Holy Qurbana, and special feast day celebrations.' }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-syro-display font-semibold text-syro-h3 text-syro-blue mb-4">
            Our Mission & Ministry
          </h2>
          <p className="font-syro-primary text-syro-body text-syro-dark-gray max-w-3xl mx-auto">
            As inheritors of the apostolic tradition established by St. Thomas, we strive to nurture faith,
            preserve our sacred heritage, and serve our community with Christ&apos;s love.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features?.map((feature, index) => (
            <div key={index} className="text-center group">
              <div className="w-16 h-16 bg-syro-blue/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-syro-blue/20 transition-all duration-300">
                <AppIcon name={feature?.icon} size={32} className="text-syro-blue" />
              </div>
              <h3 className="font-syro-display font-medium text-xl text-syro-blue mb-3">
                {feature?.title}
              </h3>
              <p className="font-syro-primary text-syro-dark-gray leading-relaxed">
                {feature?.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WelcomeSection;

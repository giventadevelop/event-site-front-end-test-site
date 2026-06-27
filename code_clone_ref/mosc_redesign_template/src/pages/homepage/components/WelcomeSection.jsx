import React from 'react';
import Icon from '../../../components/AppIcon';

const WelcomeSection = () => {
  const features = [
    {
      icon: 'Heart',
      title: 'Spiritual Guidance',
      description: 'Find peace and direction through our pastoral care and spiritual counseling services.'
    },
    {
      icon: 'Users',
      title: 'Community Fellowship',
      description: 'Join our vibrant community of believers in worship, service, and Christian fellowship.'
    },
    {
      icon: 'BookOpen',
      title: 'Orthodox Traditions',
      description: 'Experience the rich liturgical traditions and theological heritage of the Oriental Orthodox Church.'
    },
    {
      icon: 'Calendar',
      title: 'Regular Services',
      description: 'Participate in our daily prayers, Holy Qurbana, and special feast day celebrations.'
    }
  ];

  return (
    <section className="py-16 bg-card">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-heading font-semibold text-3xl text-foreground mb-4">
            Our Mission & Ministry
          </h2>
          <p className="font-body text-lg text-muted-foreground max-w-3xl mx-auto">
            As inheritors of the apostolic tradition established by St. Thomas, we strive to nurture faith, 
            preserve our sacred heritage, and serve our community with Christ's love.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features?.map((feature, index) => (
            <div key={index} className="text-center group">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 reverent-transition">
                <Icon name={feature?.icon} size={32} className="text-primary" />
              </div>
              <h3 className="font-heading font-medium text-xl text-foreground mb-3">
                {feature?.title}
              </h3>
              <p className="font-body text-muted-foreground leading-relaxed">
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
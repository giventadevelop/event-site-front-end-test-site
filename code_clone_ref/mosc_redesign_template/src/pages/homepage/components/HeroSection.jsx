import React from 'react';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-background to-muted min-h-[600px] flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {/* Church Logo */}
        <div className="mb-12">
          <div className="flex items-center space-x-3">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center sacred-shadow">
              <Icon name="Cross" size={32} color="white" />
            </div>
            <div>
              <h1 className="font-heading font-semibold text-3xl text-foreground">
                Malankara Orthodox Syrian Church
              </h1>
              <p className="font-caption text-lg text-muted-foreground">
                Saint Thomas Christian Community
              </p>
            </div>
          </div>
        </div>

        {/* Three Circular Images */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-16">
          {/* Patriarch Image */}
          <div className="flex flex-col items-center">
            <div className="w-48 h-48 lg:w-56 lg:h-56 rounded-full overflow-hidden sacred-shadow-lg bg-muted">
              <Image
                src="https://images.pexels.com/photos/8363026/pexels-photo-8363026.jpeg"
                alt="His Holiness Patriarch in traditional Orthodox robes"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="mt-4 font-heading font-medium text-lg text-foreground text-center">
              His Holiness the Patriarch
            </h3>
          </div>

          {/* Church Cross */}
          <div className="flex flex-col items-center">
            <div className="w-48 h-48 lg:w-56 lg:h-56 rounded-full overflow-hidden sacred-shadow-lg bg-gradient-to-br from-muted to-secondary/30 flex items-center justify-center">
              <Icon name="Cross" size={80} className="text-primary" />
            </div>
            <h3 className="mt-4 font-heading font-medium text-lg text-foreground text-center">
              The Holy Cross
            </h3>
          </div>

          {/* Christ Iconography */}
          <div className="flex flex-col items-center">
            <div className="w-48 h-48 lg:w-56 lg:h-56 rounded-full overflow-hidden sacred-shadow-lg bg-muted">
              <Image
                src="https://images.pexels.com/photos/8363027/pexels-photo-8363027.jpeg"
                alt="Religious iconography of Christ blessing"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="mt-4 font-heading font-medium text-lg text-foreground text-center">
              Christ the Savior
            </h3>
          </div>
        </div>

        {/* Welcome Text */}
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="font-heading font-semibold text-2xl lg:text-3xl text-foreground mb-6">
            Welcome to Our Sacred Community
          </h2>
          <p className="font-body text-lg text-muted-foreground leading-relaxed">
            The Malankara Orthodox Syrian Church traces its origins to the Apostolic ministry of St. Thomas in India. 
            We are a community rooted in ancient traditions, committed to preserving the faith handed down through generations 
            while serving our members with love, compassion, and spiritual guidance.
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
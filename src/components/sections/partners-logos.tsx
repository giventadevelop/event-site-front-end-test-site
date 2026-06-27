"use client";

import React from 'react';
import Image from 'next/image';

const partners = [
  {
    id: 1,
    name: "Global Health Foundation",
    logo: "https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/partner1.png",
    category: "Healthcare"
  },
  {
    id: 2,
    name: "Education First",
    logo: "https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/partner2.png",
    category: "Education"
  },
  {
    id: 3,
    name: "Clean Water Initiative",
    logo: "https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/partner3.png",
    category: "Environment"
  },
  {
    id: 4,
    name: "Community Builders",
    logo: "https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/partner4.png",
    category: "Development"
  },
  {
    id: 5,
    name: "Youth Empowerment",
    logo: "https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/partner5.png",
    category: "Youth"
  },
  {
    id: 6,
    name: "Sustainable Future",
    logo: "https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/partner6.png",
    category: "Sustainability"
  }
];

const PartnersLogos = () => {
  return (
    <section className="bg-gray-50 py-24">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Our Partners
          </h2>
          <div className="w-20 h-1 bg-primary rounded-full mx-auto mb-6"></div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We work with amazing organizations and partners who share our vision of creating positive change in the world.
          </p>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-16">
          {partners.map((partner) => (
            <div key={partner.id} className="text-center group">
              <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="text-sm font-medium text-foreground mb-1">
                  {partner.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {partner.category}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Partnership CTA */}
        <div className="text-center">
          <div className="bg-white rounded-2xl p-12 max-w-3xl mx-auto shadow-lg">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Become a Partner
            </h3>
            <p className="text-lg text-muted-foreground mb-8">
              Are you interested in partnering with us to create positive change? We're always looking for organizations and companies who share our values and mission.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/partnership"
                className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Learn More
              </a>
              <a
                href="/contact"
                className="inline-block border-2 border-primary text-primary px-8 py-3 rounded-lg font-medium hover:bg-primary hover:text-white transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnersLogos;


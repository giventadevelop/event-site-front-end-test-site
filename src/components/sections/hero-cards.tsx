"use client";

import React from 'react';
import { Heart, Users, Globe, Award } from 'lucide-react';

const stats = [
  {
    id: 1,
    icon: Heart,
    number: "15,000+",
    label: "Lives Impacted",
    description: "People whose lives have been changed through our programs"
  },
  {
    id: 2,
    icon: Users,
    number: "500+",
    label: "Active Volunteers",
    description: "Dedicated individuals working to make a difference"
  },
  {
    id: 3,
    icon: Globe,
    number: "25+",
    label: "Countries Reached",
    description: "Communities worldwide benefiting from our initiatives"
  },
  {
    id: 4,
    icon: Award,
    number: "$3M+",
    label: "Funds Raised",
    description: "Financial support invested in community development"
  }
];

const HeroCards = () => {
  return (
    <section className="bg-white py-16 -mt-16 relative z-20">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => (
            <div key={stat.id} className="bg-white rounded-lg p-6 shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                <stat.icon className="w-8 h-8 text-primary" />
              </div>

              {/* Number */}
              <div className="text-3xl font-bold text-foreground mb-2">
                {stat.number}
              </div>

              {/* Label */}
              <div className="text-lg font-semibold text-foreground mb-2">
                {stat.label}
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroCards;


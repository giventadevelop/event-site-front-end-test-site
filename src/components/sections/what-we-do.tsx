"use client";

import React from 'react';
import { Heart, BookOpen, Droplets, Shield, Home, Users } from 'lucide-react';

const services = [
  {
    id: 1,
    icon: Heart,
    title: "Healthcare Access",
    description: "Providing essential medical care, vaccinations, and health education to underserved communities.",
    color: "text-red-500"
  },
  {
    id: 2,
    icon: BookOpen,
    title: "Education Programs",
    description: "Building schools, providing supplies, and supporting teachers in rural and impoverished areas.",
    color: "text-blue-500"
  },
  {
    id: 3,
    icon: Droplets,
    title: "Clean Water",
    description: "Installing wells, water purification systems, and promoting hygiene education.",
    color: "text-cyan-500"
  },
  {
    id: 4,
    icon: Shield,
    title: "Child Protection",
    description: "Advocating for children's rights and providing safe environments for vulnerable youth.",
    color: "text-green-500"
  },
  {
    id: 5,
    icon: Home,
    title: "Housing Support",
    description: "Building and repairing homes for families affected by natural disasters and poverty.",
    color: "text-orange-500"
  },
  {
    id: 6,
    icon: Users,
    title: "Community Development",
    description: "Empowering communities through skills training, microfinance, and sustainable projects.",
    color: "text-purple-500"
  }
];

const WhatWeDo = () => {
  return (
    <section className="bg-white py-24">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            What We Do
          </h2>
          <div className="w-20 h-1 bg-primary rounded-full mx-auto mb-6"></div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Our foundation focuses on six key areas to create sustainable, long-term positive change in communities around the world.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => (
            <div key={service.id} className="text-center p-8 rounded-lg hover:shadow-lg transition-shadow duration-300 group">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6 group-hover:bg-primary/10 transition-colors duration-300">
                <service.icon className={`w-10 h-10 ${service.color}`} />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-foreground mb-4">
                {service.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>

        {/* Impact Stats */}
        <div className="mt-20 bg-gray-50 rounded-2xl p-12">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              Our Impact
            </h3>
            <p className="text-lg text-muted-foreground">
              Together, we've achieved remarkable results in communities worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">25+</div>
              <div className="text-muted-foreground">Countries Reached</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">100+</div>
              <div className="text-muted-foreground">Communities Served</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">50,000+</div>
              <div className="text-muted-foreground">Lives Impacted</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">$5M+</div>
              <div className="text-muted-foreground">Funds Invested</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatWeDo;

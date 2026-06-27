"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Heart, Users, Target, Calendar } from 'lucide-react';

const causes = [
  {
    id: 1,
    title: "Education for Children",
    description: "Providing quality education to underprivileged children in rural areas.",
    image: "https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/Photo_6.jpg",
    raised: 25000,
    goal: 50000,
    donors: 150,
    daysLeft: 15
  },
  {
    id: 2,
    title: "Clean Water Project",
    description: "Building wells and water purification systems in communities without access to clean water.",
    image: "https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/Photo_7.jpg",
    raised: 35000,
    goal: 75000,
    donors: 200,
    daysLeft: 8
  },
  {
    id: 3,
    title: "Medical Care Access",
    description: "Providing essential medical care and supplies to remote communities.",
    image: "https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/Photo_8.jpg",
    raised: 40000,
    goal: 60000,
    donors: 180,
    daysLeft: 22
  }
];

const CausesGrid = () => {
  return (
    <section className="bg-gray-50 py-24">
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Our Causes
          </h2>
          <div className="w-20 h-1 bg-primary rounded-full mx-auto mb-6"></div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join us in making a difference. Every donation counts towards creating positive change in communities around the world.
          </p>
        </div>

        {/* Causes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {causes.map((cause) => {
            const progress = (cause.raised / cause.goal) * 100;

            return (
              <div key={cause.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={cause.image}
                    alt={cause.title}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                    {cause.daysLeft} days left
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {cause.title}
                  </h3>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {cause.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                      <span>Raised: ${cause.raised.toLocaleString()}</span>
                      <span>Goal: ${cause.goal.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{cause.donors} donors</span>
                    </div>
                    <div className="text-lg font-bold text-primary">
                      {progress.toFixed(0)}%
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Link href={`/causes/${cause.id}`}>Donate Now</Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
            <Link href="/causes">View All Causes</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CausesGrid;


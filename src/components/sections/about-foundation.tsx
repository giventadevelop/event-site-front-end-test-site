"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Users, Heart, Target, Award } from 'lucide-react';

const AboutFoundation = () => {
  return (
    <section className="bg-white py-24">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Image */}
          <div className="relative">
            <div className="relative z-10">
              <Image
                src="https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/Photo_5.jpg"
                alt="People working together for charity"
                width={600}
                height={400}
                className="rounded-lg shadow-xl"
              />
            </div>
            {/* Decorative element */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 rounded-full -z-10"></div>
          </div>

          {/* Right Column - Content */}
          <div>
            <div className="mb-6">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                About Our Foundation
              </h2>
              <div className="w-20 h-1 bg-primary rounded-full"></div>
            </div>

            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              We are a dedicated team of volunteers and professionals committed to making a positive impact in communities around the world. Our foundation focuses on education, healthcare, and sustainable development.
            </p>

            <p className="text-base text-muted-foreground mb-8 leading-relaxed">
              Since our establishment, we have helped thousands of people access better education, healthcare services, and opportunities for growth. We believe that every individual deserves the chance to thrive.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto mb-3">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">10,000+</h3>
                <p className="text-sm text-muted-foreground">People Helped</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto mb-3">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground">500+</h3>
                <p className="text-sm text-muted-foreground">Volunteers</p>
              </div>
            </div>

            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="#about">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutFoundation;


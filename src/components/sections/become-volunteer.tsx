"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Heart, Users, Globe, Award } from 'lucide-react';

const BecomeVolunteerSection = () => {
  return (
    <section className="bg-primary py-24 text-white">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <div>
            <h2 className="text-4xl font-bold mb-6">
              Become a Volunteer
            </h2>
            <div className="w-20 h-1 bg-white rounded-full mb-6"></div>

            <p className="text-lg mb-8 leading-relaxed opacity-90">
              Join our community of dedicated volunteers and make a real difference in people's lives. Every hour you contribute helps us achieve our mission of creating positive change.
            </p>

            {/* Benefits */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Heart className="w-4 h-4 text-white" />
                </div>
                <span>Make a meaningful impact in communities</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <span>Join a supportive community of volunteers</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Globe className="w-4 h-4 text-white" />
                </div>
                <span>Gain valuable experience and skills</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Award className="w-4 h-4 text-white" />
                </div>
                <span>Receive recognition for your contributions</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="bg-white text-primary hover:bg-gray-100">
                <Link href="/volunteer">Join Now</Link>
              </Button>
              <Button asChild variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                <Link href="/volunteer-info">Learn More</Link>
              </Button>
            </div>
          </div>

          {/* Right Column - Image */}
          <div className="relative">
            <div className="relative z-10">
              <Image
                src="https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/Photo_13.jpg"
                alt="Volunteers working together"
                width={600}
                height={500}
                className="rounded-lg shadow-2xl"
              />
            </div>
            {/* Decorative elements */}
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-white/20 rounded-full -z-10"></div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full -z-10"></div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold mb-2">500+</div>
            <div className="text-white/80">Active Volunteers</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">50,000+</div>
            <div className="text-white/80">Hours Contributed</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">25+</div>
            <div className="text-white/80">Countries Reached</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BecomeVolunteerSection;


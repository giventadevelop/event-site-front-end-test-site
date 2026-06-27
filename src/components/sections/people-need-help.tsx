"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Heart, Users, Globe, Target } from 'lucide-react';

const PeopleNeedHelp = () => {
  return (
    <section className="bg-gray-50 py-24">
      <div className="container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <div>
            <h2 className="text-4xl font-bold text-foreground mb-6">
              People Need Our Help
            </h2>
            <div className="w-20 h-1 bg-primary rounded-full mb-6"></div>

            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Millions of people around the world are facing challenges that prevent them from living healthy, productive lives. Through our programs, we're working to change that.
            </p>

            {/* Key Issues */}
            <div className="space-y-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Healthcare Access</h3>
                  <p className="text-muted-foreground">Many communities lack basic medical care, leading to preventable illnesses and deaths.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Education Barriers</h3>
                  <p className="text-muted-foreground">Children in rural areas often can't access quality education due to distance and lack of resources.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Globe className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Clean Water Crisis</h3>
                  <p className="text-muted-foreground">Access to clean water is still a major challenge in many developing regions.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/donate">Help Now</Link>
              </Button>
              <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                <Link href="/programs">Our Programs</Link>
              </Button>
            </div>
          </div>

          {/* Right Column - Image Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="relative h-64 rounded-lg overflow-hidden">
                <Image
                  src="https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/Photo_18.jpg"
                  alt="People in need"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative h-48 rounded-lg overflow-hidden">
                <Image
                  src="https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/Photo_19.jpg"
                  alt="Community support"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="space-y-4 pt-8">
              <div className="relative h-48 rounded-lg overflow-hidden">
                <Image
                  src="https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/Photo_20.jpg"
                  alt="Volunteer work"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative h-64 rounded-lg overflow-hidden">
                <Image
                  src="https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/Photo_21.jpg"
                  alt="Children in need"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-20 text-center">
          <div className="bg-primary rounded-2xl p-12 text-white max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold mb-4">
              Together We Can Make a Difference
            </h3>
            <p className="text-xl mb-8 opacity-90">
              Every donation, every volunteer hour, and every act of kindness brings us closer to a world where everyone has access to the basic necessities of life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-gray-100">
                <Link href="/donate">Donate Today</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                <Link href="/volunteer">Join Our Team</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PeopleNeedHelp;


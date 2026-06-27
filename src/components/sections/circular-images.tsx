"use client";

import React from 'react';
import Image from 'next/image';

const CircularImages = () => {
  return (
    <section className="bg-white py-24">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Our Impact in Numbers
          </h2>
          <div className="w-20 h-1 bg-primary rounded-full mx-auto mb-6"></div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See the real faces behind our statistics - every number represents a life changed for the better.
          </p>
        </div>

        {/* Circular Images Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Image 1 */}
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <Image
                src="https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/Photo_22.jpg"
                alt="Community member"
                fill
                className="rounded-full object-cover"
              />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Sarah M.</h3>
            <p className="text-sm text-muted-foreground">Education Recipient</p>
          </div>

          {/* Image 2 */}
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <Image
                src="https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/Photo_23.jpg"
                alt="Volunteer"
                fill
                className="rounded-full object-cover"
              />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Michael T.</h3>
            <p className="text-sm text-muted-foreground">Active Volunteer</p>
          </div>

          {/* Image 3 */}
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <Image
                src="https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/Photo_24.jpg"
                alt="Community leader"
                fill
                className="rounded-full object-cover"
              />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Lisa K.</h3>
            <p className="text-sm text-muted-foreground">Community Partner</p>
          </div>

          {/* Image 4 */}
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-4">
              <Image
                src="https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/Photo_25.jpg"
                alt="Beneficiary"
                fill
                className="rounded-full object-cover"
              />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">David R.</h3>
            <p className="text-sm text-muted-foreground">Healthcare Recipient</p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="bg-gray-50 rounded-lg p-8 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Every Face Has a Story
            </h3>
            <p className="text-muted-foreground mb-6">
              These are just a few of the thousands of people whose lives have been touched by our foundation. Each person represents a family, a community, and a future that's brighter because of your support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/stories"
                className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Read More Stories
              </a>
              <a
                href="/impact"
                className="inline-block border-2 border-primary text-primary px-6 py-3 rounded-lg font-medium hover:bg-primary hover:text-white transition-colors"
              >
                View Our Impact
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CircularImages;


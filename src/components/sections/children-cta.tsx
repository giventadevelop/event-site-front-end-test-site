"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Heart, Gift, Users } from 'lucide-react';

const ChildrenCta = () => {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://demo.artureanec.com/themes/philantrop/wp-content/uploads/2024/03/Photo_17.jpg"
          alt="Children in need"
          fill
          className="object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Content */}
      <div className="container relative z-10">
        <div className="text-center text-white max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold mb-6">
            Every Child Deserves a Chance
          </h2>
          <p className="text-xl mb-8 leading-relaxed opacity-90">
            Join us in providing education, healthcare, and hope to children around the world. Your support can change a child's life forever.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mx-auto mb-4">
                <Heart className="w-8 h-8 text-primary" />
              </div>
              <div className="text-3xl font-bold mb-2">5,000+</div>
              <div className="text-white/80">Children Helped</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mx-auto mb-4">
                <Gift className="w-8 h-8 text-primary" />
              </div>
              <div className="text-3xl font-bold mb-2">$2M+</div>
              <div className="text-white/80">Funds Raised</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-primary/20 rounded-full mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <div className="text-3xl font-bold mb-2">15+</div>
              <div className="text-white/80">Countries Reached</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg">
              <Link href="/donate">Donate Now</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black px-8 py-4 text-lg">
              <Link href="/sponsor-child">Sponsor a Child</Link>
            </Button>
          </div>

          {/* Additional Info */}
          <p className="text-sm text-white/70 mt-8 max-w-2xl mx-auto">
            Your donation provides children with access to quality education, nutritious meals, healthcare, and a safe environment to grow and thrive.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ChildrenCta;

